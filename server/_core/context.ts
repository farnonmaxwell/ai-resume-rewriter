import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import * as db from "../db";
import { supabaseAdmin } from "../supabase";

function readBearerToken(req: CreateExpressContextOptions["req"]): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function createContext({ req, res }: CreateExpressContextOptions) {
  let user: db.AppUser | null = null;
  const token = readBearerToken(req);

  if (token) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data.user) {
      user = await db.upsertUserFromAuth(data.user);
    }
  }

  return {
    req,
    res,
    user,
  };
}

export type TrpcContext = inferAsyncReturnType<typeof createContext>;
export type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
