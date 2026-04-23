# EO50 Resume Rewriter and ATS Optimizer

An [Empower Over 50 (EO50)](https://empowerover50.com) product. A full-stack web application that helps professionals 50 and over eliminate age-bias from their resumes, pass Applicant Tracking Systems, and receive a professionally rewritten, achievement-focused resume.

---

## What It Does

- Accepts resume uploads in PDF, DOCX, or plain text paste format with automatic parsing
- Guides users through a 5-step intake flow: role type, industry, target job description, concerns checklist, and years of experience to highlight
- Rewrites the resume using AI: removes age-bias signals, optimizes ATS keywords, modernizes formatting, and transforms duty-based bullets into achievement-based bullets
- Generates an ATS Compatibility Score (0-100) with a full breakdown across keyword match, formatting, structure, and age-bias sub-scores
- Shows a side-by-side comparison of the original vs. rewritten resume with color-coded change annotations
- Provides personalized tips based on the detected issues
- Allows download of the rewritten resume as PDF and DOCX
- Stripe payments: free tier (score + teaser), $27 one-time full rewrite, $9/month unlimited subscription
- User accounts with rewrite history dashboard
- Admin dashboard with user management, rewrite stats, revenue overview, and CSV export
- Mailchimp email capture (stub mode; activates when credentials are set)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Wouter |
| Backend | Express 4, tRPC 11, Drizzle ORM |
| Database | MySQL (TiDB compatible) |
| AI | Built-in LLM helper (Gemini 2.5 Flash via Manus Forge) |
| File parsing | pdf-parse, mammoth |
| Document export | docx, pdf-lib |
| Payments | Stripe Checkout + Customer Portal |
| Storage | S3-compatible (Manus built-in) |
| Auth | Manus OAuth |
| Testing | Vitest |

---

## Project Structure

```
client/
  src/
    pages/          Landing, Upload, Intake, Score, Results, Dashboard, Admin, Pricing, HowItWorks
    components/     SiteHeader, SiteFooter, PageShell
    lib/trpc.ts     tRPC client binding
    App.tsx         Routes
    index.css       EO50 brand tokens (Navy #1a1a2e, Gold #d4a843)
drizzle/
  schema.ts         All database tables
server/
  routers/          rewrites.ts, payments.ts, admin.ts, marketing.ts
  rewriteEngine.ts  AI rewrite + ATS scoring logic
  resumeParser.ts   PDF/DOCX/text parsing
  documentExport.ts PDF and DOCX generation
  stripeClient.ts   Stripe wrapper
  stripeWebhook.ts  Webhook handler
  mailchimp.ts      Mailchimp stub
  db.ts             Drizzle query helpers
shared/
  products.ts       Stripe product/price IDs
```

---

## Local Development

### Prerequisites

- Node.js 22+
- pnpm
- A MySQL-compatible database (TiDB Cloud free tier works)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/farnonmaxwell/ai-resume-rewriter.git
cd ai-resume-rewriter

# 2. Install dependencies
pnpm install

# 3. Copy environment template and fill in values
cp .env.example .env

# 4. Generate and apply database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 5. Start the dev server
pnpm dev
```

The app runs at `http://localhost:3000`.

### Required Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Session cookie signing secret |
| `BUILT_IN_FORGE_API_KEY` | LLM API key (Manus Forge) |
| `BUILT_IN_FORGE_API_URL` | LLM API base URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (frontend) |
| `VITE_APP_ID` | Manus OAuth app ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |

Optional:

| Variable | Purpose |
|---|---|
| `MAILCHIMP_API_KEY` | Activates real Mailchimp sync (stub mode when absent) |
| `MAILCHIMP_LIST_ID` | Mailchimp audience list ID |

---

## Running Tests

```bash
pnpm test
```

9 tests across 3 suites: rewrite engine scoring, Mailchimp stub, and auth logout.

---

## Stripe Setup

1. Claim the Stripe sandbox at the URL provided in the Manus project dashboard.
2. Test payments with card `4242 4242 4242 4242`.
3. For production, replace test keys with live keys in Settings after Stripe KYC.

---

## Admin Access

To promote a user to admin, update their `role` field to `admin` directly in the database.

---

## Brand

EO50 color palette applied throughout:

- Navy: `#1a1a2e`
- Gold: `#d4a843`
- White: `#ffffff`
- Light Gray: `#f5f5f5`

No em dashes appear anywhere in user-facing copy, emails, or AI-generated content. No stock photos. No third-party branding.

---

## License

MIT
