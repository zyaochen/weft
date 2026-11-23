# Deploying the public demo (Cloudflare Pages)

This repository does not run a hosted demo. The steps below are for anyone who wants to
deploy their own copy; GitHub Pages (docs, product story and a static `#view=` viewer)
is described at the end.

One branch, two behaviors: the same `main` runs as the full local app
(`npm run server` + `.env`) and as the public demo. The demo simply has no
`.env` — visitors bring their own API key, which travels inside each request
and is never stored (the proxy is a stateless Pages Function).

## One-time setup

1. Cloudflare dashboard → **Workers & Pages → Create → Pages →
   Connect to Git** → pick this repository.
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `VITE_API_BASE` = *(empty string)* — the frontend
     then calls the same-origin `/api/*`, served by `functions/api/[[path]].js`.
3. Deploy. Every push to `main` republishes automatically.

The bilingual product story, the docs and a static copy of the app (enough to
open `#view=` share links) are published by `.github/workflows/product-story-pages.yml`
to GitHub Pages at `https://zyaochen.github.io/weft/` (enable Pages with
"GitHub Actions" as the source in the repository settings). Requests to `/story/`
on the Cloudflare deployment are permanently redirected there by `worker.js`.

## What the demo serves

- The full canvas app — visitors configure their own provider/key in the
  browser (localStorage); generations are proxied statelessly.
- Read-only `#view=` share links (no server involvement at all).
- Scholarly search (arXiv / Semantic Scholar — free public APIs).
- A permanent `/story/` redirect to the GitHub Pages product story.

Deliberately absent on the demo (local-proxy features): web search
(operator's search key), MCP, PDF text extraction (attachments still work;
extraction needs the local proxy's poppler).

## Self-hosting the full app

```bash
git clone https://github.com/zyaochen/weft && cd weft
npm install
cp .env.example .env   # add at least one LLM key
npm run server         # proxy on :3001
npm run dev            # app on :5173
```
