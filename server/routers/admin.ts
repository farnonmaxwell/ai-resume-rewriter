import * as db from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const adminRouter = router({
  overview: adminProcedure.query(async () => {
    const [users, rewrites, payments] = await Promise.all([
      db.listAllUsers(),
      db.listAllRewrites(500),
      db.listAllPayments(),
    ]);
    const totalRevenueCents = payments
      .filter(p => p.status === "succeeded" || p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const activeSubs = users.filter(u => ["active", "trialing"].includes((u.subscriptionStatus ?? "").toLowerCase())).length;
    return {
      totalUsers: users.length,
      totalRewrites: rewrites.length,
      paidRewrites: rewrites.filter(r => r.paid).length,
      activeSubscribers: activeSubs,
      totalRevenueCents,
    };
  }),

  users: adminProcedure.query(async () => {
    const users = await db.listAllUsers();
    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      subscriptionStatus: u.subscriptionStatus,
      emailSubscribed: u.emailSubscribed,
      createdAt: u.createdAt,
      lastSignedIn: u.lastSignedIn,
    }));
  }),

  rewrites: adminProcedure.query(async () => {
    const rows = await db.listAllRewrites(500);
    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      roleType: r.roleType,
      industry: r.industry,
      atsScore: r.atsScore,
      paid: r.paid,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }),

  payments: adminProcedure.query(async () => {
    return await db.listAllPayments();
  }),

  exportUserEmailsCsv: adminProcedure.query(async () => {
    const users = await db.listAllUsers();
    const subs = await db.listEmailSubscribers();
    const rows = [["email", "name", "role", "subscriptionStatus", "createdAt", "source"]];
    for (const u of users) {
      if (!u.email) continue;
      rows.push([
        u.email,
        u.name ?? "",
        u.role,
        u.subscriptionStatus ?? "",
        u.createdAt.toISOString(),
        "user",
      ]);
    }
    for (const s of subs) {
      rows.push([s.email, "", "", "", s.createdAt.toISOString(), s.source ?? "subscriber"]);
    }
    const csv = rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    return { csv, count: rows.length - 1 };
  }),
});
