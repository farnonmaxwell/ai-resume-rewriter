/**
 * AI Rewrite Engine for JASS.
 * Uses direct OpenAI calls. All output is post-processed to
 * strip em dashes from any user-facing copy.
 */
import { invokeLLM } from "./_core/llm";

export type RewriteInput = {
  originalText: string;
  roleType?: string;
  jobType?: string;
  industry?: string;
  jobDescription?: string;
  concerns?: string[];
  yearsToHighlight?: string;
};

export type ResumeSection = {
  heading: string;
  body: string[]; // paragraphs or bullets, no leading bullets
};

export type ChangeAnnotation = {
  type: "age_bias_removed" | "ats_keyword_added" | "achievement_rewrite" | "formatting" | "structure";
  original: string;
  rewritten: string;
  reason: string;
};

export type RewriteResult = {
  rewrittenText: string;
  rewrittenJson: {
    name?: string;
    contact?: { email?: string; phone?: string; linkedin?: string; location?: string };
    summary?: string;
    sections: ResumeSection[];
  };
  changeAnnotations: ChangeAnnotation[];
  ageBiasFlags: string[];
  tips: string[];
  scores: {
    atsScore: number;
    keywordScore: number;
    formattingScore: number;
    structureScore: number;
    ageBiasScore: number;
  };
};

