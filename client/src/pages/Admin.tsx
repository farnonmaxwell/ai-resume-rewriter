import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Download, Loader2 } from "lucide-react";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="border-eo50-mid-gray">
      <CardContent className="p-6">
        <div className="text-xs uppercase tracking-wider text-eo50-muted">{label}</div>
        <div className="font-display text-3xl font-bold text-eo50-navy mt-1">{value}</div>
        {sub && <div className="text-xs text-eo50-muted mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function downloadCsv(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: user?.role === "admin" });
  const users = trpc.admin.users.useQuery(undefined, { enabled: user?.role === "admin" });
  const rewrites = trpc.admin.rewrites.useQuery(undefined, { enabled: user?.role === "admin" });
  const payments = trpc.admin.payments.useQuery(undefined, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();

  const exportCsv = async () => {
    const r = await utils.admin.exportUserEmailsCsv.fetch();
    downloadCsv("eo50-emails.csv", r.csv);
  };
  const exportRewritesCsv = () => {
    if (!rewrites.data) return;
    const rows = [["id","userId","roleType","industry","atsScore","paid","status","createdAt"]];
    for (const r of rewrites.data) rows.push([String(r.id), String(r.userId), r.roleType ?? "", r.industry ?? "", String(r.atsScore ?? ""), String(r.paid), r.status ?? "", new Date(r.createdAt).toISOString()]);
    downloadCsv("eo50-rewrites.csv", rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n"));
  };
  const exportPaymentsCsv = () => {
    if (!payments.data) return;
    const rows = [["id","userId","amount","currency","type","status","createdAt"]];
    for (const p of payments.data) rows.push([String(p.id), String(p.userId ?? ""), String(p.amount), p.currency, p.type, p.status ?? "", new Date(p.createdAt).toISOString()]);
    downloadCsv("eo50-payments.csv", rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n"));
  };

  if (loading) return <PageShell><div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-eo50-gold mx-auto" /></div></PageShell>;
  if (user?.role !== "admin") {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <h1 className="font-display text-3xl text-eo50-navy">Admin only</h1>
          <p className="mt-3 text-eo50-muted">This area is restricted to EO50 administrators.</p>
        </div>
      </PageShell>
    );
  }

  const o = overview.data;

  return (
    <PageShell>
      <section className="bg-eo50-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-xs uppercase tracking-wider text-eo50-gold">Admin</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">EO50 Operations</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-4 md:grid-cols-5">
          <StatCard label="Users" value={o?.totalUsers ?? "-"} />
          <StatCard label="Rewrites" value={o?.totalRewrites ?? "-"} />
          <StatCard label="Paid rewrites" value={o?.paidRewrites ?? "-"} />
          <StatCard label="Active subscribers" value={o?.activeSubscribers ?? "-"} />
          <StatCard label="Revenue" value={o ? `$${(o.totalRevenueCents / 100).toFixed(2)}` : "-"} sub="USD, all-time" />
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="users">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabsList className="bg-eo50-light-gray">
                <TabsTrigger value="users" className="data-[state=active]:bg-eo50-navy data-[state=active]:text-white">Users</TabsTrigger>
                <TabsTrigger value="rewrites" className="data-[state=active]:bg-eo50-navy data-[state=active]:text-white">Rewrites</TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-eo50-navy data-[state=active]:text-white">Payments</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" className="border-eo50-navy text-eo50-navy" onClick={exportCsv}><Download className="w-4 h-4 mr-2" /> Export emails CSV</Button>
                <Button variant="outline" className="border-eo50-navy text-eo50-navy" onClick={exportRewritesCsv}><Download className="w-4 h-4 mr-2" /> Rewrites CSV</Button>
                <Button variant="outline" className="border-eo50-navy text-eo50-navy" onClick={exportPaymentsCsv}><Download className="w-4 h-4 mr-2" /> Payments CSV</Button>
              </div>
            </div>

            <TabsContent value="users" className="mt-4">
              <Card className="border-eo50-mid-gray">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-eo50-light-gray text-eo50-navy">
                      <tr>
                        <th className="text-left px-4 py-3">Email</th>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Role</th>
                        <th className="text-left px-4 py-3">Subscription</th>
                        <th className="text-left px-4 py-3">Joined</th>
                        <th className="text-left px-4 py-3">Last sign-in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(users.data ?? []).map(u => (
                        <tr key={u.id} className="border-t border-eo50-mid-gray">
                          <td className="px-4 py-3 text-eo50-navy">{u.email ?? "-"}</td>
                          <td className="px-4 py-3 text-eo50-navy">{u.name ?? "-"}</td>
                          <td className="px-4 py-3 text-eo50-navy">{u.role}</td>
                          <td className="px-4 py-3 text-eo50-navy">{u.subscriptionStatus ?? "-"}</td>
                          <td className="px-4 py-3 text-eo50-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-eo50-muted">{new Date(u.lastSignedIn).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewrites" className="mt-4">
              <Card className="border-eo50-mid-gray">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-eo50-light-gray text-eo50-navy">
                      <tr>
                        <th className="text-left px-4 py-3">ID</th>
                        <th className="text-left px-4 py-3">User</th>
                        <th className="text-left px-4 py-3">Role</th>
                        <th className="text-left px-4 py-3">Industry</th>
                        <th className="text-left px-4 py-3">ATS</th>
                        <th className="text-left px-4 py-3">Paid</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rewrites.data ?? []).map(r => (
                        <tr key={r.id} className="border-t border-eo50-mid-gray">
                          <td className="px-4 py-3">{r.id}</td>
                          <td className="px-4 py-3">{r.userId}</td>
                          <td className="px-4 py-3">{r.roleType ?? "-"}</td>
                          <td className="px-4 py-3">{r.industry ?? "-"}</td>
                          <td className="px-4 py-3">{r.atsScore ?? "-"}</td>
                          <td className="px-4 py-3">{r.paid ? "Yes" : "No"}</td>
                          <td className="px-4 py-3">{r.status}</td>
                          <td className="px-4 py-3 text-eo50-muted">{new Date(r.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-4">
              <Card className="border-eo50-mid-gray">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-eo50-light-gray text-eo50-navy">
                      <tr>
                        <th className="text-left px-4 py-3">ID</th>
                        <th className="text-left px-4 py-3">User</th>
                        <th className="text-left px-4 py-3">Amount</th>
                        <th className="text-left px-4 py-3">Type</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(payments.data ?? []).map(p => (
                        <tr key={p.id} className="border-t border-eo50-mid-gray">
                          <td className="px-4 py-3">{p.id}</td>
                          <td className="px-4 py-3">{p.userId ?? "-"}</td>
                          <td className="px-4 py-3">${(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()}</td>
                          <td className="px-4 py-3">{p.type}</td>
                          <td className="px-4 py-3">{p.status ?? "-"}</td>
                          <td className="px-4 py-3 text-eo50-muted">{new Date(p.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </PageShell>
  );
}
