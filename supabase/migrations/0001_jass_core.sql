-- JASS core Supabase schema
-- Apply this migration to the JASS Supabase project after creating the project.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('user', 'admin');
create type public.job_type as enum (
  'professional_office',
  'skilled_trade',
  'healthcare',
  'labour_warehouse_logistics',
  'retail_hospitality_food_service',
  'other'
);
create type public.resume_status as enum ('draft', 'scored', 'rewritten');
create type public.application_status as enum (
  'draft',
  'prepared',
  'applied',
  'response_received',
  'interview_scheduled',
  'offer',
  'ghosted',
  'rejected',
  'withdrawn'
);
create type public.feedback_outcome_status as enum (
  'applied',
  'response_received',
  'interview_scheduled',
  'offer',
  'ghosted',
  'rejected'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  role public.app_role not null default 'user',
  email_subscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_signed_in timestamptz not null default now()
);

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  job_type public.job_type,
  target_role text,
  industry text,
  industry_other text,
  resume_format text,
  scoring_method text,
  job_sources text[] not null default '{}',
  interview_prep_style text,
  displayed_monthly_price numeric(8,2),
  pricing_audience text,
  feedback_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_industry_other_required check (industry <> 'Other' or nullif(trim(industry_other), '') is not null)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  original_file_name text,
  original_file_key text,
  original_text text not null,
  role_type text,
  job_type public.job_type,
  industry text,
  industry_other text,
  job_description text,
  concerns jsonb not null default '[]'::jsonb,
  years_to_highlight text,
  rewritten_text text,
  rewritten_json jsonb,
  change_annotations jsonb,
  age_bias_flags jsonb,
  tips jsonb,
  ats_score integer,
  keyword_score integer,
  formatting_score integer,
  structure_score integer,
  age_bias_score integer,
  status public.resume_status not null default 'draft',
  pdf_file_key text,
  docx_file_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resumes_industry_other_required check (industry <> 'Other' or nullif(trim(industry_other), '') is not null)
);

create index if not exists resumes_user_id_created_at_idx on public.resumes(user_id, created_at desc);

create trigger resumes_set_updated_at
before update on public.resumes
for each row execute function public.set_updated_at();

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  job_title text,
  company_name text,
  job_url text,
  job_description text,
  job_type public.job_type,
  industry text,
  status public.application_status not null default 'draft',
  prepared_resume_id uuid references public.resumes(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_created_at_idx on public.applications(user_id, created_at desc);

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create or replace function public.set_feedback_last_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.last_updated = now();
  return new;
end;
$$;

create table if not exists public.feedback_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  job_id text,
  company_name text not null,
  application_date date,
  status public.feedback_outcome_status not null,
  last_updated timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_outcomes_user_id_last_updated_idx on public.feedback_outcomes(user_id, last_updated desc);
create index if not exists feedback_outcomes_company_status_idx on public.feedback_outcomes(company_name, status);

create trigger feedback_outcomes_set_last_updated
before update on public.feedback_outcomes
for each row execute function public.set_feedback_last_updated();

create table if not exists public.email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  synced_to_mailchimp boolean not null default false,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resume-uploads',
  'resume-uploads',
  false,
  8388608,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;
alter table public.feedback_outcomes enable row level security;
alter table public.email_subscribers enable row level security;

create policy "Users can read own user row" on public.users for select using (auth.uid() = id);
create policy "Users can update own user row" on public.users for update using (auth.uid() = id);

create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own resumes" on public.resumes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own applications" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own feedback outcomes" on public.feedback_outcomes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Anyone can join email list" on public.email_subscribers for insert with check (true);

create policy "Users can upload own resume files" on storage.objects for insert
with check (bucket_id = 'resume-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own resume files" on storage.objects for select
using (bucket_id = 'resume-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own resume files" on storage.objects for update
using (bucket_id = 'resume-uploads' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'resume-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own resume files" on storage.objects for delete
using (bucket_id = 'resume-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Server-side code upserts public.users after Supabase Auth email/password sign-in.
-- If you prefer fully automatic user-row creation, add an auth.users trigger later.
