# JASS | Job Application Support System

JASS is an AI-powered job application support tool for people who need a sharper, more credible application package. It rewrites resumes, scores ATS readiness, and adapts the experience to the type of work the user is pursuing. The product voice is direct, caring, and senior: **"Your resume undersells you. Here's what I'd fix."**

---

## Current Build Scope

This build replaces the previous application architecture with a Supabase and OpenAI foundation. It keeps the core resume upload, parsing, scoring, rewrite, results, dashboard, admin, export, and email-capture workflows, while removing payment and legacy platform dependencies.

| Area | Current implementation |
|---|---|
| Auth | Supabase Auth with email/password |
| Database | Supabase Postgres migration in `supabase/migrations/0001_jass_core.sql` |
| Storage | Supabase Storage private `resume-uploads` bucket with signed URLs |
| AI | Direct OpenAI-compatible chat completions using `OPENAI_API_KEY` |
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Wouter |
| Backend | Express 4 and tRPC 11 |
| Testing | Vitest |

The build deliberately does **not** include job search API integration, payment flows, interview prep, ghost-job verification, dual scoring UI, PWA support, landing-page expansion, Recruiter Lens, Skills Gap Bridge, or I Got Hired.

---

## Core JASS Features

The first screen after authentication asks: **"What type of work are you looking for?"** The six supported branches are Professional/Office, Skilled Trade, Healthcare, Labour/Warehouse/Logistics, Retail/Hospitality/Food Service, and Other. This value is stored on the user profile and drives resume format, scoring posture, job-source assumptions, interview-prep tone, and pricing copy displayed in the UI.

The profile setup also includes a Bureau of Labor Statistics-style industry taxonomy with an **Other** option and free-text field. Required categories include Healthcare and Pharmaceuticals, Technology and IT, Finance and Banking, Education, Government and Public Sector, Manufacturing, Construction and Trades, Retail and Consumer, Legal, Media and Communications, Non-profit, Energy and Utilities, Transportation and Logistics, Hospitality and Food Service, Real Estate, Consulting and Professional Services, Agriculture, and additional categories.

The feedback loop data model exists from day one. The `feedback_outcomes` table stores user_id, job_id, company_name, application_date, status, last_updated, and notes. Supported statuses are applied, response_received, interview_scheduled, offer, ghosted, and rejected. UI for this loop can be added later without another database redesign.

---

## Project Structure

```text
client/
  src/
    pages/          Auth, Onboarding, Upload, Intake, Score, Results, Dashboard, Admin, Pricing, HowItWorks
    components/     SiteHeader, SiteFooter, PageShell, DashboardLayout
    lib/            Supabase browser client and tRPC bindings
    App.tsx         Routes and onboarding gate
server/
  routers/          rewrites, admin, marketing
  _core/            Express entrypoint, tRPC, Supabase-auth context, OpenAI wrapper
  db.ts             Supabase/Postgres data helpers
  storage.ts        Supabase Storage upload and signed URL helpers
  rewriteEngine.ts  JASS resume rewrite and scoring logic
  resumeParser.ts   PDF/DOCX/text parsing
  documentExport.ts PDF and DOCX generation
shared/
  jass.ts           Job-type, industry, and pricing-display constants
supabase/
  migrations/       Core JASS schema, RLS, triggers, and storage bucket policies
```

---

## Local Development

### Prerequisites

You need Node.js 22+, pnpm, a Supabase project, and an OpenAI API key. Apply `supabase/migrations/0001_jass_core.sql` in the Supabase SQL editor or through the Supabase CLI before running the app against a live project.

```bash
git clone https://github.com/farnonmaxwell/ai-resume-rewriter.git
cd ai-resume-rewriter
pnpm install
cp .env.example .env
pnpm dev
```

The app runs locally at `http://localhost:3000`.

---

## Required Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `SUPABASE_URL` | Server | Supabase project URL |
| `SUPABASE_ANON_KEY` | Server | Supabase anon key used for token validation fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase service role key for backend database and storage operations |
| `SUPABASE_STORAGE_BUCKET` | Server | Resume upload bucket, defaults to `resume-uploads` |
| `OPENAI_API_KEY` | Server | Direct OpenAI-compatible API key |
| `OPENAI_BASE_URL` | Server | Optional OpenAI-compatible base URL, defaults to OpenAI |
| `OPENAI_MODEL` | Server | Optional model override, defaults to `gpt-4.1-mini` |
| `VITE_SUPABASE_URL` | Client | Supabase project URL exposed to browser |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anon key exposed to browser |

Optional email-capture variables are `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, and `MAILCHIMP_SERVER_PREFIX`. Mailchimp remains in stub mode when they are absent.

---

## Validation

```bash
pnpm check
pnpm build
pnpm test
```

The current test suite covers rewrite-engine pure helpers and the Mailchimp stub path. The production build may warn about large client chunks; that is a code-splitting optimization warning, not a functional failure.

---

## Admin Access

To promote a user to admin, update the user profile `role` field to `admin` directly in Supabase. The admin screen reports operational metrics and CSV exports only; it does not include revenue or subscription reporting.

---

## Brand

JASS uses a professional navy and gold visual system. All user-facing copy, metadata, generated document metadata, and UI branding now refer to **JASS**. No legacy platform branding, external platform dependency, or payment-flow language should appear in active application code.

---

## License

MIT
