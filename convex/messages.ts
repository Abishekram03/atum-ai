import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    // Expected to be a string that represents the workspaceId, or an actual Id
    workspaceId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      workspaceId: args.workspaceId as any,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
