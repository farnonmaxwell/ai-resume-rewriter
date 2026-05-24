import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText, ScanLine, Upload as UploadIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function HowItWorksPage() {
  const [, setLocation] = useLocation();
  const steps = [
    { icon: UploadIcon, title: "1. Upload your resume", body: "PDF, DOCX, or paste plain text. We extract everything automatically and never share your file." },
    { icon: ScanLine, title: "2. Select your work type", body: "The first authenticated screen asks what kind of work you want. That answer drives resume format, scoring, sources, interview tone, and pricing copy." },
    { icon: FileText, title: "3. Get scored and rewritten", body: "JASS gives you a direct compatibility score, rewritten bullets, and a practical explanation of what changed and why." },
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
      <section className="bg-jass-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="font-display text-4xl md:text-5xl font-bold">How JASS rewrites your resume</h1>
          <p className="mt-4 text-white/80">Built on a direct premise: your resume may be underselling you, and modern hiring systems reward evidence, clarity, and relevance.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {steps.map(s => (
            <Card key={s.title} className="border-jass-mid-gray">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-jass-navy text-jass-gold flex items-center justify-center mb-3">
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="font-display text-xl font-bold text-jass-navy">{s.title}</div>
                <p className="text-sm text-jass-muted mt-2 leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-jass-light-gray py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-jass-navy text-center">What the JASS rewrite engine actually does</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {what.map(w => (
              <li key={w} className="flex items-start gap-2 text-sm text-jass-navy bg-white border border-jass-mid-gray rounded p-4">
                <CheckCircle2 className="w-5 h-5 text-jass-gold mt-0.5" /> {w}
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Button className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)] h-12 px-8" onClick={() => setLocation("/upload")}>
              Start your free score
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
