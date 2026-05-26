import { z } from "zod";
import { BLS_INDUSTRIES, JOB_TYPES } from "@shared/jass";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { rewritesRouter } from "./routers/rewrites";
import { adminRouter } from "./routers/admin";
import { marketingRouter } from "./routers/marketing";

const jobTypeValues = JOB_TYPES.map((type) => type.value) as [string, ...string[]];
const industryValues = BLS_INDUSTRIES as readonly [string, ...string[]];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.ensureProfile(ctx.user.id);
    }),
    upsert: protectedProcedure
      .input(
        z.object({
          jobType: z.enum(jobTypeValues),
          targetRole: z.string().max(160).optional().nullable(),
          industry: z.enum(industryValues),
          industryOther: z.string().max(160).optional().nullable(),
          targetIndustry: z.enum(industryValues).optional().nullable(),
          targetIndustryOther: z.string().max(160).optional().nullable(),
          feedbackOptIn: z.boolean().optional(),
        })
          .refine((value) => value.industry !== "Other" || Boolean(value.industryOther?.trim()), {
            message: "Please describe the industry you are coming from when choosing Other.",
            path: ["industryOther"],
          })
          .refine((value) => value.targetIndustry !== "Other" || Boolean(value.targetIndustryOther?.trim()), {
            message: "Please describe the industry you are targeting when choosing Other.",
            path: ["targetIndustryOther"],
          }),
      )
      .mutation(async ({ ctx, input }) => {
        return await db.upsertProfile(ctx.user.id, input);
      }),
  }),
  rewrites: rewritesRouter,
  admin: adminRouter,
  marketing: marketingRouter,
});

export type AppRouter = typeof appRouter;
