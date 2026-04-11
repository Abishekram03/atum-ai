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
    keyPrefix: v.optional(v.string()),
    name: v.string(), // descriptive name for the key
    product: v.optional(v.string()),
    isActive: v.boolean(),
    usageCount: v.optional(v.number()),
    lastUsedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_keyHash", ["keyHash"]),

  messages: defineTable({
    workspaceId: v.id("workspaces"),
    sessionId: v.optional(v.id("sessions")),
    userId: v.optional(v.string()), // tracking who sent it if needed
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_sessionId", ["sessionId"]),

  logs: defineTable({
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
    durationMs: v.optional(v.number()), // For generation metrics
    errorStack: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_apiKeyId", ["apiKeyId"])
    .index("by_type", ["type"]),

  sessions: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_workspaceId", ["workspaceId"]),
});
