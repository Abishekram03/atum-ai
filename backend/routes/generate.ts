import { Env } from "../types";
import { validateApiKey } from "../lib/auth";
import { generateResponse } from "../ai/model";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { ExecutionContext } from "../index";

export async function handleGenerate(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!apiKey || !(await validateApiKey(apiKey))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const body = (await request.json()) as {
      message?: string;
      workspaceId?: string;
      sessionId?: string;
      persistToConvex?: boolean;
    };

    if (!body.message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const start = Date.now();

    // Step 3.3 AI Integration
    const aiResponse = await generateResponse(env.AI, body.message);

    const end = Date.now();
    const durationMs = end - start;
    console.log(
      `[LOG] Workspace: ${body.workspaceId || "N/A"} | Session: ${body.sessionId || "N/A"} | Duration: ${durationMs}ms`,
    );

    // Async save to Convex DB
    if (env.CONVEX_URL && body.sessionId && body.persistToConvex !== false) {
      const client = new ConvexHttpClient(env.CONVEX_URL);
      ctx.waitUntil(
        Promise.all([
          client.mutation(anyApi.messages.save, {
            sessionId: body.sessionId,
            role: "user",
            content: body.message,
          }),
          client.mutation(anyApi.messages.save, {
            sessionId: body.sessionId,
            role: "assistant",
            content: aiResponse,
          }),
          client.mutation(anyApi.logs.add, {
            type: "generation_metric",
            message: "Successful generation",
            durationMs,
          }),
        ]).catch((err) => console.error("Convex insert failed:", err)),
      );
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[ERROR]", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
