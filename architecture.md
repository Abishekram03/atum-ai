# Atum Architecture

## Full System Architecture

Atum follows a decoupled, serverless architecture focusing on speed and maintainability.

- **Frontend Application (Client)**: A React-based Single Page Application (SPA), styled with Tailwind CSS, and bundled by Vite. It connects directly to the backend API and occasionally queries Convex for real-time log updates via the Convex React Client.
- **Edge Backend (API Layer)**: Cloudflare Workers handle all inbound traffic routing. It is stateless, extremely fast, and automatically geolocated.
- **Database (Convex)**: Serves as the primary persistence layer for structured data, maintaining real-time subscriptions with the frontend where necessary.

## Data Flow

1. **Frontend → Backend**: The Frontend issues a `POST` request to the Backend `/generate` endpoint. Payload contains the user's prompt and workspace context. Included in the headers is a securely stored `API_KEY`.
2. **Backend → Validation & Auth**: The Cloudflare Worker intercepts the request, hashes the provided API key, and validates it against Convex's `apiKeys` table.
3. **Backend → AI**: The backend structures a specialized prompt system and forwards the context to **Cloudflare Workers AI**.
4. **AI → AI Response**: The AI returns the generated response.
5. **Backend → Database (Convex)**: The Cloudflare Worker saves the incoming prompt, the AI completion, token counts, and the execution trace to Convex (in `messages` and `logs` tables).
6. **Backend → Frontend**: Finally, the response is delivered back to the frontend to be rendered in the Chat UI.

## Model Usage

- **Cloudflare Workers AI**: Atum leverages this as the core inference engine. We utilize text generation models (eg. Llama-2/Llama-3 via CF AI) configured to prioritize accuracy to eliminate hallucinations. 
- Prompting logic guarantees safe fallbacks ("I don't know").

## Database Integration (Convex)

Convex manages all persistent state. Key tables:
- `workspaces`: Defines the different departments/SaaS segments utilizing Atum.
- `apiKeys`: Hashed secret keys tethered to specific workspaces.
- `messages`: Records of the chat conversations for analytical purposes.
- `logs`: Error tracing and generation metrics.

## Security
- **API Keys**: Stored purely as secure cryptographic hashes on Convex.
- **Validation Flow**: Validations happen securely on the Cloudflare Worker edge; sensitive operations never touch the client.
