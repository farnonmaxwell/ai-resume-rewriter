import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BLS_INDUSTRIES, JOB_TYPES, getJobTypeConfig } from "@shared/jass";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { loading } = useAuth({ redirectOnUnauthenticated: true });
  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: !loading });
  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profile saved. JASS will shape each rewrite around your real target role.");
      setLocation("/upload");
    },
    onError: (error) => toast.error(error.message),
  });

  const [jobType, setJobType] = useState<string>("professional_office");
  const [industry, setIndustry] = useState<string>("Technology and IT");
  const [industryOther, setIndustryOther] = useState("");
  const [targetIndustry, setTargetIndustry] = useState<string>("");
  const [targetIndustryOther, setTargetIndustryOther] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [feedbackOptIn, setFeedbackOptIn] = useState(true);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    if (profile.jobType) setJobType(profile.jobType);
    if (profile.industry) setIndustry(profile.industry);
    if (profile.industryOther) setIndustryOther(profile.industryOther);
    if (profile.targetIndustry) setTargetIndustry(profile.targetIndustry);
    if (profile.targetIndustryOther) setTargetIndustryOther(profile.targetIndustryOther);
    if (profile.targetRole) setTargetRole(profile.targetRole);
    setFeedbackOptIn(profile.feedbackOptIn ?? true);
  }, [profileQuery.data]);

  const selectedConfig = useMemo(() => getJobTypeConfig(jobType), [jobType]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (industry === "Other" && !industryOther.trim()) {
      toast.error("Tell us the industry you are coming from, even if it is a custom one.");
      return;
    }
    if (targetIndustry === "Other" && !targetIndustryOther.trim()) {
      toast.error("Tell us the industry you are targeting, even if it is a custom one.");
      return;
    }
    upsertProfile.mutate({
      jobType: jobType as any,
      industry: industry as any,
      industryOther: industry === "Other" ? industryOther.trim() : null,
      targetIndustry: targetIndustry ? (targetIndustry as any) : null,
      targetIndustryOther: targetIndustry === "Other" ? targetIndustryOther.trim() : null,
      targetRole: targetRole.trim() || null,
      feedbackOptIn,
    });
  };

  if (loading || profileQuery.isLoading) {
    return <main className="min-h-screen bg-jass-light-gray flex items-center justify-center text-jass-muted">Loading your JASS profile...</main>;
  }

  return (
    <main className="min-h-screen bg-jass-light-gray py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-jass-gold font-semibold">JASS Profile Setup</p>
          <h1 className="font-display text-4xl text-jass-navy font-bold mt-2">What type of work are you looking for?</h1>
          <p className="text-jass-muted mt-3 max-w-3xl">
            JASS uses this to choose the right resume structure, language, and scoring approach for your real job search. Be specific: a warehouse role, a coordinator role, and a professional office role should not be rewritten the same way.
          </p>
        </div>

        <form onSubmit={submit} className="grid lg:grid-cols-[1.4fr_0.9fr] gap-6">
          <Card className="border-jass-mid-gray">
            <CardHeader>
              <CardTitle className="text-jass-navy">Choose your work type</CardTitle>
              <CardDescription>Pick the closest fit for the work you want next. If you are changing lanes, choose where you are going.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {JOB_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.value}
                    onClick={() => setJobType(type.value)}
                    className={`text-left rounded-xl border p-4 transition ${jobType === type.value ? "border-jass-gold bg-white shadow-md" : "border-jass-mid-gray bg-white/70 hover:bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-jass-navy">{type.label}</div>
                      {jobType === type.value && <CheckCircle2 className="w-5 h-5 text-jass-gold shrink-0" />}
                    </div>
                    <p className="text-sm text-jass-muted mt-2">{type.resumeFormat}</p>
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target role</Label>
                  <Input id="targetRole" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Administrative Coordinator, RN, HVAC Technician" />
                </div>
                <div className="space-y-2">
                  <Label>What industry are you coming from?</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger><SelectValue placeholder="Choose current or recent industry" /></SelectTrigger>
                    <SelectContent>
                      {BLS_INDUSTRIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {industry === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="industryOther">Describe the industry you are coming from</Label>
                  <Input id="industryOther" value={industryOther} onChange={(event) => setIndustryOther(event.target.value)} placeholder="Tell JASS the exact industry" />
                </div>
              )}

              <div className="space-y-2">
                <Label>What industry are you targeting? <span className="text-jass-muted font-normal">Optional</span></Label>
                <Select value={targetIndustry || "same"} onValueChange={(value) => setTargetIndustry(value === "same" ? "" : value)}>
                  <SelectTrigger><SelectValue placeholder="Same as above or choose a new industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same as the industry I am coming from</SelectItem>
                    {BLS_INDUSTRIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {targetIndustry === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="targetIndustryOther">Describe the industry you are targeting</Label>
                  <Input id="targetIndustryOther" value={targetIndustryOther} onChange={(event) => setTargetIndustryOther(event.target.value)} placeholder="Tell JASS the exact target industry" />
                </div>
              )}

              <label className="flex items-start gap-3 rounded-lg border border-jass-mid-gray bg-white p-4 text-sm text-jass-muted">
                <input type="checkbox" checked={feedbackOptIn} onChange={(event) => setFeedbackOptIn(event.target.checked)} className="mt-1" />
                <span>Let JASS use my application outcomes to improve recommendations over time.</span>
              </label>

              <Button disabled={upsertProfile.isPending} className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]">
                {upsertProfile.isPending ? "Saving..." : "Save and continue"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-jass-mid-gray bg-white">
            <CardHeader>
              <CardTitle className="text-jass-navy">What this changes</CardTitle>
              <CardDescription>{selectedConfig.pricingAudience}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-jass-muted">
              <div><strong className="text-jass-navy">Resume format:</strong> {selectedConfig.resumeFormat}</div>
              <div><strong className="text-jass-navy">Scoring method:</strong> {selectedConfig.scoringMethod}</div>
              <div><strong className="text-jass-navy">Job sources:</strong> {selectedConfig.jobSources.join(", ")}</div>
              <div><strong className="text-jass-navy">Interview style:</strong> {selectedConfig.interviewPrepStyle}</div>
              <div><strong className="text-jass-navy">Plan:</strong> ${selectedConfig.displayedMonthlyPrice}/month after the free preview.</div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
