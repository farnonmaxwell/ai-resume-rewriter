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
    role: "Operations Director",
    quote: "The critique was direct without being cruel. It showed exactly where my resume was underselling me and gave me language I could actually defend in an interview.",
  },
  {
    initials: "PT",
    name: "Patricia T.",
    role: "Healthcare Manager",
    quote: "JASS made the resume tighter, clearer, and more relevant to the role. It did not flatten my experience into generic AI language.",
  },
  {
    initials: "RV",
    name: "Robert V.",
    role: "Senior Engineer",
    quote: "The score breakdown told me what was wrong. The rewrite sounded like a better version of me, not a stranger.",
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
    onError: (error) => toast.error(error.message),
  });

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="inline-block text-xs uppercase tracking-[0.2em] text-jass-gold font-semibold border border-jass-gold/40 rounded-full px-3 py-1 mb-6">
              JASS · Job Application Support System
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Your resume probably undersells you. JASS shows what to fix.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl">
              JASS rewrites resumes with a senior executive coach voice: direct, caring, and unsentimental about what modern hiring systems reward.
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
            <p className="mt-5 text-sm text-white/60">Supabase auth, private resume storage, and direct OpenAI rewriting are now the core architecture.</p>
          </div>

          <div className="md:col-span-5">
            <Card className="bg-white text-jass-navy shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-jass-light-gray flex items-center justify-center">
                    <FileText className="w-6 h-6 text-jass-gold" />
                  </div>
                  <div>
                    <div className="font-semibold">JASS resume review</div>
                    <div className="text-sm text-jass-muted">Senior executive coach tone</div>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg bg-jass-light-gray p-4">
                    <div className="text-xs uppercase tracking-wide text-jass-muted">Before</div>
                    <p className="mt-1 text-jass-muted">Responsible for operations, reporting, and team coordination.</p>
                  </div>
                  <div className="rounded-lg border border-jass-gold/40 p-4">
                    <div className="text-xs uppercase tracking-wide text-jass-gold font-semibold">After JASS rewrite</div>
                    <p className="mt-1 text-jass-navy">Led cross-functional operations reporting that improved executive visibility, reduced handoff delays, and gave hiring managers clearer evidence of impact.</p>
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
              { icon: Upload, title: "Upload or paste", text: "Add your resume securely. Files are stored privately in Supabase Storage under your account." },
              { icon: ScanLine, title: "Select your work type", text: "JASS branches by professional, trade, healthcare, logistics, service, or other work from the first authenticated screen." },
              { icon: Sparkles, title: "Get a direct rewrite", text: "The AI voice is practical and specific: your resume undersells you; here is what I would fix." },
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

      <section className="py-14 bg-jass-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.initials} className="border-jass-mid-gray bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-jass-navy text-white flex items-center justify-center font-semibold">{testimonial.initials}</div>
                  <div>
                    <div className="font-semibold text-jass-navy">{testimonial.name}</div>
                    <div className="text-xs text-jass-muted">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-sm text-jass-muted leading-relaxed">“{testimonial.quote}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-jass-navy">Want build updates?</h2>
          <p className="mt-3 text-jass-muted">Join the JASS update list. No spam, no motivational fluff.</p>
          <form
            className="mt-6 flex flex-col sm:flex-row gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              subscribe.mutate({ email, source: "home" });
            }}
          >
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required className="h-12" />
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
