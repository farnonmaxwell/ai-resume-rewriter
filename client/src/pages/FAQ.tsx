import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "What does JASS do?",
    answer: "JASS reviews your resume against a real job posting, shows the gaps, and rewrites the resume so hiring systems and hiring managers can see the fit more clearly.",
  },
  {
    question: "Is the free tier really free?",
    answer: "Yes. The free tier includes one resume rewrite against one job posting. You need an account so your resume and rewrite stay tied to your private workspace.",
  },
  {
    question: "What is included in the one-off service?",
    answer: "The one-off service is a single full deliverable for $59.99. It includes a resume rewrite plus up to five matched jobs, delivered and done without a monthly commitment.",
  },
  {
    question: "What is included in the monthly plan?",
    answer: "The monthly plan is $49.99 per month and is designed for an active job search. It includes ongoing resume optimization, job matching, an application tracker, follow-ups, and interview preparation. You can cancel anytime.",
  },
  {
    question: "Are payment buttons live yet?",
    answer: "Not yet. Stripe payment buttons are being shown as placeholders until payment keys are connected. Free account signup and resume workflow access remain available.",
  },
  {
    question: "Will JASS invent experience for me?",
    answer: "No. JASS can sharpen language, improve structure, highlight evidence, and align keywords, but it should not invent achievements, credentials, or job history.",
  },
  {
    question: "How are files handled?",
    answer: "Add your resume securely. Files are stored privately and encrypted. They are used to create your review and rewrite inside your account.",
  },
  {
    question: "What if the job is not a strong match?",
    answer: "JASS will tell you. If your resume and the posting are too far apart, it flags the mismatch and gives you a chance to explain relevant background before generating the rewrite.",
  },
];

export default function FAQPage() {
  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <p className="text-xs uppercase tracking-[0.24em] text-jass-gold font-semibold">JASS FAQ</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">Straight answers before you start</h1>
          <p className="mt-4 text-white/80 text-lg">No hype, no mystery. Here is what JASS does, what each tier includes, and what is still being connected.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {faqs.map((item) => (
            <Card key={item.question} className="border-jass-mid-gray">
              <CardContent className="p-5 md:p-6">
                <h2 className="font-display text-xl font-bold text-jass-navy">{item.question}</h2>
                <p className="mt-2 text-sm md:text-base text-jass-muted leading-relaxed">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
