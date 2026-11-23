# Why layer: CLI and read-only MCP

The Why layer indexes local Claude Code, Codex, DeepSeek Harness, Pi, and Weft canvas conversations together. Start with a file, an exact phrase, a URL, or an arXiv paper id; the result points back to the matching turn.

**Contents**

- [Install](#install)
- [CLI reference](#cli-reference)
- [MCP tool dictionary](#mcp-tool-dictionary)
- [Output dictionary](#output-dictionary)
- [Examples](#examples)

## Install

Install the command and build the local index:

```bash
npm install -g weft-canvas
weft index
```

### Connect the read-only MCP server

From the project where you want to use it:

```bash
weft setup mcp
```

This registers Weft in the current project's `.mcp.json` for Claude Code and in `~/.codex/config.toml` for Codex. Queries remain scoped to the current workspace. The MCP server can search and recall; it cannot edit a canvas or a source session.

For other clients that support local stdio servers, register `weft mcp` as the startup command. Node.js 20 or newer and supported session logs must be available on the machine running the server. A complete manual configuration example is in [cli/README.md](https://github.com/zyaochen/weft/blob/main/cli/README.md#mcp-clients-and-directories).

The server writes derived indexes under `~/.weft` and returns retrieved history to the calling agent. That agent may send it to its configured model provider. Source logs remain unchanged.

### Optional Codex skill

From a checkout of this repository:

```bash
mkdir -p .agents/skills && cp -R protocol/adapters/codex/skills/weft .agents/skills/
```

Or from an installed package: the path becomes `$(npm root -g)/weft-canvas/protocol/adapters/codex/skills/weft` relative to the CLI package's location.

This copies the repository's Codex skill into the current project. It can run CLI queries or open a supported session in the Weft desktop app (with a local bridge fallback). Skill installation is separate from MCP registration; it does not add canvas-editing MCP tools.

### Optionally add project rules

```bash
weft setup rules
weft setup rules --remove
```

The first command adds a marked block to this project's `CLAUDE.md` and `AGENTS.md`, asking agents to check relevant history before editing a file. The second removes only that block. Nothing is added to a global instruction file.

## CLI reference

For native Harness queries and their release status, see the [DeepSeek Harness plugin](./deepseek-harness#query-history). Native `why_find` and `why_recall` correspond to MCP `find` and `recall_turn` below.

| Command | Purpose |
|---|---|
| `weft index [--full] [--canvas <dir>]` | Build or refresh the index; optionally remember a canvas-backup directory |
| `weft why <path> [--include-read] [--all] [--limit N] [--json]` | Show turns that touched a file, URL, or paper |
| `weft why --check <path> [--fresh] [--json]` | Cheap check for whether an artifact has history |
| `weft find "<phrase>" [--in q\|a\|m] [--limit N] [--json]` | Exact, case-insensitive search across questions, answers, or materials |
| `weft recall <session> <n>` | Print one turn in full |
| `weft status` | Show index size and evidence coverage |
| `weft purge [--cache]` | Delete all derived data, or only rebuildable caches |
| `weft events <session-file> [--touches]` | Project one source file into canonical events |
| `weft mcp` | Serve the four read-only tools over stdio MCP |
| `weft setup [mcp \| rules [--remove]]` | Inspect or change project integration |

`<path>` may be an absolute path, a path relative to the current workspace, a URL, or `arxiv:<id>`.

## MCP tool dictionary

| Tool | Arguments | Returns |
|---|---|---|
| `why_check` | `path` | One-line history yes/no check |
| `why_file` | `path`, optional `include_read`, `limit` | Matching turns and observed file changes |
| `find` | `phrase`, optional `in`, `limit` | Exact matches in questions (`q`), answers (`a`), materials (`m`), or all three |
| `recall_turn` | `session`, `turn` | Full question, answer, and tool trail for one turn |

## Output dictionary

| Marker | Meaning |
|---|---|
| `Q` | The user's question, verbatim excerpt |
| `A` | The agent's answer, verbatim excerpt |
| `M` | Text attached to a Weft canvas node |
| `Δ` | Observed edit or write from a tool call |
| `≈` | Candidate explanation inferred from the answer; not a verified fact |
| `↗` | Pointer back to the source turn or canvas node |

## Examples

### Find the conversations that changed a file

```text
$ weft why src/lib/api.ts
why src/lib/api.ts · 12 turns in 6 sessions
claude-code  ✏️ edit  Q: Can the API detect vision support?
             Δ storedProviders → storedProviders, storedVision…
```

Add `--include-read` when read-only touches also matter. Use `--all` to remove the default result cap.

### Find where a concept appeared

```text
$ weft find "context.committed" --in q
find "context.committed" · 21 turns in 12 sessions
claude-code  Q: …add context.committed to the event contract…
codex        Q: …context.committed is already half implemented…
```

Use `--in a` for answers and `--in m` for canvas materials.

### Find a paper or webpage

```bash
weft why arxiv:2606.26733
weft why https://example.org/paper
weft find "arxiv" --in m
```

### Open one matching turn in full

Copy the session id and turn number shown by `why` or `find`:

```bash
weft recall <session-id> <turn-number>
```

If the desktop app is installed, the `↗` link opens the matching turn or canvas node.

For the visual session browser and editable context graph, continue with [Session Atlas](./session-atlas).
