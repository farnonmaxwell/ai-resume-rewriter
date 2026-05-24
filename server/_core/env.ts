import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const ENV = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseAnonKey: requireEnv("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || "resume-uploads",
  openaiApiKey: requireEnv("OPENAI_API_KEY"),
  openaiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  ownerEmail: optionalEnv("OWNER_EMAIL"),
  mailchimpApiKey: optionalEnv("MAILCHIMP_API_KEY"),
  mailchimpAudienceId: optionalEnv("MAILCHIMP_AUDIENCE_ID"),
  mailchimpServerPrefix: optionalEnv("MAILCHIMP_SERVER_PREFIX"),
};
