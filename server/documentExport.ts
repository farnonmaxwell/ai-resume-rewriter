/**
 * Generate clean ATS-friendly PDF and DOCX from rewritten resume JSON.
 */
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import PDFDocument from "pdfkit";
import type { ResumeSection } from "./rewriteEngine";

export type ResumeJson = {
  name?: string;
  contact?: { email?: string; phone?: string; linkedin?: string; location?: string };
  summary?: string;
  sections: ResumeSection[];
};

function strip(s: string): string {
  return String(s || "")
    .replace(/\u2014|\u2013/g, ", ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function contactLine(c?: ResumeJson["contact"]): string {
  if (!c) return "";
  return [c.email, c.phone, c.linkedin, c.location].map(value => strip(value || "")).filter(Boolean).join(" | ");
}

function isMeaningful(value: string): boolean {
  const text = strip(value).replace(/^[-•]\s*/, "");
  if (!text) return false;

  const lower = text.toLowerCase();
  const emptyPatterns = [
    /^none( listed| provided| specified)?\.?$/,
    /^not (listed|provided|specified)\.?$/,
    /^n\/a\.?$/,
    /^not applicable\.?$/,
    /^details? not (listed|provided|specified)\.?$/,
    /^no (certifications?|education|skills|awards|licenses?|projects?) (listed|provided|specified)\.?$/,
    /^bachelor'?s degree \(details not specified\)\.?$/,
    /^degree \(details not specified\)\.?$/,
  ];
  return !emptyPatterns.some(pattern => pattern.test(lower));
}

function normalizedSections(json: ResumeJson): ResumeSection[] {
  return (json.sections || [])
    .map(section => ({
      heading: strip(section.heading || ""),
      body: (section.body || [])
        .map(item => strip(item).replace(/^[-•]\s*/, ""))
        .filter(isMeaningful),
    }))
    .filter(section => Boolean(section.heading) && section.body.length > 0);
}

function shouldBullet(heading: string, item: string): boolean {
  const lowerHeading = heading.toLowerCase();
  if (lowerHeading.includes("summary") || lowerHeading.includes("profile")) return false;
  if (/^[A-Za-z0-9 .,'&()/-]+\s+\|\s+.+/.test(item)) return false;
  if (/^[A-Za-z0-9 .,'&()/-]+\s+-\s+.+\b(19|20)\d{2}\b/.test(item)) return false;
  return true;
}

function paragraphText(doc: PDFKit.PDFDocument, text: string, options: PDFKit.Mixins.TextOptions = {}) {
  doc.text(strip(text), {
    width: 504,
    lineGap: 2.2,
    paragraphGap: 3,
    ...options,
  });
}

export async function generatePdf(json: ResumeJson): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 52, left: 54, right: 54 },
        info: {
          Title: json.name ? `${strip(json.name)} Resume` : "Resume",
          Author: strip(json.name || ""),
          Creator: "JASS Job Application Support System",
        },
      });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const left = doc.page.margins.left;
      const rightEdge = doc.page.width - doc.page.margins.right;
      const fullWidth = rightEdge - left;

      if (json.name && isMeaningful(json.name)) {
        doc.font("Times-Bold").fontSize(21).fillColor("#111827").text(strip(json.name), {
          align: "center",
          width: fullWidth,
          lineGap: 1,
        });
      }

      const cl = contactLine(json.contact);
      if (cl) {
        doc.moveDown(0.25);
        doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(strip(cl), {
          align: "center",
          width: fullWidth,
          lineGap: 1,
        });
      }

      doc.moveDown(0.55);

      const writeHeading = (heading: string) => {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 80) doc.addPage();
        doc.moveDown(0.35);
        doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#111827").text(strip(heading.toUpperCase()), {
          width: fullWidth,
          characterSpacing: 0.6,
        });
        doc.moveTo(left, doc.y + 2).lineTo(rightEdge, doc.y + 2).strokeColor("#9ca3af").lineWidth(0.6).stroke();
        doc.moveDown(0.35);
      };

      const writeItem = (heading: string, item: string) => {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 48) doc.addPage();
        const bullet = shouldBullet(heading, item);
        doc.font("Helvetica").fontSize(10.4).fillColor("#111827");
        if (bullet) {
          doc.text("•", left, doc.y, { width: 10, continued: false });
          doc.x = left + 14;
          paragraphText(doc, item, { width: fullWidth - 14 });
          doc.x = left;
        } else {
          paragraphText(doc, item, { width: fullWidth });
        }
      };

      if (json.summary && isMeaningful(json.summary)) {
        writeHeading("Professional Summary");
        doc.font("Helvetica").fontSize(10.6).fillColor("#111827");
        paragraphText(doc, json.summary, { width: fullWidth });
      }

      for (const section of normalizedSections(json)) {
        writeHeading(section.heading);
        for (const item of section.body) writeItem(section.heading, item);
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function generateDocx(json: ResumeJson): Promise<Buffer> {
  const para = (text: string, opts: { bold?: boolean; size?: number; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; bullet?: boolean; spaceAfter?: number } = {}) =>
    new Paragraph({
      alignment: opts.align,
      spacing: { after: opts.spaceAfter ?? 90, line: 276 },
      bullet: opts.bullet ? { level: 0 } : undefined,
      children: [
        new TextRun({
          text: strip(text),
          bold: opts.bold,
          size: opts.size ?? 21,
          color: opts.color ?? "111827",
          font: "Aptos",
        }),
      ],
    });

  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 180, after: 80 },
      border: { bottom: { color: "9CA3AF", size: 4, space: 2, style: "single" } },
      children: [
        new TextRun({
          text: strip(text.toUpperCase()),
          bold: true,
          color: "111827",
          size: 22,
          font: "Aptos",
        }),
      ],
    });

  const children: Paragraph[] = [];
  if (json.name && isMeaningful(json.name)) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
        children: [new TextRun({ text: strip(json.name), bold: true, size: 34, color: "111827", font: "Aptos Display" })],
      }),
    );
  }

  const cl = contactLine(json.contact);
  if (cl) children.push(para(cl, { color: "374151", size: 19, spaceAfter: 170, align: AlignmentType.CENTER }));

  if (json.summary && isMeaningful(json.summary)) {
    children.push(heading("Professional Summary"));
    children.push(para(json.summary));
  }

  for (const section of normalizedSections(json)) {
    children.push(heading(section.heading));
    for (const item of section.body) {
      children.push(para(item, { bullet: shouldBullet(section.heading, item) }));
    }
  }

  const doc = new Document({
    creator: "JASS Job Application Support System",
    title: json.name ? `${strip(json.name)} Resume` : "Resume",
    description: "Generated by JASS Job Application Support System",
    sections: [{ properties: {}, children }],
  });

  return await Packer.toBuffer(doc);
}
