import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Download, Loader2 } from "lucide-react";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="border-jass-mid-gray">
      <CardContent className="p-6">
        <div className="text-xs uppercase tracking-wider text-jass-muted">{label}</div>
        <div className="font-display text-3xl font-bold text-jass-navy mt-1">{value}</div>
        {sub && <div className="text-xs text-jass-muted mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function formatDate(value?: string | Date | null, mode: "date" | "datetime" | "iso" = "datetime") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  if (mode === "iso") return date.toISOString();
  if (mode === "date") return date.toLocaleDateString();
  return date.toLocaleString();
}

function downloadCsv(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: user?.role === "admin" });
  const users = trpc.admin.users.useQuery(undefined, { enabled: user?.role === "admin" });
  const rewrites = trpc.admin.rewrites.useQuery(undefined, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();

  const exportCsv = async () => {
    const response = await utils.admin.exportUserEmailsCsv.fetch();
    downloadCsv("jass-emails.csv", response.csv);
  };

  const exportRewritesCsv = () => {
    if (!rewrites.data) return;
    const rows = [["id", "userId", "roleType", "jobType", "industry", "atsScore", "status", "createdAt"]];
    for (const rewrite of rewrites.data) {
      rows.push([
        String(rewrite.id),
        String(rewrite.userId),
        rewrite.roleType ?? "",
        rewrite.jobType ?? "",
        rewrite.industry ?? "",
        String(rewrite.atsScore ?? ""),
        rewrite.status ?? "",
        formatDate(rewrite.createdAt, "iso"),
      ]);
    }
    downloadCsv("jass-rewrites.csv", rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n"));
  };

  if (loading) return <PageShell><div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-jass-gold mx-auto" /></div></PageShell>;

  if (user?.role !== "admin") {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <h1 className="font-display text-3xl text-jass-navy">Admin only</h1>
          <p className="mt-3 text-jass-muted">This area is restricted to JASS administrators.</p>
        </div>
      </PageShell>
    );
  }

  const metrics = overview.data;

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-xs uppercase tracking-wider text-jass-gold">Admin</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">JASS Operations</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Users" value={metrics?.totalUsers ?? "-"} />
          <StatCard label="Rewrites" value={metrics?.totalRewrites ?? "-"} />
          <StatCard label="Completed rewrites" value={metrics?.completedRewrites ?? "-"} />
          <StatCard label="Scored rewrites" value={metrics?.scoredRewrites ?? "-"} />
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="users">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabsList className="bg-jass-light-gray">
                <TabsTrigger value="users" className="data-[state=active]:bg-jass-navy data-[state=active]:text-white">Users</TabsTrigger>
                <TabsTrigger value="rewrites" className="data-[state=active]:bg-jass-navy data-[state=active]:text-white">Rewrites</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" className="border-jass-navy text-jass-navy" onClick={exportCsv}><Download className="w-4 h-4 mr-2" /> Export emails CSV</Button>
                <Button variant="outline" className="border-jass-navy text-jass-navy" onClick={exportRewritesCsv}><Download className="w-4 h-4 mr-2" /> Rewrites CSV</Button>
              </div>
            </div>

            <TabsContent value="users" className="mt-4">
              <Card className="border-jass-mid-gray">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-jass-light-gray text-jass-navy">
                      <tr>
                        <th className="text-left px-4 py-3">Email</th>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Role</th>
                        <th className="text-left px-4 py-3">Joined</th>
                        <th className="text-left px-4 py-3">Last sign-in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(users.data ?? []).map((item) => (
                        <tr key={item.id} className="border-t border-jass-mid-gray">
                          <td className="px-4 py-3 text-jass-navy">{item.email ?? "-"}</td>
                          <td className="px-4 py-3 text-jass-navy">{item.name ?? "-"}</td>
                          <td className="px-4 py-3 text-jass-navy">{item.role}</td>
                          <td className="px-4 py-3 text-jass-muted">{formatDate(item.createdAt, "date")}</td>
                          <td className="px-4 py-3 text-jass-muted">{formatDate(item.lastSignedIn)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewrites" className="mt-4">
              <Card className="border-jass-mid-gray">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-jass-light-gray text-jass-navy">
                      <tr>
                        <th className="text-left px-4 py-3">ID</th>
                        <th className="text-left px-4 py-3">User</th>
                        <th className="text-left px-4 py-3">Role</th>
                        <th className="text-left px-4 py-3">Job type</th>
                        <th className="text-left px-4 py-3">Industry</th>
                        <th className="text-left px-4 py-3">ATS</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rewrites.data ?? []).map((rewrite) => (
                        <tr key={rewrite.id} className="border-t border-jass-mid-gray">
                          <td className="px-4 py-3">{rewrite.id}</td>
                          <td className="px-4 py-3">{rewrite.userId}</td>
                          <td className="px-4 py-3">{rewrite.roleType ?? "-"}</td>
                          <td className="px-4 py-3">{rewrite.jobType ?? "-"}</td>
                          <td className="px-4 py-3">{rewrite.industry ?? "-"}</td>
                          <td className="px-4 py-3">{rewrite.atsScore ?? "-"}</td>
                          <td className="px-4 py-3">{rewrite.status}</td>
                          <td className="px-4 py-3 text-jass-muted">{formatDate(rewrite.createdAt)}</td>
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
