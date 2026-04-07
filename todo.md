# Atum - Internal AI System TODO Draft

### 1. Project Setup
- [x] Step 1.1: Create backend folder structure ✅
      Goal: Set up base folders (routes, ai, lib, and types)
- [x] Step 1.2: Set up dependencies ✅
      Goal: Initialize package.json and install necessary packages for backend and frontend

### 2. Documentation
- [x] Step 2.1: Create README.md ✅
      Goal: Document what Atum is, purpose, features, tech stack, and how it works
- [x] Step 2.2: Create architecture.md ✅
      Goal: Document full system architecture, data flow, API flow, AI model usage, database integration, and security

### 3. Backend (Cloudflare Worker)
- [x] Step 3.1: Basic worker setup ✅
      Goal: Create index.ts and configure Cloudflare Worker environment
- [x] Step 3.2: Create /generate endpoint ✅
      Goal: Implement routes/generate.ts to handle generation requests
- [x] Step 3.3: AI integration ✅
      Goal: Implement ai/model.ts and ai/prompt.ts using Cloudflare Workers AI
- [x] Step 3.4: API key validation ✅
      Goal: Implement lib/auth.ts to validate incoming API keys and hash them
- [x] Step 3.5: Logging system ✅
      Goal: Add basic logging to track requests, logs, and errors

### 4. Convex Database
- [x] Step 4.1: Setup Convex Database ✅
      Goal: Initialize Convex in the project
- [x] Step 4.2: Create schemas ✅
      Goal: Define complete schemas for workspaces, apiKeys, messages, and logs

### 5. Frontend (React + Vite + Tailwind)
- [ ] Step 5.1: Initialize Frontend
      Goal: Scaffold React + Vite + Tailwind application inside /src
- [ ] Step 5.2: Create Chat UI
      Goal: Implement main ChatContainer, MessageList, MessageItem, and ChatInput components
- [ ] Step 5.3: Create additional pages
      Goal: Build Usage page, Logs page, and API keys management page

### 6. Integration
- [ ] Step 6.1: Connect frontend to backend
      Goal: Ensure frontend Chat UI communicates properly with the backend /generate endpoint
- [ ] Step 6.2: Test full flow
      Goal: End-to-end testing of the entire internal AI system ensuring no hallucinations and correct flow through DB and CF Worker