const SYSTEM_PROMPT = `You are JASS, a senior executive coach inside an AI-powered job application support system. You rewrite resumes so candidates present clear, credible, modern evidence for the work they actually want.

Your voice is direct, caring, never sycophantic. Do not flatter. Do not patronize. Tell the user what undersells them and what you would fix. Example tone: "Your resume undersells you. Here's what I'd fix."

Adapt the rewrite to the candidate's selected work type. Professional/Office applicants need strategic impact and ATS alignment. Skilled Trade applicants need credentials, tools, safety, and project scope. Healthcare applicants need credentials, compliance, patient-care context, and specialty fit. Labour/Warehouse/Logistics applicants need equipment, throughput, reliability, shift fit, and safety. Retail/Hospitality/Food Service applicants need service judgment, speed, reliability, customer outcomes, and team fit.

CRITICAL FORMATTING RULES:
- NEVER use em dashes or en dashes. Use a comma, semicolon, period, or hyphen instead.
- Use standard ATS-friendly section headers exactly: "Professional Summary", "Professional Experience", "Education", "Skills", "Certifications".
- No tables, columns, graphics, or special characters that ATS parsers struggle with.
- Use a single clean column. Use simple bullet points starting with a strong action verb.
- Quantify achievements where the original resume gives any hint of numbers, scope, or scale. If no number exists, never invent one; rewrite as a concrete achievement instead.
- Remove "References available upon request", objective statements, and outdated phrasing.
- Remove graduation dates older than 15 years unless the user explicitly asks to keep them.
- Remove or modernize references to outdated technology (e.g., update "Lotus Notes" or "WordPerfect" to a modern equivalent only if clearly relevant).
- Transform duty-based bullets ("Responsible for managing...") into achievement-based bullets ("Led a team of 12 that increased revenue 23 percent").
- Optimize for ATS keywords drawn from the job description if provided.

Return STRICT JSON only.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    contact: {
      type: "object",
      properties: {
        email: { type: "string" },
        phone: { type: "string" },
        linkedin: { type: "string" },
        location: { type: "string" },
      },
      required: [],
      additionalProperties: false,
    },
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          body: { type: "array", items: { type: "string" } },
        },
        required: ["heading", "body"],
        additionalProperties: false,
      },
    },
    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["age_bias_removed", "ats_keyword_added", "achievement_rewrite", "formatting", "structure"],
          },
          original: { type: "string" },
          rewritten: { type: "string" },
          reason: { type: "string" },
        },
        required: ["type", "original", "rewritten", "reason"],
        additionalProperties: false,
      },
    },
    ageBiasFlags: { type: "array", items: { type: "string" } },
    tips: { type: "array", items: { type: "string" } },
    keywordsMatched: { type: "array", items: { type: "string" } },
    keywordsMissing: { type: "array", items: { type: "string" } },
  },
  required: ["sections", "changes", "ageBiasFlags", "tips", "keywordsMatched", "keywordsMissing"],
  additionalProperties: false,
} as const;

function stripEmDash(input: string): string {
  return input.replace(/\u2014|\u2013/g, ", ").replace(/ ,/g, ",").replace(/  +/g, " ");
}

function stripDeep<T>(value: T): T {
  if (typeof value === "string") return stripEmDash(value) as unknown as T;
  if (Array.isArray(value)) return value.map(stripDeep) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripDeep(v);
    }
    return out as T;
  }
  return value;
}

function buildUserPrompt(input: RewriteInput): string {
  const parts: string[] = [];
  parts.push("USER INTAKE:");
  parts.push(`Target role: ${input.roleType || "(unspecified)"}`);
  parts.push(`Selected work type: ${input.jobType || "(unspecified)"}`);
  parts.push(`Target industry: ${input.industry || "(unspecified)"}`);
  parts.push(`Years of experience to highlight: ${input.yearsToHighlight || "all"}`);
  if (input.concerns && input.concerns.length > 0) {
    parts.push(`Their stated concerns: ${input.concerns.join("; ")}`);
  }
  if (input.jobDescription && input.jobDescription.trim()) {
    parts.push("\nTARGET JOB DESCRIPTION (extract ATS keywords from here):\n" + input.jobDescription.trim());
  }
  parts.push("\nORIGINAL RESUME TEXT:\n" + input.originalText);
  parts.push(
    "\nRewrite this resume according to all rules. Produce JSON exactly matching the response_format schema. Each `sections.body` entry is a single bullet or paragraph (no leading bullet character). Keep work experience entries together within their section by prefixing each role with company, title, dates on its own bullet then the achievement bullets after.",
  );
  return parts.join("\n");
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.\-]{1,}/g) || []).filter(t => t.length > 2);
}

const STOP_WORDS = new Set([
  "the","and","for","with","that","this","from","your","you","are","but","not","have","has","had","will","was","were","been","being","into","over","under","then","than","also","such","each","when","where","what","which","while","who","whom","very","just","only","some","more","most","much","many","any","all","its","our","their","them","they","there","here","about","upon","onto","off","out","via","per","may","can","could","should","would","one","two","three","four","five","six","seven","eight","nine","ten","across","including","include","includes","work","working","worked","experience","experienced","year","years","skills","ability","strong","excellent","successfully","responsible","duties","tasks","effective"
]);

function topKeywords(text: string, limit = 50): string[] {
  const counts = new Map<string, number>();
  for (const tok of tokenize(text)) {
    if (STOP_WORDS.has(tok)) continue;
    counts.set(tok, (counts.get(tok) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w);
}

export function computeKeywordMatch(jd: string, resume: string): { score: number; matched: string[]; missing: string[] } {
  if (!jd || !jd.trim()) return { score: 75, matched: [], missing: [] };
  const jdKeys = topKeywords(jd, 40);
  const resumeSet = new Set(tokenize(resume));
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of jdKeys) {
    if (resumeSet.has(k)) matched.push(k);
    else missing.push(k);
  }
  const score = jdKeys.length === 0 ? 75 : Math.round((matched.length / jdKeys.length) * 100);
  return { score, matched, missing };
}

export function detectAgeBiasFlags(text: string): string[] {
  const flags: string[] = [];
  const currentYear = new Date().getFullYear();
  const yearMatches = text.match(/\b(19[5-9]\d|20[0-1]\d)\b/g) || [];
  if (yearMatches.some(y => currentYear - parseInt(y) > 15)) {
    flags.push("Graduation or employment dates older than 15 years detected");
  }
  if (/references available upon request/i.test(text)) {
    flags.push("\"References available upon request\" line detected");
  }
  if (/^objective[:\s]/im.test(text)) {
    flags.push("Objective statement detected (replace with a modern Professional Summary)");
  }
  if (/\b(lotus notes|wordperfect|netscape|fortran|cobol(?! mainframe))\b/i.test(text)) {
    flags.push("Outdated technology references detected");
  }
  if (/\bdigital native\b|\benergetic\b|\byoung\b/i.test(text)) {
    flags.push("Age-coded language detected");
  }
  return flags;
}

export function scoreFormatting(text: string): number {
  let score = 100;
  if (/\t/.test(text)) score -= 10;
  if (/[\u2014\u2013]/.test(text)) score -= 5;
  if (text.split("\n").some(l => l.length > 200)) score -= 5;
  if (/\|/.test(text)) score -= 5; // tables / pipes hurt ATS
  if (!/\n/.test(text)) score -= 20; // no line breaks at all
  return Math.max(40, Math.min(100, score));
}

export function scoreStructure(text: string): number {
  const headings = ["experience", "education", "skills"];
  const lower = text.toLowerCase();
  let hits = 0;
  for (const h of headings) if (lower.includes(h)) hits++;
  return Math.round((hits / headings.length) * 100);
}

export function computeAtsScore(parts: { keyword: number; formatting: number; structure: number; ageBias: number }): number {
  const { keyword, formatting, structure, ageBias } = parts;
  return Math.round(keyword * 0.4 + formatting * 0.2 + structure * 0.2 + ageBias * 0.2);
}

export async function runRewrite(input: RewriteInput): Promise<RewriteResult> {
  const userPrompt = buildUserPrompt(input);
  const llmResp = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "resume_rewrite",
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
  });

  const raw = llmResp.choices?.[0]?.message?.content ?? "{}";
  const text = typeof raw === "string" ? raw : JSON.stringify(raw);
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    // fallback: try to extract first JSON object
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : { sections: [], changes: [], ageBiasFlags: [], tips: [], keywordsMatched: [], keywordsMissing: [] };
  }
  parsed = stripDeep(parsed);

  const sections = (parsed.sections || []) as ResumeSection[];
  const rewrittenText = renderRewriteToText({
    name: parsed.name,
    contact: parsed.contact,
    summary: parsed.summary,
    sections,
  });

  // Recompute scores against the rewritten resume for honesty
  const km = computeKeywordMatch(input.jobDescription || "", rewrittenText);
  const formatting = scoreFormatting(rewrittenText);
  const structure = scoreStructure(rewrittenText);
  const ageFlagsAfter = detectAgeBiasFlags(rewrittenText);
  const ageBias = Math.max(0, 100 - ageFlagsAfter.length * 25);
  const ats = computeAtsScore({ keyword: km.score, formatting, structure, ageBias });

  return {
    rewrittenText,
    rewrittenJson: {
      name: parsed.name,
      contact: parsed.contact,
      summary: parsed.summary,
      sections,
    },
    changeAnnotations: (parsed.changes || []) as ChangeAnnotation[],
    ageBiasFlags: parsed.ageBiasFlags || [],
    tips: parsed.tips || [],
    scores: {
      atsScore: ats,
      keywordScore: km.score,
      formattingScore: formatting,
      structureScore: structure,
      ageBiasScore: ageBias,
    },
  };
}

export function renderRewriteToText(json: {
  name?: string;
  contact?: { email?: string; phone?: string; linkedin?: string; location?: string };
  summary?: string;
  sections: ResumeSection[];
}): string {
  const lines: string[] = [];
  if (json.name) lines.push(json.name);
  if (json.contact) {
    const c = json.contact;
    const contactBits = [c.email, c.phone, c.linkedin, c.location].filter(Boolean);
    if (contactBits.length) lines.push(contactBits.join(" | "));
  }
  if (json.summary) {
    lines.push("");
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(json.summary);
  }
  for (const sec of json.sections) {
    lines.push("");
    lines.push(sec.heading.toUpperCase());
    for (const item of sec.body) {
      lines.push(item.startsWith("- ") || item.startsWith("• ") ? item : `- ${item}`);
    }
  }
  return stripEmDash(lines.join("\n"));
}

/**
 * Free-tier teaser: rewrite only the first 2 bullets so the user sees
 * the quality of the rewrite without paying.
 */
export async function runTeaser(input: RewriteInput): Promise<{
  teaserBullets: { original: string; rewritten: string }[];
  ageBiasFlags: string[];
  scores: RewriteResult["scores"];
}> {
  const teaserPrompt = `You are JASS, a senior executive coach. Take the FIRST TWO bullet points or duty statements found in the user's resume and rewrite them as strong achievement-based bullets. Be direct, caring, and practical. Quantify only if numbers exist or are obvious. NEVER use em dashes. Return JSON: {"items":[{"original":"...","rewritten":"..."}]}.

