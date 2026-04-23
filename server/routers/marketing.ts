import { z } from "zod";
import * as db from "../db";
import { syncSubscriber } from "../mailchimp";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const marketingRouter = router({
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
