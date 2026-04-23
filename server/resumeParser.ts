/**
 * Resume parser: extracts plain text from PDF or DOCX buffers.
 * Plain text is passed through.
 */
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export type ParsedResume = {
  text: string;
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
};

function clean(s: string): string {
  return s
    .replace(/\u2014|\u2013/g, "-") // em/en dash to hyphen (we then strip later in display)
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectContact(text: string): ParsedResume["contact"] {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/[A-Za-z0-9_\-/]+/i);
  // Try to grab the name from the first non-empty line (heuristic)
  const firstLine = text.split("\n").map(l => l.trim()).find(l => l.length > 0 && l.length < 80);
  const name = firstLine && /[A-Za-z]/.test(firstLine) && !firstLine.includes("@") ? firstLine : undefined;
  return {
    name,
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    linkedin: linkedinMatch?.[0],
  };
}

export async function parseResume(buffer: Buffer, filename: string, mimeType?: string): Promise<ParsedResume> {
  const lower = filename.toLowerCase();
  const isPdf = lower.endsWith(".pdf") || mimeType === "application/pdf";
  const isDocx =
    lower.endsWith(".docx") ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  let text = "";
  if (isPdf) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      text = result.text || "";
    } finally {
      await parser.destroy().catch(() => {});
    }
  } else if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || "";
  } else {
    // Plain text fallback
    text = buffer.toString("utf-8");
  }

  text = clean(text);
  return {
    text,
    contact: detectContact(text),
  };
}

export function parseResumeFromText(rawText: string): ParsedResume {
  const text = clean(rawText);
  return {
    text,
    contact: detectContact(text),
  };
}
