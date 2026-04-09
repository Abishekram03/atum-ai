import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    sessionId: v.optional(v.id("sessions")),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    let workspaceId = args.workspaceId;

    // Prefer deriving workspace ownership from session to avoid invalid client-sent IDs.
    if (!workspaceId && args.sessionId) {
      const session = await ctx.db.get(args.sessionId);
      workspaceId = session?.workspaceId;
    }

    if (!workspaceId) {
      const existingWorkspace = await ctx.db.query("workspaces").first();
      workspaceId =
        existingWorkspace?._id ??
        (await ctx.db.insert("workspaces", {
          name: "Default Workspace",
          createdAt: Date.now(),
        }));
    }

    return await ctx.db.insert("messages", {
      workspaceId,
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const listBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});
