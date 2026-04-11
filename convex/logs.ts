import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    apiKeyId: v.optional(v.id("apiKeys")),
    apiKeyName: v.optional(v.string()),
    product: v.optional(v.string()),
    endpoint: v.optional(v.string()),
    requestChars: v.optional(v.number()),
    responseChars: v.optional(v.number()),
    status: v.optional(v.union(v.literal("success"), v.literal("error"))),
    type: v.union(
      v.literal("info"),
      v.literal("error"),
      v.literal("generation_metric"),
    ),
    message: v.string(),
    durationMs: v.optional(v.number()),
    errorStack: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("logs", {
      workspaceId: args.workspaceId,
      apiKeyId: args.apiKeyId,
      apiKeyName: args.apiKeyName,
      product: args.product,
      endpoint: args.endpoint,
      requestChars: args.requestChars,
      responseChars: args.responseChars,
      status: args.status,
      type: args.type,
      message: args.message,
      durationMs: args.durationMs,
      errorStack: args.errorStack,
      createdAt: Date.now(),
    });
  },
});

export const getUsageMetrics = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("logs").collect();
    if (logs.length === 0) return null;

    let inferences = 0;
    let totalDuration = 0;
    let errors = 0;
    let successes = 0;
    const productUsage: Record<string, number> = {};
    const keyUsage: Record<string, number> = {};

    for (const log of logs) {
      if (log.type === "generation_metric") {
        inferences++;
        totalDuration += log.durationMs || 0;
      }
      if (log.status === "success") {
        successes++;
      }
      if (log.type === "error") {
        errors++;
      }
      if (log.product) {
        productUsage[log.product] = (productUsage[log.product] || 0) + 1;
      }
      if (log.apiKeyName) {
        keyUsage[log.apiKeyName] = (keyUsage[log.apiKeyName] || 0) + 1;
      }
    }

    return {
      inferences,
      avgLatencyMs: inferences > 0 ? Math.round(totalDuration / inferences) : 0,
      errors,
      successes,
      totalLogs: logs.length,
      productUsage,
      keyUsage,
    };
  },
});
