-- Public contact form submissions for JASS marketing/contact page.
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  source text not null default 'contact',
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx on public.contact_submissions(created_at desc);
create index if not exists contact_submissions_email_idx on public.contact_submissions(lower(email));

alter table public.contact_submissions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_submissions'
      and policyname = 'Anyone can submit contact form'
  ) then
    create policy "Anyone can submit contact form"
      on public.contact_submissions for insert
      with check (true);
  end if;
end $$;
