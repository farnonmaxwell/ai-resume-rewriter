import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, FileText, ScanLine, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const subscribe = trpc.marketing.subscribe.useMutation({
    onSuccess: () => {
      toast.success("You're on the JASS update list.");
      setEmail("");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="inline-block text-xs uppercase tracking-[0.2em] text-jass-gold font-semibold border border-jass-gold/40 rounded-full px-3 py-1 mb-6">
              JASS · Resume support that gets you seen
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Beat the ATS. Move from resume review to interview.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl">
              JASS rewrites your resume in your own voice, tailored to the exact job you want, so hiring systems and real people can see the fit faster.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)] text-base h-12 px-6" onClick={() => setLocation("/auth")}>
                Start with JASS
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white h-12 px-6" onClick={() => setLocation("/how-it-works")}>
                See how it works
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/60">Clear scoring. Honest gaps. A stronger resume for the role in front of you.</p>
          </div>

          <div className="md:col-span-5">
            <Card className="bg-white text-jass-navy shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-jass-light-gray flex items-center justify-center">
                    <FileText className="w-6 h-6 text-jass-gold" />
                  </div>
                  <div>
                    <div className="font-semibold">JASS resume rewrite</div>
                    <div className="text-sm text-jass-muted">Your voice, sharper evidence</div>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg bg-jass-light-gray p-4">
                    <div className="text-xs uppercase tracking-wide text-jass-muted">Before</div>
                    <p className="mt-1 text-jass-muted">Responsible for operations, reporting, and team coordination.</p>
                  </div>
                  <div className="rounded-lg border border-jass-gold/40 p-4">
                    <div className="text-xs uppercase tracking-wide text-jass-gold font-semibold">After JASS rewrite</div>
                    <p className="mt-1 text-jass-navy">Led cross-functional operations reporting that improved visibility, reduced handoff delays, and gave hiring managers clearer evidence of impact.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Upload, title: "Upload or paste", text: "Add your resume securely. Files are stored privately and encrypted." },
              { icon: ScanLine, title: "Choose your target", text: "Tell JASS the role, work type, and industry you are aiming for so the rewrite matches the job in front of you." },
              { icon: Sparkles, title: "Get a tailored rewrite", text: "JASS rewrites the resume in your voice, strengthens the evidence, and keeps the content honest to your actual experience." },
            ].map((step) => (
              <Card key={step.title} className="border-jass-mid-gray">
                <CardContent className="p-6">
                  <step.icon className="w-8 h-8 text-jass-gold" />
                  <h2 className="font-display text-xl font-bold text-jass-navy mt-4">{step.title}</h2>
                  <p className="text-jass-muted mt-2 text-sm leading-relaxed">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-jass-mid-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-jass-navy">Want JASS updates?</h2>
          <p className="mt-3 text-jass-muted">Join the JASS update list. No spam, no motivational fluff.</p>
          <form
            className="mt-6 flex flex-col sm:flex-row gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmedEmail = email.trim();
              if (!trimmedEmail) {
                toast.error("Enter your email address first.");
                return;
              }
              subscribe.mutate({ email: trimmedEmail, source: "home" });
            }}
          >
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required className="h-12" aria-label="Email address" />
            <Button type="submit" className="h-12 bg-jass-navy text-white hover:bg-[var(--jass-navy-soft)]" disabled={subscribe.isPending}>
              {subscribe.isPending ? "Saving..." : "Keep me posted"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-jass-muted">By subscribing you agree to receive occasional JASS product updates. Unsubscribe anytime.</p>
          <div className="mt-8 text-sm text-jass-muted">
            <CheckCircle2 className="inline w-4 h-4 text-jass-gold mr-1" /> Already have an account? <Link href="/auth" className="text-jass-navy font-semibold underline">Sign in</Link>.
          </div>
        </div>
      </section>
    </PageShell>
  );
}
