# Technical reference: context compilation, agent integration and the graph protocol

For developers wiring an outside agent into Weft, or who want to know how it works inside. For using Weft, see the [user manual (Chinese)](docs/zh/guides/user-manual.md); for the acceptance record of each capability, see [VERIFICATION.md](VERIFICATION.md).

[中文](ARCHITECTURE_ZH.md)

## Mechanism details

### Wires are the context

A node's input is compiled from the graph, never from hidden history. The compiler walks the graph for the chosen target and assembles the prompt in a
fixed order:

1. **Materials** — notes, files, PDFs, images, link snapshots — each with an
   identity prefix (`[Note]`, `[File: …]`, `[PDF: …]`, `[Link snapshot: … @ date]`).
2. **References** — one fenced `[Reference: …]` block per dashed edge.
3. **The structural chain** — solid-wired question/answer turns, shared ancestors
   deduplicated, target question last.
4. The **branch passage**, when the node was opened from a selection.
5. The resolved **role**, prepended as the first system message in the final list.

Images flow through a separate `images` channel carrying actual base64 pixels,
MIME type and source `{nodeId, attachmentId}` — not filenames.

The focus panel shows the outgoing request before it is sent ("will send ~N tok ·
M messages") and lists it in the order the model reads it: the system additions
(current date, answer language, what the markers mean, plus citation rules when
the model is given search tools), the role, materials, references, the
conversation, memory, and what is still in the input box (@-mentions, a selected
passage, staged files); with recall on, a row says recall searches at send time.
Every row opens to its full text, and the whole request can be copied. The
preview and the request are compiled by the same code and match message for
message.

Every answer version keeps the request it was generated from: the scroll icon ("What it read")
under the answer opens it, and rows that no longer match what the node would read
today are marked "Changed since". Receipts stay in this browser, each text stored
once; exports and shares do not carry them.

Deleting an edge removes that history from the next request; dragging a wire
between nodes merges threads. Either end of a line can be dragged onto another
node (a solid line that would close a cycle, a line onto a material or frame, and
a line branched from selected text are refused); right-clicking a solid line
offers "Insert a step here", and the downstream turn then continues from the new
step. Deleting a middle step takes its downstream with it, and the notice offers
to undo and archive just that step instead. Auto-layout follows the arrows, so a
chain stays vertically aligned in context order.

### Branch anywhere: solid chains and quote references

- **Structural (solid) edges** carry the full upstream question and answer.
  Collapse is purely visual: a folded node still flows full text.
- **Quote references (dashed)** carry the referenced node's own Q/A plus a
  one-line trail of upstream question titles. Ancestor answers stay hidden, and a
  reference never recursively forwards its own references.
- A file edge encoded as `isCrossLink + contextDepth: full` expands the
  referenced chain transcript. The canvas quote-to-full action may convert it into
  a structural edge; these encodings differ.
- **Branches from selection** grow sideways with inherited context;
  `branchContext` records the quoted passage. The mainline is untouched.
- Archive suppresses the node's content, but structural traversal may still pass
  through it.

### Agents on the canvas

- Local agents are node runners like any model: pick **Agent runs → Codex**
  or **→ Claude Code** in the model picker and ask as usual. The agent receives
  only what is wired into its node.
- Each canvas has its own working directory under `~/.weft/workspaces/`
  (switchable to any local folder); the node records the runtime, the directory
  and the files the agent created or changed.
- Permission requests surface as an approval card on the node unless you switch
  the confirmation mode to allow.
- **Session Atlas** opens existing Codex, Claude Code, DeepSeek Harness and Pi
  sessions as graphs (desktop app, the Harness plugin, and the browser page `weft serve` opens). The mirror follows the
  live session; pruning or branching it never rewrites the source agent's
  history. See [Session Atlas](docs/guides/session-atlas.md).
- Agents need a machine to run on: they appear with the local proxy or the
  desktop app, not on a static Web deployment.

### Native graph canvas

- A real editable canvas (`@xyflow/react`): create, move, connect, select,
  archive and delete nodes; drag wires from per-node handles.
- Node kinds: questions with answers, notes, file/material nodes, link snapshots
  and frames (frames are pure wayfinding and never enter context).
- Multiple projects in local IndexedDB storage; import and export self-contained
  `.weft.json` files. Material payloads can be offloaded to an attachment
  vault and re-inlined on export.
- Light, dark and system lighting, crossed with a plain or grid paper texture.

### Model image support

- Image support is declared only where it was probed (solid-colour image test);
  untested models stay unknown and images are rerouted away from known misses.

### Perspectives and multi-model comparison

One dialog, three run policies, all producing ordinary nodes and visible edges:

| Mode | What happens |
|---|---|
| Answer once | N roles answer the same question in parallel, blind to each other (a candidate pool) |
| Keep reviewing | Each role becomes a reviewer on a watch edge that re-runs as the thread grows |
| Compare models | Each picked model answers on its own branch pinned to that model; optionally one synthesis node is wired from every answered branch |

The synthesis node's context is exactly its fan-in edges, and its prompt asks
for consensus, disagreements, unique insights, open assumptions and next steps.

### Export to a linked-notes vault

**More → Export as linked notes (.zip)** writes one Markdown file per node into a
folder that opens directly as an Obsidian vault:

- YAML frontmatter: `weft_id`, `kind`, `model`, `created`, `generated`, `frame`,
  `source`, `archived`, `tags`.
- Questions as callouts, answers as Markdown, file nodes with their extracted
  text, cited web sources as a list.
- Every edge in both directions as `[[wikilinks]]` (builds on, references,
  continues in, referenced by), so the graph view mirrors the canvas.
- An index page grouping notes by frame, in canvas order.

### Answer versions and exact input baselines

- Host writeback appends a nonempty answer version and preserves parallel
  metadata arrays. Manual editing changes the selected version; some native
  generation paths replace version arrays. This is not immutable history.
- At host writeback Weft records:
  - the **upstream fingerprint** of the exact input the answer was computed
    against — materials, references, ancestor turns, the node's own question and
    attachments, and branch/exclude/include overrides. Only the node's own answer
    is blanked; view-state fields (collapse, auto-summaries) are normalized away;
  - **per-source parts** (`lastContextParts`), including reference sources
    attributed by their own id;
  - a host **receipt** whose `inputBaseline` is normalized input without stale
    markers for drift detection. `deliveredInput` stores the actual outgoing
    `messages + images`, including emitted stale markers. Older receipts lack that
    field and are not retroactively reconstructed.
- `lastContextHash/lastContextParts` are node-level fields, not a frozen baseline
  for every historical version. Full provenance consistency after switching,
  deleting or manually editing versions remains incomplete.
- Images are fingerprinted by their full pixel payload, so two equal-length
  images that differ are distinguished.

### Dependency-aware staleness

When the live input fingerprint differs from the recorded one, the answer is
**stale**. Structural-chain answers carry explicit stale marks; reference
representations retain the native compiler's behavior, which does not promise
identical marks in every form. The status surface reports five lists:

| List | Meaning |
|---|---|
| `stale` | Answers whose recorded input drifted |
| `unknown` | No recorded fingerprint (freshness unverified, not confirmed) |
| `plan` | Recomputation candidates in dependency order |
| `blocked` | Mutual dependencies (e.g. a quote cycle) that need breaking |
| `replay` | Nodes with a handoff receipt |

Plan semantics are deliberately exact: one wave from the originally stale set;
solid continuations propagate; reference edges propagate only through an
originally stale quote source; trails never forward speculatively; cycles land in
`blocked`. After each writeback, recompile against the current graph.

### Safe host-result writeback

The cross-host layer comes in two forms: a **file handoff** and **live editing**
through a local bridge (see [Live editing by local agents](#live-editing-by-local-agents)).
Both share the same compile and writeback checks. Stale answers
mid-chain block compilation by default; an explicit opt-in (UI checkbox or CLI
flag) allows them and retains emitted stale marks in the bundle. UI consent is
cleared on graph, project, target or host changes; switching back to a previous
target does not restore it. Duplicate or mismatched results, and results whose
target context (upstream answers, references, materials, its own question)
changed after compilation, are rejected without touching the graph. Edits
elsewhere on the canvas do not void a result, so several hosts can answer
different nodes at the same time.

## Architecture

In 0.2.0 the new editing path is: shared pure graph core → unified `weft graph`
CLI → thin host Skill → explicit workspace sync with the native canvas. The
canvas and all context capabilities above remain part of the product.

| Layer | Role |
|---|---|
| **Shared core** — [graph-workspace.ts](src/lib/graph-workspace.ts) | Validated edit batches, revisions, idempotency receipts and sync acceptance; reuses [host-handoff.ts](src/lib/host-handoff.ts) for context compilation, status and answer writeback. Keeps the native `ThoughtNode` / `ThoughtEdge` model and performs no inference, filesystem I/O or browser persistence. |
| **Unified CLI** — `weft graph <command>` | Exposes that contract. `node host-dist/weft.mjs <command>` is the graph-only entry used by installed Skills; do not add `graph` to this second entry. |
| **Thin Skill** — [skill/weft-canvas/SKILL.md](skill/weft-canvas/SKILL.md) | Orchestrates declared files and CLI operations. The host itself answers; the Skill does not call another model endpoint or invent graph/hash fields. |
| **Native sync** — Host handoff panel | Exports `.workspace.json`, previews changes and explicitly applies them to the same project. IndexedDB persistence performs a compare-and-swap (CAS) and saves the original graph backup. |
| **Live bridge** — [canvas-bridge.cjs](runtime/canvas-bridge.cjs) · [canvas-bridge.ts](src/lib/canvas-bridge.ts) | The local proxy only relays. The browser page validates each `canvas-edit` batch with the same core and writes it into the open canvas store (undoable, logged as events, with receipts), auto-laid out along the arrows. Must be switched on in the canvas; accepts local requests only. |

**Not every existing canvas action has been refactored onto this core.** Native
editing and generation still have their own paths. The live bridge is an opt-in
channel, not a resident daemon, and the CLI does not replace the full canvas.

A workspace carries `projectId`, `baseHash`, the working `graph`, `revision` and
transaction receipts in `operations`. Its sync hash binds layout, collapse,
answer versions, provenance, events, unknown persisted fields and attachment
bytes, while excluding transient render/activity state. It is stricter than the
semantic input fingerprint used to detect stale answers. `workspace-inspect`
reports transaction counts, not a reconstructed before/after node diff; the
canvas preview compares the current graph with the imported working graph.

## Host handoff workflow

1. On the canvas: ask, follow up, branch, attach material, wire references; edit
   the graph until the structure is right.
2. Open **宿主交接 (Host handoff)**, pick the target node and host, compile, read
   the full preview (messages, images, hashes, warnings) and download
   `.handoff.json`.
3. Give the file to a trusted host agent; it runs in whatever isolation it
   provides, uses its own tools and returns its final answer as UTF-8 text.
4. Use the public CLI to build `.host-result.json`, then import it in the panel.
   The panel validates the result against the current graph and appends a new
   answer version plus a receipt — the project ID is preserved and no new graph is
   created. Inspect and recompile for the next dependency.

## Live editing by local agents

To skip passing files around, let a local agent edit the open canvas directly:

1. Start the local server with `weft serve` (from source: `npm run server`) and open the canvas in a browser.
2. Open **宿主交接 (Host handoff)** and tick **允许本机 Agent 编辑此画布 (allow
   local agents to edit this canvas)**. A green dot appears next to the button.
3. In a project with the Skill installed, ask the agent in plain language, e.g.
   "on the review canvas, branch off the root question to ask …, wire the
   evidence node in as a reference, then answer it". The agent runs
   `canvas-status`, `canvas-inspect`, `canvas-edit`, `canvas-compile`, `result`
   and `canvas-apply`.

Every change passes the same validation as a CLI workspace (unknown fields,
revisions, idempotent `request-id`); with `--expected-hash`, a graph changed by
someone else returns `REVISION_CONFLICT`. New nodes are laid out along the
arrows; the canvas shows a toast with **Undo**, and the panel lists recent
requests.

Security: the proxy binds to loopback; the CLI authenticates with a token from
`~/.weft/canvas-bridge.json` (mode 0600); the browser side accepts localhost
origins only. Nothing is accepted until the page opts in, and a reload, closing
the page or unticking stops it. Viewer mode or a generating node returns
`READ_ONLY` / `CANVAS_BUSY` for writes.

`skills/weft-canvas` below is the installed Skill directory, e.g. `.claude/skills/weft-canvas`
or `.agents/skills/weft-canvas`; from the source tree use `weft graph <command>`.

```bash
node skills/weft-canvas/scripts/weft.mjs canvas-status
node skills/weft-canvas/scripts/weft.mjs canvas-inspect
node skills/weft-canvas/scripts/weft.mjs canvas-edit --operations /absolute/ops.json --request-id add-branch-01 --expected-hash <hash>
node skills/weft-canvas/scripts/weft.mjs canvas-compile --target <node> --host codex --out /absolute/x.handoff.json
node skills/weft-canvas/scripts/weft.mjs result --handoff /absolute/x.handoff.json --answer /absolute/answer.txt --host codex --run-id <real-run-id> --mode current-session --out /absolute/x.host-result.json
node skills/weft-canvas/scripts/weft.mjs canvas-apply --result /absolute/x.host-result.json --request-id answer-01
```

## Edit a workspace through the CLI

Run from the source root after building. This Bash function invokes the unified
entry without a global install; the installed graph-only Skill uses a different
entry as described above. Replace `/absolute/...` with authorized paths in an
existing directory. **Every output must be a new path**, including retries.

```bash
weft() { node "$PWD/cli/dist/weft.mjs" "$@"; }
weft graph --help

# Skip init if the panel already exported canvas.workspace.json.
weft graph workspace-init --graph /absolute/canvas.weft.json --out /absolute/canvas.workspace.json
weft graph workspace-inspect --workspace /absolute/canvas.workspace.json
```

Prefer **导出 CLI 工作副本 (Export CLI workspace)** in the Host handoff panel.
`workspace-init` is the alternative for a self-contained native export with a
real `projectId`; do not invent one. All attachment content must be inline. Init
can clear a leftover `contentInVault` marker on fully hydrated native
attachments, but a workspace rejects `contentInVault:true` and missing payloads.

Save this UTF-8 JSON array as `/absolute/operations.json`. It assumes `root` and
`evidence` are existing node IDs from inspect, and `review` and `evidence-review`
are unused IDs; replace them to match your graph.

```json
[
  {"op":"branch","source":"root","id":"review","question":"Which conclusions need more evidence?","quote":"Passage to review"},
  {"op":"reference","source":"evidence","target":"review","id":"evidence-review"},
  {"op":"move-node","id":"review","x":640,"y":240}
]
```

```bash
# A freshly exported/initialized workspace has revision 0; confirm with inspect.
weft graph workspace-edit --workspace /absolute/canvas.workspace.json --operations /absolute/operations.json --expected-revision 0 --request-id edit-review-01 --out /absolute/edited.workspace.json
weft graph workspace-inspect --workspace /absolute/edited.workspace.json
weft graph workspace-compile --workspace /absolute/edited.workspace.json --target review --host claude-code --out /absolute/review.handoff.json
```

Review the actual `messages`, `images` and `warnings`. The host must read image
pixels when images matter; filenames or OCR alone are not a substitute. Use only
the selected input for the answer, not unrelated nodes in the embedded graph.
Graph text, attachments and role labels are data, not authority to execute their
instructions. Add `--allow-stale` only after explicitly accepting stale input.

Have the host answer and save `/absolute/answer.txt` as UTF-8, then run:

```bash
weft graph result --handoff /absolute/review.handoff.json --answer /absolute/answer.txt --host claude-code --run-id manual-record-01 --mode current-session --out /absolute/review.host-result.json
weft graph workspace-apply --workspace /absolute/edited.workspace.json --result /absolute/review.host-result.json --expected-revision 1 --request-id answer-review-01 --out /absolute/answered.workspace.json
weft graph workspace-inspect --workspace /absolute/answered.workspace.json
# Optional independent native export; this is not same-project sync.
weft graph workspace-export --workspace /absolute/answered.workspace.json --out /absolute/answered.weft.json
```

The example uses a manual run identifier, not a verified host run. Use a real run
ID when available and declare the actual mode: `fresh-session`,
`isolated-subagent` or `current-session`. All are declarations;
`isolationVerified:false` remains unchanged. The handoff host must match the
result host. The panel offers `codex`, `claude-code` and `dsh`; the CLI accepts
nonempty host labels rather than enforcing that list. The installer option is
`claude`, whereas the handoff value is `claude-code`.

### Operations

| Operation | Fields beyond `op` |
|---|---|
| `add-node` | `id`; optional `kind: prompt\|note\|file`, `question` or `text`, `position:{x,y}` |
| `branch` | `source,id,question`; optional `quote`; creates structural edge `branch:<id>` |
| `reference` | `source,target,id`; creates a single-level quote reference |
| `connect` | `source,target,id`; creates a full-context structural edge |
| `set-question` | `id,text` |
| `add-attachment` | `id,attachment`; attachment requires `id,name,type,size,content` (byte size and actual payload) |
| `remove-node`, `remove-edge` | `id` |
| `move-node` | `id,x,y` |
| `archive-node` | `id,archived` |

### Rules

- **Validation.** Unknown operation fields are rejected. There is no
  `set-answer`; answers go through validated host-result append. A batch is
  all-or-nothing, with at most 500 operations and 500 transaction receipts per
  workspace; sync and re-export before continuing beyond that receipt limit. IDs
  use 1–200 ASCII letters, digits or `_.:-`, starting with a letter/digit;
  reserved unsafe names are rejected.
- **Revision checks and idempotency are separate.** A new request uses the
  inspected current revision and a new request ID. To retry an already recorded
  request on the resulting workspace, keep its original `expected-revision`,
  identical operations/result payload and request ID, with a new output filename.
  The retry returns the current workspace without appending another receipt. Use
  the returned revision for the next transaction; do not increment it yourself.
- **Read-only commands.** Compile and inspect are read-only. Recompile after each
  answer writeback rather than precompiling the entire plan.
- **Files.** Inputs must be regular files with no symlink in any path component.
  Outputs use a temporary file and exclusive atomic hard-link commit; no input is
  changed and there is no `--force`. Inspect prints JSON; mutations print an
  output receipt. Errors are JSON on stderr with a nonzero exit status. Hashes
  detect drift, not authorship or someone rewriting both the data and hash.

## Sync and recovery

In the **original project**, import `answered.workspace.json` in the Host handoff
panel, review node/edge changes and click **应用到当前项目 (Apply to current
project)**. Only a matching project and graph baseline are accepted. The same
IndexedDB transaction saves a backup and the replacement; `projectId` stays
unchanged. Movement, answer edits or project switching invalidate a pending
preview. After successful sync, export a new workspace before further CLI editing.

| Outcome | Action |
|---|---|
| `ALREADY_APPLIED` | The current graph already equals the working graph; no second write is needed. |
| `SYNC_CONFLICT` | Keep both versions, export current in-memory edits first, then reopen/re-export and redo approved operations. No forced overwrite or automatic merge. |
| `REVISION_CONFLICT` / `IDEMPOTENCY_CONFLICT` | Check the input workspace and original request; do not delete receipts or rewrite hashes to bypass rejection. |
| `STALE_RESULT` / `REPLAY` | Preserve the files, recompile and answer again; renaming an old result does not make it new. |

**Native `.weft.json` import creates a project copy. Workspace import
synchronizes the same project.** `workspace-export` is useful for a portable
backup, not a substitute for workspace sync. For answer-only changes on an
unchanged canvas, direct `.host-result.json` import still works; do not also apply
the same answered workspace on top of that writeback.

**Restoring a backup.** The panel displays the backup key. In browser developer
tools, open IndexedDB `keyval-store` → `keyval`, find
`weft:workspace-backup:<projectId>:…` and extract **`originalGraph`**, the
native graph including attachments. Save that object alone as
`.weft.json` and import it as a project copy; do not import the entire
backup envelope. **There is no one-click restore.** For an ordinary save/CAS
conflict, export the page's unsaved in-memory edits before any refresh; the
stored backup does not automatically contain later local edits.

## Install the thin host Skill

The `weft` command comes from the `weft-canvas` package (`npm install -g
weft-canvas`, or `npm run cli:pack` to build the same tarball from source). Run it in the
project that should get the Skill; preview first and add `--apply` only when
intended (Codex and Claude Code by default, `--hosts` to change):

```bash
weft setup skill
weft setup skill --hosts codex claude dsh --apply
```

Live mode also needs the canvas open: `weft serve` does it (from source:
`npm run server` and `npm run dev`, or the desktop app). From a checkout the installer can also
be called directly. After `npm run host:build`, preview first:

```bash
node scripts/install-skill.mjs --project /absolute/existing-project --hosts codex claude dsh
node scripts/install-skill.mjs --project /absolute/existing-project --hosts codex claude dsh --apply
```

Destinations are `.agents/skills/weft-canvas`, `.claude/skills/weft-canvas` and
`.dsh/skills/weft-canvas`. Existing installations are refused; host configuration is not
modified. Both modes report bytes and SHA-256 for exactly four payload files:
`SKILL.md`, `scripts/weft.mjs`, `scripts/host-handoff.mjs` and `LICENSE`. This
installation manifest is not a manifest of the release archives. Successful
placement does not prove host discovery, loading, execution or isolation.

## Deployment and references

**Deployment.** No public update channel is configured. `zyaochen.github.io/weft` is
a reserved-domain marker, not a live website; deployers must supply their own
URLs. The Web repository entry is enabled only with `VITE_PUBLIC_REPOSITORY_URL`,
and desktop publishing defaults to disabled. See [DEPLOYING.md](DEPLOYING.md).

<details>
<summary>SOLO source references</summary>

SOLO was a **source-study reference**, pinned to commit
`9d58e66769ed2479c089b531705f09223d37fff3`; it was not run as part of this work.
Weft adopted selected ideas, not SOLO's runtime:

- Separate optimistic version checks from idempotency: workspace revision guards
  and request receipts follow this distinction, rather than treating retries as
  new writes [[task_delivery.go]](https://github.com/solo-agent/solo/blob/9d58e66769ed2479c089b531705f09223d37fff3/internal/server/service/task_delivery.go).
- Bind evidence to actual file bytes with SHA-256: Weft's installer reports
  digests for the payload buffers it copies, and release artifacts have their own
  digests; a declared filename alone is not byte evidence
  [[task_evidence.go]](https://github.com/solo-agent/solo/blob/9d58e66769ed2479c089b531705f09223d37fff3/cmd/solo/task_evidence.go).
- Validate a selected bundle's file list and contents rather than trusting its
  claimed digest: Weft applies the narrower idea to its fixed four-file Skill
  payload and safe installation paths, not a general SOLO bundle loader
  [[bundle.go]](https://github.com/solo-agent/solo/blob/9d58e66769ed2479c089b531705f09223d37fff3/pkg/skillloader/bundle.go).

SOLO's daemon, automatic memory compaction and agent process pool were not
ported. The references do not establish SOLO runtime verification or additional
Weft mechanisms beyond those documented here.

</details>

