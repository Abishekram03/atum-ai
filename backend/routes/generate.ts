import { Env } from "../types";
import { validateApiKey } from "../lib/auth";
import { generateResponse } from "../ai/model";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { ExecutionContext } from "../index";

type SupportedModel = "llama-3-8b-instruct" | "gemma-4-26b-a4b-it";

const TRUSTED_UI_ORIGINS = new Set([
  "https://atum-ai.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

export async function handleGenerate(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const productHeader = request.headers.get("x-product-id") || undefined;
  const apiKey = request.headers
    .get("Authorization")
    ?.replace("Bearer ", "")
    .trim();
  const requestOrigin = request.headers.get("Origin") || "";
  const isTrustedUiRequest = TRUSTED_UI_ORIGINS.has(requestOrigin);
  const auth = apiKey ? await validateApiKey(apiKey, env, productHeader) : null;

  // External callers must provide a valid API key.
  // Atum's own UI is allowed without a key.
  if ((apiKey && !auth) || (!apiKey && !isTrustedUiRequest)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const client = env.CONVEX_URL ? new ConvexHttpClient(env.CONVEX_URL) : null;
    const body = (await request.json()) as {
      message?: string;
      model?: SupportedModel;
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
    const aiResponse = await generateResponse(
      env.AI,
      body.message,
      body.model || "llama-3-8b-instruct",
    );

    const end = Date.now();
    const durationMs = end - start;
    console.log(
      `[LOG] Workspace: ${auth?.workspaceId || "N/A"} | Session: ${body.sessionId || "N/A"} | Product: ${auth?.product || "N/A"} | Duration: ${durationMs}ms`,
    );

    // Async save to Convex DB
    if (client) {
      const usageLogPromise = client.mutation(anyApi.logs.add, {
        workspaceId: auth?.workspaceId,
        apiKeyId: auth?.apiKeyId,
        apiKeyName: auth?.keyName,
        product: auth?.product || (isTrustedUiRequest ? "atum-ui" : undefined),
        endpoint: "/generate",
        requestChars: body.message.length,
        responseChars: aiResponse.length,
        status: "success",
        type: "generation_metric",
        message: "Successful generation",
        durationMs,
      });

      const shouldPersistChatMessages =
        Boolean(body.sessionId) && body.persistToConvex !== false;

      const persistencePromise = shouldPersistChatMessages
        ? Promise.all([
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
          ])
        : Promise.resolve();

      ctx.waitUntil(
        Promise.all([usageLogPromise, persistencePromise]).catch((err) =>
          console.error("Convex insert failed:", err),
        ),
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
    if (env.CONVEX_URL) {
      const client = new ConvexHttpClient(env.CONVEX_URL);
      ctx.waitUntil(
        client
          .mutation(anyApi.logs.add, {
            workspaceId: auth?.workspaceId,
            apiKeyId: auth?.apiKeyId,
            apiKeyName: auth?.keyName,
            product:
              auth?.product || (isTrustedUiRequest ? "atum-ui" : undefined),
            endpoint: "/generate",
            status: "error",
            type: "error",
            message: error?.message || "Generation failure",
            errorStack: error?.stack,
          })
          .catch((err) => console.error("Convex error log failed:", err)),
      );
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
