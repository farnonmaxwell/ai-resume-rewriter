import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

const tiers = [
  {
    eyebrow: "Free",
    name: "One Resume Rewrite",
    price: "$0",
    description: "One resume rewrite against one job posting. Sign-up is required so the work stays private in your account.",
    features: ["One job posting", "One resume rewrite", "Role-fit score and keyword gaps", "Clear next steps before you pay"],
    cta: "Start free",
    highlight: false,
    paymentReady: true,
  },
  {
    eyebrow: "One-off",
    name: "Delivered and Done",
    price: "$59.99",
    description: "Full service including a resume rewrite plus up to five matched jobs. Pay once and finish the deliverable without a monthly plan.",
    features: ["Full tailored resume rewrite", "Up to 5 matched jobs", "Delivered as a complete one-off service", "No subscription commitment"],
    cta: "Coming soon",
    highlight: false,
    paymentReady: false,
  },
  {
    eyebrow: "Recommended",
    name: "Monthly Full Service",
    price: "$49.99/month",
    description: "Full service unlimited for an active search: optimization, matching, tracking, follow-ups, and interview preparation. Cancel anytime.",
    features: ["Unlimited resume optimization", "Job matching", "Application tracker", "Follow-ups", "Interview prep", "Cancel anytime"],
    cta: "Coming soon",
    highlight: true,
    paymentReady: false,
  },
];

export default function PricingPage() {
  const [, setLocation] = useLocation();

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs uppercase tracking-[0.24em] text-jass-gold font-semibold">JASS Pricing</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">Start free. Upgrade when the full service is ready.</h1>
          <p className="mt-5 text-white/80 text-lg">
            JASS gives you a focused free rewrite first. Paid Stripe checkout buttons are shown as placeholders until payment keys are connected.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.highlight ? "relative border-jass-gold border-2 shadow-xl" : "border-jass-mid-gray"}>
              {tier.highlight && (
                <div className="absolute -top-3 left-6 rounded-full bg-jass-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-jass-navy">
                  Recommended
                </div>
              )}
              <CardContent className="p-6 flex h-full flex-col">
                <div className={tier.highlight ? "text-xs uppercase tracking-wider text-jass-gold font-semibold" : "text-xs uppercase tracking-wider text-jass-muted"}>{tier.eyebrow}</div>
                <h2 className="font-display text-2xl font-bold text-jass-navy mt-2">{tier.name}</h2>
                <div className="font-display text-4xl font-bold text-jass-navy mt-3">{tier.price}</div>
                <p className="text-sm text-jass-muted mt-3 leading-relaxed">{tier.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-jass-muted flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlight ? "default" : "outline"}
                  className={tier.highlight ? "w-full mt-6 bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)] disabled:opacity-70" : "w-full mt-6 border-jass-navy text-jass-navy"}
                  onClick={() => tier.paymentReady && setLocation("/upload")}
                  disabled={!tier.paymentReady}
                >
                  {tier.cta}
                </Button>
                {!tier.paymentReady && <p className="mt-2 text-xs text-center text-jass-muted">Stripe checkout will be enabled when payment keys are provided.</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-center">
          <h2 className="font-display text-2xl font-bold text-jass-navy">One-off means done. Monthly means ongoing.</h2>
          <p className="mt-3 text-jass-muted">
            The one-off tier is a capped transaction. The monthly tier is the recommended option for people running a sustained search and wanting the complete JASS workflow.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
