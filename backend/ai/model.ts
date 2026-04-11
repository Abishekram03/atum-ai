import { getSystemPrompt } from "./prompt";

type SupportedModel = "llama-3-8b-instruct" | "gemma-4-26b-a4b-it";

const MODEL_MAP: Record<SupportedModel, string> = {
  "llama-3-8b-instruct": "@cf/meta/llama-3-8b-instruct",
  "gemma-4-26b-a4b-it": "@cf/google/gemma-4-26b-a4b-it",
};

export async function generateResponse(
  aiBinding: any,
  userMessage: string,
  model: SupportedModel = "llama-3-8b-instruct",
): Promise<string> {
  const messages = [
    { role: "system", content: getSystemPrompt() },
    { role: "user", content: userMessage },
  ];

  const selectedModel = MODEL_MAP[model] || MODEL_MAP["llama-3-8b-instruct"];

  try {
    const response = await aiBinding.run(selectedModel, {
      messages,
    });
    return response.response;
  } catch (error) {
    // Fall back to Llama to keep chat available if the selected model is unavailable.
    const fallback = await aiBinding.run(MODEL_MAP["llama-3-8b-instruct"], {
      messages,
    });
    return fallback.response;
  }
}
