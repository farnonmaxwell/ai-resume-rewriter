import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

function badge(type: string) {
  switch (type) {
    case "age_bias_removed": return { label: "Age bias removed", className: "bg-[#b3261e]/10 text-[#b3261e] border-[#b3261e]/30" };
    case "ats_keyword_added": return { label: "ATS keyword added", className: "bg-jass-gold/10 text-[#8a6a1f] border-jass-gold/40" };
    case "achievement_rewrite": return { label: "Achievement rewrite", className: "bg-jass-navy/5 text-jass-navy border-jass-navy/30" };
    case "formatting": return { label: "Formatting", className: "bg-jass-light-gray text-jass-muted border-jass-mid-gray" };
    case "structure": return { label: "Structure", className: "bg-jass-light-gray text-jass-muted border-jass-mid-gray" };
    default: return { label: type, className: "bg-jass-light-gray text-jass-muted border-jass-mid-gray" };
  }
}

function ScoreCircle({ value }: { value: number }) {
  const color = value >= 80 ? "text-jass-gold" : value >= 60 ? "text-[#b88c2f]" : "text-[#b3261e]";
  return (
    <div className="text-center">
      <div className={`font-display text-6xl font-bold ${color}`}>{value}</div>
      <div className="text-jass-muted text-sm">out of 100</div>
    </div>
  );
}

export default function ResultsPage() {
  const [, params] = useRoute<{ id: string }>("/results/:id");
  const id = params?.id || "";
  const [, setLocation] = useLocation();
  const q = trpc.rewrites.get.useQuery({ id }, { enabled: Boolean(id) });
  const utils = trpc.useUtils();
  const generateFull = trpc.rewrites.generateFull.useMutation({
    onSuccess: () => {
      utils.rewrites.get.invalidate({ id });
      toast.success("Full rewrite ready");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (q.data && !q.data.rewrittenText && !generateFull.isPending) {
      generateFull.mutate({ id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data?.rewrittenText, id]);

  if (!id) return <PageShell><div className="py-20 text-center">Missing rewrite id.</div></PageShell>;
  if (q.isLoading || !q.data) {
    return <PageShell><div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-jass-gold mx-auto" /></div></PageShell>;
  }

  const resume = q.data;

  if (!resume.rewrittenText) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Sparkles className="w-10 h-10 text-jass-gold mx-auto" />
          <h1 className="font-display text-3xl font-bold text-jass-navy mt-3">Generating your full rewrite...</h1>
          <p className="mt-3 text-jass-muted">This usually takes 20 to 40 seconds. If it stalls, return to the score page and run it again.</p>
          <div className="mt-6"><Loader2 className="w-8 h-8 animate-spin text-jass-gold mx-auto" /></div>
          <Button variant="outline" className="mt-6 border-jass-navy text-jass-navy" onClick={() => setLocation(`/score/${id}`)}>Back to score</Button>
        </div>
      </PageShell>
    );
  }

  const annotations = (resume.changeAnnotations as any[]) ?? [];
  const tips = (resume.tips as string[]) ?? [];
  const ageFlags = (resume.ageBiasFlags as string[]) ?? [];

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-jass-gold">Step 4: Your rewritten resume</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Your JASS rewrite is ready</h1>
            <p className="mt-2 text-white/80">Review the changes, download the files, and apply with a sharper version of your experience.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {resume.pdfUrl && (
                <a href={resume.pdfUrl} target="_blank" rel="noreferrer">
                  <Button className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)] h-11"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
                </a>
              )}
              {resume.docxUrl && (
                <a href={resume.docxUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white h-11"><FileText className="w-4 h-4 mr-2" /> Download DOCX</Button>
                </a>
              )}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg border border-white/10 p-5">
            <ScoreCircle value={resume.atsScore ?? 0} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/80">
              <div>Keywords <span className="text-jass-gold font-semibold">{resume.keywordScore ?? 0}</span></div>
              <div>Formatting <span className="text-jass-gold font-semibold">{resume.formattingScore ?? 0}</span></div>
              <div>Structure <span className="text-jass-gold font-semibold">{resume.structureScore ?? 0}</span></div>
              <div>Age bias <span className="text-jass-gold font-semibold">{resume.ageBiasScore ?? 0}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
          <Card className="border-jass-mid-gray">
            <CardContent className="p-0">
              <div className="bg-jass-light-gray px-5 py-3 text-xs uppercase tracking-wider text-jass-muted border-b">Original</div>
              <pre className="p-5 whitespace-pre-wrap text-sm leading-relaxed text-jass-navy max-h-[600px] overflow-auto font-sans">{resume.originalText}</pre>
            </CardContent>
          </Card>
          <Card className="border-jass-gold border-2">
            <CardContent className="p-0">
              <div className="bg-jass-gold/10 px-5 py-3 text-xs uppercase tracking-wider text-[#8a6a1f] font-semibold border-b border-jass-gold/30">JASS Rewrite</div>
              <pre className="p-5 whitespace-pre-wrap text-sm leading-relaxed text-jass-navy max-h-[600px] overflow-auto font-sans">{resume.rewrittenText}</pre>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-6">
          <Card className="border-jass-mid-gray lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-bold text-jass-navy">Color-coded changes</h2>
              <p className="text-sm text-jass-muted">Each change is labeled so you understand exactly what JASS changed and why.</p>
              <div className="mt-5 space-y-4">
                {annotations.length === 0 && <div className="text-sm text-jass-muted">No specific change annotations were captured for this rewrite.</div>}
                {annotations.map((change, index) => {
                  const badgeInfo = badge(change.type);
                  return (
                    <div key={index} className="border border-jass-mid-gray rounded p-4">
                      <div className={`inline-block text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded border ${badgeInfo.className}`}>{badgeInfo.label}</div>
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <div className="rounded bg-[#b3261e]/5 border border-[#b3261e]/20 p-3">
                          <div className="text-xs uppercase text-[#b3261e] font-semibold tracking-wider">Before</div>
                          <p className="text-sm text-jass-navy mt-1">{change.original}</p>
                        </div>
                        <div className="rounded bg-jass-gold/5 border border-jass-gold/30 p-3">
                          <div className="text-xs uppercase text-[#8a6a1f] font-semibold tracking-wider">After</div>
                          <p className="text-sm text-jass-navy mt-1">{change.rewritten}</p>
                        </div>
                      </div>
                      <p className="text-xs text-jass-muted mt-2"><span className="font-semibold">Why:</span> {change.reason}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-jass-mid-gray">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-jass-navy">Personalized tips</h3>
                <ul className="mt-3 space-y-2 text-sm text-jass-muted">
                  {(tips.length ? tips : ["Tailor your resume to each role by pasting the job description into the intake before rewriting.", "Keep your downloaded DOCX as the master copy and adjust the summary per application."]).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-jass-gold mt-0.5" /> <span>{tip}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-jass-mid-gray">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-jass-navy">Age-bias signals we removed</h3>
                <ul className="mt-3 space-y-2 text-sm text-jass-muted">
                  {(ageFlags.length ? ageFlags : ["No age-bias signals detected in your original resume."]).map((flag, index) => (
                    <li key={index} className="flex items-start gap-2"><TriangleAlert className="w-4 h-4 text-[#b88c2f] mt-0.5" /> <span>{flag}</span></li>
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
