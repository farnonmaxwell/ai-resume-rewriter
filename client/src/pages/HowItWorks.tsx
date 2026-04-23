import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText, ScanLine, Upload as UploadIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function HowItWorksPage() {
  const [, setLocation] = useLocation();
  const steps = [
    { icon: UploadIcon, title: "1. Upload your resume", body: "PDF, DOCX, or paste plain text. We extract everything automatically and never share your file." },
    { icon: ScanLine, title: "2. Tell us what you are targeting", body: "Five quick questions about role type, industry, target job description, concerns, and which years to highlight." },
    { icon: FileText, title: "3. Get scored and rewritten", body: "Free ATS Compatibility Score and a teaser of your rewrite. Upgrade to unlock the full rewrite, comparison, and downloads." },
  ];
  const what = [
    "Removes age-bias signals (old graduation dates, dated tech, objective statements)",
    "Optimizes for ATS keywords drawn from the job description",
    "Modernizes formatting for clean ATS parsing (no tables, columns, or graphics)",
    "Rewrites duty bullets as achievement bullets",
    "Quantifies impact only when the original suggests numbers",
    "Generates a transparent Keywords Match Score",
  ];

  return (
    <PageShell>
      <section className="bg-eo50-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="font-display text-4xl md:text-5xl font-bold">How EO50 rewrites your resume</h1>
          <p className="mt-4 text-white/80">Built with one belief: the problem isn&apos;t you, it is the language the systems are filtering for.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {steps.map(s => (
            <Card key={s.title} className="border-eo50-mid-gray">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-eo50-navy text-eo50-gold flex items-center justify-center mb-3">
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="font-display text-xl font-bold text-eo50-navy">{s.title}</div>
                <p className="text-sm text-eo50-muted mt-2 leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-eo50-light-gray py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-eo50-navy text-center">What our AI Rewrite Engine actually does</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {what.map(w => (
              <li key={w} className="flex items-start gap-2 text-sm text-eo50-navy bg-white border border-eo50-mid-gray rounded p-4">
                <CheckCircle2 className="w-5 h-5 text-eo50-gold mt-0.5" /> {w}
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Button className="bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)] h-12 px-8" onClick={() => setLocation("/upload")}>
              Start your free score
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
