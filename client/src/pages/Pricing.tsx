import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const checkout = trpc.payments.createCheckout.useMutation({
    onSuccess: r => {
      if (r.url) {
        toast.message("Redirecting to secure checkout");
        window.open(r.url, "_blank");
      }
    },
    onError: e => toast.error(e.message),
  });

  const startSub = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    checkout.mutate({ type: "subscription", origin: window.location.origin });
  };

  return (
    <PageShell>
      <section className="bg-eo50-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Simple pricing. Built for one purpose: to get you interviews.</h1>
          <p className="mt-4 text-white/80">Start free. Upgrade only when you are ready to download the full rewrite.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          <Card className="border-eo50-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-eo50-muted">Free</div>
              <div className="font-display text-4xl font-bold text-eo50-navy mt-1">$0</div>
              <p className="text-sm text-eo50-muted mt-2">Get an honest assessment of your resume.</p>
              <ul className="mt-4 space-y-2 text-sm text-eo50-muted">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> ATS Compatibility Score with breakdown</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Age-bias signals detected</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Two rewritten bullet samples</li>
              </ul>
              <Button variant="outline" className="w-full mt-6 border-eo50-navy text-eo50-navy" onClick={() => setLocation("/upload")}>
                Start free
              </Button>
            </CardContent>
          </Card>

          <Card className="border-eo50-gold border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-eo50-gold font-semibold">Most popular</div>
              <div className="text-xs uppercase tracking-wider text-eo50-muted mt-2">Single rewrite</div>
              <div className="font-display text-4xl font-bold text-eo50-navy mt-1">$27</div>
              <p className="text-sm text-eo50-muted mt-2">One job, one full rewrite, no subscription.</p>
              <ul className="mt-4 space-y-2 text-sm text-eo50-muted">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Complete AI rewrite</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Side by side comparison</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> PDF and DOCX downloads</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Personalized tips and changelog</li>
              </ul>
              <Button className="w-full mt-6 bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]" onClick={() => setLocation("/upload")}>
                Start a rewrite
              </Button>
            </CardContent>
          </Card>

          <Card className="border-eo50-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-eo50-muted">Unlimited</div>
              <div className="font-display text-4xl font-bold text-eo50-navy mt-1">$9<span className="text-base font-normal text-eo50-muted"> per month</span></div>
              <p className="text-sm text-eo50-muted mt-2">For active job seekers tailoring multiple versions.</p>
              <ul className="mt-4 space-y-2 text-sm text-eo50-muted">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Unlimited rewrites</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> One version per role you target</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Cancel anytime in Stripe portal</li>
              </ul>
              <Button className="w-full mt-6 bg-eo50-navy text-white hover:bg-[var(--eo50-navy-soft)]" onClick={startSub} disabled={checkout.isPending}>
                {checkout.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</> : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <p className="mt-6 text-center text-xs text-eo50-muted">All payments are processed securely by Stripe. Test card 4242 4242 4242 4242 works in sandbox mode.</p>
      </section>
    </PageShell>
  );
}
