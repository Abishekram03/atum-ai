import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    let workspace = await ctx.db.query("workspaces").first();
    if (!workspace) return [];
    return await ctx.db.query("sessions")
      .withIndex("by_workspaceId", q => q.eq("workspaceId", workspace._id))
      .order("desc")
      .collect();
  }
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    let workspace = await ctx.db.query("workspaces").first();
    let workspaceId = workspace?._id;
    if (!workspaceId) {
      workspaceId = await ctx.db.insert("workspaces", {
        name: "Default Workspace",
        createdAt: Date.now()
      });
    }

    return await ctx.db.insert("sessions", {
      workspaceId: workspaceId,
      name: args.name,
      createdAt: Date.now()
    });
  }
});

export const remove = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("messages")
      .withIndex("by_sessionId", q => q.eq("sessionId", args.id))
      .collect();
    
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    
    await ctx.db.delete(args.id);
  }
});
