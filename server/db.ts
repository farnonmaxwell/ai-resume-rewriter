import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { getJobTypeConfig } from "@shared/jass";
import { ENV } from "./_core/env";
import { supabaseAdmin } from "./supabase";

export type AppUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
  emailSubscribed?: boolean;
  createdAt?: Date;
  lastSignedIn?: Date;
};

export type Profile = {
  userId: string;
  jobType: string | null;
  targetRole: string | null;
  industry: string | null;
  industryOther: string | null;
  resumeFormat: string | null;
  scoringMethod: string | null;
  jobSources: string[];
  interviewPrepStyle: string | null;
  displayedMonthlyPrice: number | null;
  pricingAudience: string | null;
  feedbackOptIn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Rewrite = {
  id: string;
  userId: string;
  originalText: string;
  originalFileName?: string | null;
  originalFileKey?: string | null;
  roleType?: string | null;
  jobType?: string | null;
  industry?: string | null;
  industryOther?: string | null;
  jobDescription?: string | null;
  concerns?: string[];
  yearsToHighlight?: string | null;
  rewrittenText?: string | null;
  rewrittenJson?: unknown;
  changeAnnotations?: unknown;
  ageBiasFlags?: unknown;
  tips?: unknown;
  atsScore?: number | null;
  keywordScore?: number | null;
  formattingScore?: number | null;
  structureScore?: number | null;
  ageBiasScore?: number | null;
  status?: "draft" | "scored" | "rewritten";
  pdfFileKey?: string | null;
  docxFileKey?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FeedbackOutcomeInput = {
  userId: string;
  jobId?: string | null;
  companyName: string;
  applicationDate?: string | null;
  status: "applied" | "response_received" | "interview_scheduled" | "offer" | "ghosted" | "rejected";
  notes?: string | null;
};

function toDate(value: string | null | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

function userFromRow(row: any): AppUser {
  return {
    id: row.id,
    email: row.email ?? null,
    name: row.name ?? null,
    role: row.role ?? "user",
    emailSubscribed: row.email_subscribed ?? false,
    createdAt: toDate(row.created_at),
    lastSignedIn: toDate(row.last_signed_in),
  };
}

function profileFromRow(row: any): Profile {
  return {
    userId: row.user_id,
    jobType: row.job_type ?? null,
    targetRole: row.target_role ?? null,
    industry: row.industry ?? null,
    industryOther: row.industry_other ?? null,
    resumeFormat: row.resume_format ?? null,
    scoringMethod: row.scoring_method ?? null,
    jobSources: row.job_sources ?? [],
    interviewPrepStyle: row.interview_prep_style ?? null,
    displayedMonthlyPrice: row.displayed_monthly_price == null ? null : Number(row.displayed_monthly_price),
    pricingAudience: row.pricing_audience ?? null,
    feedbackOptIn: row.feedback_opt_in ?? false,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function rewriteFromRow(row: any): Rewrite {
  return {
    id: row.id,
    userId: row.user_id,
    originalText: row.original_text,
    originalFileName: row.original_file_name ?? null,
    originalFileKey: row.original_file_key ?? null,
    roleType: row.role_type ?? null,
    jobType: row.job_type ?? null,
    industry: row.industry ?? null,
    industryOther: row.industry_other ?? null,
    jobDescription: row.job_description ?? null,
    concerns: row.concerns ?? [],
    yearsToHighlight: row.years_to_highlight ?? null,
    rewrittenText: row.rewritten_text ?? null,
    rewrittenJson: row.rewritten_json ?? null,
    changeAnnotations: row.change_annotations ?? null,
    ageBiasFlags: row.age_bias_flags ?? null,
    tips: row.tips ?? null,
    atsScore: row.ats_score ?? null,
    keywordScore: row.keyword_score ?? null,
    formattingScore: row.formatting_score ?? null,
    structureScore: row.structure_score ?? null,
    ageBiasScore: row.age_bias_score ?? null,
    status: row.status ?? "draft",
    pdfFileKey: row.pdf_file_key ?? null,
    docxFileKey: row.docx_file_key ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function assertNoError(error: any, label: string): void {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

export async function upsertUserFromAuth(authUser: SupabaseAuthUser): Promise<AppUser> {
  const email = authUser.email ?? null;
  const name =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    email?.split("@")[0] ??
    null;
  const role = ENV.ownerEmail && email?.toLowerCase() === ENV.ownerEmail.toLowerCase() ? "admin" : "user";

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        id: authUser.id,
        email,
        name,
        role,
        last_signed_in: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  assertNoError(error, "Unable to upsert user");
  await ensureProfile(authUser.id);
  return userFromRow(data);
}

export async function getUserById(id: string): Promise<AppUser | undefined> {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", id).maybeSingle();
  assertNoError(error, "Unable to load user");
  return data ? userFromRow(data) : undefined;
}

export async function updateUser(id: string, patch: Partial<{ name: string | null; emailSubscribed: boolean }>): Promise<void> {
  const update: Record<string, unknown> = {};
  if ("name" in patch) update.name = patch.name;
  if ("emailSubscribed" in patch) update.email_subscribed = patch.emailSubscribed;
  const { error } = await supabaseAdmin.from("users").update(update).eq("id", id);
  assertNoError(error, "Unable to update user");
}

export async function ensureProfile(userId: string): Promise<Profile> {
  const existing = await getProfile(userId);
  if (existing) return existing;
  const cfg = getJobTypeConfig(null);
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert({
      user_id: userId,
      resume_format: cfg.resumeFormat,
      scoring_method: cfg.scoringMethod,
      job_sources: cfg.jobSources,
      interview_prep_style: cfg.interviewPrepStyle,
      displayed_monthly_price: cfg.displayedMonthlyPrice,
      pricing_audience: cfg.pricingAudience,
    })
    .select("*")
    .single();
  assertNoError(error, "Unable to create profile");
  return profileFromRow(data);
}

export async function getProfile(userId: string): Promise<Profile | undefined> {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  assertNoError(error, "Unable to load profile");
  return data ? profileFromRow(data) : undefined;
}

export async function upsertProfile(userId: string, input: Partial<{
  jobType: string;
  targetRole: string | null;
  industry: string | null;
  industryOther: string | null;
  feedbackOptIn: boolean;
}>): Promise<Profile> {
  const cfg = getJobTypeConfig(input.jobType);
  const payload: Record<string, unknown> = {
    user_id: userId,
    resume_format: cfg.resumeFormat,
    scoring_method: cfg.scoringMethod,
    job_sources: cfg.jobSources,
    interview_prep_style: cfg.interviewPrepStyle,
    displayed_monthly_price: cfg.displayedMonthlyPrice,
    pricing_audience: cfg.pricingAudience,
  };
  if ("jobType" in input) payload.job_type = input.jobType;
  if ("targetRole" in input) payload.target_role = input.targetRole;
  if ("industry" in input) payload.industry = input.industry;
  if ("industryOther" in input) payload.industry_other = input.industryOther;
  if ("feedbackOptIn" in input) payload.feedback_opt_in = input.feedbackOptIn;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  assertNoError(error, "Unable to update profile");
  return profileFromRow(data);
}

export async function createRewrite(input: {
  userId: string;
  originalText: string;
  originalFileName?: string | null;
  originalFileKey?: string | null;
  roleType?: string | null;
  jobType?: string | null;
  industry?: string | null;
  industryOther?: string | null;
  jobDescription?: string | null;
  concerns?: string[];
  yearsToHighlight?: string | null;
}): Promise<string> {
  const profile = await getProfile(input.userId);
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .insert({
      user_id: input.userId,
      original_text: input.originalText,
      original_file_name: input.originalFileName ?? null,
      original_file_key: input.originalFileKey ?? null,
      role_type: input.roleType ?? null,
      job_type: input.jobType ?? profile?.jobType ?? null,
      industry: input.industry ?? profile?.industry ?? null,
      industry_other: input.industryOther ?? profile?.industryOther ?? null,
      job_description: input.jobDescription ?? null,
      concerns: input.concerns ?? [],
      years_to_highlight: input.yearsToHighlight ?? null,
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create resume record");
  if (!data?.id) throw new Error("Unable to create resume record");
  return data.id;
}

export async function getRewriteById(id: string): Promise<Rewrite | undefined> {
  const { data, error } = await supabaseAdmin.from("resumes").select("*").eq("id", id).maybeSingle();
  assertNoError(error, "Unable to load resume record");
  return data ? rewriteFromRow(data) : undefined;
}

export async function updateRewrite(id: string, patch: Partial<Rewrite>): Promise<void> {
  const update: Record<string, unknown> = {};
  if ("originalText" in patch) update.original_text = patch.originalText;
  if ("originalFileName" in patch) update.original_file_name = patch.originalFileName;
  if ("originalFileKey" in patch) update.original_file_key = patch.originalFileKey;
  if ("roleType" in patch) update.role_type = patch.roleType;
  if ("jobType" in patch) update.job_type = patch.jobType;
  if ("industry" in patch) update.industry = patch.industry;
  if ("industryOther" in patch) update.industry_other = patch.industryOther;
  if ("jobDescription" in patch) update.job_description = patch.jobDescription;
  if ("concerns" in patch) update.concerns = patch.concerns;
  if ("yearsToHighlight" in patch) update.years_to_highlight = patch.yearsToHighlight;
  if ("rewrittenText" in patch) update.rewritten_text = patch.rewrittenText;
  if ("rewrittenJson" in patch) update.rewritten_json = patch.rewrittenJson;
  if ("changeAnnotations" in patch) update.change_annotations = patch.changeAnnotations;
  if ("ageBiasFlags" in patch) update.age_bias_flags = patch.ageBiasFlags;
  if ("tips" in patch) update.tips = patch.tips;
  if ("atsScore" in patch) update.ats_score = patch.atsScore;
  if ("keywordScore" in patch) update.keyword_score = patch.keywordScore;
  if ("formattingScore" in patch) update.formatting_score = patch.formattingScore;
  if ("structureScore" in patch) update.structure_score = patch.structureScore;
  if ("ageBiasScore" in patch) update.age_bias_score = patch.ageBiasScore;
  if ("status" in patch) update.status = patch.status;
  if ("pdfFileKey" in patch) update.pdf_file_key = patch.pdfFileKey;
  if ("docxFileKey" in patch) update.docx_file_key = patch.docxFileKey;
  const { error } = await supabaseAdmin.from("resumes").update(update).eq("id", id);
  assertNoError(error, "Unable to update resume record");
}

export async function listRewritesByUser(userId: string): Promise<Rewrite[]> {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  assertNoError(error, "Unable to list user resumes");
  return (data ?? []).map(rewriteFromRow);
}

export async function listAllRewrites(limit = 500): Promise<Rewrite[]> {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  assertNoError(error, "Unable to list resumes");
  return (data ?? []).map(rewriteFromRow);
}

export async function listAllUsers(): Promise<AppUser[]> {
  const { data, error } = await supabaseAdmin.from("users").select("*").order("created_at", { ascending: false });
  assertNoError(error, "Unable to list users");
  return (data ?? []).map(userFromRow);
}

export async function addEmailSubscriber(input: { email: string; source?: string | null }): Promise<void> {
  const { error } = await supabaseAdmin
    .from("email_subscribers")
    .upsert({ email: input.email.toLowerCase(), source: input.source ?? "website" }, { onConflict: "email" });
  assertNoError(error, "Unable to add email subscriber");
}

export async function listEmailSubscribers(): Promise<Array<{ id: string; email: string; source?: string | null; createdAt?: Date }>> {
  const { data, error } = await supabaseAdmin
    .from("email_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  assertNoError(error, "Unable to list email subscribers");
  return (data ?? []).map((row: any) => ({ id: row.id, email: row.email, source: row.source, createdAt: toDate(row.created_at) }));
}

export async function createFeedbackOutcome(input: FeedbackOutcomeInput): Promise<void> {
  const { error } = await supabaseAdmin.from("feedback_outcomes").insert({
    user_id: input.userId,
    job_id: input.jobId ?? null,
    company_name: input.companyName,
    application_date: input.applicationDate ?? null,
    status: input.status,
    notes: input.notes ?? null,
    last_updated: new Date().toISOString(),
  });
  assertNoError(error, "Unable to create feedback outcome");
}

export async function listAllPayments(): Promise<[]> {
  return [];
}
