# Atum AI - Complete Architecture & Flow Guide

## Table of Contents

1. [Request Flow](#request-flow)
2. [Model Information](#model-information)
3. [Database & Storage](#database--storage)
4. [Endpoints](#endpoints)
5. [Architecture Overview](#architecture-overview)
6. [Integration Points](#integration-points)
7. [Extension Guidelines](#extension-guidelines)

---

## Request Flow

### Question 1-4: Current Request Flow, Full Flow, Model Used, LLM Implementation Location

**Current Request Flow (Simplified):**

```
Client Request
    ↓
Authentication (API Key Validation)
    ↓
Request Handler (/generate endpoint)
    ↓
Message Extraction
    ↓
LLM Call (Llama 3.8B)
    ↓
Response Processing
    ↓
Client Response + Convex Logging
```

### The Complete Flow with Processing Layers:

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React + Vite)                                         │
│ - Chat.tsx → ChatContainer.tsx → ChatInput.tsx                 │
│ - User types message, clicks send                              │
│ - Constructs POST /generate request                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ API LAYER - CORS & OPTIONS Handling                            │
│ Location: backend/index.ts (main Worker entry point)           │
│ - Handles OPTIONS requests for CORS preflight                  │
│ - Routes POST /generate → handleGenerate()                     │
│ - Sets CORS headers: Origin, Methods, Custom headers           │
│ - Allowed Origins: atum-ai.vercel.app, localhost:5173, etc.   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ AUTH MIDDLEWARE - backend/routes/generate.ts (handleGenerate) │
│ - Extract API Key from Authorization header or check if       │
│   request origin is in TRUSTED_UI_ORIGINS                     │
│ - Call validateApiKey(apiKey, env, x-product-id)            │
│ - Returns auth object with:                                   │
│   • workspaceId                                               │
│   • apiKeyId, keyName                                         │
│   • product (from header or default "atum-ui")               │
│ - If unauthorized (not valid key + not trusted origin),       │
│   return 401 Unauthorized                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ REQUEST PARSING                                                 │
│ Location: generate.ts (handleGenerate function)               │
│ - Parse JSON body: { message, sessionId, persistToConvex }    │
│ - Validate message field exists                               │
│ - If missing, return 400 Bad Request                          │
│ - Extract optional metadata (sessionId, workspaceId)          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ PROCESSING LAYER - Prompt Construction                         │
│ Location: backend/ai/model.ts (generateResponse function)     │
│ - Get system prompt from getSystemPrompt()                    │
│   "You are Atum, an internal AI assistant for our SaaS...    │
│    Accuracy is key. Don't hallucinate. Be concise..."         │
│ - Construct messages array:                                   │
│   [                                                           │
│     { role: "system", content: "[system prompt above]" },    │
│     { role: "user", content: "[user message]" }              │
│   ]                                                           │
│ - Pass to aiBinding.run()                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ LLM CALL - Cloudflare Workers AI                              │
│ Location: backend/ai/model.ts                                 │
│ Model: @cf/meta/llama-3-8b-instruct (Llama 3, 8B params)     │
│ Provider: Cloudflare Workers AI binding (env.AI)             │
│ Call: aiBinding.run("@cf/meta/llama-3-8b-instruct", {        │
│         messages: [system, user]                             │
│       })                                                      │
│ Response Format: { response: string }                         │
│ No streaming, single response block                          │
│ Execution Time: Usually 1-3 seconds per request             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE CONSTRUCTION                                           │
│ Location: generate.ts (after aiBinding.run)                   │
│ - Extract response string: const aiResponse = result.response │
│ - Measure duration: durationMs = end - start                  │
│ - No post-processing, return as-is                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ ASYNC LOGGING & PERSISTENCE                                    │
│ Location: generate.ts (Convex mutations via ctx.waitUntil)   │
│ - Call logs.add() mutation:                                   │
│   • workspaceId, apiKeyId, product, endpoint                 │
│   • requestChars, responseChars, durationMs                  │
│   • status: "success" or "error"                             │
│ - If sessionId provided, call messages.save() twice:         │
│   • Save user message                                        │
│   • Save assistant response                                  │
│ - Execute asynchronously via ctx.waitUntil(Promise.all([]))  │
│ - Errors logged to console, don't block response             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE SENT TO CLIENT                                         │
│ - HTTP 200 with JSON: { response: "[AI generated text]" }     │
│ - CORS header: Access-Control-Allow-Origin: *                 │
│ - Content-Type: application/json                              │
└──────────────────────────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND RESPONSE HANDLING                                      │
│ Location: ChatContainer.tsx (handleSendMessage)               │
│ - Receive response from /generate                             │
│ - Add to message list state                                   │
│ - Display assistant message in chat UI                        │
│ - Persist to Convex if sessionId exists                       │
└──────────────────────────────────────────────────────────────────┘
```

**Key Files in Flow:**

- **Client Entry:** `src/pages/Chat.tsx` → `src/components/Chat/ChatContainer.tsx`
- **API Routing:** `backend/index.ts` (Worker entry point)
- **Auth Middleware:** `backend/routes/generate.ts` (handleGenerate, validateApiKey)
- **Prompt Construction:** `backend/ai/prompt.ts` (getSystemPrompt)
- **LLM Integration:** `backend/ai/model.ts` (generateResponse, aiBinding.run)
- **Logging:** `backend/routes/generate.ts` (Convex mutations)

---

## Model Information

### Question 5-7: Which Model, Where LLM Called, System Prompt

**Current Model:**

- **Model Name:** `@cf/meta/llama-3-8b-instruct`
- **Provider:** Cloudflare Workers AI
- **Parameters:** 8 Billion
- **Type:** Instruction-tuned language model
- **Capabilities:** Text generation, conversation, reasoning
- **Not Streaming:** Single response block only
- **Inference Time:** 1-3 seconds typically, up to 10s under load
- **Cost:** Included in Cloudflare Workers billing (per request)

**Where LLM Call is Implemented:**

File: `backend/ai/model.ts`

```typescript
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
```

**Is it Cloudflare Workers AI or External?**

- **Answer:** Cloudflare Workers AI binding
- **How it Works:**
  - Cloudflare provides `env.AI` binding in Worker environment
  - No external HTTP call, runs on CF's global network
  - Automatic load balancing, no separate API endpoint needed
  - Response is direct from Worker binding

**System Prompt Layout:**

File: `backend/ai/prompt.ts`

```typescript
export function getSystemPrompt(): string {
  return `You are Atum, an internal AI assistant for our SaaS products.
Your primary directive is accuracy. If you do not know the answer, admit it. Do not hallucinate.
Be concise, professional, and focus on providing business value.`;
}
```

**What the System Prompt Does:**

1. Establishes identity: "You are Atum"
2. Sets scope: "Internal AI assistant for SaaS products"
3. Enforces accuracy: "Don't guess, admit unknowns"
4. Prevents false info: "Do not hallucinate"
5. Defines tone: "Concise, professional, business value"

---

## Database & Storage

### Question 11-15: Chat History, Context Management, Database, Convex Connection, Data Storage

**Does Atum Store Chat History?**

- **Answer:** YES, optionally
- All conversations are stored in Convex database if:
  - `sessionId` is provided in request
  - `persistToConvex` is not explicitly set to `false`
- Each message (user + assistant) gets separate database record

**How Conversation State is Managed:**

1. **Frontend State (ChatContainer.tsx):**
   - `localMessages: Message[]` holds in-memory messages
   - `isLoading: boolean` tracks API request status
   - Real-time sync with Convex via `useQuery(api.messages.listBySession)`

2. **Backend State:**
   - No session state kept in Worker (stateless)
   - Each request is independent
   - Context passed via `messages` array to model

3. **Session Management:**
   - Created on first message via `createSession()` mutation
   - Session ID passed in subsequent requests
   - Session name is first 30 chars of user message

**What Database Does Atum Use?**

- **Convex** - Real-time backend database
- **Not Separate:** Uses same Convex instance as support tool
- **Tables Used:**
  - `messages`
  - `sessions`
  - `logs` (analytics)
  - `workspaces`
  - `apiKeys`

**Is Convex Already Connected?**

- **Answer:** YES, fully connected
- ConvexHttpClient initialized in Worker:
  ```typescript
  const client = env.CONVEX_URL ? new ConvexHttpClient(env.CONVEX_URL) : null;
  ```
- Environment variable: `CONVEX_URL` (from wrangler.toml secrets)

**Where is Data Stored and Retrieved?**

**Storage:**

- Location: Convex cloud backend
- Mutations used: `logs.add()`, `messages.save()`, `sessions.create()`

**Retrieval:**

- Location: Frontend via `useQuery(api.messages.listBySession)`
- Queries used: `messages.listBySession(sessionId)`
- Real-time updates via Convex subscription

**Data Schema:**

```typescript
// Messages Table
{
  _id: Id<"messages">,
  workspaceId: Id<"workspaces">,
  sessionId: Id<"sessions">,  // optional
  role: "user" | "assistant" | "system",
  content: string,
  createdAt: number (timestamp),
  // Indexed by: sessionId, workspaceId
}

// Sessions Table
{
  _id: Id<"sessions">,
  workspaceId: Id<"workspaces">,
  name: string,  // first 30 chars of message
  createdAt: number (timestamp),
  // Indexed by: workspaceId
}

// Logs Table (Usage Analytics)
{
  _id: Id<"logs">,
  workspaceId: Id<"workspaces">,
  apiKeyId: Id<"apiKeys">,
  apiKeyName: string,
  product: string,  // "customer-support-tool", "atum-ui", etc
  endpoint: string,  // "/generate"
  requestChars: number,
  responseChars: number,
  status: "success" | "error",
  type: "info" | "error" | "generation_metric",
  message: string,
  durationMs: number,
  createdAt: number (timestamp),
  // Indexed by: workspaceId, apiKeyId, type
}
```

---

## Endpoints

### Question 16-20: Endpoints, /chat Implementation, Extension Capability, Streaming, Response Logic

**What Endpoints Exist?**

1. **GET / (Root)**
   - Returns: "Atum backend is running"
   - Purpose: Health check
   - No auth required

2. **POST /generate (Main Endpoint)**
   - Purpose: Generate AI response for user message
   - Request Body:
     ```json
     {
       "message": "string (required)",
       "sessionId": "Id<sessions> (optional)",
       "workspaceId": "Id<workspaces> (optional)",
       "persistToConvex": "boolean (optional, default: true)"
     }
     ```
   - Response:
     ```json
     {
       "response": "AI generated text"
     }
     ```
   - Auth: API Key in Authorization header OR trusted origin
   - Headers Required:
     - Authorization: Bearer YOUR_API_KEY
     - x-product-id: "customer-support-tool" (optional but recommended)
     - Content-Type: application/json

3. **OPTIONS \* (CORS Preflight)**
   - Auto-handled by Worker
   - Returns CORS headers for all requests

**How is /generate Implemented?**

Location: `backend/routes/generate.ts` → `handleGenerate()` function

```typescript
export async function handleGenerate(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  // 1. Extract auth info
  const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
  const productHeader = request.headers.get("x-product-id");

  // 2. Validate auth
  const auth = apiKey ? await validateApiKey(apiKey, env, productHeader) : null;

  // 3. Check if trusted origin (UI)
  const isTrustedUiRequest = TRUSTED_UI_ORIGINS.has(origin);

  // 4. Require valid key OR trusted origin
  if ((apiKey && !auth) || (!apiKey && !isTrustedUiRequest)) {
    return 401 Unauthorized response;
  }

  // 5. Parse body
  const { message, sessionId, persistToConvex } = await request.json();

  // 6. Call LLM
  const aiResponse = await generateResponse(env.AI, message);

  // 7. Async: Log + Persist
  ctx.waitUntil(
    client.mutation(logs.add, { /* usage data */ }),
    client.mutation(messages.save, { /* user message */ }),
    client.mutation(messages.save, { /* assistant message */ })
  );

  // 8. Return response
  return new Response(JSON.stringify({ response: aiResponse }), {
    status: 200,
    headers: CORS_HEADERS
  });
}
```

**Can I Extend /generate to Support projectId or Knowledge Base?**

**Answer:** YES, multiple approaches:

### Approach 1: Add to Request Body (No Code Change Needed)

```json
POST /generate
{
  "message": "How do I setup?",
  "projectId": "proj_123",
  "knowledgeBase": "faq"
}
```

These are already accepted (flexible body) but **not used** in current code.

### Approach 2: Add Retrieval Pipeline Before LLM Call

Modify `backend/routes/generate.ts`:

```typescript
// Before calling generateResponse:
const body = await request.json();

// NEW: Retrieve knowledge for context
let context = "";
if (body.projectId || body.knowledgeBase) {
  context = await retrieveKnowledge(
    body.projectId,
    body.knowledgeBase,
    body.message,
  );
}

// Pass enriched context to model
const aiResponse = await generateResponse(env.AI, body.message, context);
```

Modify `backend/ai/model.ts`:

```typescript
export async function generateResponse(
  aiBinding: any,
  userMessage: string,
  knowledgeBase?: string,
): Promise<string> {
  const messages = [
    { role: "system", content: getSystemPrompt() },
    // NEW: Add knowledge context
    ...(knowledgeBase
      ? [{ role: "assistant", content: `Context:\n${knowledgeBase}` }]
      : []),
    { role: "user", content: userMessage },
  ];

  const response = await aiBinding.run(PRIMARY_MODEL, { messages });
  return response.response;
}
```

### Approach 3: Add to System Prompt Dynamically

```typescript
export async function generateResponse(
  aiBinding: any,
  userMessage: string,
  projectId?: string,
): Promise<string> {
  const messages = [
    { role: "system", content: getSystemPromptForProject(projectId) },
    { role: "user", content: userMessage },
  ];

  // ... rest same
}

function getSystemPromptForProject(projectId?: string): string {
  const basePrompt = `You are Atum, an internal AI assistant for our SaaS products...`;

  if (projectId === "proj_support") {
    return (
      basePrompt +
      `\nYou are helping the customer support team. Focus on helpful, actionable advice.`
    );
  }

  return basePrompt;
}
```

**Does Atum Currently Support Streaming Responses?**

- **Answer:** NO
- Current implementation:
  - Waits for full LLM response
  - Returns complete response block
  - Single fetch().then() on frontend

**To Add Streaming:**

Would require:

1. Server-Sent Events (SSE) instead of JSON response
2. Cloudflare Workers ReadableStream wrapper
3. Frontend EventSource listener
4. Streaming chunk handling

This is **NOT currently implemented** but possible with Cloudflare.

**How Are Responses Sent to Client?**

Location: `backend/routes/generate.ts` → return Response()

```typescript
return new Response(JSON.stringify({ response: aiResponse }), {
  status: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  },
});
```

Response flow on frontend (ChatContainer.tsx):

1. Fetch response from `/generate`
2. Parse JSON: `const result = await response.json()`
3. Extract response: `const aiText = result.response`
4. Add to message list: `setLocalMessages([...prev, assistantMessage])`
5. Save to Convex: `await saveMessage({ sessionId, role: "assistant", content: aiText })`
6. Display in UI

---

## Architecture Overview

### Question 21: Step-by-Step Architecture Including API Layer, Processing, Model Call, Response Flow

**Complete Architecture Diagram:**

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            ATUM AI PLATFORM                                    │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─── FRONTEND TIER ──────────────────────────────────────────────────────┐  │
│  │ src/pages/Chat.tsx                                                     │  │
│  │   ├─ ChatContainer.tsx (state + API calls)                            │  │
│  │   ├─ ChatInput.tsx (form input)                                       │  │
│  │   └─ MessageList.tsx (display messages)                              │  │
│  │                                                                        │  │
│  │ Technologies:                                                          │  │
│  │   • React + TypeScript                                               │  │
│  │   • Vite (build tool)                                                │  │
│  │   • Convex React bindings (useQuery, useMutation)                    │  │
│  │   • Fetch API for /generate endpoint                                 │  │
│  │   • Tailwind CSS (styling)                                           │  │
│  │                                                                        │  │
│  │ State Management:                                                      │  │
│  │   • React useState for local messages                                 │  │
│  │   • Convex useQuery for DB sync                                      │  │
│  │   • SessionId for conversation grouping                              │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                              HTTPS/CORS                                     │
│                                  ↓                                          │
│  ┌─── BACKEND TIER (Cloudflare Workers) ──────────────────────────────┐  │
│  │                                                                     │  │
│  │ backend/index.ts (Entry Point - Worker)                           │  │
│  │   ├─ Routing: GET /, POST /generate, OPTIONS *                   │  │
│  │   ├─ CORS handling                                                │  │
│  │   └─ Delegates to route handlers                                  │  │
│  │                                                                     │  │
│  │      ↓                                                              │  │
│  │                                                                     │  │
│  │ AUTH MIDDLEWARE (backend/lib/auth.ts)                             │  │
│  │   ├─ validateApiKey() function                                    │  │
│  │   ├─ Checks API key hash against Convex table                    │  │
│  │   ├─ Returns auth object or null                                  │  │
│  │   └─ Supports product routing (x-product-id header)              │  │
│  │                                                                     │  │
│  │      ↓                                                              │  │
│  │                                                                     │  │
│  │ REQUEST HANDLER (backend/routes/generate.ts)                      │  │
│  │   ├─ handleGenerate() function                                    │  │
│  │   ├─ Parse request body: { message, sessionId, ... }             │  │
│  │   ├─ Validate required fields                                     │  │
│  │   └─ Prepare for model call                                       │  │
│  │                                                                     │  │
│  │      ↓                                                              │  │
│  │                                                                     │  │
│  │ PROCESSING LAYER (backend/ai/)                                    │  │
│  │   ├─ model.ts → generateResponse()                               │  │
│  │   ├─ prompt.ts → getSystemPrompt()                               │  │
│  │   ├─ Constructs messages array [system, user]                    │  │
│  │   └─ Ready for LLM inference                                      │  │
│  │                                                                     │  │
│  │      ↓                                                              │  │
│  │                                                                     │  │
│  │ LLM INFERENCE (Cloudflare Workers AI)                            │  │
│  │   ├─ Model: @cf/meta/llama-3-8b-instruct                        │  │
│  │   ├─ Call: env.AI.run(model, { messages })                       │  │
│  │   ├─ Provider: Cloudflare global network                         │  │
│  │   ├─ Latency: 1-3 seconds typical                                │  │
│  │   └─ Response: { response: string }                              │  │
│  │                                                                     │  │
│  │      ↓                                                              │  │
│  │                                                                     │  │
│  │ ASYNC PERSISTENCE (backend/routes/generate.ts)                    │  │
│  │   ├─ ctx.waitUntil(Promise.all([...]))                           │  │
│  │   ├─ logs.add() → Usage analytics                                │  │
│  │   ├─ messages.save() → User message                              │  │
│  │   ├─ messages.save() → Assistant message                         │  │
│  │   └─ Errors don't block response                                 │  │
│  │                                                                     │  │
│  │      ↓                                                              │  │
│  │                                                                     │  │
│  │ RESPONSE BUILDER                                                   │  │
│  │   ├─ Format: HTTP 200 + JSON                                     │  │
│  │   ├─ Body: { response: aiText }                                  │  │
│  │   ├─ Headers: CORS, Content-Type                                 │  │
│  │   └─ Send to frontend                                            │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                              HTTPS/REST                                   │
│                                  ↓                                        │
│  ┌─── DATA TIER (Convex) ──────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │ Tables (Real-time DB):                                         │  │
│  │   ├─ messages (user + assistant messages)                      │  │
│  │   ├─ sessions (chat sessions)                                  │  │
│  │   ├─ logs (usage analytics)                                    │  │
│  │   ├─ apiKeys (API key management)                              │  │
│  │   └─ workspaces (multi-tenant)                                 │  │
│  │                                                                  │  │
│  │ Queries:                                                         │  │
│  │   └─ messages.listBySession(sessionId)                         │  │
│  │                                                                  │  │
│  │ Mutations:                                                       │  │
│  │   ├─ messages.save(sessionId, role, content)                   │  │
│  │   ├─ sessions.create(name)                                     │  │
│  │   ├─ logs.add(usage data)                                      │  │
│  │   ├─ apiKeys.create(keyHash, product)                          │  │
│  │   └─ apiKeys.validate(keyHash)                                 │  │
│  │                                                                  │  │
│  │ Features:                                                        │  │
│  │   • Real-time sync via subscriptions                           │  │
│  │   • Automatic indexing                                         │  │
│  │   • ACID transactions                                          │  │
│  │   • JWT auth with allowlist                                    │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─── EXTERNAL SERVICES ─────────────────────────────────────────┐  │
│  │                                                                │  │
│  │ Cloudflare Workers AI:                                        │  │
│  │   └─ LLM inference endpoint                                   │  │
│  │                                                                │  │
│  │ Vercel (Hosting):                                             │  │
│  │   └─ Frontend deployment                                      │  │
│  │                                                                │  │
│  │ GitHub (SCM):                                                 │  │
│  │   └─ Source code management                                   │  │
│  │                                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└────────────────────────────────────────────────────────────────────────────┘
```

**Data Flow Sequence:**

```
User Input
   ↓
[Frontend] ChatContainer.handleSendMessage()
   ├─ Create session if needed
   ├─ Save user message to Convex
   ├─ Build fetch request:
   │  - URL: VITE_BACKEND_URL + /generate
   │  - Method: POST
   │  - Body: { message, sessionId, persistToConvex: true }
   │  - Headers: { Authorization, x-product-id, Content-Type }
   └─ isLoading = true
      ↓
[Network] HTTPS POST Request
   ↓
[Backend] Worker Receives Request
   ├─ index.ts routes to /generate
   └─ handleGenerate() executes
      ↓
[Auth] validateApiKey()
   ├─ Extract API key from header
   ├─ Check ConvexHttpClient against apiKeys table
   └─ Return auth object or reject with 401
      ↓
[Request Parsing] Extract & Validate
   ├─ Parse JSON body
   ├─ Check message exists
   └─ Prepare metadata (sessionId, productId)
      ↓
[Processing] Build Messages Array
   ├─ getSystemPrompt() → "You are Atum..."
   ├─ Construct [{ role: "system", ... }, { role: "user", ... }]
   └─ Measure start time
      ↓
[LLM] generateResponse()
   ├─ Call env.AI.run("@cf/meta/llama-3-8b-instruct", { messages })
   ├─ Wait for response from Cloudflare
   └─ Extract response.response string
      ↓
[Async] Start Background Tasks (don't block response)
   ├─ ctx.waitUntil(Promise.all([
   │   logs.add({ status, duration, chars, ... }),
   │   messages.save({ role: "user", content: message }),
   │   messages.save({ role: "assistant", content: response })
   │ ]))
   └─ Errors logged, response not affected
      ↓
[Response] Send to Client
   ├─ HTTP 200
   ├─ JSON: { response: "[AI text]" }
   └─ CORS headers
      ↓
[Frontend] Receive Response
   ├─ response.json()
   ├─ Extract aiResponse.response
   ├─ Create assistant message
   ├─ setLocalMessages([...prev, newMessage])
   └─ isLoading = false, UI updates
      ↓
[UI] Display in Chat
   └─ MessageList shows user + assistant messages
```

---

## Integration Points

### Where Can I Modify Input Before It Reaches the Model?

**5 Key Integration Points:**

**1. Frontend Request Building (BEST for simple changes)**

- File: `src/components/Chat/ChatContainer.tsx`
- Location: `handleSendMessage()` function
- What: Modify request body before fetch
- Example:
  ```typescript
  await fetch(`${backendUrl}/generate`, {
    body: JSON.stringify({
      message: text,
      sessionId: targetSessionId,
      // ADD HERE: custom fields
      projectId: "proj_123",
      searchHistory: true, // custom flag
    }),
  });
  ```

**2. Backend Request Parsing (GOOD for validation)**

- File: `backend/routes/generate.ts`
- Location: `handleGenerate()` function, after JSON parse
- What: Extract/validate additional fields from request
- Example:

  ```typescript
  const body = await request.json();
  const { message, projectId, searchHistory } = body;

  // Custom logic here
  if (projectId) {
    // lookup project context
  }
  ```

**3. Message Array Construction (EXCELLENT for RAG/context)**

- File: `backend/ai/model.ts`
- Location: `generateResponse()` function
- What: Add context messages before system prompt or after user message
- Example:
  ```typescript
  const messages = [
    { role: "system", content: getSystemPrompt() },
    { role: "user", content: "[retrieved_knowledge]" }, // INSERT HERE
    { role: "user", content: userMessage },
  ];
  ```

**4. System Prompt Customization (GOOD for behavior steering)**

- File: `backend/ai/prompt.ts`
- Location: `getSystemPrompt()` function
- What: Modify or build dynamic system prompts
- Example:
  ```typescript
  export function getSystemPrompt(projectId?: string): string {
    const basePrompt = "You are Atum...";

    if (projectId === "support") {
      return basePrompt + "\nYou are customer support AI.";
    }
    return basePrompt;
  }
  ```

**5. Post-LLM Processing (GOOD for output filtering/formatting)**

- File: `backend/routes/generate.ts`
- Location: After `generateResponse()` call, before response builder
- What: Transform, filter, or enhance LLM response
- Example:

  ```typescript
  const aiResponse = await generateResponse(env.AI, body.message);

  // ADD HERE: post-processing
  const sanitized = aiResponse.replace(/\[REDACTED\]/g, "***");
  const withFooter = sanitized + "\n\n---\nPowered by Atum";
  ```

---

## Extension Guidelines

### Best Place to Integrate a Retrieval Pipeline

**Recommended Architecture:**

```typescript
// Location: backend/routes/generate.ts

export async function handleGenerate(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  // ... existing auth & parsing code ...

  const body = await request.json();
  const { message, projectId, knowledgeBaseId } = body;

  // ← INSERT RETRIEVAL PIPELINE HERE
  let retrievedContext = "";
  if (knowledgeBaseId) {
    const retrievalClient = new ConvexHttpClient(env.CONVEX_URL);
    retrievedContext = await retrievalClient.query(api.retrieval.search, {
      knowledgeBaseId,
      query: message,
      topK: 5,
    });
  }

  // Pass context to model
  const aiResponse = await generateResponse(env.AI, message, retrievedContext);

  // ... rest of function ...
}
```

**Update model.ts to accept context:**

```typescript
export async function generateResponse(
  aiBinding: any,
  userMessage: string,
  retrievedContext?: string,
): Promise<string> {
  const messages = [
    { role: "system", content: getSystemPrompt() },
    // Insert context between system and user message
    ...(retrievedContext
      ? [
          {
            role: "assistant",
            content: `Context Information:\n${retrievedContext}`,
          },
        ]
      : []),
    { role: "user", content: userMessage },
  ];

  const response = await aiBinding.run(PRIMARY_MODEL, { messages });
  return response.response;
}
```

**Alternative: Chain with RAG in Support Tool**

Don't duplicate RAG in Atum. Instead:

1. **Support tool does RAG:**
   - Retrieve relevant chunks from knowledge base
   - Embed context with semantic search

2. **Support tool calls Atum:**

   ```typescript
   const context = await vectorSearch(userQuery);  // Your RAG
   const response = await callAtumAPI(userQuery, context: context);
   ```

3. **Atum generates:**
   - Receives enriched context
   - Generates response using Llama
   - Returns text

**This is the CLEANEST approach** because:

- Separation of concerns
- Your support tool already has RAG working
- Atum stays focused on inference only
- Single source of truth for knowledge base

---

## Quick Reference: File Locations

```
backend/
  ├─ index.ts                   # Worker entry, routing
  ├─ types.ts                   # TypeScript types
  ├─ routes/
  │  └─ generate.ts             # POST /generate handler
  ├─ ai/
  │  ├─ model.ts                # LLM inference wrapper
  │  └─ prompt.ts               # System & dynamic prompts
  └─ lib/
     └─ auth.ts                 # API key validation

src/
  ├─ pages/
  │  └─ Chat.tsx                # Chat page
  └─ components/Chat/
     ├─ ChatContainer.tsx       # Chat state & API calls
     ├─ ChatInput.tsx            # Input form
     ├─ MessageList.tsx          # Message display
     └─ MessageItem.tsx          # Single message

convex/
  ├─ schema.ts                  # Database schema
  ├─ messages.ts                # Message queries/mutations
  ├─ sessions.ts                # Session management
  ├─ logs.ts                    # Usage logging
  └─ apiKeys.ts                 # API key management
```

---

## Summary

| Question                  | Answer                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Current request flow?     | Client → Auth → Parse → LLM → Log → Respond                                             |
| Which model?              | Llama 3.8B Instruct via Cloudflare Workers AI                                           |
| LLM location?             | `backend/ai/model.ts` → `generateResponse()`                                            |
| Cloudflare or external?   | Cloudflare (env.AI binding, no HTTP call)                                               |
| Prompt construction?      | `getSystemPrompt()` + system message + user message                                     |
| System prompt template?   | "You are Atum, internal AI... Focus on accuracy, no hallucination"                      |
| Middleware/processing?    | Auth validation → Request parsing → Message building                                    |
| Modify input location?    | 5 integration points: Frontend, parsing, messages array, system prompt, post-processing |
| Store chat history?       | YES, in Convex if sessionId provided                                                    |
| Context management?       | LocalMessages state + real-time Convex sync                                             |
| Database?                 | Convex                                                                                  |
| Convex connected?         | YES, ConvexHttpClient initialized                                                       |
| Data storage/retrieval?   | messages/sessions/logs tables in Convex                                                 |
| Existing endpoints?       | GET /, POST /generate, OPTIONS \*                                                       |
| /generate implementation? | handleGenerate() in backend/routes/generate.ts                                          |
| Extend with projectId?    | YES, add to request body and pass to model                                              |
| Streaming support?        | NO (currently single response block)                                                    |
| Response sending?         | HTTP 200 JSON + CORS headers                                                            |
| Integration points?       | 5 places to insert logic before/after LLM                                               |
| Best RAG integration?     | Retrieve in support tool, pass context to Atum                                          |
| Architecture summary?     | Frontend React → Worker with auth/routing → LLM inference → Convex DB                   |

---

_Last Updated: April 15, 2026_
_Atum Version: Llama 3.8B Instruct (Stable)_