ORIGINAL RESUME:
${input.originalText.slice(0, 4000)}`;

  const resp = await invokeLLM({
    messages: [
      { role: "system", content: "You output strict JSON only. No em dashes." },
      { role: "user", content: teaserPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "teaser",
        strict: true,
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  rewritten: { type: "string" },
                },
                required: ["original", "rewritten"],
                additionalProperties: false,
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = resp.choices?.[0]?.message?.content ?? "{}";
  const text = typeof raw === "string" ? raw : JSON.stringify(raw);
  let parsed: any = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : { items: [] };
  }
  parsed = stripDeep(parsed);

  // Compute scores from the original resume so the user sees their starting point
  const km = computeKeywordMatch(input.jobDescription || "", input.originalText);
  const formatting = scoreFormatting(input.originalText);
  const structure = scoreStructure(input.originalText);
  const ageFlags = detectAgeBiasFlags(input.originalText);
  const ageBias = Math.max(0, 100 - ageFlags.length * 25);
  const ats = computeAtsScore({ keyword: km.score, formatting, structure, ageBias });

  return {
    teaserBullets: (parsed.items || []).slice(0, 2),
    ageBiasFlags: ageFlags,
    scores: {
      atsScore: ats,
      keywordScore: km.score,
      formattingScore: formatting,
      structureScore: structure,
      ageBiasScore: ageBias,
    },
  };
}
