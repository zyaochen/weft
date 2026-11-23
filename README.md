<div align="center">

<img src="public/favicon.svg" width="72" alt="Weft logo"/>

# Weft

**Make the context a model reads visible and editable.**

Every exchange with a model or an agent is a node on an infinite canvas; the wires between nodes are the context.<br/>
What a node sees is exactly what flows into it along the arrows. Cut one wire, and the next answer changes.

[![CI](https://github.com/zyaochen/weft/actions/workflows/ci.yml/badge.svg)](https://github.com/zyaochen/weft/actions/workflows/ci.yml) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-%E2%89%A520-339933) · [中文](./README_ZH.md) · [Docs](https://zyaochen.github.io/weft/docs/) · [User manual](docs/guides/user-manual.md)

</div>

<img src="docs/hero-demo-en.gif" width="100%" alt="Weft in use: ask from a document, branch a conversation, and edit the connections that carry context."/>

Weft is for people who run long model or agent sessions (development, research,
debugging over dozens of turns) and want to decide exactly what the next turn
reads. It is a local web app plus a small proxy; it is not a model, an agent
runtime or a hosted service.

> **Fork notice.** Weft is a fork of [ThoughtDAG](https://github.com/chenxiachan/thoughtdag)
> by Xia Chen (MIT). It keeps the canvas and adds a packaged `weft` command, an
> agent Skill and a live canvas bridge for terminal agents. See
> [Relationship to ThoughtDAG](#relationship-to-thoughtdag).

- [Quick start](#quick-start)
- [What it does](#what-it-does)
- [Configuration](#configuration)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [Develop](#develop)

## Quick start

Requires Node.js 20 or newer and git.

```bash
git clone https://github.com/zyaochen/weft.git
cd weft
npm install
npm run server         # model proxy: "Weft proxy (Vercel AI SDK) running on http://localhost:3001"
npm run dev            # canvas: http://localhost:5173 (second terminal)
```

Open `http://localhost:5173`, click **Connect a model** (top right) and paste a
provider key or the URL of any OpenAI-compatible endpoint. Then type a question
on the start page and press Enter. To look around without a model, click
**Load example canvas**.

**Without cloning.** The `weft-canvas` package on npm carries the built canvas, the proxy and the `weft` command:

```bash
npm install -g weft-canvas
weft serve                               # serves the canvas on http://localhost:3001 and opens it
```

`npx weft-canvas serve` runs it once without a global install. Canvases are saved in the browser (IndexedDB), so open the same address each time.

**As a Claude Code or Codex plugin.** The plugin adds the session command (`/weft:weft` in Claude Code, the `weft` Skill in Codex), the `weft-canvas` Skill and the read-only MCP server, which runs from the CLI bundled in the plugin (about 0.3 MB; nothing is downloaded from npm). It does not include the canvas app; start that with `weft serve` or the desktop app. `--sparse` keeps the checkout to the plugin files instead of the whole repository.

```bash
claude plugin marketplace add zyaochen/weft --sparse .claude-plugin plugins
claude plugin install weft@weft

codex plugin marketplace add zyaochen/weft --sparse .claude-plugin --sparse plugins
codex plugin add weft@weft
```

## What it does

**The problem it targets.** Forty turns into an agent session, the model is still
chasing a theory that died at turn 8, because every new turn re-reads all the
turns before it. Re-explaining in a fresh window loses the evidence; compaction
drops information without telling you which. In Weft the next turn's input is
a set of wires you can see, cut and reconnect.

| On the canvas | What the model receives |
|---|---|
| A follow-up grows a solid-wired child | The full upstream chain, nothing else |
| A branch forks from an answer or a selected passage | Sibling branches never see each other |
| A dashed reference wires in a node from elsewhere | That node's own Q/A, not its ancestry |
| A material (note, file, PDF, image, web snapshot) is wired in | It goes first, labelled with its source |
| A wire is cut | That history leaves the next request; Cmd+Z brings it back |
| Several wires flow into one node | Merged threads, model comparison, synthesis |

### 1. Draw the conversation as a map

- **Follow-ups and branches** from any node; select a passage to branch on just that passage.
- **References and materials**: only what is wired counts.
- **Model comparison**: several models answer on separate branches, then a synthesis node reads exactly those wires.

See [Branch a conversation](docs/tutorials/branch-ai-conversations.md) and [Conversation nodes](docs/guides/conversations.md).

### 2. See what the model read

- **Before sending**: "will send ~N tok · M messages" above the input expands into the full request, in order. The preview and the real request come from the same compiler.
- **After sending**: each answer version keeps the request it was generated from; rows that differ from what the node would read now are marked **Changed since**.
- **When upstream changes**: the answer is marked **Upstream changed** instead of going stale silently.

Example from the [user manual](docs/guides/user-manual.md) walk-through (pre-send
estimates, not billed tokens): cutting the wire between a branch and the first
question drops the branch's next request from about 2,603 to about 1,384 tokens.

### 3. Edit context by editing wires

Cut (select a wire, Delete), connect and reconnect (drag a handle; cycles are
refused), right-click a solid wire for **Insert a step here**, archive a node (it stays
visible, its content leaves the context), and **replay**: rerun affected nodes in
dependency order, each adding a new version. See [Edit AI context](docs/tutorials/edit-ai-context.md)
and [Versions and replay](docs/guides/versions-replay.md).

### 4. Agents follow the same rule

- **Agent nodes**: pick Codex or Claude Code in the model menu; the agent works in the canvas directory and the node records the files it changed.
- **Sessions as graphs**: local Claude Code, Codex, DeepSeek Harness and Pi sessions open as a live mirror you can prune, branch and condense; the original session file is never rewritten. `/weft` in Claude Code (`$weft` in Codex) opens the current session.
- **A terminal agent edits the canvas**: `weft setup skill --apply` installs the Skill; in the host handoff panel (bottom right) tick **允许本机 Agent 编辑此画布** ("allow local agents to edit this canvas"; this panel is not translated yet). Concurrent writers get `REVISION_CONFLICT` and reread instead of overwriting.
- **Why layer**: `weft why src/lib/api.ts` lists the turns that touched a file; `weft mcp` offers the same lookups as a read-only MCP server.

See [Session Atlas](docs/guides/session-atlas.md), [Why layer](docs/guides/why-layer.md) and [cli/README.md](cli/README.md).

## Configuration

Model access needs one of these; any one is enough.

| Option | Where | Notes |
|---|---|---|
| Provider key | **Connect a model** in the browser | Kept in this browser (localStorage) and the proxy's memory, never written to disk |
| OpenAI-compatible endpoint | **Connect a model → Custom endpoint** | Your own gateway, vLLM, LM Studio, a relay |
| Keys in `.env` | `cp .env.example .env` | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `DEEPSEEK_API_KEY`, `MOONSHOT_API_KEY`, `OPENROUTER_API_KEY`, `ZHIPU_API_KEY`, `DASHSCOPE_API_KEY`; restart the proxy after editing |
| Local model | `.env`: `OLLAMA_MODELS=qwen3:8b,llama3.2` | `OLLAMA_BASE_URL` defaults to `http://localhost:11434` |

Optional pieces:

- **Decision model** (scores branches, ranks recall): OpenRouter Jev, TypeSafe, Cloudflare, a self-hosted `/v1/systemone` endpoint, or the chat model as an uncalibrated stand-in. Without one, every decision falls back to a rule. See [docs/setup.md](docs/setup.md).
- **Agents**: install `claude` (Claude Code) or `codex` on `PATH`; each runs on its own login.
- **Ports**: `PORT` in `.env` for the proxy (default 3001); `VITE_API_BASE` if the canvas should call a proxy elsewhere; `weft serve --port N`.

## Limitations

- The preview and receipts cover the input the canvas compiles, not provider-side state; with an agent runner, the agent runtime's own system prompt is not in the preview.
- Canvases and receipts live in the browser profile you used; there is no sync or account. Back up with **Export backup (.json)**.
- Desktop installers on [Releases](https://github.com/zyaochen/weft/releases) are unsigned. On macOS the app is ad-hoc signed and not notarized: the first launch is blocked until you allow it under System Settings → Privacy & Security → Open Anyway, and in-app updates may fail to install, so download new versions from Releases. Windows SmartScreen asks once (More info → Run anyway).
- The host handoff panel is Chinese-only; the rest of the UI is English and Chinese.
- Session mirrors read the on-disk formats of Claude Code, Codex, DeepSeek Harness and Pi as observed; a format change in those tools can break the mirror until the reader is updated.
- The browser acceptance scripts that need no model run on macOS by hand and nightly on Linux in CI; Windows is not covered. What was run, and what it does not establish, is in [VERIFICATION.md](VERIFICATION.md).

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Proxy prints `No LLM API key in .env — starting empty` | Expected without `.env`. Connect a model in the browser, or add a key to `.env` and restart `npm run server`. |
| `weft serve` says the port is in use | Another program holds 3001. Run `weft serve --port 3002`. |
| Codex / Claude Code missing from the model menu | The CLI is not on `PATH`. The menu lists the directories it searched; install the CLI or add it to `PATH`, then reopen the menu. |
| The canvas loads but every request fails | The page is not reaching the proxy. Keep `npm run server` running, or set `VITE_API_BASE` to the proxy's URL. |

More in [docs/reference/troubleshooting.md](docs/reference/troubleshooting.md).

## Documentation

| Start here | Read |
|---|---|
| Walk through one session step by step | [User manual](docs/guides/user-manual.md) · [中文](docs/zh/guides/user-manual.md) |
| Install and connect a model | [docs/index.md](docs/index.md) · [Connect a model](docs/setup.md) |
| Look up a feature | [Guide map](docs/guides/index.md) · [Tutorials](docs/tutorials/index.md) · [Reference](docs/reference/index.md) |
| CLI, why layer, MCP | [cli/README.md](cli/README.md) |
| Design and acceptance | [ARCHITECTURE.md](ARCHITECTURE.md) · [VERIFICATION.md](VERIFICATION.md) · [DEPLOYING.md](DEPLOYING.md) |
| How Weft differs from similar tools | [COMPARISON.md](COMPARISON.md) |

The docs render as a VitePress site with search: `npm run docs:dev`, or the
copy the Pages workflow publishes at <https://zyaochen.github.io/weft/docs/>.

## Develop

| Command | What it does |
|---|---|
| `npm run build` | Typecheck and production web build in `dist/` |
| `npm run lint` | ESLint |
| `npm test` | CLI unit tests (builds the CLI first) plus layout, live-log and subagent checks |
| `npm run cli:pack` | The `weft-canvas` CLI tarball (canvas, Skill and CLI together), the same artifact that is published to npm |
| `node scripts/verify-cli-package.mjs cli/weft-canvas-<version>.tgz` | Install the tarball into an empty project and drive it in Chrome |
| `npm run docs:dev` | Documentation site |
| `npm run desktop` | Electron shell from source |

| Path | Contents |
|---|---|
| `src/` | React 19 + Vite canvas: `components/`, zustand `store/`, graph and context `lib/`, `i18n/` (English, Chinese) |
| `server.mjs` | Express proxy on the Vercel AI SDK, with agentic web search |
| `cli/` · `skill/` · `protocol/` | `weft` CLI, the canvas Skill, the context-bundle protocol and host adapters |
| `runtime/` | Local agent runtimes (Claude Code, Codex, Pi) and the canvas bridge |
| `desktop/` · `dsh/` | Electron shell; DeepSeek Harness plugin |
| `scripts/` | Build helpers, Skill installer, acceptance scripts (`verify-*.mjs`) |
| `docs/` · `website/` · `video/` | Docs, static website, Remotion video sources |
| `benchmark/` | Context-intervention benchmark: cases, gold answers, captured runs, tools |

Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: see [SECURITY.md](SECURITY.md).

## Relationship to ThoughtDAG

Weft started from ThoughtDAG ([chenxiachan/thoughtdag](https://github.com/chenxiachan/thoughtdag),
MIT, © 2026 Xia Chen) and was renamed. The canvas model (nodes, wires as
context, versions, replay, Session Atlas), the why layer (`why`, `mcp`) and the
context-bundle protocol come from that project. This repository adds the
packaged CLI (`weft serve`, `open`, `graph`, `bundle`, `setup skill`), the canvas
Skill and its installer, the live canvas bridge that lets terminal agents edit
an open canvas, and the acceptance scripts in `scripts/`. Its git history starts
fresh; upstream's history is in the upstream repository. The two projects evolve
independently: upstream changes are not merged into Weft on a schedule.

## License

MIT, see [LICENSE](./LICENSE). The upstream copyright notice is retained as the
license requires.
