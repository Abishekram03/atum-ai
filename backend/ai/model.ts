import { getSystemPrompt } from './prompt';

export async function generateResponse(aiBinding: any, userMessage: string): Promise<string> {
  const messages = [
    { role: 'system', content: getSystemPrompt() },
    { role: 'user', content: userMessage }
  ];

  const response = await aiBinding.run('@cf/meta/llama-3-8b-instruct', {
    messages
  });

  return response.response;
}
