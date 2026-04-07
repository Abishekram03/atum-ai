import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("apiKeys").order("desc").collect();
  }
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const key = 'ak_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Get or create default workspace to satisfy Id<"workspaces"> constraints
    let workspace = await ctx.db.query("workspaces").first();
    let workspaceId = workspace?._id;
    if (!workspaceId) {
      workspaceId = await ctx.db.insert("workspaces", {
        name: "Default Workspace",
        createdAt: Date.now()
      });
    }

    await ctx.db.insert("apiKeys", {
      workspaceId: workspaceId,
      name: args.name,
      isActive: true,
      keyHash: key,
      createdAt: Date.now()
    });
    return key;
  }
});
