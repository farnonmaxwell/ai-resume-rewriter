import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  emailSubscribers,
  InsertEmailSubscriber,
  InsertPayment,
  InsertRewrite,
  InsertUser,
  payments,
  rewrites,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return r[0];
}

export async function updateUser(id: number, patch: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(patch).where(eq(users.id, id));
}

export async function listAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function findUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId)).limit(1);
  return r[0];
}

// REWRITES
export async function createRewrite(input: InsertRewrite): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const r: any = await db.insert(rewrites).values(input);
  return Number(r?.[0]?.insertId ?? r?.insertId ?? 0);
}

export async function updateRewrite(id: number, patch: Partial<InsertRewrite>) {
  const db = await getDb();
  if (!db) return;
  await db.update(rewrites).set(patch).where(eq(rewrites.id, id));
}

export async function getRewriteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(rewrites).where(eq(rewrites.id, id)).limit(1);
  return r[0];
}

export async function listRewritesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rewrites).where(eq(rewrites.userId, userId)).orderBy(desc(rewrites.createdAt));
}

export async function listAllRewrites(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rewrites).orderBy(desc(rewrites.createdAt)).limit(limit);
}

export async function countPaidRewritesSince(userId: number, since: Date): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const r = await db
    .select({ c: sql<number>`count(*)` })
    .from(rewrites)
    .where(and(eq(rewrites.userId, userId), gte(rewrites.createdAt, since), eq(rewrites.paid, true)));
  return Number(r[0]?.c ?? 0);
}

// PAYMENTS
export async function recordPayment(input: InsertPayment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(payments).values(input);
}

export async function listAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

// EMAIL SUBSCRIBERS
export async function addEmailSubscriber(input: InsertEmailSubscriber) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(emailSubscribers).values(input);
  } catch (e: any) {
    if (!String(e?.message ?? "").includes("Duplicate")) throw e;
  }
}

export async function listEmailSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.createdAt));
}

