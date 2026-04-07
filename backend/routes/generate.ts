import { Env } from '../types';
import { validateApiKey } from '../lib/auth';
import { generateResponse } from '../ai/model';

export async function handleGenerate(request: Request, env: Env): Promise<Response> {
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!apiKey || !(await validateApiKey(apiKey))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json() as { message?: string, workspaceId?: string };
    
    if (!body.message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    const start = Date.now();
    
    // Step 3.3 AI Integration
    const aiResponse = await generateResponse(env.AI, body.message);
    
    const end = Date.now();

    // Step 3.5 Logging system
    console.log(`[LOG] Workspace: ${body.workspaceId || 'N/A'} | Duration: ${end - start}ms`);

    return new Response(JSON.stringify({ response: aiResponse }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[ERROR]', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
