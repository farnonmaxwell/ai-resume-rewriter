import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

function badge(t: string) {
  switch (t) {
    case "age_bias_removed": return { label: "Age bias removed", className: "bg-[#b3261e]/10 text-[#b3261e] border-[#b3261e]/30" };
    case "ats_keyword_added": return { label: "ATS keyword added", className: "bg-eo50-gold/10 text-[#8a6a1f] border-eo50-gold/40" };
    case "achievement_rewrite": return { label: "Achievement rewrite", className: "bg-eo50-navy/5 text-eo50-navy border-eo50-navy/30" };
    case "formatting": return { label: "Formatting", className: "bg-eo50-light-gray text-eo50-muted border-eo50-mid-gray" };
    case "structure": return { label: "Structure", className: "bg-eo50-light-gray text-eo50-muted border-eo50-mid-gray" };
    default: return { label: t, className: "bg-eo50-light-gray text-eo50-muted border-eo50-mid-gray" };
  }
}

function ScoreCircle({ value }: { value: number }) {
  const color = value >= 80 ? "text-eo50-gold" : value >= 60 ? "text-[#b88c2f]" : "text-[#b3261e]";
  return (
    <div className="text-center">
      <div className={`font-display text-6xl font-bold ${color}`}>{value}</div>
      <div className="text-eo50-muted text-sm">out of 100</div>
    </div>
  );
}

