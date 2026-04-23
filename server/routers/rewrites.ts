import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { storagePut } from "../storage";
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

const intakeSchema = z.object({
  roleType: z.string().max(255).optional(),
  industry: z.string().max(255).optional(),
  jobDescription: z.string().max(20000).optional(),
  concerns: z.array(z.string()).optional(),
  yearsToHighlight: z.string().max(16).optional(),
});

function isSubscribedActive(user: { subscriptionStatus?: string | null }): boolean {
  const s = (user.subscriptionStatus || "").toLowerCase();
  return s === "active" || s === "trialing";
}

export const rewritesRouter = router({
  /** Step 1: upload + parse the resume. Persists a draft rewrite. */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255).optional(),
        mimeType: z.string().max(128).optional(),
        // Either a base64 file or pasted text
        fileBase64: z.string().optional(),
        pastedText: z.string().max(80000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let parsed;
      let storageKey: string | undefined;
      let fileName = input.fileName || "pasted-resume.txt";

      if (input.fileBase64) {
        const buf = Buffer.from(input.fileBase64, "base64");
        if (buf.length > 8 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "File exceeds 8 MB limit" });
        }
        parsed = await parseResume(buf, fileName, input.mimeType);
        try {
          const put = await storagePut(`resumes/${ctx.user.id}/${fileName}`, buf, input.mimeType || "application/octet-stream");
          storageKey = put.key;
        } catch (e) {
          console.warn("[upload] storagePut failed", e);
        }
      } else if (input.pastedText) {
        parsed = parseResumeFromText(input.pastedText);
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Either fileBase64 or pastedText is required" });
      }

      if (!parsed.text || parsed.text.length < 50) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not extract enough text from your resume. Try pasting it as plain text instead." });
      }

      const id = await db.createRewrite({
        userId: ctx.user.id,
        originalFileName: fileName,
        originalFileKey: storageKey,
        originalText: parsed.text,
        status: "draft",
      });
      return { id, parsedContact: parsed.contact, charCount: parsed.text.length };
    }),

  /** Step 2: save intake answers. */
  saveIntake: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }).merge(intakeSchema))
    .mutation(async ({ ctx, input }) => {
      const r = await db.getRewriteById(input.id);
      if (!r || r.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      await db.updateRewrite(input.id, {
        roleType: input.roleType,
        industry: input.industry,
        jobDescription: input.jobDescription,
        concerns: input.concerns ?? [],
        yearsToHighlight: input.yearsToHighlight,
      });
      return { ok: true };
    }),

  /** Step 3a: free score + teaser bullets (no payment required). */
  generateTeaser: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const r = await db.getRewriteById(input.id);
      if (!r || r.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const teaser = await runTeaser({
        originalText: r.originalText,
        roleType: r.roleType ?? undefined,
        industry: r.industry ?? undefined,
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

  /** Step 3b: full rewrite. Requires either paid=true on this row, or active subscription. */
  generateFull: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const r = await db.getRewriteById(input.id);
      if (!r || r.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const fresh = await db.getUserById(ctx.user.id);
      const subscribed = fresh ? isSubscribedActive(fresh) : false;

      if (!r.paid && !subscribed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Payment required: purchase a single rewrite or subscribe for unlimited rewrites.",
        });
      }

      // If the user is subscribed, mark this rewrite as paid for history clarity
      if (subscribed && !r.paid) {
        await db.updateRewrite(input.id, { paid: true });
      }

      const result = await runRewrite({
        originalText: r.originalText,
        roleType: r.roleType ?? undefined,
        industry: r.industry ?? undefined,
        jobDescription: r.jobDescription ?? undefined,
        concerns: (r.concerns as string[]) ?? [],
        yearsToHighlight: r.yearsToHighlight ?? undefined,
      });

      // Generate downloadable PDF and DOCX and stash them in storage
      let pdfKey: string | undefined;
      let docxKey: string | undefined;
      try {
        const pdfBuf = await generatePdf(result.rewrittenJson);
        const docxBuf = await generateDocx(result.rewrittenJson);
        const baseName = (result.rewrittenJson.name || "resume").replace(/[^A-Za-z0-9_-]+/g, "_");
        const p1 = await storagePut(`rewrites/${ctx.user.id}/${input.id}/${baseName}.pdf`, pdfBuf, "application/pdf");
        const p2 = await storagePut(
          `rewrites/${ctx.user.id}/${input.id}/${baseName}.docx`,
          docxBuf,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        pdfKey = p1.key;
        docxKey = p2.key;
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
        pdfUrl: pdfKey ? `/manus-storage/${pdfKey}` : null,
        docxUrl: docxKey ? `/manus-storage/${docxKey}` : null,
      };
    }),

  /** Fetch a single rewrite (used by results page and dashboard). */
  get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const r = await db.getRewriteById(input.id);
    if (!r || (r.userId !== ctx.user.id && ctx.user.role !== "admin")) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    return {
      ...r,
      pdfUrl: r.pdfFileKey ? `/manus-storage/${r.pdfFileKey}` : null,
      docxUrl: r.docxFileKey ? `/manus-storage/${r.docxFileKey}` : null,
    };
  }),

  /** History list for the current user. */
  myHistory: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db.listRewritesByUser(ctx.user.id);
    return rows.map(r => ({
      id: r.id,
      roleType: r.roleType,
      industry: r.industry,
      atsScore: r.atsScore,
      paid: r.paid,
      status: r.status,
      createdAt: r.createdAt,
      pdfUrl: r.pdfFileKey ? `/manus-storage/${r.pdfFileKey}` : null,
      docxUrl: r.docxFileKey ? `/manus-storage/${r.docxFileKey}` : null,
    }));
  }),

  /** Local heuristic scoring helper, exposed for unit tests. */
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
