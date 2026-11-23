# dsh-weft

This directory is the DeepSeek Harness plugin of [Weft](../README.md), published to npm as `dsh-weft`; its version follows the app's, and the Weft build it embeds is the one in this tree.

Weft for DeepSeek Harness: open DSH sessions (live or on disk) as
editable thought graphs on Weft's infinite canvas — from inside the
harness UI.

Source, releases and issues live in the **[Weft repository](https://github.com/zyaochen/weft)**.

This is a [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
plugin (a Cordis plugin distributed as an npm package), built on the same shell
pattern as [dsh-synapse](https://github.com/liangmianya/dsh-synapse): the host
half mounts the Weft SPA under `/weft/` on the EXISTING harness
web server (no second process, no second port), and the client half adds a
floating "对话 | 思维图" switch at the top of the harness page that shows the
canvas in a same-origin full-screen iframe.

> The switch floats over the chat, so it is there before any session is
> open; while the canvas is up, the same switch sits in the canvas's own top
> bar next to the canvas chip, so it never covers the canvas toolbar. (开关浮
> 在对话页顶部，空态也能切换；思维图打开时，同一个开关在画布顶栏「画布名」右侧，
> 不再压住画布工具栏。0.4.18 曾把它放进会话标题栏，0.4.19 撤回。)

## What works

- `dsh plugin --profile web add dsh-weft` installs the plugin from npm; every GitHub release also carries `dsh-weft-<version>.tgz`, and the same command takes that file's URL (`dsh plugin` forwards to pnpm)
- The harness GUI gains a floating "对话 | 思维图" switch at the top of the page;
  "思维图" opens Weft at
  `/weft/` (same origin — no CORS, no second server)
- The host serves the SPA plus a read-only session bridge:

  | Endpoint | Purpose |
  |---|---|
  | `GET /weft/api/disksessions` | list durable sessions on disk (id, title, cwd from the session header; newest first) |
  | `GET /weft/api/disksessions/<id>/log` | one disk session as JSONL — the exact dialect Weft's `dsh-session` adapter parses, so a past harness session imports like a local file |
  | `GET /weft/api/sessions` | list live sessions in this process |
  | `GET /weft/api/sessions/<id>/log` | one live session's events as JSONL |
  | `GET /weft/api/sessions/<id>/turns` | turn boundaries (start/end seq, the person's message id) of a live or on-disk session — the fork points a canvas can name |
  | `POST /weft/api/sessions/<id>/fork` | `{ afterTurn }` or `{ atSeq }` → a child session inheriting the prefix through that completed turn (`sessionController.fork`, so the chat UI lists it) |
  | `POST /weft/api/sessions/<id>/inject` | `{ text }` or `{ blocks: [{type:'text',text}] }` → model-facing context for the next step (`agent.inject`; no wake; shown in the transcript as injected context from `dsh-weft`) |
  | `POST /weft/api/sessions/<id>/followup` | `{ text | blocks, mode?: 'queue' | 'steer' }` → a user prompt through `sessionController.prompt`, exactly as the composer sends one |
  | `GET /weft/api/roots` · `GET /weft/api/roots/<key>/list\|head\|read\|range` | the other agents' session directories on this machine (`claude-projects` = `~/.claude/projects`, `codex-sessions` = `~/.codex/sessions`) with the desktop bridge's file primitives, so Session Atlas inside the harness lists all three sources and mirrors a Claude Code or Codex session as the desktop does; `rel` never escapes its root |
  | `GET /weft/api/models` | the harness's model catalog in the SPA's list shape (`<provider>/<model>` ids, the harness default) |
  | `POST /weft/api/stream` · `POST /weft/api/claude` | the SPA's own proxy protocol, answered on the harness's providers and credentials (`ctx.llm.stream`); the embedded SPA is built with `VITE_API_BASE=/weft`, so its model picker and every canvas-native generation (summaries, condensing, a canvas that is not a mirrored session) run on the harness's models. These calls do not enter a session log; a mirrored session's turns go through `/followup` |
  | `harness/agent` (a catalog entry) | pick it in the picker and the question goes INTO the harness: a fresh session per call, the canvas's wired context injected first (`agent.inject`, source `dsh-weft`), the question as a user follow-up, the harness's own agent loop with tools; text, reasoning and tool calls stream back as the SPA's frames, the first frame names the session (`{ harnessSession }`) and, once the question enters the surface, the turn it created (`{ harnessTurn: { turn, userMessageId, seq } }`), so the canvas can mark its node as that turn's mirror instead of receiving it twice. The session stays in the Chat and the atlas. `harness: { cwd }` sets the session's working directory (the canvas passes the project it mirrors, else the current chat session's); `harness: { session }` continues a mirrored session instead of forking a fresh one (a tail follow-up); `images` (base64) are admitted through the controller's prompt and a vision model is selected for that turn, so a picture the canvas holds is read by the harness's own eyes |
  | `POST /weft/api/fetch-url` | the SPA's link snapshot (`{ url }` → `{ title, text, fetchedAt, html? }`) through the harness's bounded, credential-free fetcher (`ctx.web.fetch`) |

  Disk logs are zstd *concatenated-frame* files; the bridge locates frame
  boundaries structurally and decodes each with `node:zlib` (the same walk the
  DSH persistence backend performs), so no external zstd binary or native
  module is needed.
- The bridge is Host-header fenced (localhost/127.0.0.1 + `trustedHosts`)

## Verified (2026-09)

- installed into the local `web` profile via `dsh plugin --profile web add <dir>`
- a fresh web-profile boot serves `/weft/` (SPA) and the bridge API; the
  index injection table lists `dsh-weft/client.js`
- headless-browser walk: the "对话 | 思维图" switch floats at the top of the page, the full-screen
  same-origin iframe opens, and Weft boots inside it
- fetching the bridge from INSIDE the weft origin works with no extra
  auth: `GET /weft/api/disksessions` lists every on-disk session (new
  sessions created by the running instance appear automatically) and
  `GET .../log` returns the full event stream
- real session logs decode correctly (multi-frame zstd → 15k+ JSONL lines,
  identical to the `zstd` CLI)
- the live bridge (`/api/sessions`) reflects the running instance's active
  session as soon as the GUI opens one (verified: opening the UI surfaces the
  auto-created session with its live seq), complementing the disk archive

### Canvas-side import

When a turn launched from the canvas needs the person's approval (the
harness's sandbox asking to escalate, a policy hook answering `ask`), the
plugin answers first: it registers ahead of the harness's own panel on the
`approval/request` waterfall for the sessions it is running, streams the
question to the canvas as an `approval` frame, and the node shows it —
tool, command, the harness's reason, allow once or reject. The decision
returns through `POST /weft/api/approvals/:id` and stays on the node
as part of the turn's record. If the canvas stream is gone, the request
is handed down the chain to the harness's panel unchanged.

Inside the iframe the canvas runs with this bridge as its session source
(the SPA is built with `VITE_DSH_BRIDGE=/weft/api`): Session Atlas
lists the harness's sessions beside Claude Code's, Codex's and Pi's (served by
this host from their directories), opens one as a graph, and follows it
live by polling the session's seq. The client half tells the canvas which
session the chat shows (`td:current-session`) and switches the chat when the
canvas names one (`td:select-session`).

## The why layer inside the harness

The plugin bundles the `weft` CLI's library (`lib/why.mjs`, built at pack time) and answers the same four questions over the same `~/.weft` index — no CLI or MCP install needed:

| Surface | What |
|---|---|
| Native tools | `why_check(path)`, `why_file(path, include_read?, limit?)`, `why_find(phrase, in?, limit?)`, `why_recall(session, turn)` — the agent calls them like any harness tool; relative paths resolve against the session's working directory |
| `/why <path \| url \| arxiv:id>` | a person asks from the chat; the answer is the CLI's `why` output, no model message |
| System-prompt section | four lines telling the model to `why_check` before editing a file with history and how to read the other three |

Both are on by default; `whyTools: false` / `whyPrompt: false` in the plugin config turn them off.

## Not yet (roadmap)

- Canvas why panel (a node's file → its history through `/weft/api`)
- Canvas UI for the write bridge: name a fork point on a node, hand a compiled context to `inject`, continue with `followup`; the client already switches the chat to a session the canvas names (`td:select-session`)
- `replace`: shadow a surface range from the canvas (DSH's compaction primitive); needs a live check of how the chat renders a replaced range
- Theme and language sync with the harness UI
- Open the chat's current session on the canvas automatically when the view switches

## Development

```bash
# 1. build the embedded Weft SPA with a /weft/ subpath base (from the repo root)
npm run dsh:build            # writes dsh/dist-app, which git ignores

# 2. install into a profile from this directory (pnpm link)
dsh plugin --profile web add /abs/path/to/weft/dsh

# 3. restart the profile's web app; the switch floats at the top of the page
```

The script drives `tsc`, `vite` and `esbuild` through Node directly, so the
same code path builds on Windows, macOS and Linux. Always run it as
`npm run dsh:build` instead of passing the flags through Git Bash by hand:
MSYS path conversion rewrites `--base=/weft/` into a Git-install path,
which bakes a broken base into `dist-app` — every asset request then falls
through to the SPA fallback HTML and the canvas mounts as a blank white page.

While developing, the profile keeps a pnpm *link* to this directory, so edits
to `lib/` apply on the next restart without reinstalling.

License: MIT
