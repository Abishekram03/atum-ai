import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { Env } from "../types";

export type AuthenticatedApiKey = {
  apiKeyId: string;
  workspaceId: string;
  keyName: string;
  product?: string;
};

export async function validateApiKey(
  apiKey: string,
  env: Env,
  product?: string,
): Promise<AuthenticatedApiKey | null> {
  if (!apiKey || apiKey.trim().length < 10 || !env.CONVEX_URL) {
    return null;
  }

  const client = new ConvexHttpClient(env.CONVEX_URL);
  const authResult = await client.mutation(anyApi.apiKeys.authenticate, {
    apiKey,
    product,
  });

  return authResult;
}
