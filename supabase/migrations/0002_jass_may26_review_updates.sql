-- May 26 JASS review updates: add Administrative/Coordinator path and source/target industry context.

alter type public.job_type add value if not exists 'administrative_coordinator';

alter table public.profiles
  add column if not exists target_industry text,
  add column if not exists target_industry_other text;

alter table public.resumes
  add column if not exists target_industry text,
  add column if not exists target_industry_other text,
  add column if not exists suitability_context text,
  add column if not exists role_fit_score integer,
  add column if not exists score_deductions jsonb,
  add column if not exists mismatch_warning jsonb;

alter table public.profiles
  drop constraint if exists profiles_target_industry_other_required;

alter table public.profiles
  add constraint profiles_target_industry_other_required
  check (target_industry is distinct from 'Other' or nullif(trim(target_industry_other), '') is not null);

alter table public.resumes
  drop constraint if exists resumes_target_industry_other_required;

alter table public.resumes
  add constraint resumes_target_industry_other_required
  check (target_industry is distinct from 'Other' or nullif(trim(target_industry_other), '') is not null);
