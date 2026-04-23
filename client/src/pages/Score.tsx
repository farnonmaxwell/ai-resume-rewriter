import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, Loader2, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "bg-eo50-gold" : value >= 60 ? "bg-[#d4a843]" : value >= 40 ? "bg-[#b88c2f]" : "bg-[#b3261e]";
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-eo50-navy">{label}</span>
        <span className="font-semibold text-eo50-navy">{value}/100</span>
      </div>
      <div className="h-2 bg-eo50-light-gray rounded-full mt-1">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ScorePage() {
  const [, params] = useRoute<{ id: string }>("/score/:id");
  const id = Number(params?.id || 0);
  const [, setLocation] = useLocation();
  const [data, setData] = useState<Awaited<ReturnType<ReturnType<typeof trpc.rewrites.generateTeaser.useMutation>["mutateAsync"]>> | null>(null);

  const teaser = trpc.rewrites.generateTeaser.useMutation();
  const status = trpc.payments.myStatus.useQuery(undefined, { staleTime: 30000 });
  const checkout = trpc.payments.createCheckout.useMutation({
    onSuccess: r => {
      if (r.url) {
        toast.message("Redirecting to secure checkout");
        window.open(r.url, "_blank");
      }
    },
    onError: e => toast.error(e.message),
  });
  const generateFull = trpc.rewrites.generateFull.useMutation();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await teaser.mutateAsync({ id });
        if (!cancelled) setData(r);
      } catch (e: any) {
        toast.error(e?.message ?? "Could not score your resume");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id) {
    return <PageShell><div className="py-20 text-center">Missing rewrite id.</div></PageShell>;
  }

  if (!data) {
    return (
      <PageShell>
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-eo50-gold mx-auto" />
          <p className="mt-4 text-eo50-muted">Scoring your resume...</p>
        </div>
      </PageShell>
    );
  }

  const subscribed = status.data?.isSubscribed;

  const buyOneTime = () =>
    checkout.mutate({ type: "one_time", rewriteId: id, origin: window.location.origin });
  const subscribe = () => checkout.mutate({ type: "subscription", origin: window.location.origin });
  const runFull = async () => {
    try {
      await generateFull.mutateAsync({ id });
      setLocation(`/results/${id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate the full rewrite");
    }
  };

  return (
    <PageShell>
      <section className="bg-eo50-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-xs uppercase tracking-wider text-eo50-gold">Step 3: Free Score</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Your ATS Compatibility Score</h1>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <Card className="border-eo50-mid-gray">
            <CardContent className="p-6">
              <div className="text-sm text-eo50-muted">Overall ATS score</div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="font-display text-6xl font-bold text-eo50-navy">{data.scores.atsScore}</div>
                <div className="text-eo50-muted">/ 100</div>
              </div>
              <div className="mt-6 space-y-4">
                <ScoreBar label="Keyword match" value={data.scores.keywordScore} />
                <ScoreBar label="Formatting" value={data.scores.formattingScore} />
                <ScoreBar label="Structure" value={data.scores.structureScore} />
                <ScoreBar label="Age-bias signals" value={data.scores.ageBiasScore} />
              </div>
              {data.ageBiasFlags.length > 0 && (
                <div className="mt-6 p-4 rounded bg-eo50-light-gray">
                  <div className="text-sm font-semibold text-eo50-navy">What we flagged</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-eo50-muted space-y-1">
                    {data.ageBiasFlags.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-eo50-mid-gray">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-eo50-gold">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Sample of the rewrite</span>
              </div>
              <p className="text-sm text-eo50-muted mt-1">A taste of how we transform duty bullets into achievement bullets.</p>
              <div className="mt-4 space-y-4">
                {data.teaserBullets.length === 0 ? (
                  <div className="text-sm text-eo50-muted">We could not find clear bullets to preview. Run the full rewrite to see all the changes.</div>
                ) : (
                  data.teaserBullets.map((b, i) => (
                    <div key={i} className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded border border-[#b3261e]/30 bg-[#b3261e]/5 p-3">
                        <div className="text-xs uppercase tracking-wider text-[#b3261e] font-semibold">Before</div>
                        <p className="text-sm text-eo50-navy mt-1">{b.original}</p>
                      </div>
                      <div className="rounded border border-eo50-gold/40 bg-eo50-gold/5 p-3">
                        <div className="text-xs uppercase tracking-wider text-eo50-gold font-semibold">After</div>
                        <p className="text-sm text-eo50-navy mt-1">{b.rewritten}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center gap-2 text-eo50-navy">
                  <Lock className="w-4 h-4" />
                  <span className="font-semibold">Unlock the full rewrite</span>
                </div>
                <ul className="mt-3 text-sm text-eo50-muted space-y-1">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Every bullet rewritten</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Side-by-side comparison view</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> PDF and DOCX downloads</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-eo50-gold mt-0.5" /> Personalized tips</li>
                </ul>
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {subscribed ? (
                    <Button onClick={runFull} disabled={generateFull.isPending} className="sm:col-span-2 h-11 bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]">
                      {generateFull.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating full rewrite...</> : <>Generate full rewrite (subscription) <ArrowRight className="w-4 h-4 ml-2" /></>}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={buyOneTime} disabled={checkout.isPending} className="h-11 bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]">
                        $27 single rewrite
                      </Button>
                      <Button onClick={subscribe} disabled={checkout.isPending} variant="outline" className="h-11 border-eo50-navy text-eo50-navy">
                        $9/month unlimited
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
