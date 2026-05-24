import * as db from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const adminRouter = router({
  overview: adminProcedure.query(async () => {
    const [users, rewrites] = await Promise.all([
      db.listAllUsers(),
      db.listAllRewrites(500),
    ]);
    return {
      totalUsers: users.length,
      totalRewrites: rewrites.length,
      completedRewrites: rewrites.filter((rewrite) => rewrite.status === "rewritten").length,
      scoredRewrites: rewrites.filter((rewrite) => rewrite.status === "scored").length,
      feedbackOptIns: 0,
    };
  }),

  users: adminProcedure.query(async () => {
    const users = await db.listAllUsers();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailSubscribed: user.emailSubscribed,
      createdAt: user.createdAt,
      lastSignedIn: user.lastSignedIn,
    }));
  }),

  rewrites: adminProcedure.query(async () => {
    const rows = await db.listAllRewrites(500);
    return rows.map((rewrite) => ({
      id: rewrite.id,
      userId: rewrite.userId,
      roleType: rewrite.roleType,
      jobType: rewrite.jobType,
      industry: rewrite.industry,
      atsScore: rewrite.atsScore,
      status: rewrite.status,
      createdAt: rewrite.createdAt,
    }));
  }),

  exportUserEmailsCsv: adminProcedure.query(async () => {
    const users = await db.listAllUsers();
    const subscribers = await db.listEmailSubscribers();
    const rows = [["email", "name", "role", "createdAt", "source"]];
    for (const user of users) {
      if (!user.email) continue;
      rows.push([
        user.email,
        user.name ?? "",
        user.role,
        user.createdAt?.toISOString() ?? "",
        "user",
      ]);
    }
    for (const subscriber of subscribers) {
      rows.push([
        subscriber.email,
        "",
        "",
        subscriber.createdAt?.toISOString() ?? "",
        subscriber.source ?? "subscriber",
      ]);
    }
    const csv = rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    return { csv, count: rows.length - 1 };
  }),
});
