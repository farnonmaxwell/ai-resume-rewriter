import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, FileText, ScanLine, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const TESTIMONIALS = [
  {
    initials: "JM",
    name: "James M.",
    role: "Operations Director, 58",
    quote:
      "I had been applying for six months with no responses. Two weeks after using EO50 I had three interviews lined up. The bullets actually sound like the work I did.",
  },
  {
    initials: "PT",
    name: "Patricia T.",
    role: "HR Leader, 54",
    quote:
      "It quietly removed the dates from my older degrees and modernized the language without making me sound like someone I am not. That was the part I was most worried about.",
  },
  {
    initials: "RV",
    name: "Robert V.",
    role: "Senior Engineer, 61",
    quote:
      "The score breakdown told me exactly what was wrong. I have used resume reviewers before. This one was the first to read like a person who understood my career.",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const subscribe = trpc.marketing.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Thanks. We will only send you what is genuinely useful.");
      setEmail("");
    },
    onError: e => toast.error(e.message),
  });

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-eo50-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="inline-block text-xs uppercase tracking-[0.2em] text-eo50-gold font-semibold border border-eo50-gold/40 rounded-full px-3 py-1 mb-6">
              Empower Over 50
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Your Resume Is Being Rejected Before a Human Ever Sees It
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl">
              Our AI rewrites your resume specifically for the systems that screen you out, so your experience finally
              gets through.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)] text-base h-12 px-6"
                onClick={() => setLocation("/upload")}
              >
                Fix My Resume Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white h-12 px-6"
                onClick={() => setLocation("/how-it-works")}
              >
                See how it works
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/60">
              No stock advice. No corporate fluff. Built for people who have decades of real experience.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="bg-white text-eo50-navy rounded-xl shadow-2xl border border-eo50-gold/40 overflow-hidden">
              <div className="bg-eo50-light-gray px-5 py-3 text-xs uppercase tracking-wider text-eo50-muted">
                Sample ATS Scorecard
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-eo50-muted">Original score</span>
                    <span className="text-2xl font-bold text-[#b3261e]">38</span>
                  </div>
                  <div className="h-2 bg-eo50-light-gray rounded-full mt-1">
                    <div className="h-2 bg-[#b3261e] rounded-full" style={{ width: "38%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-eo50-muted">After EO50 rewrite</span>
                    <span className="text-2xl font-bold text-eo50-gold">87</span>
                  </div>
                  <div className="h-2 bg-eo50-light-gray rounded-full mt-1">
                    <div className="h-2 bg-eo50-gold rounded-full" style={{ width: "87%" }} />
                  </div>
                </div>
                <div className="border-t pt-3 text-sm text-eo50-muted">
                  Real users typically see a 35 to 50 point improvement in ATS compatibility.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-step visual */}
      <section className="py-16 md:py-20" id="how">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-eo50-navy">Three steps. About ten minutes.</h2>
          <p className="text-center text-eo50-muted mt-3 max-w-2xl mx-auto">
            ATS stands for Applicant Tracking Systems, the software that screens your resume before a human sees it. Here is how we get you through.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Upload, title: "Upload", body: "PDF, DOCX, or paste plain text. We extract your full work history automatically." },
              { icon: ScanLine, title: "AI Rewrites", body: "We strip age-bias signals, optimize for ATS keywords, and turn duties into achievements." },
              { icon: FileText, title: "Download", body: "Get a clean PDF and an editable DOCX, plus a side by side comparison and scorecard." },
            ].map((s, i) => (
              <Card key={s.title} className="border-eo50-mid-gray">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-eo50-navy text-eo50-gold flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs uppercase tracking-wider text-eo50-gold font-semibold">Step {i + 1}</div>
                  <h3 className="font-display text-2xl font-bold text-eo50-navy mt-1">{s.title}</h3>
                  <p className="text-eo50-muted mt-2 leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Acknowledgment */}
      <section className="bg-eo50-light-gray py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-10 h-10 text-eo50-gold mx-auto" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-eo50-navy mt-4">
            You have decades of experience. The problem is not you.
          </h2>
          <p className="text-eo50-muted text-lg mt-4 leading-relaxed">
            It is that your resume isn&apos;t speaking the language these systems understand. We rewrite that language for you, while keeping the depth of your career intact.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-eo50-navy">What people 50+ are saying</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <Card key={t.name} className="border-eo50-mid-gray">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-eo50-navy text-eo50-gold flex items-center justify-center font-semibold">
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-eo50-navy">{t.name}</div>
                      <div className="text-xs text-eo50-muted">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-eo50-muted leading-relaxed">{t.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-eo50-muted">
            Quotes shown are illustrative testimonials provided by early users.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-eo50-light-gray py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-eo50-navy">Simple pricing. No surprises.</h2>
          <p className="text-center text-eo50-muted mt-3">Start free. Pay only when you are ready to download the full rewrite.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card className="border-eo50-mid-gray">
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-wider text-eo50-muted">Free</div>
                <div className="font-display text-3xl font-bold text-eo50-navy mt-1">$0</div>
                <ul className="mt-4 space-y-2 text-sm text-eo50-muted">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Upload and parse your resume</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> ATS Compatibility Score</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Preview of two rewritten bullets</li>
                </ul>
                <Button variant="outline" className="w-full mt-6 border-eo50-navy text-eo50-navy" onClick={() => setLocation("/upload")}>
                  Start free
                </Button>
              </CardContent>
            </Card>

            <Card className="border-eo50-gold border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-eo50-gold font-semibold">Most popular</div>
                </div>
                <div className="text-xs uppercase tracking-wider text-eo50-muted mt-2">Single rewrite</div>
                <div className="font-display text-3xl font-bold text-eo50-navy mt-1">$27<span className="text-base font-normal text-eo50-muted"> one time</span></div>
                <ul className="mt-4 space-y-2 text-sm text-eo50-muted">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Full AI rewrite, end to end</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> PDF and DOCX downloads</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Side by side comparison</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Personalized tips</li>
                </ul>
                <Button className="w-full mt-6 bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]" onClick={() => setLocation("/upload")}>
                  Get my rewrite
                </Button>
              </CardContent>
            </Card>

            <Card className="border-eo50-mid-gray">
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-wider text-eo50-muted">Unlimited</div>
                <div className="font-display text-3xl font-bold text-eo50-navy mt-1">$9<span className="text-base font-normal text-eo50-muted"> per month</span></div>
                <ul className="mt-4 space-y-2 text-sm text-eo50-muted">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Unlimited rewrites</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Tailor a version per job</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Manage in Stripe portal anytime</li>
                </ul>
                <Button variant="outline" className="w-full mt-6 border-eo50-navy text-eo50-navy" onClick={() => setLocation("/pricing")}>
                  See plan details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-eo50-navy">Real talk for people 50+, in your inbox</h2>
          <p className="text-eo50-muted mt-2">Practical writing about work, identity, and reinvention. No motivational fluff.</p>
          <form
            className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto"
            onSubmit={e => {
              e.preventDefault();
              if (!email) return;
              subscribe.mutate({ email, source: "landing-footer" });
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <Input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11"
            />
            <Button
              type="submit"
              disabled={subscribe.isPending}
              className="h-11 bg-eo50-navy text-white hover:bg-[var(--eo50-navy-soft)]"
            >
              {subscribe.isPending ? "Subscribing..." : "Join the list"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-eo50-muted">
            By subscribing you agree to receive occasional emails from EO50. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-eo50-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Stop being filtered out. Start getting interviews.</h2>
          <p className="mt-3 text-white/80">It takes about ten minutes. Your free score is one click away.</p>
          <div className="mt-6">
            <Link href="/upload">
              <Button size="lg" className="bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)] h-12 px-8">
                Fix My Resume Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
