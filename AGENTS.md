# Repository Guidelines

## Project Structure & Module Organization

This repository is a documentation-first knowledge base for AI/LLM topics.
Primary content lives in `notes/`, organized by topic (for example,
`notes/ai-fundamentals/`, `notes/architecture/`, `notes/claude-code/`). The
VitePress site config and theme live in `docs/.vitepress/`, and static
documentation files in `docs/`. Supporting materials are stored in `library/`
and `prompts/`, while conversation archives live in `sessions/`.

## Build, Test, and Development Commands

- `npm run docs:dev`: Start the VitePress dev server.
- `npm run docs:build`: Build the static site for production.
- `npm run docs:preview`: Preview the production build locally.
- `npx prettier --write .`: Format Markdown and config files.
- `npx prettier --check .`: Validate formatting without changes.

## Coding Style & Naming Conventions

- Markdown is wrapped at 80 chars with single quotes; see `.prettierrc`.
- Use `kebab-case` for folders and Markdown files (for example,
  `notes/ai-fundamentals/prompt-engineering.md`).
- Prefer clear, structured headings and include language tags on code blocks.

## Testing Guidelines

There is no automated test suite. The `npm test` script intentionally exits
with an error. Validate changes by running `npm run docs:dev` and checking for
broken links or layout regressions.

## Commit & Pull Request Guidelines

Recent history uses short, conventional-style subjects such as
`docs: update ...` or `docs(telegram): ...`. Follow that pattern and keep
subjects imperative and scoped when relevant. PRs should include:

- A brief description of content changes and why.
- Links to related notes or issues if applicable.
- Screenshots or a short recording when visual layout changes in VitePress.

## Documentation Workflow Notes

- Update `notes/guide/index.md` and `README.md` when adding or renaming
  documents.
- Avoid creating application code or runtime config files; this repo is a
  documentation project.
