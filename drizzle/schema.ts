import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  subscriptionStatus: varchar("subscriptionStatus", { length: 32 }),
  emailSubscribed: boolean("emailSubscribed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const rewrites = mysqlTable("rewrites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }),
  originalFileKey: varchar("originalFileKey", { length: 255 }),
  originalText: text("originalText").notNull(),
  roleType: varchar("roleType", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  jobDescription: text("jobDescription"),
  concerns: json("concerns"),
  yearsToHighlight: varchar("yearsToHighlight", { length: 16 }),
  rewrittenText: text("rewrittenText"),
  rewrittenJson: json("rewrittenJson"),
  changeAnnotations: json("changeAnnotations"),
  ageBiasFlags: json("ageBiasFlags"),
  tips: json("tips"),
  atsScore: int("atsScore"),
  keywordScore: int("keywordScore"),
  formattingScore: int("formattingScore"),
  structureScore: int("structureScore"),
  ageBiasScore: int("ageBiasScore"),
  status: mysqlEnum("status", ["draft", "scored", "rewritten"]).default("draft").notNull(),
  paid: boolean("paid").default(false).notNull(),
  pdfFileKey: varchar("pdfFileKey", { length: 255 }),
  docxFileKey: varchar("docxFileKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rewrite = typeof rewrites.$inferSelect;
export type InsertRewrite = typeof rewrites.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  stripeSessionId: varchar("stripeSessionId", { length: 128 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 128 }),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 8 }).default("usd").notNull(),
  type: mysqlEnum("type", ["one_time", "subscription"]).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  rewriteId: int("rewriteId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const emailSubscribers = mysqlTable("emailSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }),
  syncedToMailchimp: boolean("syncedToMailchimp").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;
