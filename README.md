# Atum - Internal AI System

## What is Atum?
Atum is a powerful internal AI system designed to serve as the unified AI infrastructure and chat engine across multiple internal SaaS products. It acts as an intelligent business assistant capable of handling deep organizational knowledge safely and efficiently.

## Purpose
The primary purpose of Atum is to provide a central intelligence layer that powers:
- Support conversations
- Sales assistance
- General research
- Internal document querying

Atum focuses heavily on **accuracy** and **safety**—if it isn't sure about an answer, it is trained to admit it rather than hallucinate. 

## Features
- **Centralized Chat Engine**: A dynamic chat interface usable by employees for internal operations.
- **Smart System Prompts**: Specialized prompting logic to avoid hallucinations and maintain safe responses.
- **API Key Security**: Validated, hashed API keys to ensure only authorized SaaS apps can connect.
- **Logging & Tracking**: Granular tracking for messages, AI usage, and errors.
- **Modern UI**: Polished, professional React/Tailwind frontend for managing keys, viewing logs, and chatting.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend/API**: Cloudflare Workers
- **AI Infrastructure**: Cloudflare Workers AI
- **Database**: Convex
- **Language**: TypeScript throughout

## How it Works
1. **Frontend**: The user logs in or uses the internal chat pane in their operations dashboard.
2. **Backend**: Cloudflare worker handles incoming generation requests to `/generate` via an authenticated API Key.
3. **Execution**: The Cloudflare Worker calls out to Cloudflare Workers AI with the specialized internal prompts.
4. **Storage**: Every request, prompt, response, and workspace relationship is securely logged in the Convex Database for long-term intelligence gathering and auditing.
