import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { BLS_INDUSTRIES, JOB_TYPES } from "@shared/jass";
import { storageGet, storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { generateDocx, generatePdf } from "../documentExport";
import { parseResume, parseResumeFromText } from "../resumeParser";
import {
  computeAtsScore,
  computeKeywordMatch,
  detectAgeBiasFlags,
  runRewrite,
  runTeaser,
  scoreFormatting,
  scoreStructure,
} from "../rewriteEngine";

const uuidSchema = z.string().uuid();
const jobTypeValues = JOB_TYPES.map((type) => type.value) as [string, ...string[]];
const industryValues = BLS_INDUSTRIES as readonly [string, ...string[]];

const intakeSchema = z.object({
  roleType: z.string().max(255).optional(),
  jobType: z.enum(jobTypeValues).optional(),
  industry: z.enum(industryValues).optional(),
  industryOther: z.string().max(160).optional().nullable(),
  jobDescription: z.string().max(20000).optional(),
  concerns: z.array(z.string()).optional(),
  yearsToHighlight: z.string().max(16).optional(),
});

export const rewritesRouter = router({
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255).optional(),
        mimeType: z.string().max(128).optional(),
        fileBase64: z.string().optional(),
        pastedText: z.string().max(80000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let parsed;
      let storageKey: string | undefined;
      const fileName = input.fileName || "pasted-resume.txt";

      if (input.fileBase64) {
        const buf = Buffer.from(input.fileBase64, "base64");
        if (buf.length > 8 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "File exceeds 8 MB limit" });
        }
        parsed = await parseResume(buf, fileName, input.mimeType);
        try {
          const put = await storagePut("resumes", fileName, buf, {
            userId: ctx.user.id,
            contentType: input.mimeType || "application/octet-stream",
          });
          storageKey = put.key;
        } catch (e) {
          console.warn("[upload] Supabase storage upload failed", e);
        }
      } else if (input.pastedText) {
        parsed = parseResumeFromText(input.pastedText);
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Either fileBase64 or pastedText is required" });
      }

      if (!parsed.text || parsed.text.length < 50) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not extract enough text from your resume. Try pasting it as plain text instead." });
      }

      const profile = await db.ensureProfile(ctx.user.id);
      const id = await db.createRewrite({
        userId: ctx.user.id,
        originalFileName: fileName,
        originalFileKey: storageKey,
        originalText: parsed.text,
        jobType: profile.jobType,
        industry: profile.industry,
        industryOther: profile.industryOther,
      });
      return { id, parsedContact: parsed.contact, charCount: parsed.text.length, profile };
    }),

  saveIntake: protectedProcedure
    .input(z.object({ id: uuidSchema }).merge(intakeSchema))
    .mutation(async ({ ctx, input }) => {
      const r = await db.getRewriteById(input.id);
      if (!r || r.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      await db.updateRewrite(input.id, {
        roleType: input.roleType,
        jobType: input.jobType,
        industry: input.industry,
        industryOther: input.industryOther,
        jobDescription: input.jobDescription,
        concerns: input.concerns ?? [],
        yearsToHighlight: input.yearsToHighlight,
      });
      return { ok: true };
    }),

  generateTeaser: protectedProcedure
    .input(z.object({ id: uuidSchema }))
    .mutation(async ({ ctx, input }) => {
      const r = await db.getRewriteById(input.id);
      if (!r || r.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const teaser = await runTeaser({
        originalText: r.originalText,
        roleType: r.roleType ?? undefined,
        industry: r.industryOther || r.industry || undefined,
        jobType: r.jobType ?? undefined,
        jobDescription: r.jobDescription ?? undefined,
        concerns: (r.concerns as string[]) ?? [],
        yearsToHighlight: r.yearsToHighlight ?? undefined,
      });

      await db.updateRewrite(input.id, {
        status: "scored",
        atsScore: teaser.scores.atsScore,
        keywordScore: teaser.scores.keywordScore,
        formattingScore: teaser.scores.formattingScore,
        structureScore: teaser.scores.structureScore,
        ageBiasScore: teaser.scores.ageBiasScore,
        ageBiasFlags: teaser.ageBiasFlags,
      });

      return {
        teaserBullets: teaser.teaserBullets,
        scores: teaser.scores,
        ageBiasFlags: teaser.ageBiasFlags,
      };
    }),

  generateFull: protectedProcedure
    .input(z.object({ id: uuidSchema }))
    .mutation(async ({ ctx, input }) => {
      const r = await db.getRewriteById(input.id);
      if (!r || r.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const result = await runRewrite({
        originalText: r.originalText,
        roleType: r.roleType ?? undefined,
        industry: r.industryOther || r.industry || undefined,
        jobType: r.jobType ?? undefined,
        jobDescription: r.jobDescription ?? undefined,
        concerns: (r.concerns as string[]) ?? [],
        yearsToHighlight: r.yearsToHighlight ?? undefined,
      });

      let pdfKey: string | undefined;
      let docxKey: string | undefined;
      let pdfUrl: string | null = null;
      let docxUrl: string | null = null;
      try {
        const pdfBuf = await generatePdf(result.rewrittenJson);
        const docxBuf = await generateDocx(result.rewrittenJson);
        const baseName = (result.rewrittenJson.name || "resume").replace(/[^A-Za-z0-9_-]+/g, "_");
        const p1 = await storagePut(`rewrites/${input.id}`, `${baseName}.pdf`, pdfBuf, {
          userId: ctx.user.id,
          contentType: "application/pdf",
        });
        const p2 = await storagePut(`rewrites/${input.id}`, `${baseName}.docx`, docxBuf, {
          userId: ctx.user.id,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        pdfKey = p1.key;
        docxKey = p2.key;
        pdfUrl = p1.url;
        docxUrl = p2.url;
      } catch (e) {
        console.warn("[generateFull] export failed", e);
      }

      await db.updateRewrite(input.id, {
        status: "rewritten",
        rewrittenText: result.rewrittenText,
        rewrittenJson: result.rewrittenJson,
        changeAnnotations: result.changeAnnotations,
        ageBiasFlags: result.ageBiasFlags,
        tips: result.tips,
        atsScore: result.scores.atsScore,
        keywordScore: result.scores.keywordScore,
        formattingScore: result.scores.formattingScore,
        structureScore: result.scores.structureScore,
        ageBiasScore: result.scores.ageBiasScore,
        pdfFileKey: pdfKey,
        docxFileKey: docxKey,
      });

      return {
        rewrittenText: result.rewrittenText,
        rewrittenJson: result.rewrittenJson,
        changeAnnotations: result.changeAnnotations,
        ageBiasFlags: result.ageBiasFlags,
        tips: result.tips,
        scores: result.scores,
        pdfUrl,
        docxUrl,
      };
    }),

  get: protectedProcedure.input(z.object({ id: uuidSchema })).query(async ({ ctx, input }) => {
    const r = await db.getRewriteById(input.id);
    if (!r || (r.userId !== ctx.user.id && ctx.user.role !== "admin")) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    const [pdf, docx] = await Promise.all([
      r.pdfFileKey ? storageGet(r.pdfFileKey).catch(() => null) : Promise.resolve(null),
      r.docxFileKey ? storageGet(r.docxFileKey).catch(() => null) : Promise.resolve(null),
    ]);
    return {
      ...r,
      pdfUrl: pdf?.url ?? null,
      docxUrl: docx?.url ?? null,
    };
  }),

  myHistory: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db.listRewritesByUser(ctx.user.id);
    return Promise.all(rows.map(async (r) => {
      const [pdf, docx] = await Promise.all([
        r.pdfFileKey ? storageGet(r.pdfFileKey).catch(() => null) : Promise.resolve(null),
        r.docxFileKey ? storageGet(r.docxFileKey).catch(() => null) : Promise.resolve(null),
      ]);
      return {
        id: r.id,
        roleType: r.roleType,
        jobType: r.jobType,
        industry: r.industryOther || r.industry,
        atsScore: r.atsScore,
        status: r.status,
        createdAt: r.createdAt,
        pdfUrl: pdf?.url ?? null,
        docxUrl: docx?.url ?? null,
      };
    }));
  }),

  scoreOriginal: protectedProcedure
    .input(z.object({ text: z.string(), jobDescription: z.string().optional() }))
    .query(({ input }) => {
      const km = computeKeywordMatch(input.jobDescription || "", input.text);
      const fmt = scoreFormatting(input.text);
      const struct = scoreStructure(input.text);
      const flags = detectAgeBiasFlags(input.text);
      const ageBias = Math.max(0, 100 - flags.length * 25);
      const ats = computeAtsScore({ keyword: km.score, formatting: fmt, structure: struct, ageBias });
      return { atsScore: ats, keywordScore: km.score, formattingScore: fmt, structureScore: struct, ageBiasScore: ageBias, ageBiasFlags: flags };
    }),
});
