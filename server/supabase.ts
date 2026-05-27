import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { ENV } from "./_core/env";

const serverKey = ENV.supabaseServiceRoleKey || ENV.supabaseAnonKey;

export const supabaseAdmin = createClient(ENV.supabaseUrl, serverKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws as never,
  },
});

export const hasServiceRoleKey = Boolean(ENV.supabaseServiceRoleKey);
