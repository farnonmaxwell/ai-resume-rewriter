# JASS Migration Checklist

## Completed in this overhaul

- [x] Replace legacy auth with Supabase email/password auth flow.
- [x] Add Supabase Postgres migration for users, profiles, resumes, applications, feedback_outcomes, email subscribers, and storage policies.
- [x] Add Supabase Storage support for private resume uploads and signed URLs.
- [x] Replace legacy LLM endpoint with direct OpenAI-compatible chat completions using environment variables.
- [x] Remove legacy platform branding, legacy auth helpers, retired storage helpers, old database schema, and payment modules from active code paths.
- [x] Add first-screen-after-auth job-type branching with the six required JASS work-type options.
- [x] Add canonical industry taxonomy with an Other free-text path.
- [x] Remove checkout, customer portal, payment gating, and revenue reporting from the app.
- [x] Update dashboard, admin, pricing, upload, intake, score, results, home, and metadata for JASS.
- [x] Validate with `pnpm check`, `pnpm build`, and `pnpm test`.

## Still pending outside this code-only pass

- [ ] Create or connect the live Supabase cloud project under the production account.
- [ ] Apply `supabase/migrations/0001_jass_core.sql` to that project.
- [ ] Configure production environment variables in the hosting environment.
- [ ] Verify Supabase email templates and redirect URLs in the Supabase dashboard.

## Explicitly not built in this phase

- [ ] Job search API integration.
- [ ] Payment flows.
- [ ] Interview prep module.
- [ ] Ghost-job verification logic.
- [ ] Dual scoring UI.
- [ ] PWA support.
- [ ] New landing-page expansion.
- [ ] Recruiter Lens, Skills Gap Bridge, or I Got Hired.
