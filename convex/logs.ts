import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
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

    for (const log of logs) {
      if (log.type === "generation_metric") {
        inferences++;
        totalDuration += log.durationMs || 0;
      }
      if (log.type === "error") {
        errors++;
      }
    }

    return {
      inferences,
      avgLatencyMs: inferences > 0 ? Math.round(totalDuration / inferences) : 0,
      errors,
      totalLogs: logs.length,
    };
  },
});
