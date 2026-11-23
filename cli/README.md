# weft-canvas

Weft on your machine: the canvas app, the Skill that lets local agents edit it, and the why layer over your agent sessions.

```bash
npm install -g weft-canvas     # provides the `weft` command
weft serve                     # open the canvas in the browser
weft open <session-id>         # open one Claude Code / Codex session on the canvas
weft why src/lib/api.ts        # the conversations that shaped a file
```

The command is `weft`.

Indexes the agent sessions already on your machine (Claude Code, Codex, DeepSeek Harness, Pi) by the files each turn read, wrote or edited, and lists those turns: when, what changed, what was asked, what the answer said about the file. Every hit links back to the conversation.

- Facts come straight off tool calls, never from free text or a model.
- Session files are read, never written. The index lives in `~/.weft` (0700/0600) and can be deleted with `weft purge`.
- `Δ` lines are observed changes; `≈` lines are read from the answer and are candidate explanations, not verified reasons.

```
weft index [--full] [--canvas <dir>]
weft why <path> [--include-read] [--all] [--limit N] [--json]
weft why --check <path>            # one line, exit 0/1: is there history here?
weft find "<phrase>" [--in q|a|m]  # where these exact words were asked, answered or attached
weft recall <session> <n>
weft status
weft purge [--cache]
weft mcp                           # the same questions as MCP tools (stdio, read-only)
weft setup [mcp | rules [--remove]]
weft setup skill [--hosts codex claude dsh] [--apply]
weft serve [--port N] [--no-open]
weft open <session-id | weft://link> [--port N]
weft stop                          # stop the server weft open started
weft graph <command>               # native graph, workspace and live canvas commands; graph --help
```

## Let the agent ask on its own

`weft setup mcp` registers the server for Claude Code in this project's `.mcp.json` and for Codex in the user-level `~/.codex/config.toml`; the agent then has `why_check`, `why_file`, `find` and `recall_turn` as tools. `weft setup rules` adds two lines to this project's `CLAUDE.md` and `AGENTS.md` — check for history before editing a file; query before explaining why code is the way it is — as a marked block, `--remove` takes it out. Rule changes are per project and explicit; nothing is written unless you ask.

## Open the canvas

`weft serve` starts the canvas app on `http://localhost:3001` (loopback only) and opens it in the browser; keep the terminal open, Ctrl+C stops it. Canvases are kept in the browser's storage for that address, so stay on one port (`--port` or `WEFT_PORT` picks another, with its own empty list). If Weft is already running there, it just opens it. Models: click **Connect a model** in the canvas and configure your model provider or paste an API key; server-side keys go in `~/.weft/.env`, using the template at `app/env.example` in this package. The package has no third-party runtime dependencies.

## Open your agent sessions

The canvas lists the Claude Code, Codex and Pi sessions on this machine: **Or open your agent conversations as graphs** on the start page, or **All canvases & sessions…** in the canvas menu. Opened sessions keep growing on the canvas while the page is open. `weft open <session-id>` opens one directly (a `weft://open?…` link from `weft why` works too); with no server running it starts one in the background, logging to `~/.weft/serve.log`, and `weft stop` ends it. `weft setup skill --apply` also installs `/weft` for Claude Code (`~/.claude/commands/weft.md`) and `$weft` for Codex (`~/.codex/skills/weft/SKILL.md`), the same files the desktop app installs: typed in a session, they open that session on the canvas.

## Let the agent edit the canvas

`weft setup skill` installs the canvas Skill `weft-canvas` into this project's `.agents/skills/weft-canvas` and `.claude/skills/weft-canvas` (add `dsh` to `--hosts` for `.dsh/skills/weft-canvas`). A copy installed by an earlier version as `skills/weft` is reported with the command that removes it; it shares its name with the `/weft` session command. It previews by default; `--apply` writes. Existing installs are refused and host configuration is not touched. With the Skill installed, Claude Code or Codex can branch, reference, answer and write back on the open canvas through `weft graph canvas-*`. That needs the canvas open (`weft serve`) with "Allow local agents to edit this canvas" turned on in its host handoff panel.

## MCP clients and directories

A client that supports local stdio servers can start it with:

```json
{
  "mcpServers": {
    "weft": {
      "command": "weft",
      "args": ["mcp"]
    }
  }
}
```

Requires Node.js 20 or newer and supported session logs on the machine running the server. Start it in the relevant project directory so file queries use the intended workspace. Clients use different configuration formats; the example above is for clients that accept `mcpServers` JSON.

The four tools search and recall history; they cannot edit a canvas, modify source sessions, or replace the client's conversation. Derived indexes and caches are written under `~/.weft`. Retrieved text is returned to the calling agent and may enter that agent's model context; review the client's provider settings before using private history.

### Container and directory checks

The [Dockerfile](https://github.com/zyaochen/weft/blob/main/cli/Dockerfile) installs the CLI as a non-root stdio server. It does not copy the repository or any session data into the image. From the repository root:

```bash
docker build -f cli/Dockerfile -t weft-mcp cli
docker run --rm -i --network none weft-mcp
```

An empty container answers MCP initialization and `tools/list`; history queries have no results until you explicitly provide local data. No model key, private session, or hosted endpoint is needed for the directory check.

For actual local use, mount only the history directories you choose, read-only, at `/data/sessions` and optionally `/data/canvases`. The derived index is stored separately at `/home/node/.weft`. Query absolute artifact paths recorded in those sessions; the container's default working directory is not your host project's path. The native `npx` configuration above is the simpler option for project-relative queries. A cloud-hosted copy cannot see the history on your computer.

## Optional Codex skill

The repository also contains a Codex skill for opening a session in the desktop app or running CLI history queries:

```bash
mkdir -p .agents/skills && cp -R /path/to/weft/protocol/adapters/codex/skills/weft .agents/skills/
```

This copies the skill into the current project. Opening a session needs the Weft desktop app or its local bridge; CLI queries use the npm package. It is separate from MCP registration and does not provide a canvas-writing MCP tool.
