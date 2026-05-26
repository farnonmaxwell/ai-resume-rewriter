import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText, ScanLine, Upload as UploadIcon } from "lucide-react";
import { useLocation } from "wouter";

const steps = [
  { icon: UploadIcon, title: "1. Add your resume", body: "Upload a file or paste the text. Files are stored privately and encrypted." },
  { icon: ScanLine, title: "2. Match it to a real role", body: "Tell JASS what kind of work you want and add the job posting so the review is grounded in the role you are actually pursuing." },
  { icon: FileText, title: "3. Move from review to interview", body: "JASS scores the fit, explains the gaps, and rewrites the resume in your voice for that specific job." },
];

const tiers = [
  {
    title: "Free",
    price: "$0",
    body: "One resume rewrite against one job posting. Sign-up required. You get one shot, with up to 3 attempts at the same rewrite.",
  },
  {
    title: "One-off",
    price: "$59.99",
    body: "A full JASS deliverable capped at 5 job matches and one rewrite cycle. Pay once, get the deliverable, and you are done.",
  },
  {
    title: "Monthly",
    price: "$49.99/month",
    body: "Full ongoing access with unlimited rewrites, tracker access, follow-ups, interview prep, and cancellation anytime.",
  },
];

const what = [
  "Checks whether the resume truly fits the job before rewriting it",
  "Explains specific score deductions instead of pretending every role is a perfect match",
  "Optimizes for hiring-system keywords drawn from the job description",
  "Rewrites duty bullets as clear evidence of value",
  "Keeps the final resume clean, professional, and ATS-parseable",
  "Preserves your voice while tailoring the resume to a specific job",
];

export default function HowItWorksPage() {
  const [, setLocation] = useLocation();

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="font-display text-4xl md:text-5xl font-bold">How JASS gets you from review to interview</h1>
          <p className="mt-4 text-white/80">JASS is blunt in the right way: it tells you whether the role is a realistic match, what is missing, and how your resume should change.</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-jass-navy">Choose the level of help you need</h2>
            <p className="mt-3 text-jass-muted">Free is a focused first pass. One-off is a capped deliverable. Monthly is ongoing access to the full JASS system.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.title} className="border-jass-mid-gray bg-white">
                <CardContent className="p-6">
                  <div className="font-display text-2xl font-bold text-jass-navy">{tier.title}</div>
                  <div className="font-display text-3xl font-bold text-jass-gold mt-2">{tier.price}</div>
                  <p className="text-sm text-jass-muted mt-3 leading-relaxed">{tier.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-jass-navy text-center">What JASS actually does</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {what.map(w => (
              <li key={w} className="flex items-start gap-2 text-sm text-jass-navy bg-white border border-jass-mid-gray rounded p-4">
                <CheckCircle2 className="w-5 h-5 text-jass-gold mt-0.5 shrink-0" /> {w}
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Button className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)] h-12 px-8" onClick={() => setLocation("/upload")}>
              Start your free review
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
