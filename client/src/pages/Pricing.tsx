import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JOB_TYPES } from "@shared/jass";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function PricingPage() {
  const [, setLocation] = useLocation();

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="font-display text-4xl md:text-5xl font-bold">JASS pricing is job-type aware.</h1>
          <p className="mt-4 text-white/80">Payment flows are intentionally not active in this build. The architecture now displays pricing according to the work category selected during onboarding.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-jass-muted">Assessment</div>
              <div className="font-display text-4xl font-bold text-jass-navy mt-1">$0</div>
              <p className="text-sm text-jass-muted mt-2">Get a direct read on whether your resume is helping or hurting you.</p>
              <ul className="mt-4 space-y-2 text-sm text-jass-muted">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Job-type-aware scoring baseline</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Resume format recommendation</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Two rewritten bullet samples</li>
              </ul>
              <Button variant="outline" className="w-full mt-6 border-jass-navy text-jass-navy" onClick={() => setLocation("/upload")}>Start free</Button>
            </CardContent>
          </Card>

          <Card className="border-jass-gold border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-jass-gold font-semibold">Core workflow</div>
              <div className="text-xs uppercase tracking-wider text-jass-muted mt-2">Single rewrite</div>
              <div className="font-display text-4xl font-bold text-jass-navy mt-1">Displayed by profile</div>
              <p className="text-sm text-jass-muted mt-2">The selected work type determines the resume format, scoring priorities, and pricing copy shown to the user.</p>
              <ul className="mt-4 space-y-2 text-sm text-jass-muted">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Complete JASS rewrite</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Side-by-side comparison</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> PDF and DOCX downloads</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Senior executive coach critique</li>
              </ul>
              <Button className="w-full mt-6 bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]" onClick={() => setLocation("/upload")}>Start a rewrite</Button>
            </CardContent>
          </Card>

          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-jass-muted">Tonight's build status</div>
              <div className="font-display text-4xl font-bold text-jass-navy mt-1">No checkout</div>
              <p className="text-sm text-jass-muted mt-2">Payment flows are intentionally out of scope for this build; pricing is displayed only as product positioning.</p>
              <ul className="mt-4 space-y-2 text-sm text-jass-muted">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Authentication through Supabase</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Resume uploads through Supabase Storage</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Feedback loop data model ready</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <h2 className="font-display text-2xl font-bold text-jass-navy">Job-type pricing display hooks</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {JOB_TYPES.map((type) => (
              <div key={type.value} className="rounded-lg border border-jass-mid-gray bg-white p-4">
                <div className="font-semibold text-jass-navy">{type.label}</div>
                <p className="text-sm text-jass-muted mt-1">{type.pricingAudience}: displayed monthly price ${type.displayedMonthlyPrice}.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
