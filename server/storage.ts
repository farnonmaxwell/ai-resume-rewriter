import path from "node:path";
import { ENV } from "./_core/env";
import { supabaseAdmin } from "./supabase";

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "resume.txt";
}

function normalizeKey(key: string): string {
  return key.replace(/^\/+/, "").replace(/\.\.(\/|\\)/g, "");
}

function contentTypeForFile(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".txt") return "text/plain";
  return "application/octet-stream";
}

export async function storagePut(
  folder: string,
  fileName: string,
  bytes: Uint8Array | Buffer | string,
  options?: { userId?: string; contentType?: string },
): Promise<{ key: string; url: string }> {
  const safeFolder = normalizeKey(folder).replace(/\/$/, "");
  const safeName = sanitizeFileName(fileName);
  const key = normalizeKey(`${options?.userId ? `${options.userId}/` : ""}${safeFolder}/${Date.now()}-${safeName}`);
  const body = typeof bytes === "string" ? Buffer.from(bytes) : bytes;

  const { error } = await supabaseAdmin.storage
    .from(ENV.supabaseStorageBucket)
    .upload(key, body, {
      contentType: options?.contentType || contentTypeForFile(fileName),
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  const { data, error: signedError } = await supabaseAdmin.storage
    .from(ENV.supabaseStorageBucket)
    .createSignedUrl(key, 60 * 60);

  if (signedError) {
    throw new Error(`Supabase storage signed URL failed: ${signedError.message}`);
  }

  return { key, url: data.signedUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const { data, error } = await supabaseAdmin.storage
    .from(ENV.supabaseStorageBucket)
    .createSignedUrl(key, 60 * 60);

  if (error) {
    throw new Error(`Supabase storage signed URL failed: ${error.message}`);
  }

  return { key, url: data.signedUrl };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  return (await storageGet(relKey)).url;
}
