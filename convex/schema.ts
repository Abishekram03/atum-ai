import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(), // e.g. "Sales", "Support Team"
    description: v.optional(v.string()),
    createdAt: v.number(),
  }),

  apiKeys: defineTable({
    workspaceId: v.id("workspaces"),
    keyHash: v.string(), // securely hashed API key
    name: v.string(), // descriptive name for the key
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_workspaceId", ["workspaceId"])
    .index("by_keyHash", ["keyHash"]),

  messages: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()), // tracking who sent it if needed
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_workspaceId", ["workspaceId"]),

  logs: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    type: v.union(v.literal("info"), v.literal("error"), v.literal("generation_metric")),
    message: v.string(),
    durationMs: v.optional(v.number()), // For generation metrics
    errorStack: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_workspaceId", ["workspaceId"])
    .index("by_type", ["type"]),
});
