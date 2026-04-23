import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import * as db from "./db";
import { getStripe } from "./stripeClient";

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string | undefined;
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!sig || !secret) {
        console.error("[Webhook] missing signature or secret");
        return res.status(400).send("Missing signature");
      }
      const stripe = getStripe();
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
      } catch (e) {
        console.error("[Webhook] signature verification failed", e);
        return res.status(400).send(`Webhook Error: ${(e as Error).message}`);
      }

      // Required: Stripe test events probe
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected");
        return res.json({ verified: true });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = Number(session.client_reference_id || session.metadata?.user_id || 0);
            const type = (session.metadata?.type as "one_time" | "subscription" | undefined) ?? (session.mode === "subscription" ? "subscription" : "one_time");
            if (session.customer && userId) {
              const u = await db.getUserById(userId);
              if (u && !u.stripeCustomerId) {
                await db.updateUser(userId, { stripeCustomerId: String(session.customer) });
              }
            }
            if (type === "one_time") {
              const rewriteId = Number(session.metadata?.rewrite_id || 0);
              if (rewriteId) await db.updateRewrite(rewriteId, { paid: true });
              await db.recordPayment({
                userId: userId || null,
                stripeSessionId: session.id,
                stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
                amount: session.amount_total ?? 0,
                currency: session.currency ?? "usd",
                type: "one_time",
                status: "succeeded",
                rewriteId: rewriteId || null,
              });
            } else {
              if (userId) {
                await db.updateUser(userId, {
                  stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
                  subscriptionStatus: "active",
                });
              }
              await db.recordPayment({
                userId: userId || null,
                stripeSessionId: session.id,
                amount: session.amount_total ?? 0,
                currency: session.currency ?? "usd",
                type: "subscription",
                status: "active",
                rewriteId: null,
              });
            }
            break;
          }
          case "customer.subscription.updated":
          case "customer.subscription.created": {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = String(sub.customer);
            const u = await db.findUserByStripeCustomerId(customerId);
            if (u) {
              await db.updateUser(u.id, {
                stripeSubscriptionId: sub.id,
                subscriptionStatus: sub.status,
              });
            }
            break;
          }
          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const u = await db.findUserByStripeCustomerId(String(sub.customer));
            if (u) {
              await db.updateUser(u.id, { subscriptionStatus: "canceled" });
            }
            break;
          }
          case "invoice.paid":
          case "invoice.payment_succeeded": {
            const inv = event.data.object as Stripe.Invoice;
            const u = inv.customer ? await db.findUserByStripeCustomerId(String(inv.customer)) : undefined;
            await db.recordPayment({
              userId: u?.id ?? null,
              stripeInvoiceId: inv.id,
              amount: inv.amount_paid ?? 0,
              currency: inv.currency ?? "usd",
              type: "subscription",
              status: "paid",
              rewriteId: null,
            });
            break;
          }
          default:
            console.log(`[Webhook] unhandled event ${event.type}`);
        }
      } catch (e) {
        console.error("[Webhook] handler error", e);
      }

      res.json({ received: true });
    },
  );
}
