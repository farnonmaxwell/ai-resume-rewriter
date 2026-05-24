import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "bg-jass-gold" : value >= 60 ? "bg-[#d4a843]" : value >= 40 ? "bg-[#b88c2f]" : "bg-[#b3261e]";
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-jass-navy">{label}</span>
        <span className="font-semibold text-jass-navy">{value}/100</span>
      </div>
      <div className="h-2 bg-jass-light-gray rounded-full mt-1">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ScorePage() {
  const [, params] = useRoute<{ id: string }>("/score/:id");
  const id = params?.id || "";
  const [, setLocation] = useLocation();
  const [data, setData] = useState<Awaited<ReturnType<ReturnType<typeof trpc.rewrites.generateTeaser.useMutation>["mutateAsync"]>> | null>(null);

  const teaser = trpc.rewrites.generateTeaser.useMutation();
  const generateFull = trpc.rewrites.generateFull.useMutation();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await teaser.mutateAsync({ id });
        if (!cancelled) setData(result);
      } catch (error: any) {
        toast.error(error?.message ?? "Could not score your resume");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id) {
    return <PageShell><div className="py-20 text-center">Missing rewrite id.</div></PageShell>;
  }

  if (!data) {
    return (
      <PageShell>
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-jass-gold mx-auto" />
          <p className="mt-4 text-jass-muted">Scoring your resume...</p>
        </div>
      </PageShell>
    );
  }

  const runFull = async () => {
    try {
      await generateFull.mutateAsync({ id });
      setLocation(`/results/${id}`);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not generate the full rewrite");
    }
  };

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-xs uppercase tracking-wider text-jass-gold">Step 3: JASS Score</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Your Resume Compatibility Score</h1>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <div className="text-sm text-jass-muted">Overall score</div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="font-display text-6xl font-bold text-jass-navy">{data.scores.atsScore}</div>
                <div className="text-jass-muted">/ 100</div>
              </div>
              <div className="mt-6 space-y-4">
                <ScoreBar label="Keyword match" value={data.scores.keywordScore} />
                <ScoreBar label="Formatting" value={data.scores.formattingScore} />
                <ScoreBar label="Structure" value={data.scores.structureScore} />
                <ScoreBar label="Age-bias signals" value={data.scores.ageBiasScore} />
              </div>
              {data.ageBiasFlags.length > 0 && (
                <div className="mt-6 p-4 rounded bg-jass-light-gray">
                  <div className="text-sm font-semibold text-jass-navy">What JASS flagged</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-jass-muted space-y-1">
                    {data.ageBiasFlags.map((flag, index) => <li key={index}>{flag}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-jass-gold">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Sample of the rewrite</span>
              </div>
              <p className="text-sm text-jass-muted mt-1">A preview of how JASS turns duties into evidence.</p>
              <div className="mt-4 space-y-4">
                {data.teaserBullets.length === 0 ? (
                  <div className="text-sm text-jass-muted">We could not find clear bullets to preview. Generate the full rewrite to see all the changes.</div>
                ) : (
                  data.teaserBullets.map((bullet, index) => (
                    <div key={index} className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded border border-[#b3261e]/30 bg-[#b3261e]/5 p-3">
                        <div className="text-xs uppercase tracking-wider text-[#b3261e] font-semibold">Before</div>
                        <p className="text-sm text-jass-navy mt-1">{bullet.original}</p>
                      </div>
                      <div className="rounded border border-jass-gold/40 bg-jass-gold/5 p-3">
                        <div className="text-xs uppercase tracking-wider text-jass-gold font-semibold">After</div>
                        <p className="text-sm text-jass-navy mt-1">{bullet.rewritten}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 border-t pt-6">
                <div className="font-semibold text-jass-navy">Generate the full rewrite</div>
                <ul className="mt-3 text-sm text-jass-muted space-y-1">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Every bullet rewritten</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Side-by-side comparison view</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> PDF and DOCX downloads</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-jass-gold mt-0.5" /> Direct, practical recommendations</li>
                </ul>
                <Button onClick={runFull} disabled={generateFull.isPending} className="w-full mt-5 h-11 bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]">
                  {generateFull.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating full rewrite...</> : <>Generate full rewrite <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
