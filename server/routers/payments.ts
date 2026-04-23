import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PRODUCTS } from "@shared/products";
import * as db from "../db";
import { getStripe } from "../stripeClient";
import { protectedProcedure, router } from "../_core/trpc";

async function ensureCustomer(userId: number, email?: string | null, name?: string | null): Promise<string> {
  const u = await db.getUserById(userId);
  if (u?.stripeCustomerId) return u.stripeCustomerId;
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: name ?? undefined,
    metadata: { user_id: String(userId) },
  });
  await db.updateUser(userId, { stripeCustomerId: customer.id });
  return customer.id;
}

export const paymentsRouter = router({
  /** Create a Checkout Session for either a one-time rewrite or the monthly subscription. */
  createCheckout: protectedProcedure
    .input(
      z.object({
        type: z.enum(["one_time", "subscription"]),
        rewriteId: z.number().int().positive().optional(),
        origin: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const customerId = await ensureCustomer(ctx.user.id, ctx.user.email, ctx.user.name as string | null);
      const baseMeta = {
        user_id: String(ctx.user.id),
        customer_email: ctx.user.email ?? "",
        customer_name: (ctx.user.name as string) ?? "",
      };

      if (input.type === "one_time") {
        if (!input.rewriteId) throw new TRPCError({ code: "BAD_REQUEST", message: "rewriteId required" });
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          customer: customerId,
          client_reference_id: String(ctx.user.id),
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: PRODUCTS.oneTime.currency,
                unit_amount: PRODUCTS.oneTime.amount,
                product_data: {
                  name: PRODUCTS.oneTime.name,
                  description: PRODUCTS.oneTime.description,
                },
              },
              quantity: 1,
            },
          ],
          success_url: `${input.origin}/results/${input.rewriteId}?paid=1`,
          cancel_url: `${input.origin}/intake/${input.rewriteId}?canceled=1`,
          metadata: { ...baseMeta, type: "one_time", rewrite_id: String(input.rewriteId) },
        });
        return { url: session.url };
      }

      // Subscription
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: String(ctx.user.id),
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: PRODUCTS.subscription.currency,
              unit_amount: PRODUCTS.subscription.amount,
              recurring: { interval: PRODUCTS.subscription.interval },
              product_data: {
                name: PRODUCTS.subscription.name,
                description: PRODUCTS.subscription.description,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${input.origin}/dashboard?subscribed=1`,
        cancel_url: `${input.origin}/pricing?canceled=1`,
        metadata: { ...baseMeta, type: "subscription" },
      });
      return { url: session.url };
    }),

  /** Open the Stripe billing portal for managing subscription. */
  customerPortal: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const u = await db.getUserById(ctx.user.id);
      if (!u?.stripeCustomerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No Stripe customer record yet" });
      }
      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: u.stripeCustomerId,
        return_url: `${input.origin}/dashboard`,
      });
      return { url: session.url };
    }),

  /** Status check used by frontend to know whether the user's subscription is active. */
  myStatus: protectedProcedure.query(async ({ ctx }) => {
    const u = await db.getUserById(ctx.user.id);
    return {
      stripeCustomerId: u?.stripeCustomerId ?? null,
      subscriptionStatus: u?.subscriptionStatus ?? null,
      isSubscribed: ["active", "trialing"].includes((u?.subscriptionStatus ?? "").toLowerCase()),
    };
  }),
});
