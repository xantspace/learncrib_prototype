# 📝 LearnCrib Architecture Update: V1 & V2 AI Integration

**Status:** PR Review - `ai-dev` branch
**Date:** April 2026

## Overview
I've been reviewing the PR and branch for the new `ai-dev` features for V2. The AI readiness schema—specifically the new `curriculum` taxonomy, `ai_analytics` tracking, and enriched `SessionLog/SessionNote` models—looks fantastic. This foundation is exactly what we need for the ML agents and RAG assistant going forward. 

However, **we cannot merge the `ai-dev` PR into `backend-dev` or `main` at this time.**

There are major conflicts between the V1 production infrastructure and the V2 branch that will break our current MVP if merged directly.

## 🚨 High-Impact Conflicts

1. **Frontend Deletion:** 
   The `ai-dev` branch removes the entire React frontend (`frontend/` folder), Vite configs, and package files.
2. **Infrastructure Regression:** 
   It strips out our Docker setup (`docker-compose.yml`, `entrypoint.sh`), switching back to bare-metal SQLite processing. 
3. **Security Rollbacks:** 
   Essential production security built in V1 (JWT Auth, Device Fingerprinting, Bot Protection Middleware, rate limiting, and `.env` credentials) has been stripped out. 
4. **Placeholder vs Implementation:**
   The `ai-dev` branch only has payment **placeholders**. Our `backend-dev` branch now has the **completed** Paystack production logic, real-time webhooks, and tutor bank account management.

Merging `ai-dev` now would literally delete our core business engine.

## ✅ Proposed Action Plan to Move Forward

Instead of a direct merge, we need to selectively port the AI schema into our live environment. 

1. **Declare `backend-dev` as the Source of Truth:** 
   `backend-dev` is now the lead branch. It has the frontend, Docker infra, security, and the finished Payment/Payout engine.
2. **AI-Dev Rebase/Pull:** 
   The `ai-dev` branch must pull current changes from `backend-dev` and fix their conflicts *there*. 
3. **Selective Schema Porting:** 
   Instead of trying to override the V1 logic, the AI dev should focus solely on adding the `curriculum` taxonomies and `ai_analytics` modules onto our stable base.

This approach will let us start capturing rich ML behavioral data in V1 right now, without tearing down our frontend or production infrastructure. Let's sync up on writing those data migration scripts!
