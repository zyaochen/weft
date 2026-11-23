---
description: Run the open-source Weft canvas from source, connect a model, and edit what the model reads as a graph of branches and wires.
---

# Install and quick start

> **Weft is an open-source canvas for thinking with AI.** It runs from source today; the repository has not published prebuilt desktop installers yet.

Weft turns LLM conversations into an editable graph. Each node contains a question and answer; incoming wires determine what the model sees next.

## Run from source

Requires Node.js 20 or newer:

```bash
git clone https://github.com/zyaochen/weft.git
cd weft
npm install
npm run server   # model proxy on http://localhost:3001
npm run dev      # canvas on http://localhost:5173
```

Open `http://localhost:5173`. You can configure a provider key or an OpenAI-compatible endpoint inside the app, so an `.env` file is optional.

For a single `weft` command (`weft serve` starts the server and opens the canvas; it also carries the why layer and the agent Skill installer):

```bash
npm install -g weft-canvas                # or run once: npx weft-canvas serve
weft serve                                # http://localhost:3001
```

## Start from a problem

[Remove context you no longer want](/tutorials/edit-ai-context) · [Branch a side question](/tutorials/branch-ai-conversations) · [Reuse an earlier discussion](/tutorials/reuse-past-ai-discussions)

<img src="./hero-demo-en.gif" alt="Weft overview: asking from a document, editing context wires, semantic zoom, backup, and continuing project context with Session Atlas" width="100%" loading="lazy"/>

## Connect your first model

When you need generation, choose **Connect a model**. One connection is enough to begin; you do not need to configure every option.

![Weft model connection window with connection type, authorization, API key, and storage boundary](/screenshots/onboarding/en/connect-model-en-annotated.png)

> The red callouts are documentation overlays. [Open the unannotated screenshot](/screenshots/onboarding/en/connect-model-en.png).

- **Fastest path**: use the one-time authorization in the interface.
- **Existing API key**: choose its provider preset and paste the key.
- **Local model**: choose Ollama, or use a custom endpoint.

The flow is: **choose a connection → authorize or enter a key → fetch models → select models → save**. The window states where connection information is kept; see [Connect a model](/setup) for providers, subscriptions, local models, and developer configuration.

## Continue

1. Load the example canvas or ask your first real question.
2. Open the [interface overview](/guides/interface-overview) to learn the toolbar, nodes, wires, and floating panel.
3. To continue local agent work, see [source and handoff setup](/guides/session-atlas#configure-sources-and-handoff).

**[Browse all guides by interface area →](/guides/)**

## Other ways to run Weft

### Desktop shell

The Electron shell lives in `desktop/` and starts from source with `npm run desktop`. Pushing a `v*` tag runs the `desktop` GitHub Actions workflow, which packages macOS, Windows and Linux builds into a draft release; without signing certificates configured the builds are unsigned. Published versions, when there are any, are on [GitHub Releases](https://github.com/zyaochen/weft/releases).

### Read-only share pages

`#view=` share links are static pages with no server involved; the repository's GitHub Pages workflow publishes the website, the docs and a static copy of the canvas under `https://zyaochen.github.io/weft/`.
