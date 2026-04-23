import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Download, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const history = trpc.rewrites.myHistory.useQuery(undefined, { enabled: isAuthenticated });
  const status = trpc.payments.myStatus.useQuery(undefined, { enabled: isAuthenticated });
  const portal = trpc.payments.customerPortal.useMutation({
    onSuccess: r => { if (r.url) window.open(r.url, "_blank"); },
    onError: e => toast.error(e.message),
  });

  if (loading) return <PageShell><div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-eo50-gold mx-auto" /></div></PageShell>;

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <h1 className="font-display text-3xl text-eo50-navy">Sign in to see your dashboard</h1>
          <Button className="mt-4 bg-eo50-gold text-eo50-navy" onClick={() => (window.location.href = getLoginUrl())}>Sign in</Button>
        </div>
      </PageShell>
    );
  }

  const subscribed = status.data?.isSubscribed;

  return (
    <PageShell>
      <section className="bg-eo50-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-eo50-gold">Welcome back</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">{user?.name || user?.email}</h1>
            <p className="text-white/75 mt-1 text-sm">Manage your rewrites and subscription</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]" onClick={() => setLocation("/upload")}>
              Start a new rewrite
            </Button>
            {subscribed && (
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white" onClick={() => portal.mutate({ origin: window.location.origin })}>
                Manage subscription
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <Card className="border-eo50-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-eo50-muted">Subscription</div>
              <div className="mt-2 flex items-center gap-2">
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-eo50-gold" />
                    <span className="font-semibold text-eo50-navy">Unlimited monthly active</span>
                  </>
                ) : (
                  <span className="text-eo50-navy">Free plan</span>
                )}
              </div>
              {!subscribed && (
                <Button variant="outline" className="mt-3 border-eo50-navy text-eo50-navy" onClick={() => setLocation("/pricing")}>
                  See plans
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="border-eo50-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-eo50-muted">Total rewrites</div>
              <div className="font-display text-3xl font-bold text-eo50-navy mt-1">{history.data?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="border-eo50-mid-gray">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-eo50-muted">Best ATS score</div>
              <div className="font-display text-3xl font-bold text-eo50-navy mt-1">
                {history.data?.reduce((m, r) => Math.max(m, r.atsScore ?? 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-eo50-navy">Rewrite history</h2>
          {history.isLoading ? (
            <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-eo50-gold mx-auto" /></div>
          ) : (history.data ?? []).length === 0 ? (
            <Card className="mt-4 border-eo50-mid-gray">
              <CardContent className="p-10 text-center">
                <Sparkles className="w-8 h-8 text-eo50-gold mx-auto" />
                <p className="mt-3 text-eo50-muted">No rewrites yet. Start your first one.</p>
                <Button className="mt-4 bg-eo50-gold text-eo50-navy" onClick={() => setLocation("/upload")}>Start a rewrite</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-3">
              {history.data!.map(r => (
                <Card key={r.id} className="border-eo50-mid-gray">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xs text-eo50-muted">{new Date(r.createdAt).toLocaleString()}</div>
                      <div className="font-semibold text-eo50-navy">{r.roleType || "Untitled rewrite"}{r.industry ? ` · ${r.industry}` : ""}</div>
                      <div className="text-xs text-eo50-muted mt-1">Status: {r.status}{r.paid ? " · Paid" : " · Free score"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-eo50-muted">ATS</div>
                        <div className="font-display text-2xl font-bold text-eo50-navy">{r.atsScore ?? "-"}</div>
                      </div>
                      <Link href={`/results/${r.id}`}>
                        <Button variant="outline" className="border-eo50-navy text-eo50-navy">View</Button>
                      </Link>
                      {r.pdfUrl && (
                        <a href={r.pdfUrl} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="border-eo50-navy text-eo50-navy"><Download className="w-4 h-4" /></Button>
                        </a>
                      )}
                      {r.docxUrl && (
                        <a href={r.docxUrl} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="border-eo50-navy text-eo50-navy"><FileText className="w-4 h-4" /></Button>
                        </a>
                      )}
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