export default function ResultsPage() {
  const [, params] = useRoute<{ id: string }>("/results/:id");
  const id = Number(params?.id || 0);
  const [, setLocation] = useLocation();
  const q = trpc.rewrites.get.useQuery({ id }, { enabled: !!id });
  const status = trpc.payments.myStatus.useQuery();
  const utils = trpc.useUtils();
  const generateFull = trpc.rewrites.generateFull.useMutation({
    onSuccess: () => {
      utils.rewrites.get.invalidate({ id });
      toast.success("Full rewrite ready");
    },
    onError: e => toast.error(e.message),
  });

  useEffect(() => {
    // If user just paid via Stripe and the rewrite isn't generated yet, kick off generation.
    if (q.data && !q.data.rewrittenText && q.data.paid) {
      generateFull.mutate({ id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data?.paid, q.data?.rewrittenText]);

  if (!id) return <PageShell><div className="py-20 text-center">Missing rewrite id.</div></PageShell>;
  if (q.isLoading || !q.data) {
    return (
      <PageShell><div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-eo50-gold mx-auto" /></div></PageShell>
    );
  }

  const r = q.data;

  if (!r.rewrittenText) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Sparkles className="w-10 h-10 text-eo50-gold mx-auto" />
          <h1 className="font-display text-3xl font-bold text-eo50-navy mt-3">
            {r.paid || status.data?.isSubscribed ? "Generating your full rewrite..." : "Unlock the full rewrite"}
          </h1>
          {r.paid || status.data?.isSubscribed ? (
            <>
              <p className="mt-3 text-eo50-muted">This usually takes 20 to 40 seconds.</p>
              <div className="mt-6"><Loader2 className="w-8 h-8 animate-spin text-eo50-gold mx-auto" /></div>
            </>
          ) : (
            <>
              <p className="mt-3 text-eo50-muted">Head back to your score and choose a plan to continue.</p>
              <Button className="mt-6 bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]" onClick={() => setLocation(`/score/${id}`)}>Back to score</Button>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const annotations = (r.changeAnnotations as any[]) ?? [];
  const tips = (r.tips as string[]) ?? [];
  const ageFlags = (r.ageBiasFlags as string[]) ?? [];

  return (
    <PageShell>
      <section className="bg-eo50-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-eo50-gold">Step 4: Your rewritten resume</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Your ATS-optimized resume is ready</h1>
            <p className="mt-2 text-white/80">Review the changes, download the files, and apply with confidence.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {r.pdfUrl && (
                <a href={r.pdfUrl} target="_blank" rel="noreferrer">
                  <Button className="bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)] h-11"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
                </a>
              )}
              {r.docxUrl && (
                <a href={r.docxUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white h-11"><FileText className="w-4 h-4 mr-2" /> Download DOCX</Button>
                </a>
              )}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg border border-white/10 p-5">
            <ScoreCircle value={r.atsScore ?? 0} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/80">
              <div>Keywords <span className="text-eo50-gold font-semibold">{r.keywordScore ?? 0}</span></div>
              <div>Formatting <span className="text-eo50-gold font-semibold">{r.formattingScore ?? 0}</span></div>
              <div>Structure <span className="text-eo50-gold font-semibold">{r.structureScore ?? 0}</span></div>
              <div>Age bias <span className="text-eo50-gold font-semibold">{r.ageBiasScore ?? 0}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
          <Card className="border-eo50-mid-gray">
            <CardContent className="p-0">
              <div className="bg-eo50-light-gray px-5 py-3 text-xs uppercase tracking-wider text-eo50-muted border-b">Original</div>
              <pre className="p-5 whitespace-pre-wrap text-sm leading-relaxed text-eo50-navy max-h-[600px] overflow-auto font-sans">{r.originalText}</pre>
            </CardContent>
          </Card>
          <Card className="border-eo50-gold border-2">
            <CardContent className="p-0">
              <div className="bg-eo50-gold/10 px-5 py-3 text-xs uppercase tracking-wider text-[#8a6a1f] font-semibold border-b border-eo50-gold/30">EO50 Rewrite</div>
              <pre className="p-5 whitespace-pre-wrap text-sm leading-relaxed text-eo50-navy max-h-[600px] overflow-auto font-sans">{r.rewrittenText}</pre>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-6">
          <Card className="border-eo50-mid-gray lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-bold text-eo50-navy">Color-coded changes</h2>
              <p className="text-sm text-eo50-muted">Each change is labeled so you understand exactly what we did.</p>
              <div className="mt-5 space-y-4">
                {annotations.length === 0 && (
                  <div className="text-sm text-eo50-muted">No specific change annotations were captured for this rewrite.</div>
                )}
                {annotations.map((c, i) => {
                  const b = badge(c.type);
                  return (
                    <div key={i} className="border border-eo50-mid-gray rounded p-4">
                      <div className={`inline-block text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded border ${b.className}`}>{b.label}</div>
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <div className="rounded bg-[#b3261e]/5 border border-[#b3261e]/20 p-3">
                          <div className="text-xs uppercase text-[#b3261e] font-semibold tracking-wider">Before</div>
                          <p className="text-sm text-eo50-navy mt-1">{c.original}</p>
                        </div>
                        <div className="rounded bg-eo50-gold/5 border border-eo50-gold/30 p-3">
                          <div className="text-xs uppercase text-[#8a6a1f] font-semibold tracking-wider">After</div>
                          <p className="text-sm text-eo50-navy mt-1">{c.rewritten}</p>
                        </div>
                      </div>
                      <p className="text-xs text-eo50-muted mt-2"><span className="font-semibold">Why:</span> {c.reason}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-eo50-mid-gray">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-eo50-navy">Personalized tips</h3>
                <ul className="mt-3 space-y-2 text-sm text-eo50-muted">
                  {(tips.length ? tips : ["Tailor your resume to each role by pasting the job description into the intake before rewriting.", "Keep your downloaded DOCX as the master copy and adjust the summary per application."]).map((t, i) => (
                    <li key={i} className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-eo50-gold mt-0.5" /> <span>{t}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-eo50-mid-gray">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-eo50-navy">Age-bias signals we removed</h3>
                <ul className="mt-3 space-y-2 text-sm text-eo50-muted">
                  {(ageFlags.length ? ageFlags : ["No age-bias signals detected in your original resume."]).map((f, i) => (
                    <li key={i} className="flex items-start gap-2"><TriangleAlert className="w-4 h-4 text-[#b88c2f] mt-0.5" /> <span>{f}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
