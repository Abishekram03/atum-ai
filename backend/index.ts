import { handleGenerate } from './routes/generate';
import { Env } from './types';

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('Atum backend is running', {
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (request.method === 'POST' && url.pathname === '/generate') {
      return handleGenerate(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};
