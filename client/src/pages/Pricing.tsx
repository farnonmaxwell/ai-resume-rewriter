import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

const tiers = [
  {
    eyebrow: "Free",
    name: "One JASS Review",
    price: "$0",
    description: "One resume rewrite against one job posting. Sign-up is required so your resume stays private and tied to your account.",
    features: ["One job posting", "One rewrite, with up to 3 attempts for the same role", "Role-fit score and keyword gaps", "Clean, practical feedback before you pay"],
    cta: "Start free",
    highlight: false,
  },
  {
    eyebrow: "One-off",
    name: "Full JASS Deliverable",
    price: "$59.99",
    description: "A capped transaction: pay once, get the deliverable, and move on without an ongoing plan.",
    features: ["Full tailored rewrite", "Up to 5 job matches", "One rewrite cycle", "Professional ATS-parseable PDF"],
    cta: "Choose one-off",
    highlight: false,
  },
  {
    eyebrow: "Monthly",
    name: "Full JASS System",
    price: "$49.99/month",
    description: "Ongoing access for an active job search with unlimited support and the tools that keep you moving.",
    features: ["Unlimited rewrites", "Tracker access", "Follow-up support", "Interview preparation", "Cancel anytime"],
    cta: "Choose monthly",
    highlight: true,
  },
];

export default function PricingPage() {
  const [, setLocation] = useLocation();

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs uppercase tracking-[0.24em] text-jass-gold font-semibold">JASS Pricing</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">Start free. Pay only when you want the full system.</h1>
          <p className="mt-5 text-white/80 text-lg">
            JASS gives you an honest first read before asking you to commit. Choose a one-off deliverable when you need a single result, or monthly access when your job search needs ongoing support.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.highlight ? "border-jass-gold border-2 shadow-lg" : "border-jass-mid-gray"}>
              <CardContent className="p-6 flex h-full flex-col">
                <div className={tier.highlight ? "text-xs uppercase tracking-wider text-jass-gold font-semibold" : "text-xs uppercase tracking-wider text-jass-muted"}>{tier.eyebrow}</div>
                <h2 className="font-display text-2xl font-bold text-jass-navy mt-2">{tier.name}</h2>
                <div className="font-display text-4xl font-bold text-jass-navy mt-3">{tier.price}</div>
                <p className="text-sm text-jass-muted mt-3">{tier.description}</p>
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
                  className={tier.highlight ? "w-full mt-6 bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]" : "w-full mt-6 border-jass-navy text-jass-navy"}
                  onClick={() => setLocation("/upload")}
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-center">
          <h2 className="font-display text-2xl font-bold text-jass-navy">One-off means done. Monthly means ongoing.</h2>
          <p className="mt-3 text-jass-muted">
            The one-off tier is a capped transaction: one payment, a focused deliverable, and no continuing access. The monthly tier is for candidates who want the full JASS workflow throughout an active search.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
