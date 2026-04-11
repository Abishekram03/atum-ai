import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateApiKey(): string {
  const random = crypto.getRandomValues(new Uint8Array(24));
  const token = Array.from(random)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `ak_live_${token}`;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const keys = await ctx.db.query("apiKeys").order("desc").collect();
    return keys.map((key) => ({
      _id: key._id,
      name: key.name,
      isActive: key.isActive,
      product: key.product,
      keyPrefix: key.keyPrefix || "legacy",
      usageCount: key.usageCount || 0,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    product: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const key = generateApiKey();
    const keyHash = await sha256Hex(key);

    // Get or create default workspace to satisfy Id<"workspaces"> constraints
    let workspace = await ctx.db.query("workspaces").first();
    let workspaceId = workspace?._id;
    if (!workspaceId) {
      workspaceId = await ctx.db.insert("workspaces", {
        name: "Default Workspace",
        createdAt: Date.now(),
      });
    }

    const keyId = await ctx.db.insert("apiKeys", {
      workspaceId: workspaceId,
      name: args.name,
      product: args.product,
      isActive: true,
      keyHash,
      keyPrefix: key.slice(0, 14),
      usageCount: 0,
      createdAt: Date.now(),
    });

    return {
      key,
      keyId,
      keyPrefix: key.slice(0, 14),
    };
  },
});

export const authenticate = mutation({
  args: {
    apiKey: v.string(),
    product: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const keyHash = await sha256Hex(args.apiKey);

    let apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash))
      .unique();

    // Backward compatibility for legacy plain-text keys created before hashing.
    if (!apiKey) {
      apiKey = await ctx.db
        .query("apiKeys")
        .withIndex("by_keyHash", (q) => q.eq("keyHash", args.apiKey))
        .unique();
    }

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    await ctx.db.patch(apiKey._id, {
      lastUsedAt: Date.now(),
      usageCount: (apiKey.usageCount || 0) + 1,
    });

    return {
      apiKeyId: apiKey._id,
      workspaceId: apiKey.workspaceId,
      keyName: apiKey.name,
      product: args.product || apiKey.product,
    };
  },
});

export const revoke = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

export const remove = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
