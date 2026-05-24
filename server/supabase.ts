import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

const serverKey = ENV.supabaseServiceRoleKey || ENV.supabaseAnonKey;

export const supabaseAdmin = createClient(ENV.supabaseUrl, serverKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const hasServiceRoleKey = Boolean(ENV.supabaseServiceRoleKey);
