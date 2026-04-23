import { describe, it, expect } from "vitest";
import {
  computeAtsScore,
  computeKeywordMatch,
  detectAgeBiasFlags,
  renderRewriteToText,
  scoreFormatting,
  scoreStructure,
} from "./rewriteEngine";

describe("rewriteEngine pure helpers", () => {
  it("computeKeywordMatch returns 100 when all JD keywords present", () => {
    const jd = "Looking for a Senior Project Manager with Agile, Scrum, Stakeholder, and Budget skills.";
    const resume = "Senior Project Manager experienced in Agile, Scrum, Stakeholder management, and Budget oversight.";
    const r = computeKeywordMatch(jd, resume);
    expect(r.score).toBeGreaterThan(70);
    expect(r.matched.length).toBeGreaterThan(0);
  });

  it("computeKeywordMatch falls back to 75 when JD is empty", () => {
    const r = computeKeywordMatch("", "Anything goes here.");
    expect(r.score).toBe(75);
    expect(r.matched).toEqual([]);
    expect(r.missing).toEqual([]);
  });

  it("detectAgeBiasFlags catches old years, objective, references line, and age-coded language", () => {
    const text = `Objective: Looking for a role.
Education: BS in Math, 1985.
Energetic professional.
References available upon request.`;
    const flags = detectAgeBiasFlags(text);
    expect(flags.some(f => /older than 15/.test(f))).toBe(true);
    expect(flags.some(f => /Objective statement/.test(f))).toBe(true);
    expect(flags.some(f => /References available/.test(f))).toBe(true);
    expect(flags.some(f => /Age-coded/.test(f))).toBe(true);
  });

  it("scoreFormatting penalizes em dashes and tabs", () => {
    const clean = "Line one\nLine two\nLine three";
    const messy = "Line\tone\nLine \u2014 two\nLine three";
    expect(scoreFormatting(clean)).toBeGreaterThan(scoreFormatting(messy));
  });

  it("scoreStructure rewards presence of standard sections", () => {
    const full = "Experience\n...\nEducation\n...\nSkills\n...";
    const partial = "Experience\n...";
    expect(scoreStructure(full)).toBe(100);
    expect(scoreStructure(partial)).toBeLessThan(100);
  });

  it("computeAtsScore weights the four sub-scores", () => {
    const s = computeAtsScore({ keyword: 100, formatting: 100, structure: 100, ageBias: 100 });
    expect(s).toBe(100);
    const low = computeAtsScore({ keyword: 0, formatting: 0, structure: 0, ageBias: 0 });
    expect(low).toBe(0);
  });

  it("renderRewriteToText strips em dashes from output", () => {
    const out = renderRewriteToText({
      name: "Test User \u2014 Hero",
      summary: "Strong leader \u2014 results focused.",
      sections: [{ heading: "Experience", body: ["Led team \u2014 grew revenue"] }],
    });
    expect(out.includes("\u2014")).toBe(false);
    expect(out.includes("\u2013")).toBe(false);
  });
});
