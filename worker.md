# Cloudflare Workers AI Integration Guide

To make the AI functionality in **Atum** completely operational on a live environment, follow these steps to deploy and bind Cloudflare Workers AI.

## 1. Prerequisites
- Create a Cloudflare account at [dash.cloudflare.com](https://dash.cloudflare.com/).
- Ensure the `wrangler` CLI is installed (which we already added to package.json).
- Log into wrangler strictly via your terminal:
  ```bash
  npx wrangler login
  ```

## 2. Setting Up the AI Binding
Cloudflare Workers allows you to access powerful machine learning models (like Llama-3) gracefully via an `[ai]` binding. Look into the `wrangler.toml` of this repository:

```toml
[ai]
binding = "AI"
```

This configuration exposes `env.AI` directly inside the worker environment.

## 3. Creating and Connecting the Worker
1. Make sure your local `.dev.vars` contains your `CONVEX_URL` value.
2. Run your worker locally to interact live during development:
   ```bash
   npm run dev:backend
   ```
3. Your local server (usually `http://127.0.0.1:8787`) is now officially proxying requests to Cloudflare's massive AI infrastructure under the hood using your authentication! We specifically use the `@cf/meta/llama-3-8b-instruct` model inside our `backend/ai/model.ts`.

## 4. Deploying to Production
To push the worker permanently to the Cloudflare Edge networks globally:

```bash
npm run deploy:backend
```

Once deployed successfully, copy the generated `.workers.dev` URL it gives you and update the `fetch` hook located in `src/components/Chat/ChatContainer.tsx` to point toward your new live backend URL!
