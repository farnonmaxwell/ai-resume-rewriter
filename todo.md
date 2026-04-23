# EO50 Resume Rewriter — TODO

## Database & Backend
- [x] Add resumes, rewrites, intakes, payments, subscriptions, email_subscribers tables to drizzle schema
- [x] Run drizzle-kit generate and apply migration
- [x] Install backend deps (pdf-parse, mammoth, docx, pdf-lib, stripe)
- [x] Resume file parser (PDF, DOCX, plain text paste)
- [x] AI rewrite engine via invokeLLM (age-bias removal, ATS optimization, achievement bullets, keywords match score)
- [x] ATS Compatibility Score calculator (0-100 with keyword/formatting/structure/age-bias breakdown)
- [x] PDF generator for downloadable rewritten resume
- [x] DOCX generator for editable rewritten resume
- [x] tRPC routers: rewrites, payments, admin, marketing
- [x] Free-tier teaser logic (first 2 bullets rewritten only)
- [x] Mailchimp stub on email capture

## Frontend
- [x] Apply EO50 brand colors (Navy #1a1a2e, Gold #d4a843, White, Light Gray) in index.css and Tailwind theme
- [x] Landing page with hero, 3-step visual, testimonials, pricing, email capture, CTA
- [x] Upload page (PDF/DOCX/paste)
- [x] 5-step intake flow (role type, industry, JD, concerns checklist, years to highlight)
- [x] Side-by-side comparison view with color-coded annotations
- [x] Results page with ATS score breakdown, tips, downloads
- [x] Free-tier teaser preview
- [x] User dashboard with rewrite history
- [x] Auth via Manus OAuth (template integration)
- [x] Admin dashboard (users, rewrites, revenue, CSV export)
- [x] Stripe checkout flow + customer portal
- [x] Email capture form (Mailchimp stub)
- [x] Mobile responsive across all pages
- [x] WCAG accessibility (focus rings, semantic HTML, labels, color contrast)
- [x] No em dashes anywhere in user-facing copy
- [x] No stock photos
- [x] No Manus branding

## Payments
- [x] Stripe one-time checkout ($27)
- [x] Stripe subscription ($9/month)
- [x] Stripe customer portal for sub management
- [x] Webhook endpoint for payment events at /api/stripe/webhook

## Tests
- [x] vitest tests for rewrite engine scoring (7 tests)
- [x] vitest test for Mailchimp stub mode
- [x] Existing auth.logout vitest passes

## Deployment
- [x] webdev_check_status clean (no LSP/TS errors)
- [x] Save checkpoint
- [x] Deploy public
