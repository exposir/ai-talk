# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Talk is an AI dialogue learning project focused on building LLM application architecture. Currently in early planning/architecture phase with documentation complete but implementation pending.

**Tech Stack**: Node.js with OpenAI/Gemini API integration

## Commands

```bash
npm install          # Install dependencies
npm test             # Run tests (not yet configured)
npx prettier --write .  # Format code
```

## Code Style

Prettier configured with:
- Print width: 80
- Single quotes
- Prose wrap: always

## Architecture

The project follows a "Dual-Engine" layered architecture:

- **System 1 (Fast Lane)**: Handles ~80% simple tasks (Q&A, basic queries)
- **System 2 (Slow Lane)**: Handles ~20% complex tasks (code analysis, deep reasoning)

**Control Plane Components**:
- Risk Tagger → Policy Engine → Router → Evidence Firewall

**Data Plane Components**:
- Context Builder → Agent Loop → Tool Gateway → Output Handler → Validator/Retry → Tracing/Eval

## Directory Structure

- `notes/` - Learning notes organized by topic (architecture, AI fundamentals, prompt engineering)
- `library/` - External resources (papers, references, tutorials)
- `prompts/` - Prompt templates (`system/` and `user/` subdirectories)
- `sessions/` - Conversation records archived by date (YYYY/MM/)

## Environment Setup

Copy `.env.example` to `.env` and configure API keys:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
