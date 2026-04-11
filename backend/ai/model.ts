import { getSystemPrompt } from "./prompt";
const PRIMARY_MODEL = "@cf/meta/llama-3-8b-instruct";

export async function generateResponse(
  aiBinding: any,
  userMessage: string,
): Promise<string> {
  const messages = [
    { role: "system", content: getSystemPrompt() },
    { role: "user", content: userMessage },
  ];

  const response = await aiBinding.run(PRIMARY_MODEL, {
    messages,
  });
  return response.response;
}
