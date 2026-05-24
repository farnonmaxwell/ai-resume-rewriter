import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BLS_INDUSTRIES } from "@shared/jass";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

const ROLE_TYPES = [
  "Individual Contributor",
  "Team Lead",
  "Manager",
  "Senior Manager / Director",
  "Vice President",
  "C-Suite / Executive",
  "Consultant / Independent",
  "Other",
];

const CONCERNS = [
  "I look too senior or overqualified",
  "My resume reads as outdated",
  "I am not getting past the ATS",
  "My experience is not landing interviews",
  "Gaps in my recent work history",
  "Career change into a new industry",
  "Returning to work after time away",
  "Want to highlight modern tech skills",
];

const YEARS_OPTIONS = ["Last 10 years", "Last 15 years", "Last 20 years", "All experience"];

export default function IntakePage() {
  const [, params] = useRoute<{ id: string }>("/intake/:id");
  const [, setLocation] = useLocation();
  const id = params?.id || "";
  const [step, setStep] = useState(1);
  const [roleType, setRoleType] = useState("");
  const [industry, setIndustry] = useState("");
  const [industryOther, setIndustryOther] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [yearsToHighlight, setYearsToHighlight] = useState("");
  const save = trpc.rewrites.saveIntake.useMutation();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const next = () => setStep(s => Math.min(totalSteps, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = async () => {
    if (industry === "Other" && !industryOther.trim()) {
      toast.error("Choose Other only if you tell JASS the industry.");
      return;
    }

    try {
      await save.mutateAsync({
        id,
        roleType: roleType || undefined,
        industry: industry || undefined,
        industryOther: industry === "Other" ? industryOther.trim() : null,
        jobDescription: jobDescription || undefined,
        concerns,
        yearsToHighlight: yearsToHighlight || undefined,
      });
      setLocation(`/score/${id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save your answers");
    }
  };

  if (!id) {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <p className="text-jass-muted">Missing rewrite id.</p>
          <Button className="mt-4" onClick={() => setLocation("/upload")}>Start over</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-xs uppercase tracking-wider text-jass-gold">Step 2: Targeting</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">A few questions to tailor your rewrite</h1>
          <p className="mt-2 text-white/80">Answer honestly. The more we know, the better the rewrite.</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-jass-muted mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              {step === 1 && (
                <div>
                  <Label className="text-base text-jass-navy">What kind of role are you targeting?</Label>
                  <p className="text-sm text-jass-muted mb-3">This shapes how we frame leadership and scope.</p>
                  <Select value={roleType} onValueChange={setRoleType}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Choose a role type" /></SelectTrigger>
                    <SelectContent>
                      {ROLE_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {step === 2 && (
                <div>
                  <Label className="text-base text-jass-navy">Industry or function</Label>
                  <p className="text-sm text-jass-muted mb-3">If you are switching industries, pick the one you are moving into.</p>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Choose an industry" /></SelectTrigger>
                    <SelectContent>
                      {BLS_INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {industry === "Other" && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="industryOther" className="text-jass-navy">Describe the industry</Label>
                      <Input id="industryOther" value={industryOther} onChange={(event) => setIndustryOther(event.target.value)} placeholder="Tell JASS the exact industry" />
                    </div>
                  )}
                </div>
              )}
              {step === 3 && (
                <div>
                  <Label htmlFor="jd" className="text-base text-jass-navy">Paste a target job description (optional)</Label>
                  <p className="text-sm text-jass-muted mb-3">We extract ATS keywords directly from this. Leaving it blank still works.</p>
                  <Textarea id="jd" rows={10} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job posting here..." />
                </div>
              )}
              {step === 4 && (
                <div>
                  <Label className="text-base text-jass-navy">What are your biggest concerns?</Label>
                  <p className="text-sm text-jass-muted mb-3">Select all that apply. We will address them directly.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {CONCERNS.map(c => {
                      const checked = concerns.includes(c);
                      return (
                        <label key={c} className={`flex items-start gap-3 p-3 rounded border cursor-pointer ${checked ? "border-jass-gold bg-jass-light-gray" : "border-jass-mid-gray"}`}>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              setConcerns(prev => v ? [...prev, c] : prev.filter(x => x !== c));
                            }}
                          />
                          <span className="text-sm text-jass-navy leading-snug">{c}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              {step === 5 && (
                <div>
                  <Label className="text-base text-jass-navy">How many years of experience should we highlight?</Label>
                  <p className="text-sm text-jass-muted mb-3">For most candidates 50+, 10 to 15 years is the sweet spot for ATS systems.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {YEARS_OPTIONS.map(y => (
                      <label key={y} className={`flex items-center gap-3 p-3 rounded border cursor-pointer ${yearsToHighlight === y ? "border-jass-gold bg-jass-light-gray" : "border-jass-mid-gray"}`}>
                        <input
                          type="radio"
                          name="years"
                          value={y}
                          checked={yearsToHighlight === y}
                          onChange={() => setYearsToHighlight(y)}
                          className="accent-[#d4a843]"
                        />
                        <span className="text-sm text-jass-navy">{y}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={back} disabled={step === 1} className="border-jass-navy text-jass-navy">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {step < totalSteps ? (
                  <Button onClick={next} className="bg-jass-navy text-white hover:bg-[var(--jass-navy-soft)]">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleFinish} disabled={save.isPending} className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]">
                    {save.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "See my score"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
