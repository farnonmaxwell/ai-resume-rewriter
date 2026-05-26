import { useAuth } from "@/_core/hooks/useAuth";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getJobTypeConfig } from "@shared/jass";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

function titleCaseName(value?: string | null): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  return raw
    .split(/\s+/)
    .map(part => part.length <= 2 && part === part.toUpperCase() ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const history = trpc.rewrites.myHistory.useQuery(undefined, { enabled: isAuthenticated });
  const profile = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const jobTypeConfig = getJobTypeConfig(profile.data?.jobType);
  const displayName = titleCaseName(user?.name) || user?.email || "JASS user";
  const scoredRewrites = (history.data ?? []).filter(rewrite => typeof rewrite.atsScore === "number");
  const bestScore = scoredRewrites.length ? Math.max(...scoredRewrites.map(rewrite => rewrite.atsScore ?? 0)) : 0;

  if (loading) return <PageShell><div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-jass-gold mx-auto" /></div></PageShell>;

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <h1 className="font-display text-3xl text-jass-navy">Sign in to see your dashboard</h1>
          <Button className="mt-4 bg-jass-gold text-jass-navy" onClick={() => setLocation("/auth")}>Sign in</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-jass-gold">Welcome back to JASS</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">{displayName}</h1>
            <p className="text-white/75 mt-1 text-sm">Manage your rewrites and job-application profile.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]" onClick={() => setLocation("/upload")}>Start a new rewrite</Button>
            <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white" onClick={() => setLocation("/onboarding")}>Edit profile</Button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-jass-muted">Work type</div>
              <div className="mt-2 font-semibold text-jass-navy">{jobTypeConfig.label}</div>
              <p className="text-sm text-jass-muted mt-2">{jobTypeConfig.scoringMethod}</p>
            </CardContent>
          </Card>
          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-jass-muted">Total rewrites</div>
              <div className="font-display text-3xl font-bold text-jass-navy mt-1">{history.data?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-jass-muted">Best score</div>
              <div className="font-display text-3xl font-bold text-jass-navy mt-1">
                {bestScore}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-jass-navy">Rewrite history</h2>
          {history.isLoading ? (
            <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-jass-gold mx-auto" /></div>
          ) : (history.data ?? []).length === 0 ? (
            <Card className="mt-4 border-jass-mid-gray">
              <CardContent className="p-10 text-center">
                <Sparkles className="w-8 h-8 text-jass-gold mx-auto" />
                <p className="mt-3 text-jass-muted">No rewrites yet. Start your first one.</p>
                <Button className="mt-4 bg-jass-gold text-jass-navy" onClick={() => setLocation("/upload")}>Start a rewrite</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-3">
              {history.data!.map((rewrite) => (
                <Card key={rewrite.id} className="border-jass-mid-gray">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xs text-jass-muted">{rewrite.createdAt ? new Date(rewrite.createdAt).toLocaleString() : "Date unavailable"}</div>
                      <div className="font-semibold text-jass-navy">{rewrite.roleType || rewrite.jobType || "Untitled rewrite"}{rewrite.industry ? ` · ${rewrite.industry}` : ""}</div>
                      <div className="text-xs text-jass-muted mt-1">Status: {rewrite.status}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-jass-muted">Score</div>
                        <div className="font-display text-2xl font-bold text-jass-navy">{rewrite.atsScore ?? "-"}</div>
                      </div>
                      <Link href={`/results/${rewrite.id}`}><Button variant="outline" className="border-jass-navy text-jass-navy">View</Button></Link>
                      {rewrite.pdfUrl && <a href={rewrite.pdfUrl} target="_blank" rel="noreferrer"><Button variant="outline" className="border-jass-navy text-jass-navy"><Download className="w-4 h-4" /></Button></a>}
                      {rewrite.docxUrl && <a href={rewrite.docxUrl} target="_blank" rel="noreferrer"><Button variant="outline" className="border-jass-navy text-jass-navy"><FileText className="w-4 h-4" /></Button></a>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
