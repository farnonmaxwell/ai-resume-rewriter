import { z } from "zod";
import * as db from "../db";
import { syncSubscriber } from "../mailchimp";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const marketingRouter = router({
  /** Public contact form capture from the contact page. */
  submitContact: publicProcedure
    .input(z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().email().max(254),
      subject: z.string().trim().max(160).optional(),
      message: z.string().trim().min(10).max(4000),
      source: z.string().trim().max(64).default("contact"),
    }))
    .mutation(async ({ input }) => {
      await db.createContactSubmission(input);
      return { ok: true };
    }),

  /** Public newsletter capture from the landing page. */
  subscribe: publicProcedure
    .input(z.object({ email: z.string().email(), source: z.string().max(64).default("landing") }))
    .mutation(async ({ input }) => {
      await db.addEmailSubscriber({ email: input.email, source: input.source });
      const r = await syncSubscriber(input.email, input.source);
      return { ok: true, stub: r.stub };
    }),

  /** When a logged-in user opts in (e.g., from dashboard). */
  optIn: protectedProcedure
    .input(z.object({ optIn: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db.updateUser(ctx.user.id, { emailSubscribed: input.optIn });
      if (input.optIn && ctx.user.email) {
        await db.addEmailSubscriber({ email: ctx.user.email, source: "user-optin" });
        await syncSubscriber(ctx.user.email, "user-optin");
      }
      return { ok: true };
    }),
});
