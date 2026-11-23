#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// <define:import.meta.env>
var define_import_meta_env_default;
var init_define_import_meta_env = __esm({
  "<define:import.meta.env>"() {
    define_import_meta_env_default = {};
  }
});

// runtime/legacy-home.cjs
var require_legacy_home = __commonJS({
  "runtime/legacy-home.cjs"(exports, module) {
    "use strict";
    init_define_import_meta_env();
    var LEGACY = ["thoughtpath", "thoughtdag"];
    var ALT2 = LEGACY.join("|");
    var QUOTED2 = new RegExp(`(\\\\*")(?:${ALT2})(?=[.:"\\\\-])`, "g");
    var URIS2 = new RegExp(`\\b(?:${ALT2})(?=://|:attachment/)`, "g");
    var CANVAS_SUFFIX = new RegExp(`\\.(?:${ALT2})\\.json$`, "i");
    var RULES_BLOCK = new RegExp(`\\n?<!-- (?:${ALT2}):begin -->[\\s\\S]*?<!-- (?:${ALT2}):end -->\\n?`, "g");
    var TOML_BLOCK = new RegExp(`(?:^#[^\\n]*\\n)?^\\[mcp_servers\\.(?:${ALT2})\\]\\n(?:^(?!\\[)[^\\n]*\\S[^\\n]*(?:\\n|$))*`, "gm");
    var rebrandText = (s) => s.replace(QUOTED2, "$1weft").replace(URIS2, "weft");
    var dropLegacyRules = (text3) => text3.replace(RULES_BLOCK, "\n").replace(/\n{3,}/g, "\n\n");
    var dropLegacyMcpToml = (toml) => toml.replace(TOML_BLOCK, "").replace(/\n{3,}/g, "\n\n");
    function dropLegacyMcpServers(servers) {
      let dropped = false;
      for (const old of LEGACY) if (servers && old in servers) {
        delete servers[old];
        dropped = true;
      }
      return dropped;
    }
    function bindLegacyHome({ fs: fs2, os: os4, path: path4 }) {
      const moveIfAbsent = (from, to) => {
        if (!fs2.existsSync(from) || fs2.existsSync(to)) return false;
        try {
          fs2.renameSync(from, to);
          return true;
        } catch {
          return false;
        }
      };
      const rewrite = (file, to = file) => {
        const text3 = fs2.readFileSync(file, "utf8");
        const next = rebrandText(text3);
        if (to === file) {
          if (next !== text3) fs2.writeFileSync(file, next);
          return;
        }
        fs2.writeFileSync(to, next, { mode: fs2.statSync(file).mode & 511 });
        fs2.unlinkSync(file);
      };
      function adoptLegacyProjectDir(dir) {
        if (typeof dir !== "string" || !path4.isAbsolute(dir)) return;
        for (const old of LEGACY) moveIfAbsent(path4.join(dir, `.${old}`), path4.join(dir, ".weft"));
      }
      let homeChecked = false;
      function adoptLegacyHome() {
        if (homeChecked || process.env.WEFT_HOME) return;
        homeChecked = true;
        const home = path4.join(os4.homedir(), ".weft");
        let moved = false;
        for (const old of LEGACY) moved = moveIfAbsent(path4.join(os4.homedir(), `.${old}`), home) || moved;
        try {
          if (moved) {
            for (const name of fs2.readdirSync(home)) if (/\.jsonl?$/.test(name)) rewrite(path4.join(home, name));
            const workspaces = path4.join(home, "workspaces");
            if (fs2.existsSync(workspaces)) for (const id2 of fs2.readdirSync(workspaces)) adoptLegacyProjectDir(path4.join(workspaces, id2));
          }
          const canvases = path4.join(home, "canvases");
          if (fs2.existsSync(canvases)) {
            for (const name of fs2.readdirSync(canvases)) {
              if (!CANVAS_SUFFIX.test(name)) continue;
              const to = path4.join(canvases, name.replace(CANVAS_SUFFIX, ".weft.json"));
              if (!fs2.existsSync(to)) rewrite(path4.join(canvases, name), to);
            }
          }
        } catch (err) {
          console.warn("[weft] legacy data migration incomplete:", err.message);
        }
      }
      function adoptLegacyCommands() {
        for (const old of LEGACY) {
          moveIfAbsent(path4.join(os4.homedir(), ".claude", "commands", `${old}.md`), path4.join(os4.homedir(), ".claude", "commands", "weft.md"));
          moveIfAbsent(path4.join(os4.homedir(), ".codex", "skills", old), path4.join(os4.homedir(), ".codex", "skills", "weft"));
        }
      }
      function adoptLegacyProfile(appData, dataDir, packaged) {
        moveIfAbsent(path4.join(appData, packaged ? "ThoughtPath" : "thoughtpath-desktop"), dataDir);
      }
      return { adoptLegacyHome, adoptLegacyProjectDir, adoptLegacyCommands, adoptLegacyProfile };
    }
    module.exports = { bindLegacyHome, rebrandText, dropLegacyRules, dropLegacyMcpToml, dropLegacyMcpServers };
  }
});

// src/lib/events/types.ts
var EVENT_SCHEMA;
var init_types = __esm({
  "src/lib/events/types.ts"() {
    init_define_import_meta_env();
    EVENT_SCHEMA = "weft.events/1";
  }
});

// src/lib/events/project.ts
var project_exports = {};
__export(project_exports, {
  EVENT_SCHEMA: () => EVENT_SCHEMA,
  EXCERPT_CHARS: () => EXCERPT_CHARS,
  absolutePath: () => absolutePath,
  anchorOf: () => anchorOf,
  arxivArtifact: () => arxivArtifact,
  changeHead: () => changeHead,
  deriveTouches: () => deriveTouches,
  fileArtifact: () => fileArtifact,
  filePathOf: () => filePathOf,
  fileUri: () => fileUri,
  fragmentTag: () => fragmentTag,
  sessionKey: () => sessionKey,
  sessionToEvents: () => sessionToEvents,
  toolArtifacts: () => toolArtifacts,
  urlArtifact: () => urlArtifact
});
function fragmentTag(sourceId) {
  let h = 5381;
  for (let i = 0; i < sourceId.length; i++) h = (h << 5) + h + sourceId.charCodeAt(i) | 0;
  return (h >>> 0).toString(36);
}
function turnKeys(session, turns) {
  const seen = /* @__PURE__ */ new Map();
  return turns.map((t, i) => {
    const base = t.itemIds[0] ?? `i${i}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? `${session}#${base}` : `${session}#${base}~${n}`;
  });
}
function absolutePath(observed, cwd) {
  const p = observed.replace(/\\/g, "/");
  let base;
  if (p.startsWith("/") || isWindowsAbs(p)) base = p;
  else if (cwd) base = `${cwd.replace(/\\/g, "/").replace(/\/+$/, "")}/${p}`;
  else return null;
  const drive = isWindowsAbs(base) ? base.slice(0, 2) : "";
  const parts = [];
  for (const seg of base.slice(drive.length).split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") {
      parts.pop();
      continue;
    }
    parts.push(seg);
  }
  return `${drive}/${parts.join("/")}`;
}
function fileUri(absPath) {
  const drive = isWindowsAbs(absPath) ? absPath.slice(0, 2) : "";
  const rest = absPath.slice(drive.length);
  const encoded = rest.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  return `file://${drive ? `/${drive}` : ""}${encoded}`;
}
function filePathOf(id2) {
  if (!id2.startsWith("file://")) return null;
  const raw = id2.slice("file://".length);
  const decoded = raw.split("/").map((seg) => {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  }).join("/");
  return /^\/[A-Za-z]:\//.test(decoded) ? decoded.slice(1) : decoded;
}
function fileArtifact(observed, cwd) {
  const abs = absolutePath(observed, cwd);
  return abs ? { id: fileUri(abs), observedPath: observed } : null;
}
function urlArtifact(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase();
  if (host === "arxiv.org" || host === "www.arxiv.org") {
    const m = u.pathname.match(ARXIV_RE);
    if (m) return { id: `arxiv:${m[1]}`, observedPath: url };
  }
  u.hash = "";
  return { id: u.href, observedPath: url };
}
function arxivArtifact(text3) {
  const m = text3.trim().match(/^(?:arxiv:)?(\d{4}\.\d{4,5})(?:v\d+)?$/i);
  return m ? { id: `arxiv:${m[1]}`, observedPath: text3 } : null;
}
function toolArtifacts(tool, cwd) {
  const out = [];
  for (const p of tool.paths ?? []) {
    const a = fileArtifact(p, cwd);
    if (a) out.push(tool.locator ? { ...a, locator: tool.locator } : a);
  }
  if (tool.url) {
    const a = urlArtifact(tool.url);
    if (a) out.push(a);
  }
  return out;
}
function changeHead(t) {
  const one = (s, max = 70) => {
    const l = s.trim();
    return l.length > max ? `${l.slice(0, max)}\u2026` : l;
  };
  if (t.op === "edit" && /^\*\*\* Begin Patch/m.test(t.call)) {
    const lines = t.call.split("\n");
    const minus = lines.find((l) => l.startsWith("-") && !l.startsWith("---"))?.slice(1) ?? "";
    const plus = lines.find((l) => l.startsWith("+") && !l.startsWith("+++"))?.slice(1) ?? "";
    if (minus || plus) return `${one(minus) || "\u2205"} \u2192 ${one(plus) || "\u2205"}`;
  }
  if (t.op === "edit") {
    const m = t.call.match(/\n--- old\n([\s\S]*?)\n\+\+\+ new\n([\s\S]*)$/);
    if (!m) return void 0;
    const a = m[1].split("\n");
    const b = m[2].split("\n");
    let k = 0;
    while (k < a.length && k < b.length && a[k] === b[k]) k++;
    const before = a.slice(k).find((l) => l.trim()) ?? "";
    const after = b.slice(k).find((l) => l.trim()) ?? "";
    return `${one(before) || "\u2205"} \u2192 ${one(after) || "\u2205"}`;
  }
  if (t.op === "write") {
    const body = t.call.replace(/^[^\n]*\n\n?/, "");
    const first = body.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
    return `new file, ${body.length} chars: ${one(first, 80)}`;
  }
  return void 0;
}
function anchorOf(text3) {
  const m = text3.match(ANCHOR_RE);
  return m ? { project: m[1], node: m[2], bundle: m[3], mode: m[4] === "continue" ? "continue" : "branch" } : void 0;
}
function sessionToEvents(s) {
  const sid = sessionKey(s.runner, s.nativeId);
  const src = (ref) => ({ runner: s.runner, file: s.file, ref, schema: s.schema });
  const out = [];
  const sourceId = s.sourceId ?? s.file;
  const started = {
    id: `${sid}/session@${fragmentTag(sourceId)}`,
    kind: "session.started",
    sessionId: sid,
    source: src(s.nativeId),
    ...OBS_FULL,
    runner: s.runner,
    nativeId: s.nativeId,
    sourceId,
    title: s.title,
    ...s.cwd ? { cwd: s.cwd } : {},
    ...s.workspace ? { workspace: s.workspace } : {},
    ...s.parentSessionId ? { parentSessionId: s.parentSessionId } : {},
    ...s.subagent ? { subagent: true } : {}
  };
  const anchor = anchorOf(s.turns[0]?.question ?? "");
  if (anchor) started.anchor = anchor;
  out.push(started);
  const keys = turnKeys(sid, s.turns);
  const byItem = /* @__PURE__ */ new Map();
  s.turns.forEach((t, i) => {
    for (const id2 of t.itemIds) if (!byItem.has(id2)) byItem.set(id2, keys[i]);
  });
  s.turns.forEach((t, i) => {
    const tid = keys[i];
    const at = t.at;
    const base = { sessionId: sid, turnId: tid, turnIndex: i, ...at ? { at } : {} };
    if (t.compactionBefore) {
      const b = {
        id: `${tid}/compaction`,
        kind: "boundary.compaction",
        sessionId: sid,
        source: src(t.itemIds[0] ?? `turn-${i}`),
        ...OBS_PART,
        ...at ? { at } : {},
        summaryExcerpt: clip(t.compactionBefore)
      };
      out.push(b);
    }
    const parent = t.parentItemId ? byItem.get(t.parentItemId) : void 0;
    const ts = {
      id: `${tid}/turn`,
      kind: "turn.started",
      ...base,
      source: src(t.itemIds[0] ?? `turn-${i}`),
      ...OBS_FULL,
      ...parent && parent !== tid ? { parentTurnId: parent } : {},
      humanAuthored: !!t.question.trim()
    };
    out.push(ts);
    if (t.question.trim()) {
      const m = {
        id: `${tid}/q`,
        kind: "message.recorded",
        ...base,
        source: src(t.itemIds[0] ?? `turn-${i}`),
        ...OBS_FULL,
        role: "user",
        actor: "human",
        modelVisible: true,
        excerpt: clip(t.question),
        length: t.question.length
      };
      out.push(m);
    }
    t.tools.forEach((tool, k) => {
      const callId = `${tid}/t${k}`;
      const nativeRef = tool.nativeCallId ?? `${t.itemIds[0] ?? `turn-${i}`}:tool${k}`;
      const artifacts = toolArtifacts(tool, s.cwd);
      const change = changeHead(tool);
      const called = {
        id: callId,
        kind: "tool.called",
        ...base,
        source: src(nativeRef),
        ...OBS_PART,
        callId: tool.nativeCallId ?? callId,
        name: tool.name,
        op: opOf(tool),
        artifacts,
        excerpt: clip(tool.call),
        length: tool.call.length,
        ...change ? { change } : {}
      };
      out.push(called);
      const done = {
        id: `${callId}/result`,
        kind: "tool.completed",
        ...base,
        source: src(nativeRef),
        basis: "observed",
        completeness: tool.truncated ? "partial" : "full",
        calledEventId: callId,
        excerpt: clip(tool.result),
        length: tool.result.length,
        truncated: tool.truncated
      };
      out.push(done);
    });
    if (t.response.trim()) {
      const m = {
        id: `${tid}/a`,
        kind: "message.recorded",
        ...base,
        source: src(t.itemIds[t.itemIds.length - 1] ?? `turn-${i}`),
        ...OBS_PART,
        role: "assistant",
        actor: "model",
        modelVisible: true,
        excerpt: clip(t.response),
        length: t.response.length
      };
      out.push(m);
    }
  });
  return out;
}
function deriveTouches(events) {
  const rank = { read: 1, fetch: 1, attach: 1, write: 2, edit: 2 };
  const byKey = /* @__PURE__ */ new Map();
  for (const raw of events) {
    const e = raw.kind === "artifact.attached" ? { kind: "tool.called", id: raw.id, sessionId: raw.sessionId, turnId: raw.turnId, turnIndex: raw.turnIndex, at: raw.at, op: "attach", artifacts: [raw.artifact], change: void 0 } : raw;
    if (e.kind !== "tool.called" || !(e.op in rank)) continue;
    for (const a of e.artifacts) {
      const key = `${e.turnId}|${a.id}`;
      const prev = byKey.get(key);
      const stronger = !prev || rank[e.op] > rank[prev.op];
      const locators = [...prev?.locators ?? []];
      if (a.locator && !locators.some((l) => JSON.stringify(l) === JSON.stringify(a.locator))) locators.push(a.locator);
      if (!prev || stronger) {
        const change = stronger ? e.change ?? prev?.change : prev?.change;
        byKey.set(key, {
          artifact: a.id,
          op: e.op,
          sessionId: e.sessionId,
          turnId: e.turnId,
          turnIndex: e.turnIndex ?? 0,
          derivedFrom: e.id,
          ...e.at ? { at: e.at } : {},
          ...change ? { change } : {},
          ...locators.length ? { locators } : {}
        });
      } else {
        if (!prev.change && e.change) prev.change = e.change;
        if (locators.length) prev.locators = locators;
      }
    }
  }
  return [...byKey.values()];
}
var EXCERPT_CHARS, OBS_FULL, OBS_PART, clip, sessionKey, isWindowsAbs, ARXIV_RE, opOf, ANCHOR_RE;
var init_project = __esm({
  "src/lib/events/project.ts"() {
    init_define_import_meta_env();
    init_types();
    EXCERPT_CHARS = 200;
    OBS_FULL = { basis: "observed", completeness: "full" };
    OBS_PART = { basis: "observed", completeness: "partial" };
    clip = (s, max = EXCERPT_CHARS) => {
      const t = s.trim();
      return t.length > max ? `${t.slice(0, max)}\u2026` : t;
    };
    sessionKey = (runner, nativeId) => `${runner}:${nativeId}`;
    isWindowsAbs = (p) => /^[A-Za-z]:[\\/]/.test(p);
    ARXIV_RE = /^\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?\/?$/;
    opOf = (t) => t.op ?? "unknown";
    ANCHOR_RE = /\[Weft anchor: project=([\w-]+) node=([\w-]+) bundle=([\w-]+)(?: mode=(branch|continue))?\]/;
  }
});

// src/utils.ts
function countTokens(text3) {
  let cjk = 0;
  for (let i = 0; i < text3.length; i++) {
    const c = text3.charCodeAt(i);
    if (c >= 11904 && c <= 40959 || c >= 63744 && c <= 64255 || c >= 65280 && c <= 65519 || c >= 12288 && c <= 12351) cjk++;
  }
  return Math.ceil(cjk + (text3.length - cjk) / 4);
}
function generateId() {
  return `node-${Date.now()}-${idCounter++}`;
}
var idCounter;
var init_utils = __esm({
  "src/utils.ts"() {
    init_define_import_meta_env();
    idCounter = 0;
  }
});

// src/lib/graph.ts
function walkUpAncestors(startIds, nodes, edges) {
  const starts = Array.isArray(startIds) ? startIds : [startIds];
  const ordered = [];
  const visited = /* @__PURE__ */ new Set();
  const visitedEdgeIds = /* @__PURE__ */ new Set();
  function walkUp(id2) {
    if (visited.has(id2)) return;
    visited.add(id2);
    const node = nodes.find((n) => n.id === id2);
    if (!node) return;
    const incoming = edges.filter((e) => e.target === id2);
    if (incoming.length > 1) {
      incoming.sort((a, b) => (a.data?.contextOrder ?? Number.MAX_SAFE_INTEGER) - (b.data?.contextOrder ?? Number.MAX_SAFE_INTEGER));
    }
    for (const edge of incoming) {
      visitedEdgeIds.add(edge.id);
      walkUp(edge.source);
    }
    ordered.push(node);
  }
  for (const id2 of starts) walkUp(id2);
  return { ordered, visitedEdgeIds };
}
function isToolOutput(att) {
  return att.name.startsWith("tool: ");
}
function toolOutputReach(nodeId, edges) {
  return /* @__PURE__ */ new Set([nodeId, ...edges.filter((e) => e.target === nodeId && !e.data?.isCrossLink).map((e) => e.source)]);
}
function partitionContext(nodeId, nodes, edges) {
  const structural = edges.filter((e) => !e.data?.isCrossLink);
  const crossLinks = edges.filter((e) => e.data?.isCrossLink);
  const { ordered: structuralOrdered } = walkUpAncestors(nodeId, nodes, structural);
  const materials = [];
  const mainline = [];
  for (const n of structuralOrdered) {
    (CONTENT_KINDS.has(n.data.stepKind ?? "") ? materials : mainline).push(n);
  }
  const mainlineIds = new Set(structuralOrdered.map((n) => n.id));
  const references = [];
  const seenRefSources = /* @__PURE__ */ new Set();
  for (const edge of crossLinks) {
    if (!mainlineIds.has(edge.target)) continue;
    if (mainlineIds.has(edge.source)) continue;
    if (seenRefSources.has(edge.source)) continue;
    const source = nodes.find((n) => n.id === edge.source);
    if (!source) continue;
    seenRefSources.add(edge.source);
    if (CONTENT_KINDS.has(source.data.stepKind ?? "")) {
      materials.push(source);
      continue;
    }
    const { ordered: refOrdered } = walkUpAncestors(edge.source, nodes, structural);
    const chain = [];
    for (const n of refOrdered) {
      if (n.id === edge.source) continue;
      if (mainlineIds.has(n.id)) continue;
      if (CONTENT_KINDS.has(n.data.stepKind ?? "")) continue;
      chain.push(n);
    }
    references.push({ source, edge, depth: edge.data?.contextDepth === "full" ? "full" : "quote", chain });
  }
  return { materials, references, mainline };
}
function getDescendantIds(nodeId, edges) {
  const descendants = [];
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift();
    const children = edges.filter((e) => e.source === current && !e.data?.isCrossLink).map((e) => e.target);
    descendants.push(...children);
    queue.push(...children);
  }
  return descendants;
}
var CONTENT_KINDS;
var init_graph = __esm({
  "src/lib/graph.ts"() {
    init_define_import_meta_env();
    CONTENT_KINDS = /* @__PURE__ */ new Set(["note", "file", "link"]);
  }
});

// src/lib/constants.ts
var API_BASE, LAYOUT_COL_WIDTH, LAYOUT_H_GAP, LAYOUT_V_GAP, COLLAPSED_LAYOUT_HEIGHT;
var init_constants = __esm({
  "src/lib/constants.ts"() {
    init_define_import_meta_env();
    API_BASE = define_import_meta_env_default.VITE_API_BASE ?? (define_import_meta_env_default.DEV ? "http://localhost:3001" : "");
    LAYOUT_COL_WIDTH = 540;
    LAYOUT_H_GAP = 64;
    LAYOUT_V_GAP = 96;
    COLLAPSED_LAYOUT_HEIGHT = 240;
  }
});

// src/lib/layout.ts
function estimateNodeHeight(node) {
  if (node.data.isCollapsed) return COLLAPSED_LAYOUT_HEIGHT;
  const questionH = Math.min(180, 40 + (node.data.question || "").length / 1.2);
  const responseH = Math.min(400, (node.data.response || "").length / 1.05);
  const highlightsH = (node.data.highlights?.length ?? 0) * 26;
  const insightH = (node.data.attachments?.length ?? 0) > 0 ? 30 : 0;
  const estimated = 215 + questionH + responseH + highlightsH + insightH;
  return Math.max(260, Math.min(930, estimated));
}
function nodeHeight(node) {
  return Math.max(node.measured?.height ?? 0, estimateNodeHeight(node));
}
function autoLayout(allNodes, allEdges) {
  if (allNodes.length === 0) return allNodes;
  const contentIds = new Set(
    allNodes.filter((n) => ["note", "file", "link", "frame"].includes(n.data.stepKind ?? "")).map((n) => n.id)
  );
  const nodes = allNodes.filter((n) => !contentIds.has(n.id));
  const edges = allEdges.filter((e) => !contentIds.has(e.source) && !contentIds.has(e.target));
  const NODE_WIDTH = LAYOUT_COL_WIDTH;
  const H_GAP = LAYOUT_H_GAP;
  const V_GAP = LAYOUT_V_GAP;
  const V_PAD = 24;
  const structuralEdges = edges.filter((e) => !e.data?.isCrossLink);
  const hasStructuralParent = new Set(structuralEdges.map((e) => e.target));
  for (const e of edges) {
    if (e.data?.isCrossLink && !e.data?.isWatch && !hasStructuralParent.has(e.target)) {
      structuralEdges.push(e);
      hasStructuralParent.add(e.target);
    }
  }
  const targetIds = new Set(structuralEdges.map((e) => e.target));
  const roots = nodes.filter((n) => !targetIds.has(n.id));
  const structuralParents = /* @__PURE__ */ new Map();
  for (const e of structuralEdges) {
    const list = structuralParents.get(e.target) || [];
    list.push(e.source);
    structuralParents.set(e.target, list);
  }
  const materialAnchors = /* @__PURE__ */ new Map();
  const perMaterialCount = /* @__PURE__ */ new Map();
  for (const root of roots) {
    const mats = allEdges.filter((e) => e.target === root.id && !e.data?.isCrossLink && contentIds.has(e.source)).map((e) => allNodes.find((n) => n.id === e.source)).filter((m) => !!m);
    if (mats.length === 0) continue;
    const lowest = mats.reduce((a, b) => a.position.y + nodeHeight(a) > b.position.y + nodeHeight(b) ? a : b);
    const k = perMaterialCount.get(lowest.id) ?? 0;
    perMaterialCount.set(lowest.id, k + 1);
    materialAnchors.set(root.id, {
      x: lowest.position.x - 60 + k * (LAYOUT_COL_WIDTH + LAYOUT_H_GAP),
      y: lowest.position.y + nodeHeight(lowest) + LAYOUT_V_GAP
    });
  }
  const childrenMap = /* @__PURE__ */ new Map();
  for (const edge of structuralEdges) {
    const list = childrenMap.get(edge.source) || [];
    list.push(edge.target);
    childrenMap.set(edge.source, list);
  }
  const edgeKey = (parent, child) => `${parent}\0${child}`;
  const exploreEdges = new Set(
    edges.filter((e) => e.data?.isBranchFromSelection).map((e) => edgeKey(e.source, e.target))
  );
  function classifyChildren(parentId, claimant2) {
    const children = (childrenMap.get(parentId) || []).filter(
      (c) => (claimant2.get(c) ?? parentId) === parentId
    );
    const nonExplore = children.filter((c) => !exploreEdges.has(edgeKey(parentId, c)));
    const explores = children.filter((c) => exploreEdges.has(edgeKey(parentId, c)));
    return {
      continuation: nonExplore[0] ?? null,
      regenerates: nonExplore.slice(1),
      explores
    };
  }
  const VIRT_BASE = 1e5;
  function assignAllColumns(claimant2) {
    const nodeColumn2 = /* @__PURE__ */ new Map();
    let nextColumn = 0;
    let nextVirt = VIRT_BASE;
    const colXOverride = /* @__PURE__ */ new Map();
    const colX2 = (col) => colXOverride.get(col) ?? col * (NODE_WIDTH + H_GAP);
    function assignColumns(nodeId, col) {
      if (nodeColumn2.has(nodeId)) return;
      nodeColumn2.set(nodeId, col);
      const { continuation, regenerates, explores } = classifyChildren(nodeId, claimant2);
      if (continuation) assignColumns(continuation, col);
      for (let i = 0; i < regenerates.length; i++) {
        let regenCol;
        if (col >= VIRT_BASE) {
          regenCol = nextVirt++;
          colXOverride.set(regenCol, colX2(col) + (i + 1) * (NODE_WIDTH + H_GAP));
        } else {
          regenCol = col + 1 + i;
          nextColumn = Math.max(nextColumn, regenCol + 1);
        }
        assignColumns(regenerates[i], regenCol);
      }
      let exploreOffset = 0;
      for (const ec of explores) {
        let exploreCol;
        if (col >= VIRT_BASE) {
          exploreCol = nextVirt++;
          colXOverride.set(exploreCol, colX2(col) + (regenerates.length + 1 + exploreOffset) * (NODE_WIDTH + H_GAP));
          exploreOffset++;
        } else {
          exploreCol = nextColumn;
          nextColumn++;
        }
        assignColumns(ec, exploreCol);
      }
    }
    for (const root of roots) {
      const anchor = materialAnchors.get(root.id);
      if (anchor) {
        const virtCol = nextVirt++;
        colXOverride.set(virtCol, anchor.x);
        assignColumns(root.id, virtCol);
      } else {
        const rootCol = nextColumn;
        nextColumn++;
        assignColumns(root.id, rootCol);
      }
    }
    for (let guard = 0; guard < nodes.length; guard++) {
      let progressed = false;
      for (const node of nodes) {
        if (nodeColumn2.has(node.id)) continue;
        const cols = (structuralParents.get(node.id) || []).map((p) => nodeColumn2.get(p)).filter((c) => c !== void 0).sort((a, b) => a - b);
        if (!cols.length) continue;
        assignColumns(node.id, cols[Math.floor((cols.length - 1) / 2)]);
        progressed = true;
      }
      if (!progressed) break;
    }
    return { nodeColumn: nodeColumn2, colX: colX2 };
  }
  const claimant = /* @__PURE__ */ new Map();
  for (const [child, ps] of structuralParents) {
    if (ps.length < 2) continue;
    const continued = ps.filter((p) => !exploreEdges.has(edgeKey(p, child)));
    const pool = continued.length ? continued : ps;
    claimant.set(child, pool[0]);
  }
  const { nodeColumn, colX } = assignAllColumns(claimant);
  const nodeHeightMap = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    nodeHeightMap.set(node.id, nodeHeight(node));
  }
  const positioned = /* @__PURE__ */ new Map();
  const visited = /* @__PURE__ */ new Set();
  const queue = [...roots.map((r) => r.id)];
  for (const rootId of queue) {
    const col = nodeColumn.get(rootId) ?? 0;
    const anchor = materialAnchors.get(rootId);
    positioned.set(rootId, { x: colX(col), y: anchor?.y ?? 0 });
    visited.add(rootId);
  }
  while (queue.length > 0) {
    const current = queue.shift();
    const parentPos = positioned.get(current);
    const parentHeight = nodeHeightMap.get(current) || 220;
    const { continuation, regenerates, explores } = classifyChildren(current, claimant);
    if (continuation && !visited.has(continuation)) {
      visited.add(continuation);
      const col = nodeColumn.get(continuation) ?? 0;
      positioned.set(continuation, {
        x: colX(col),
        y: parentPos.y + parentHeight + V_GAP
      });
      queue.push(continuation);
    }
    const continuationY = parentPos.y + parentHeight + V_GAP;
    for (const rc of regenerates) {
      if (visited.has(rc)) continue;
      visited.add(rc);
      const col = nodeColumn.get(rc) ?? 0;
      positioned.set(rc, {
        x: colX(col),
        y: continuationY
      });
      queue.push(rc);
    }
    for (const ec of explores) {
      if (visited.has(ec)) continue;
      visited.add(ec);
      const col = nodeColumn.get(ec) ?? 0;
      positioned.set(ec, {
        x: colX(col),
        y: parentPos.y + parentHeight * 0.25
      });
      queue.push(ec);
    }
  }
  for (let guard = 0; guard < nodes.length; guard++) {
    let progressed = false;
    for (const node of nodes) {
      if (positioned.has(node.id)) continue;
      const ps = (structuralParents.get(node.id) || []).filter((p) => positioned.has(p));
      if (!ps.length) continue;
      const bottom = Math.max(
        ...ps.map((p) => positioned.get(p).y + (nodeHeightMap.get(p) || 220))
      );
      positioned.set(node.id, { x: colX(nodeColumn.get(node.id) ?? 0), y: bottom + V_GAP });
      progressed = true;
    }
    if (!progressed) break;
  }
  for (const node of nodes) {
    if (!positioned.has(node.id)) {
      positioned.set(node.id, { x: 0, y: 0 });
    }
  }
  for (let pass = 0; pass < 5; pass++) {
    let moved = false;
    for (const node of nodes) {
      const pos = positioned.get(node.id);
      if (!pos) continue;
      const all = (structuralParents.get(node.id) || []).filter((p) => positioned.has(p));
      if (all.length < 2) continue;
      const continued = all.filter((p) => !exploreEdges.has(`${p}\0${node.id}`));
      const explored = all.filter((p) => exploreEdges.has(`${p}\0${node.id}`));
      let floor = -Infinity;
      for (const p of continued) {
        floor = Math.max(floor, positioned.get(p).y + (nodeHeightMap.get(p) || 220) + V_GAP);
      }
      for (const p of explored) {
        floor = Math.max(floor, positioned.get(p).y);
      }
      if (floor > -Infinity && pos.y < floor) {
        const delta = floor - pos.y;
        pos.y = floor;
        for (const dId of new Set(getDescendantIds(node.id, structuralEdges))) {
          const dPos = positioned.get(dId);
          if (dPos) dPos.y += delta;
        }
        moved = true;
      }
    }
    if (!moved) break;
  }
  const columnNodes = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    const col = nodeColumn.get(node.id) ?? 0;
    const list = columnNodes.get(col) || [];
    list.push(node.id);
    columnNodes.set(col, list);
  }
  for (let pass = 0; pass < 5; pass++) {
    let moved = false;
    for (const [, colNodeIds] of columnNodes) {
      colNodeIds.sort((a, b) => positioned.get(a).y - positioned.get(b).y);
      for (let i = 1; i < colNodeIds.length; i++) {
        const prevId = colNodeIds[i - 1];
        const currId = colNodeIds[i];
        const prevPos = positioned.get(prevId);
        const currPos = positioned.get(currId);
        const prevHeight = nodeHeightMap.get(prevId) || 220;
        const minY = prevPos.y + prevHeight + V_PAD;
        if (currPos.y < minY) {
          const delta = minY - currPos.y;
          currPos.y = minY;
          moved = true;
          for (const dId of new Set(getDescendantIds(currId, structuralEdges))) {
            const dPos = positioned.get(dId);
            if (dPos) dPos.y += delta;
          }
        }
      }
    }
    if (!moved) break;
  }
  const FOLD_HEIGHT = 8e3;
  const FOLD_COL_GAP = 180;
  const importerNotes = allNodes.filter((n) => n.data.stepKind === "note" && n.data.importSource);
  const noteTargets = new Set(
    allEdges.filter((e) => importerNotes.some((n) => n.id === e.source)).map((e) => e.target)
  );
  for (const root of roots) {
    const chain = [];
    let cur = root.id;
    let pure = true;
    while (cur) {
      chain.push(cur);
      const kids = childrenMap.get(cur) || [];
      if (kids.length > 1) {
        pure = false;
        break;
      }
      cur = kids[0];
    }
    if (!pure || chain.length < 8) continue;
    const chainSet = new Set(chain);
    const first = positioned.get(chain[0]);
    const lastId = chain[chain.length - 1];
    const totalH = positioned.get(lastId).y + (nodeHeightMap.get(lastId) || 220) - first.y;
    if (totalH <= FOLD_HEIGHT) continue;
    const rightOccupied = nodes.some((n) => !chainSet.has(n.id) && positioned.get(n.id).x > first.x + NODE_WIDTH / 2);
    if (rightOccupied) continue;
    let foldCol = 0;
    let y = first.y;
    for (const id2 of chain) {
      const h = nodeHeightMap.get(id2) || 220;
      const used = y - first.y;
      const mustFold = used + h > FOLD_HEIGHT;
      const chapterFold = noteTargets.has(id2) && used > FOLD_HEIGHT * 0.6;
      if ((mustFold || chapterFold) && y !== first.y) {
        foldCol++;
        y = first.y;
      }
      const p = positioned.get(id2);
      p.x = first.x + foldCol * (NODE_WIDTH + FOLD_COL_GAP);
      p.y = y;
      y += h + V_GAP;
    }
  }
  const solidRects = nodes.map((n) => {
    const p = positioned.get(n.id);
    return { x: p.x, y: p.y, w: NODE_WIDTH, h: nodeHeightMap.get(n.id) || 220 };
  });
  const NOTE_W = 460;
  const NOTE_H = 130;
  const collides = (x, y) => solidRects.some((r) => x < r.x + r.w && x + NOTE_W > r.x && y < r.y + r.h && y + NOTE_H > r.y);
  const colTopStacks = /* @__PURE__ */ new Map();
  for (const note of importerNotes) {
    const targetId = allEdges.find((e) => e.source === note.id)?.target;
    const tp = targetId ? positioned.get(targetId) : void 0;
    if (!tp) continue;
    let x = tp.x - 520;
    let y = tp.y;
    if (collides(x, y)) {
      x = tp.x;
      y = tp.y - NOTE_H - 40;
    }
    if (collides(x, y)) {
      const colKey = Math.round(tp.x);
      const colMinY = Math.min(...nodes.filter((n) => Math.round(positioned.get(n.id).x) === colKey).map((n) => positioned.get(n.id).y));
      const k = colTopStacks.get(colKey) ?? 0;
      colTopStacks.set(colKey, k + 1);
      x = tp.x;
      y = colMinY - NOTE_H - 40 - k * (NOTE_H + 30);
    }
    positioned.set(note.id, { x, y });
  }
  return allNodes.map((node) => {
    const pos = positioned.get(node.id);
    return pos ? { ...node, position: pos } : node;
  });
}
var init_layout = __esm({
  "src/lib/layout.ts"() {
    init_define_import_meta_env();
    init_graph();
    init_constants();
  }
});

// src/lib/import-chat.ts
function makeNode(question, response, isRoot) {
  return {
    id: generateId(),
    type: "thought",
    position: { x: 0, y: 0 },
    dragHandle: ".drag-handle",
    data: {
      question,
      response,
      responses: [response],
      responseIndex: 0,
      isCollapsed: true,
      isEditing: false,
      isEditingResponse: false,
      isLoading: false,
      tokenCount: Math.ceil((question + response).length / 4),
      highlights: [],
      highlightMode: "tag",
      attachments: [],
      excludedAttachmentIds: [],
      includedAttachmentIds: [],
      roleMode: "inherit",
      isRoot,
      isBranch: false
    }
  };
}
var init_import_chat = __esm({
  "src/lib/import-chat.ts"() {
    init_define_import_meta_env();
    init_utils();
    init_layout();
  }
});

// src/lib/turn-insight.ts
function conclusionOf(response, max = 140) {
  const paras = response.replace(/```[\s\S]*?```/g, "").split(/\n\s*\n/).map((p) => p.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#*`>|_~]/g, "").replace(/^\s*[-•\d.)]+\s*/gm, "").replace(/\s+/g, " ").trim()).filter((p) => p.length > 12 && !/[:：]$/.test(p) && !/^(sources?|references?|来源|参考)\b/i.test(p));
  const substantive = paras.filter((p) => p.length >= 30);
  const last = substantive[substantive.length - 1] ?? paras[paras.length - 1] ?? response.replace(/[#*`>-]/g, "").replace(/\s+/g, " ").trim();
  return last.length > max ? `${last.slice(0, max)}\u2026` : last;
}
var init_turn_insight = __esm({
  "src/lib/turn-insight.ts"() {
    init_define_import_meta_env();
    init_utils();
  }
});

// src/lib/adapters/shared.ts
function toolOpOf(name) {
  return TOOL_OPS.find(([re]) => re.test(name))?.[1] ?? "other";
}
function dropSelfCommandTurns(turns) {
  return turns.filter((t) => !SELF_MARKS.some((m) => t.question.includes(m)));
}
function markImporterNote(note) {
  note.width = 460;
}
function seedPlaque(node) {
  const line = conclusionOf(node.data.response, 90);
  if (line) node.data.summaries = [line];
}
function toolAttachments(turn) {
  return turn.tools.map((tool) => ({
    id: generateId(),
    name: `tool: ${tool.name}${tool.truncated ? " (truncated)" : ""}`,
    type: "text/plain",
    size: tool.call.length + tool.result.length,
    content: `[call] ${tool.call}
[result]
${tool.result}`,
    ...tool.paths?.length ? { paths: tool.paths } : {},
    ...tool.op ? { op: tool.op } : {}
  }));
}
function adoptSubagentSessions(turns, subs) {
  const used = /* @__PURE__ */ new Set();
  const settle = (run, sub) => {
    used.add(sub);
    const tools = sub.turns.flatMap((t) => t.tools);
    if (tools.length) run.tools = tools;
    if (!run.output.trim()) run.output = sub.turns.map((t) => t.response).filter((r) => r.trim()).at(-1) ?? "";
    if (!run.itemIds.includes(sub.sessionId)) run.itemIds.push(sub.sessionId);
    if (!run.at && sub.at) run.at = sub.at;
  };
  for (const turn of turns) for (const run of turn.subagents ?? []) {
    const key = run.match?.trim();
    if (!key) continue;
    const sub = subs.find((x) => !used.has(x) && x.firstQuestion.trim() === key);
    if (sub) settle(run, sub);
  }
  for (const sub of subs) {
    if (used.has(sub) || !sub.at) continue;
    const before = turns.filter((t) => t.at && t.at <= sub.at);
    const turn = before.at(-1) ?? turns.at(-1);
    if (!turn) continue;
    const run = { agent: sub.runner, task: sub.firstQuestion, output: "", itemIds: [sub.sessionId], at: sub.at };
    settle(run, sub);
    (turn.subagents ??= []).push(run);
  }
}
function attachSubagentBranches(parent, turn, nodes, edges, runner, sessionId, cwd) {
  const kids = [];
  for (const run of turn.subagents ?? []) {
    const node = makeNode(`[${run.agent}] ${run.task}`.trim(), run.output, false);
    node.data.isBranch = true;
    node.data.importSource = { runner, sessionId, itemIds: run.itemIds, ...cwd ? { cwd } : {}, subagent: { agent: run.agent, of: turn.itemIds[0] ?? "" } };
    node.data.source = { question: node.data.question, response: node.data.response };
    if (run.tools?.length) node.data.attachments = toolAttachments({ question: run.task, response: run.output, itemIds: run.itemIds, tools: run.tools });
    seedPlaque(node);
    nodes.push(node);
    kids.push(node);
    edges.push({ id: generateId(), source: parent.id, target: node.id, type: "smoothstep", data: { isBranchFromSelection: true, branchYRatio: 0.5 } });
  }
  return kids;
}
function toolScope(input) {
  const i = input ?? {};
  const out = {};
  if (typeof i.url === "string" && /^https?:\/\//.test(i.url)) out.url = i.url;
  const loc = {};
  if (typeof i.pages === "string" && i.pages.trim()) loc.pages = i.pages.trim();
  if (typeof i.offset === "number" || typeof i.limit === "number") {
    const start = Math.max(1, typeof i.offset === "number" ? i.offset : 1);
    const end = typeof i.limit === "number" ? start + Math.max(0, i.limit) - 1 : start;
    loc.lines = [start, Math.max(start, end)];
  }
  if (Object.keys(loc).length) out.locator = loc;
  return out;
}
function toolPaths(input) {
  const i = input ?? {};
  const p = i.file_path ?? i.notebook_path;
  return typeof p === "string" && p ? [p] : [];
}
function renderCall(name, input) {
  const i = input ?? {};
  const op = toolOpOf(name);
  if (op === "write" && typeof i.content === "string") return `${i.file_path ?? ""}

${i.content}`;
  if (op === "edit" && typeof i.new_string === "string") {
    return `${i.file_path ?? i.notebook_path ?? ""}${i.replace_all ? " (replace all)" : ""}
--- old
${i.old_string ?? ""}
+++ new
${i.new_string}`;
  }
  return JSON.stringify(input ?? {});
}
var TOOL_OPS, TOOL_CALL_LIMIT, ARTIFACT_CALL_LIMIT, TOOL_RESULT_LIMIT, clipText, SELF_MARKS;
var init_shared = __esm({
  "src/lib/adapters/shared.ts"() {
    init_define_import_meta_env();
    init_import_chat();
    init_layout();
    init_utils();
    init_turn_insight();
    TOOL_OPS = [
      [/^(Read|NotebookRead|read_file|view_image)$/i, "read"],
      [/^(Write|write_file)$/i, "write"],
      [/^(Edit|MultiEdit|NotebookEdit|apply_patch)$/i, "edit"],
      [/^(Bash|BashOutput|Shell|exec_command|local_shell|write_stdin)$/i, "run"],
      [/^(Grep|Glob|LS|Search|WebSearch|web_search)$/i, "search"],
      [/^(WebFetch|Fetch)$/i, "fetch"],
      [/^(Task|Agent)$/i, "agent"]
    ];
    TOOL_CALL_LIMIT = 800;
    ARTIFACT_CALL_LIMIT = 32e3;
    TOOL_RESULT_LIMIT = 4e3;
    clipText = (s, limit) => s.length > limit ? { text: `${s.slice(0, limit)}
\u2026[truncated, ${s.length} chars total]`, truncated: true } : { text: s, truncated: false };
    SELF_MARKS = ["<command-name>/weft</command-name>", "[[weft:command]]"];
  }
});

// src/lib/adapters/claude-code-session.ts
function textParts(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((p) => p.type === "text" && p.text).map((p) => p.text).join("\n");
}
function resultText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((p) => p.type === "text" && p.text ? p.text : p.type === "image" ? "[image result omitted]" : "").filter(Boolean).join("\n");
}
function noteNode(text3) {
  const n = makeNode(text3, "", false);
  n.data.stepKind = "note";
  markImporterNote(n);
  return n;
}
function buildGraphFromTurns(turns, sessionId, cwd) {
  const origin = cwd ? { cwd } : {};
  const nodes = [];
  const edges = [];
  let prev = null;
  const byItem = /* @__PURE__ */ new Map();
  const link2 = (source, target) => {
    edges.push({ id: generateId(), source: source.id, target: target.id, type: "smoothstep" });
  };
  for (const turn of turns) {
    let noteToWire = null;
    if (turn.compactionBefore) {
      const note = noteNode(turn.compactionBefore);
      note.data.importSource = { runner: "claude-code", sessionId, itemIds: [], ...origin };
      nodes.push(note);
      noteToWire = note;
    }
    const node = makeNode(turn.question, turn.response, prev === null);
    node.data.importSource = { runner: "claude-code", sessionId, itemIds: turn.itemIds, ...origin };
    node.data.source = { question: node.data.question, response: node.data.response };
    seedPlaque(node);
    node.data.attachments = toolAttachments(turn);
    nodes.push(node);
    attachSubagentBranches(node, turn, nodes, edges, "claude-code", sessionId, cwd);
    const parent = turn.parentItemId ? byItem.get(turn.parentItemId) : void 0;
    if (parent) link2(parent, node);
    else if (prev) link2(prev, node);
    if (noteToWire) link2(noteToWire, node);
    for (const id2 of turn.itemIds) byItem.set(id2, node);
    prev = node;
  }
  return { nodes: autoLayout(nodes, edges), edges };
}
var NOTIFICATION_LIMIT, clip2, ClaudeSessionCollector;
var init_claude_code_session = __esm({
  "src/lib/adapters/claude-code-session.ts"() {
    init_define_import_meta_env();
    init_import_chat();
    init_layout();
    init_utils();
    init_shared();
    NOTIFICATION_LIMIT = 16e3;
    clip2 = clipText;
    ClaudeSessionCollector = class {
      turns = [];
      // tool_use id → registration, so results pair up even across lines
      pendingTools = /* @__PURE__ */ new Map();
      current = null;
      pendingCompaction;
      sessionId = null;
      customTitle = null;
      summary = null;
      slug = null;
      firstQuestion = null;
      cwd = null;
      // decided by the first message line: what kind of file this is
      mode = null;
      feedLine(raw) {
        const t = raw.trim();
        if (!t) return;
        let line;
        try {
          line = JSON.parse(t);
        } catch {
          return;
        }
        this.feed(line);
      }
      flush() {
        const c = this.current;
        if (c && (c.question || c.response || c.tools.length)) this.turns.push(c);
        this.current = null;
      }
      feed(line) {
        if (line.type === "custom-title" && line.customTitle) this.customTitle = line.customTitle;
        if (line.type === "summary" && line.summary && !this.summary) this.summary = line.summary;
        if (line.slug && !this.slug) this.slug = line.slug;
        if (line.cwd && !this.cwd) this.cwd = line.cwd;
        if (this.mode === null && (line.type === "user" || line.type === "assistant") && line.uuid) {
          this.mode = line.isSidechain && line.agentId ? "sidechain" : "main";
          if (this.mode === "sidechain") this.sessionId = line.agentId;
        }
        if (!!line.isSidechain !== (this.mode === "sidechain")) return;
        if (line.type === "system" && line.subtype === "compact_boundary") {
          this.flush();
          const m = line.compactMetadata;
          this.pendingCompaction = `[Compaction] The source runner compacted its history here${m?.preTokens ? ` (${m.preTokens} \u2192 ${m.postTokens ?? "?"} tokens)` : ""}. Everything above this point reached later turns only as a summary.`;
          return;
        }
        if ((line.type === "user" || line.type === "assistant") && line.uuid && line.sessionId && !this.sessionId) {
          this.sessionId = line.sessionId;
        }
        if (line.type === "user") {
          const content = line.message?.content;
          if (Array.isArray(content)) {
            for (const p of content) {
              if (p.type === "tool_result" && p.tool_use_id) {
                const reg = this.pendingTools.get(p.tool_use_id);
                if (reg && this.current) {
                  const res = clip2(resultText(p.content), TOOL_RESULT_LIMIT);
                  this.current.tools.push({
                    name: reg.name,
                    call: reg.call,
                    result: res.text,
                    truncated: res.truncated,
                    ...reg.paths.length ? { paths: reg.paths } : {},
                    op: reg.op,
                    nativeCallId: p.tool_use_id,
                    ...reg.url ? { url: reg.url } : {},
                    ...reg.locator ? { locator: reg.locator } : {}
                  });
                  if (reg.spawn) {
                    const report = clip2(resultText(p.content), ARTIFACT_CALL_LIMIT);
                    (this.current.subagents ??= []).push({ agent: reg.spawn.agent, task: reg.spawn.task, output: report.text, itemIds: [p.tool_use_id], match: reg.spawn.prompt, ...line.timestamp ? { at: line.timestamp } : {} });
                  }
                  this.pendingTools.delete(p.tool_use_id);
                }
              }
            }
          }
          const text3 = textParts(content);
          if (!text3.trim()) return;
          if (/^\s*<task-notification>/.test(text3)) {
            if (this.current) {
              const res = clip2(text3, NOTIFICATION_LIMIT);
              this.current.tools.push({ name: "Agent", call: "(task notification)", result: res.text, truncated: res.truncated, op: "agent" });
            }
            return;
          }
          {
            this.flush();
            if (!this.firstQuestion) this.firstQuestion = text3.trim();
            this.current = {
              question: text3,
              response: "",
              itemIds: line.uuid ? [line.uuid] : [],
              tools: [],
              parentItemId: line.parentUuid ?? void 0,
              ...line.timestamp ? { at: line.timestamp } : {}
            };
            if (this.pendingCompaction) {
              this.current.compactionBefore = this.pendingCompaction;
              this.pendingCompaction = void 0;
            }
          }
          return;
        }
        if (line.type === "assistant" && this.current) {
          if (line.uuid) this.current.itemIds.push(line.uuid);
          const content = line.message?.content;
          const text3 = textParts(content);
          if (text3.trim()) this.current.response = this.current.response ? `${this.current.response}

${text3}` : text3;
          if (Array.isArray(content)) {
            for (const p of content) {
              if (p.type === "tool_use" && p.id && p.name) {
                const op = toolOpOf(p.name);
                const call2 = clip2(renderCall(p.name, p.input), op === "write" || op === "edit" ? ARTIFACT_CALL_LIMIT : TOOL_CALL_LIMIT);
                const inp = p.input && typeof p.input === "object" ? p.input : {};
                const spawn2 = op === "agent" ? { agent: String(inp.subagent_type ?? "agent"), task: String(inp.description ?? inp.prompt?.split("\n")[0] ?? ""), prompt: String(inp.prompt ?? "") } : void 0;
                this.pendingTools.set(p.id, { name: p.name, call: call2.text, paths: toolPaths(p.input), op, ...toolScope(p.input), ...spawn2 ? { spawn: spawn2 } : {} });
              }
            }
          }
        }
      }
      finish() {
        this.flush();
        if (!this.sessionId) return null;
        const asked = this.firstQuestion?.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("<"))?.slice(0, 80) ?? null;
        const title = this.customTitle ?? this.summary ?? asked ?? this.slug ?? `session ${this.sessionId.slice(0, 8)}`;
        return { sessionId: this.sessionId, title, turns: dropSelfCommandTurns(this.turns), ...this.cwd ? { cwd: this.cwd } : {} };
      }
      toConversation() {
        const s = this.finish();
        if (!s || s.turns.length === 0) return null;
        return {
          title: s.title,
          messageCount: s.turns.length,
          source: "claude-code",
          sessionId: s.sessionId,
          build: () => buildGraphFromTurns(s.turns, s.sessionId, s.cwd),
          adopt: (subs) => adoptSubagentSessions(s.turns, subs)
        };
      }
      /** This file as a subagent's transcript (a sidechain file), for its parent to adopt. */
      toSubagentSession() {
        const s = this.finish();
        if (!s || s.turns.length === 0 || this.mode !== "sidechain") return null;
        const first = s.turns[0];
        return { runner: "claude-code", sessionId: s.sessionId, firstQuestion: this.firstQuestion ?? first.question, turns: s.turns, ...s.cwd ? { cwd: s.cwd } : {}, ...first.at ? { at: first.at } : {} };
      }
    };
  }
});

// src/lib/adapters/codex-session.ts
function patchPaths(patch) {
  const out = [];
  for (const m of patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) out.push(m[1].trim());
  return out;
}
function buildGraphFromTurns2(turns, sessionId, cwd) {
  const origin = cwd ? { cwd } : {};
  const nodes = [];
  const edges = [];
  let prev = null;
  for (const turn of turns) {
    let noteToWire = null;
    if (turn.compactionBefore) {
      const note = makeNode(turn.compactionBefore, "", false);
      note.data.stepKind = "note";
      note.data.importSource = { runner: "codex", sessionId, itemIds: [], ...origin };
      markImporterNote(note);
      nodes.push(note);
      noteToWire = note;
    }
    const node = makeNode(turn.question || "(tool-only turn)", turn.response, prev === null);
    node.data.importSource = { runner: "codex", sessionId, itemIds: turn.itemIds, ...origin };
    node.data.source = { question: node.data.question, response: node.data.response };
    node.data.attachments = toolAttachments(turn);
    seedPlaque(node);
    nodes.push(node);
    if (prev) edges.push({ id: generateId(), source: prev.id, target: node.id, type: "smoothstep" });
    if (noteToWire) edges.push({ id: generateId(), source: noteToWire.id, target: node.id, type: "smoothstep" });
    attachSubagentBranches(node, turn, nodes, edges, "codex", sessionId, cwd);
    prev = node;
  }
  return { nodes: autoLayout(nodes, edges), edges };
}
var clip3, partText, INJECTED, isInjectedUserText, userPartText, outputText, CodexSessionCollector;
var init_codex_session = __esm({
  "src/lib/adapters/codex-session.ts"() {
    init_define_import_meta_env();
    init_import_chat();
    init_layout();
    init_utils();
    init_shared();
    clip3 = clipText;
    partText = (content) => (content ?? []).filter((p) => p.text && (p.type === "input_text" || p.type === "output_text" || p.type === "text")).map((p) => p.text).join("\n");
    INJECTED = /^\s*<\/?[a-zA-Z_][\w-]*[^>]*>/;
    isInjectedUserText = (text3) => INJECTED.test(text3) || text3.trimStart().startsWith("# AGENTS.md instructions for ");
    userPartText = (content) => (content ?? []).filter((p) => p.text && (p.type === "input_text" || p.type === "text") && !isInjectedUserText(p.text)).map((p) => p.text).join("\n");
    outputText = (output) => {
      if (typeof output === "string") return output;
      if (Array.isArray(output)) return output.map((p) => p?.text ?? "").filter(Boolean).join("\n");
      return output == null ? "" : JSON.stringify(output);
    };
    CodexSessionCollector = class {
      turns = [];
      pendingCalls = /* @__PURE__ */ new Map();
      current = null;
      pendingCompaction;
      sessionId = null;
      cwd = "";
      day = "";
      sawItems = false;
      firstQuestion = null;
      parentThreadId = null;
      startedAt = null;
      feedLine(raw) {
        const t = raw.trim();
        if (!t) return;
        let line;
        try {
          line = JSON.parse(t);
        } catch {
          return;
        }
        this.feed(line);
      }
      flush() {
        const c = this.current;
        if (c && (c.question || c.response || c.tools.length)) this.turns.push(c);
        this.current = null;
      }
      ensure() {
        if (!this.current) {
          this.current = { question: "", response: "", itemIds: [], tools: [] };
          if (this.pendingCompaction) {
            this.current.compactionBefore = this.pendingCompaction;
            this.pendingCompaction = void 0;
          }
        }
        return this.current;
      }
      feed(line) {
        const p = line.payload ?? {};
        if (line.type === "session_meta" && p.id && !this.sessionId) {
          this.sessionId = p.id;
          this.cwd = p.cwd ?? "";
          this.day = p.timestamp?.slice(0, 10) ?? "";
          this.parentThreadId = p.parent_thread_id ?? null;
          this.startedAt = p.timestamp ?? line.timestamp ?? null;
          return;
        }
        if (line.type === "response_item" || line.type === "event_msg") this.sawItems = true;
        if (line.type === "compacted") {
          this.flush();
          this.pendingCompaction = "[Compaction] The source runner compacted its history here. Everything above this point reached later turns only as a summary.";
          return;
        }
        if (line.type === "turn_context" || line.type === "event_msg" && p.type === "task_started") {
          this.flush();
          const t = this.ensure();
          if (p.turn_id) t.itemIds.push(p.turn_id);
          return;
        }
        if (line.type !== "response_item") return;
        if (p.type === "message") {
          if (p.role === "user") {
            const text3 = userPartText(p.content);
            if (text3.trim()) {
              if (!this.firstQuestion) this.firstQuestion = text3.trim();
              const t = this.ensure();
              if (!t.at && line.timestamp) t.at = line.timestamp;
              t.question = t.question ? `${t.question}

${text3}` : text3;
            }
          } else if (p.role === "assistant") {
            const text3 = partText(p.content);
            if (text3.trim()) {
              const t = this.ensure();
              t.response = t.response ? `${t.response}

${text3}` : text3;
            }
          }
        } else if ((p.type === "function_call" || p.type === "custom_tool_call") && p.call_id && p.name) {
          const raw = String(p.arguments ?? p.input ?? "");
          const op = toolOpOf(p.name);
          const call2 = clip3(raw, op === "edit" || op === "write" ? ARTIFACT_CALL_LIMIT : TOOL_CALL_LIMIT);
          const viewed = op === "read" ? (() => {
            try {
              const a = JSON.parse(raw);
              return typeof a.path === "string" && a.path ? [a.path] : [];
            } catch {
              return [];
            }
          })() : [];
          this.pendingCalls.set(p.call_id, { name: p.name, call: call2.text, paths: op === "edit" ? patchPaths(raw) : viewed, op });
        } else if ((p.type === "function_call_output" || p.type === "custom_tool_call_output") && p.call_id) {
          const reg = this.pendingCalls.get(p.call_id);
          if (reg) {
            const t = this.ensure();
            const res = clip3(outputText(p.output), TOOL_RESULT_LIMIT);
            t.tools.push({
              name: reg.name,
              call: reg.call,
              result: res.text,
              truncated: res.truncated,
              ...reg.paths.length ? { paths: reg.paths } : {},
              op: reg.op,
              nativeCallId: p.call_id
            });
            this.pendingCalls.delete(p.call_id);
          }
        }
      }
      finish() {
        this.flush();
        if (!this.sessionId || !this.sawItems) return null;
        const folded = [];
        let carriedCompaction;
        for (const turn of this.turns) {
          const prev = folded[folded.length - 1];
          if (!turn.question.trim() && prev) {
            if (turn.compactionBefore) carriedCompaction = carriedCompaction ?? turn.compactionBefore;
            if (turn.response) prev.response = prev.response ? `${prev.response}

${turn.response}` : turn.response;
            prev.tools.push(...turn.tools);
            prev.itemIds.push(...turn.itemIds);
          } else {
            if (carriedCompaction && !turn.compactionBefore) turn.compactionBefore = carriedCompaction;
            carriedCompaction = void 0;
            folded.push(turn);
          }
        }
        this.turns = folded;
        const dir = this.cwd.split("/").filter(Boolean).pop();
        const title = this.firstQuestion?.split("\n")[0].slice(0, 60) || ["codex", dir, this.day].filter(Boolean).join(" \xB7 ");
        return { sessionId: this.sessionId, title, turns: dropSelfCommandTurns(this.turns), subagent: !!this.parentThreadId, ...this.cwd ? { cwd: this.cwd } : {} };
      }
      toConversation() {
        const s = this.finish();
        if (!s || s.turns.length === 0) return null;
        return {
          title: s.title,
          messageCount: s.turns.length,
          source: "codex",
          sessionId: s.sessionId,
          build: () => buildGraphFromTurns2(s.turns, s.sessionId, s.cwd),
          adopt: (subs) => adoptSubagentSessions(s.turns, subs)
        };
      }
      /** This rollout as a child thread's transcript, for the parent named in its header to adopt. */
      toSubagentSession() {
        const s = this.finish();
        if (!s || s.turns.length === 0 || !s.subagent) return null;
        const first = s.turns[0];
        const at = first.at ?? this.startedAt ?? void 0;
        return { runner: "codex", sessionId: s.sessionId, firstQuestion: this.firstQuestion ?? first.question, turns: s.turns, ...s.cwd ? { cwd: s.cwd } : {}, ...at ? { at } : {} };
      }
    };
  }
});

// src/lib/adapters/dsh-session.ts
function resultFailed(data) {
  if (!data) return false;
  if (data.error) return true;
  const parts = data.message?.content;
  return Array.isArray(parts) && parts.some((p) => !!p && typeof p === "object" && p.isError === true);
}
function partsText(content, depth = 0) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content) || depth > 2) return "";
  return content.map((p) => {
    if (!p || typeof p !== "object") return "";
    const o = p;
    if (o.type === "text" && typeof o.text === "string") return o.text;
    if (o.type === "image") return "[image omitted]";
    if (o.type === "reasoning") return "";
    return partsText(o.text ?? o.content, depth + 1);
  }).filter(Boolean).join("\n");
}
function renderRootCall(name, argumentsJson, args2) {
  const op = toolOpOf(name);
  if (op === "run" || /^run_code$/i.test(name)) {
    const a = args2 ?? {};
    return clipText(typeof a.code === "string" ? a.code : argumentsJson, ARTIFACT_CALL_LIMIT);
  }
  const body = args2 && typeof args2 === "object" ? renderCall(name, args2) : argumentsJson;
  return clipText(body, op === "write" || op === "edit" ? ARTIFACT_CALL_LIMIT : TOOL_CALL_LIMIT);
}
function buildGraphFromTurns3(turns, sessionId, cwd) {
  const origin = cwd ? { cwd } : {};
  const nodes = [];
  const edges = [];
  let prev = null;
  for (const turn of turns) {
    const node = makeNode(turn.question || "(tool-only turn)", turn.response, prev === null);
    node.data.importSource = { runner: "dsh", sessionId, itemIds: turn.itemIds, ...origin };
    node.data.source = { question: node.data.question, response: node.data.response };
    node.data.attachments = toolAttachments(turn);
    seedPlaque(node);
    nodes.push(node);
    if (prev) edges.push({ id: generateId(), source: prev.id, target: node.id, type: "smoothstep" });
    prev = node;
  }
  return { nodes: autoLayout(nodes, edges), edges };
}
var parseArgs, DshSessionCollector;
var init_dsh_session = __esm({
  "src/lib/adapters/dsh-session.ts"() {
    init_define_import_meta_env();
    init_import_chat();
    init_layout();
    init_utils();
    init_shared();
    parseArgs = (json) => {
      try {
        return JSON.parse(json ?? "");
      } catch {
        return void 0;
      }
    };
    DshSessionCollector = class {
      turns = [];
      pendingTools = /* @__PURE__ */ new Map();
      current = null;
      sessionId = null;
      cwd = null;
      title = null;
      firstQuestion = null;
      feedLine(raw) {
        const t = raw.trim();
        if (!t) return;
        let line;
        try {
          line = JSON.parse(t);
        } catch {
          return;
        }
        this.feed(line);
      }
      flush() {
        const c = this.current;
        if (c && (c.question || c.response || c.tools.length)) this.turns.push(c);
        this.current = null;
      }
      ensure() {
        if (!this.current) this.current = { question: "", response: "", itemIds: [], tools: [] };
        return this.current;
      }
      feed(line) {
        if (line.type === "session" && line.id && !("timestamp" in line)) {
          if (!this.sessionId) this.sessionId = line.id;
          if (line.cwd && !this.cwd) this.cwd = line.cwd;
          return;
        }
        if (line.type === "session/title" && line.data?.title && !this.title) {
          this.title = line.data.title;
          return;
        }
        if (line.type === "user/message") {
          const um = line;
          const kind = um.data?.source?.kind;
          if (kind && kind !== "user") return;
          const text3 = partsText(um.data?.content).trim();
          if (!text3) return;
          if (!this.firstQuestion) this.firstQuestion = text3.split("\n")[0].slice(0, 80);
          this.flush();
          const t = this.ensure();
          t.question = text3;
          t.itemIds = [um.data?.id ?? `u${um.seq}`];
          if (um.time) t.at = new Date(um.time).toISOString();
          return;
        }
        if (line.type === "assistant/message" && this.current) {
          const am = line;
          const parts = am.data?.message?.content;
          const text3 = partsText(parts).trim();
          const id2 = am.data?.message?.id;
          if (id2) this.current.itemIds.push(id2);
          if (text3) this.current.response = this.current.response ? `${this.current.response}

${text3}` : text3;
          return;
        }
        if (line.type === "tool/call") {
          const tc = line;
          if (!tc.data?.callId || !tc.data?.name) return;
          const op = /^run_code$/i.test(tc.data.name) ? "run" : toolOpOf(tc.data.name);
          const args2 = parseArgs(tc.data.arguments);
          const call2 = renderRootCall(tc.data.name, tc.data.arguments ?? "", args2);
          const scope = op === "run" ? {} : toolScope(args2);
          this.pendingTools.set(tc.data.callId, { name: tc.data.name, call: call2.text, truncated: call2.truncated, op, paths: op === "run" ? [] : toolPaths(args2), ...scope });
          return;
        }
        if (line.type === "tool/result") {
          const tr = line;
          const callId = tr.data?.message?.source?.callId;
          if (!callId) return;
          const reg = this.pendingTools.get(callId);
          if (!reg) return;
          const res = clipText(partsText(tr.data?.message?.content), TOOL_RESULT_LIMIT);
          const t = this.ensure();
          const failed = resultFailed(tr.data);
          t.tools.push({
            name: reg.name,
            call: reg.call,
            result: res.text,
            truncated: reg.truncated || res.truncated,
            op: failed ? "other" : reg.op,
            nativeCallId: callId,
            ...failed ? {} : { ...reg.paths.length ? { paths: reg.paths } : {}, ...reg.url ? { url: reg.url } : {}, ...reg.locator ? { locator: reg.locator } : {} }
          });
          this.pendingTools.delete(callId);
          return;
        }
        if (line.type === "tool/code-dispatch" || line.type === "tool/ptc-dispatch") {
          const d = line.data;
          if (!d?.name || !d.subCallId) return;
          const paths = toolPaths(d.arguments);
          const scope = toolScope(d.arguments);
          if (!paths.length && !scope.url) return;
          if (d.isError === true) {
            const attempt = clipText(renderCall(d.name, d.arguments), TOOL_CALL_LIMIT);
            const err = clipText(partsText(d.content), TOOL_RESULT_LIMIT);
            this.ensure().tools.push({ name: d.name, call: attempt.text, result: err.text, truncated: attempt.truncated || err.truncated, op: "other", nativeCallId: d.subCallId });
            return;
          }
          const op = toolOpOf(d.name);
          const call2 = clipText(renderCall(d.name, d.arguments), op === "write" || op === "edit" ? ARTIFACT_CALL_LIMIT : TOOL_CALL_LIMIT);
          const res = clipText(partsText(d.content), TOOL_RESULT_LIMIT);
          this.ensure().tools.push({
            name: d.name,
            call: call2.text,
            result: res.text,
            truncated: call2.truncated || res.truncated,
            op,
            nativeCallId: d.subCallId,
            ...paths.length ? { paths } : {},
            ...scope.url ? { url: scope.url } : {},
            ...scope.locator ? { locator: scope.locator } : {}
          });
          return;
        }
      }
      finish() {
        this.flush();
        if (!this.sessionId) return null;
        const asked = this.firstQuestion ?? null;
        const title = this.title ?? asked ?? `session ${this.sessionId.replace(/^session-/, "").slice(0, 8)}`;
        return { sessionId: this.sessionId, title, turns: dropSelfCommandTurns(this.turns), ...this.cwd ? { cwd: this.cwd } : {} };
      }
      toConversation() {
        const s = this.finish();
        if (!s || s.turns.length === 0) return null;
        return {
          title: s.title,
          messageCount: s.turns.length,
          source: "dsh",
          sessionId: s.sessionId,
          build: () => buildGraphFromTurns3(s.turns, s.sessionId, s.cwd)
        };
      }
    };
  }
});

// src/lib/adapters/pi-session.ts
function renderCall2(name, args2) {
  const a = args2 && typeof args2 === "object" ? args2 : {};
  const op = toolOpOf(name);
  const paths = typeof a.path === "string" && a.path && (op === "read" || op === "edit" || op === "write") ? [a.path] : [];
  let locator;
  if (op === "read" && (typeof a.offset === "number" || typeof a.limit === "number")) {
    const start = Math.max(1, typeof a.offset === "number" ? a.offset : 1);
    const end = typeof a.limit === "number" ? start + Math.max(0, a.limit) - 1 : start;
    locator = { lines: [start, Math.max(start, end)] };
  }
  if (op === "write" && typeof a.content === "string") {
    const c2 = clipText(`${a.path ?? ""}

${a.content}`, ARTIFACT_CALL_LIMIT);
    return { ...c2, paths };
  }
  if (op === "edit") {
    const edits = Array.isArray(a.edits) ? a.edits : typeof a.newText === "string" ? [{ oldText: a.oldText, newText: a.newText }] : [];
    if (edits.length) {
      const body = edits.map((e) => `${a.path ?? ""}
--- old
${e.oldText ?? ""}
+++ new
${e.newText ?? ""}`).join("\n\n");
      const c2 = clipText(body, ARTIFACT_CALL_LIMIT);
      return { ...c2, paths };
    }
  }
  if (op === "run" && typeof a.command === "string") {
    const c2 = clipText(a.command, TOOL_CALL_LIMIT);
    return { ...c2, paths };
  }
  const c = clipText(JSON.stringify(args2 ?? {}), TOOL_CALL_LIMIT);
  return { ...c, paths, ...locator ? { locator } : {} };
}
function subagentRuns(args2, content, details, callId) {
  const d = details;
  if (Array.isArray(d?.results) && d.results.length) {
    return d.results.map((r, i) => ({ agent: String(r.agent ?? "agent"), task: String(r.task ?? ""), output: finalOutput(r.messages) || String(r.stderr ?? "").trim(), itemIds: [`${callId}#${i}`] }));
  }
  const a = args2 && typeof args2 === "object" ? args2 : {};
  const asked = Array.isArray(a.tasks) && a.tasks.length ? a.tasks : Array.isArray(a.chain) && a.chain.length ? a.chain : a.agent || a.task ? [{ agent: a.agent, task: a.task }] : [];
  const text3 = textOf(content).trim();
  return asked.map((x, i) => ({ agent: String(x.agent ?? "agent"), task: String(x.task ?? ""), output: asked.length === 1 ? text3 : "", itemIds: [`${callId}#${i}`] }));
}
function buildGraphFromTurns4(turns, sessionId, cwd) {
  const origin = cwd ? { cwd } : {};
  const nodes = [];
  const edges = [];
  const byItem = /* @__PURE__ */ new Map();
  const link2 = (a, b) => edges.push({ id: generateId(), source: a.id, target: b.id, type: "smoothstep" });
  let prev = null;
  for (const turn of turns) {
    const node = makeNode(turn.question || "(tool-only turn)", turn.response, prev === null);
    node.data.importSource = { runner: "pi", sessionId, itemIds: turn.itemIds, ...origin };
    node.data.source = { question: node.data.question, response: node.data.response };
    node.data.attachments = toolAttachments(turn);
    seedPlaque(node);
    nodes.push(node);
    const parent = turn.parentItemId ? byItem.get(turn.parentItemId) : void 0;
    if (parent) link2(parent, node);
    else if (prev) link2(prev, node);
    attachSubagentBranches(node, turn, nodes, edges, "pi", sessionId, cwd);
    for (const id2 of turn.itemIds) byItem.set(id2, node);
    prev = node;
  }
  return { nodes: autoLayout(nodes, edges), edges };
}
var textOf, finalOutput, PiSessionCollector;
var init_pi_session = __esm({
  "src/lib/adapters/pi-session.ts"() {
    init_define_import_meta_env();
    init_import_chat();
    init_layout();
    init_utils();
    init_shared();
    textOf = (content) => {
      if (typeof content === "string") return content;
      if (!Array.isArray(content)) return "";
      return content.filter((b) => b && b.type === "text" && typeof b.text === "string").map((b) => b.text).join("\n");
    };
    finalOutput = (messages) => {
      if (!Array.isArray(messages)) return "";
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (m?.role === "assistant") {
          const text3 = textOf(m.content).trim();
          if (text3) return text3;
        }
      }
      return "";
    };
    PiSessionCollector = class {
      turns = [];
      pending = /* @__PURE__ */ new Map();
      current = null;
      sessionId = null;
      cwd = null;
      firstQuestion = null;
      feedLine(raw) {
        const t = raw.trim();
        if (!t) return;
        let e;
        try {
          e = JSON.parse(t);
        } catch {
          return;
        }
        this.feed(e);
      }
      flush() {
        const c = this.current;
        if (c && (c.question || c.response || c.tools.length)) this.turns.push(c);
        this.current = null;
      }
      feed(e) {
        if (e.type === "session" && typeof e.id === "string") {
          if (!this.sessionId) this.sessionId = e.id;
          if (typeof e.cwd === "string" && !this.cwd) this.cwd = e.cwd;
          return;
        }
        if (e.type !== "message") {
          if (this.current && typeof e.id === "string") this.current.itemIds.push(e.id);
          return;
        }
        const m = e.message;
        if (!m) return;
        if (m.role === "user") {
          const text3 = textOf(m.content).trim();
          if (!text3) return;
          this.flush();
          if (!this.firstQuestion) this.firstQuestion = text3.split("\n")[0].slice(0, 80);
          const at = typeof e.timestamp === "string" ? e.timestamp : typeof m.timestamp === "number" ? new Date(m.timestamp).toISOString() : void 0;
          this.current = {
            question: text3,
            response: "",
            itemIds: typeof e.id === "string" ? [e.id] : [],
            tools: [],
            ...typeof e.parentId === "string" ? { parentItemId: e.parentId } : {},
            ...at ? { at } : {}
          };
          return;
        }
        if (m.role === "assistant") {
          const cur = this.current ?? (this.current = { question: "", response: "", itemIds: [], tools: [] });
          if (typeof e.id === "string") cur.itemIds.push(e.id);
          const text3 = textOf(m.content).trim();
          if (text3) cur.response = cur.response ? `${cur.response}

${text3}` : text3;
          if (Array.isArray(m.content)) {
            for (const b of m.content) {
              if (b?.type !== "toolCall" || typeof b.id !== "string" || typeof b.name !== "string") continue;
              const r = renderCall2(b.name, b.arguments);
              this.pending.set(b.id, { name: b.name, call: r.text, truncated: r.truncated, op: toolOpOf(b.name), paths: r.paths, ...r.locator ? { locator: r.locator } : {}, ...b.name === "subagent" ? { args: b.arguments } : {} });
            }
          }
          return;
        }
        if (m.role === "toolResult") {
          const id2 = m.toolCallId;
          if (!id2) return;
          const reg = this.pending.get(id2);
          if (!reg) return;
          const cur = this.current ?? (this.current = { question: "", response: "", itemIds: [], tools: [] });
          if (typeof e.id === "string") cur.itemIds.push(e.id);
          const res = clipText(textOf(m.content), TOOL_RESULT_LIMIT);
          cur.tools.push({
            name: reg.name,
            call: reg.call,
            result: res.text,
            truncated: reg.truncated || res.truncated,
            op: reg.op,
            nativeCallId: id2,
            ...reg.paths.length ? { paths: reg.paths } : {},
            ...reg.locator ? { locator: reg.locator } : {}
          });
          if (reg.name === "subagent") {
            const runs = subagentRuns(reg.args, m.content, m.details, id2);
            if (runs.length) cur.subagents = [...cur.subagents ?? [], ...runs];
          }
          this.pending.delete(id2);
        }
      }
      finish() {
        this.flush();
        if (!this.sessionId) return null;
        const title = this.firstQuestion ?? `session ${this.sessionId.slice(0, 8)}`;
        return { sessionId: this.sessionId, title, turns: dropSelfCommandTurns(this.turns), ...this.cwd ? { cwd: this.cwd } : {} };
      }
      toConversation() {
        const s = this.finish();
        if (!s || s.turns.length === 0) return null;
        return {
          title: s.title,
          messageCount: s.turns.length,
          source: "pi",
          sessionId: s.sessionId,
          build: () => buildGraphFromTurns4(s.turns, s.sessionId, s.cwd)
        };
      }
    };
  }
});

// src/lib/adapters/dsh-zstd.ts
function scanZstdFrames(buf) {
  const frames = [];
  const u32 = (o) => (buf[o] | buf[o + 1] << 8 | buf[o + 2] << 16 | buf[o + 3] << 24) >>> 0;
  let offset = 0;
  while (offset < buf.length) {
    const start = offset;
    if (buf.length - offset < 4) break;
    if (u32(offset) !== ZSTD_MAGIC) return frames;
    offset += 4;
    if (offset >= buf.length) break;
    const descriptor = buf[offset];
    offset += 1;
    const contentSizeFlag = descriptor >>> 6;
    const singleSegment = (descriptor & 32) !== 0;
    const checksum = (descriptor & 4) !== 0;
    const dictFlag = descriptor & 3;
    const dictBytes = dictFlag === 3 ? 4 : dictFlag;
    const contentSizeBytes = contentSizeFlag === 0 ? singleSegment ? 1 : 0 : 1 << contentSizeFlag;
    const restOfHeader = (singleSegment ? 0 : 1) + dictBytes + contentSizeBytes;
    if (buf.length - offset < restOfHeader) break;
    offset += restOfHeader;
    for (; ; ) {
      if (buf.length - offset < 3) return frames;
      const header = buf[offset] | buf[offset + 1] << 8 | buf[offset + 2] << 16;
      offset += 3;
      const last = (header & 1) !== 0;
      const type = header >>> 1 & 3;
      const size = header >>> 3;
      const payload = type === 1 ? 1 : size;
      if (buf.length - offset < payload) return frames;
      offset += payload;
      if (last) break;
    }
    if (checksum) {
      if (buf.length - offset < 4) return frames;
      offset += 4;
    }
    frames.push({ start, end: offset });
  }
  return frames;
}
function decompressZstdFrames(buf, inflate) {
  const parts = scanZstdFrames(buf).map((f) => inflate(buf.subarray(f.start, f.end)));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
var ZSTD_MAGIC;
var init_dsh_zstd = __esm({
  "src/lib/adapters/dsh-zstd.ts"() {
    init_define_import_meta_env();
    ZSTD_MAGIC = 4247762216;
  }
});

// src/lib/events/manifests.ts
var OBS_FULL2, OBS_PART2, UNKNOWN, CLAUDE_CODE_MANIFEST, CODEX_MANIFEST, WEFT_MANIFEST, PI_MANIFEST, DSH_MANIFEST, MANIFESTS;
var init_manifests = __esm({
  "src/lib/events/manifests.ts"() {
    init_define_import_meta_env();
    OBS_FULL2 = { basis: "observed", completeness: "full" };
    OBS_PART2 = { basis: "observed", completeness: "partial" };
    UNKNOWN = { basis: "inferred", completeness: "unknown" };
    CLAUDE_CODE_MANIFEST = {
      runner: "claude-code",
      schema: "cc-jsonl/2026-09",
      turns: OBS_FULL2,
      parenting: OBS_FULL2,
      // parentUuid is written on every message
      messages: OBS_PART2,
      // one assistant record per turn
      toolPairing: OBS_FULL2,
      // tool_use.id ↔ tool_result.tool_use_id
      artifactTouch: OBS_PART2,
      // shell commands are not parsed for files
      compaction: OBS_PART2,
      // the boundary is marked; what it replaced is not
      contextSurface: UNKNOWN
    };
    CODEX_MANIFEST = {
      runner: "codex",
      schema: "codex-rollout/2026-09",
      turns: OBS_FULL2,
      parenting: OBS_PART2,
      // rollouts are linear; forks live in the app-server thread store
      messages: OBS_PART2,
      toolPairing: OBS_FULL2,
      // call_id pairs function_call with its output
      artifactTouch: OBS_PART2,
      // only apply_patch names files
      compaction: OBS_PART2,
      contextSurface: UNKNOWN
    };
    WEFT_MANIFEST = {
      runner: "weft",
      schema: "weft-canvas/1",
      turns: OBS_FULL2,
      parenting: OBS_FULL2,
      // the wires ARE the structure
      messages: OBS_FULL2,
      // hand-made nodes carry their text whole
      toolPairing: UNKNOWN,
      // no tools run on the canvas
      artifactTouch: OBS_FULL2,
      // attachments and references are explicit
      compaction: UNKNOWN,
      // condensing is a new node, not a replacement
      contextSurface: OBS_PART2
      // exact for logged commits, upstream-only before
    };
    PI_MANIFEST = {
      runner: "pi",
      schema: "pi-session/v3",
      turns: OBS_FULL2,
      // one user message opens every turn
      parenting: OBS_FULL2,
      // every entry names its parent; the session is a tree
      messages: OBS_PART2,
      // assistant text blocks fold per turn; thinking is dropped
      toolPairing: OBS_FULL2,
      // toolCall blocks ↔ toolResult messages pair by toolCallId
      artifactTouch: OBS_FULL2,
      // `path` on read/edit/write; shell commands stay opaque, as for every runner
      compaction: UNKNOWN,
      // not projected yet
      contextSurface: UNKNOWN
      // the log records messages, not requests
    };
    DSH_MANIFEST = {
      runner: "dsh",
      schema: "dsh-events/2026-09",
      turns: OBS_FULL2,
      // user/message events (source.kind=user) bound every turn
      parenting: OBS_FULL2,
      // turns are linear; a continued session is a new file
      messages: OBS_PART2,
      // assistant text folds per step; reasoning is dropped
      toolPairing: OBS_FULL2,
      // tool/call ↔ tool/result pair by callId
      artifactTouch: OBS_FULL2,
      // file_path on read/write/edit — top-level calls and run_code dispatches alike; shell commands stay opaque, as for every runner
      compaction: UNKNOWN,
      // no boundary event observed in the log yet
      contextSurface: OBS_PART2
      // request/context carries provider+model+window, never messages
    };
    MANIFESTS = {
      "claude-code": CLAUDE_CODE_MANIFEST,
      codex: CODEX_MANIFEST,
      dsh: DSH_MANIFEST,
      pi: PI_MANIFEST,
      weft: WEFT_MANIFEST
    };
  }
});

// src/lib/legacy-names.ts
var LEGACY_NAMES, ALT, QUOTED, LEADING, URIS, CANVAS_FILE_SUFFIX, stripCanvasSuffix;
var init_legacy_names = __esm({
  "src/lib/legacy-names.ts"() {
    init_define_import_meta_env();
    LEGACY_NAMES = ["thoughtpath", "thoughtdag"];
    ALT = LEGACY_NAMES.join("|");
    QUOTED = new RegExp(`(\\\\*")(?:${ALT})(?=[.:"\\\\-])`, "g");
    LEADING = new RegExp(`^(?:${ALT})(?=[.:-]|$)`);
    URIS = new RegExp(`\\b(?:${ALT})(?=://|:attachment/)`, "g");
    CANVAS_FILE_SUFFIX = new RegExp(`\\.(?:weft|${ALT})\\.json$`, "i");
    stripCanvasSuffix = (name) => name.replace(CANVAS_FILE_SUFFIX, "");
  }
});

// src/lib/adapters/weft-canvas.ts
function isCanvasBackup(v) {
  return !!v && typeof v === "object" && Array.isArray(v.nodes) && Array.isArray(v.edges);
}
function canvasNativeId(file) {
  const base = file.replace(/\\/g, "/").split("/").pop() ?? file;
  return stripCanvasSuffix(base);
}
function canvasToEvents(backup, opts) {
  const nativeId = backup.projectId?.trim() || canvasNativeId(opts.file);
  const sid = sessionKey("weft", nativeId);
  const sourceId = opts.sourceId ?? opts.file;
  const schema = WEFT_MANIFEST.schema;
  const src = (ref) => ({ runner: "weft", file: opts.file, ref, schema });
  const out = [];
  const texts = /* @__PURE__ */ new Map();
  const title = backup.name?.trim() || nativeId;
  const started = {
    id: `${sid}/session@${fragmentTag(sourceId)}`,
    kind: "session.started",
    sessionId: sid,
    source: src("canvas"),
    ...OBS_FULL3,
    runner: "weft",
    nativeId,
    sourceId,
    title,
    ...backup.exportedAt ? { at: backup.exportedAt } : {}
  };
  out.push(started);
  const turnIdOf = (nodeId) => `${sid}#${nodeId}`;
  const kept = backup.nodes.filter((n) => !n.data.archived);
  const index = /* @__PURE__ */ new Map();
  kept.forEach((n, i) => index.set(n.id, i));
  for (const n of kept) {
    const d = n.data;
    const tid = turnIdOf(n.id);
    const i = index.get(n.id) ?? 0;
    const at = d.createdAt ?? d.lastGeneratedAt;
    const base = { sessionId: sid, turnId: tid, turnIndex: i, ...at ? { at } : {} };
    const mirror = d.importSource ? { sessionId: sessionKey(d.importSource.runner, d.importSource.sessionId), item: d.importSource.itemIds[0] ?? n.id } : void 0;
    const isMaterial = d.stepKind === "file" || d.stepKind === "link" || d.stepKind === "frame";
    const isNote = d.stepKind === "note";
    const ts = {
      id: `${tid}/turn`,
      kind: "turn.started",
      ...base,
      source: src(n.id),
      ...OBS_FULL3,
      humanAuthored: !isMaterial,
      ...mirror ? { mirrorOf: mirror } : {}
    };
    out.push(ts);
    if (isMaterial) {
      const held = (d.attachments ?? []).filter((a) => !a.name.startsWith("tool: ")).map((a) => a.name);
      texts.set(tid, { question: held.length ? `[${d.stepKind}] ${held.join(", ")}` : `[${d.stepKind}] ${clip4(d.question ?? "", 80)}`, response: "" });
    }
    if (!mirror && !isMaterial) {
      texts.set(tid, { question: d.question ?? "", response: d.response ?? "" });
      if (d.question?.trim()) {
        const m = {
          id: `${tid}/q`,
          kind: "message.recorded",
          ...base,
          source: src(`${n.id}:question`),
          ...OBS_FULL3,
          role: isNote ? "custom" : "user",
          actor: "human",
          modelVisible: true,
          excerpt: clip4(d.question),
          length: d.question.length
        };
        out.push(m);
      }
      if (d.response?.trim() && !isNote) {
        const model = d.generatedBy?.[d.responseIndex ?? 0] ?? void 0;
        const a = {
          id: `${tid}/a`,
          kind: "message.recorded",
          ...base,
          source: src(`${n.id}:response`),
          ...OBS_FULL3,
          ...d.lastGeneratedAt ? { at: d.lastGeneratedAt } : {},
          role: "assistant",
          actor: model ? "model" : "unknown",
          modelVisible: true,
          excerpt: clip4(d.response),
          length: d.response.length
        };
        out.push(a);
      }
    }
    if (mirror && d.source) {
      for (const field of ["question", "response"]) {
        const now = d[field] ?? "";
        const was = d.source[field] ?? "";
        if (now !== was) {
          const e = {
            id: `${tid}/edit:${field}`,
            kind: "record.edited",
            ...base,
            source: src(`${n.id}:${field}`),
            ...OBS_FULL3,
            field,
            excerpt: clip4(now),
            length: now.length
          };
          out.push(e);
        }
      }
    }
    for (const h of d.highlights ?? []) {
      const visible = d.highlightMode === "filter" || d.highlightMode === "tag";
      const m = {
        id: `${tid}/hl:${h.id}`,
        kind: "message.recorded",
        ...base,
        ...h.at ? { at: h.at } : {},
        source: src(`${n.id}:highlight:${h.id}`),
        ...OBS_FULL3,
        role: "custom",
        actor: "human",
        modelVisible: visible,
        excerpt: clip4(h.text),
        length: h.text.length
      };
      out.push(m);
    }
    const excluded = new Set(d.excludedAttachmentIds ?? []);
    for (const att of d.attachments ?? []) {
      if (att.name.startsWith("tool: ") || att.op) continue;
      const artifact = {
        id: `weft:attachment/${att.id}`,
        observedPath: att.name,
        ...d.anchor && d.anchor.attId === att.id ? { locator: { pages: String(d.anchor.page) } } : {}
      };
      const e = {
        id: `${tid}/att:${att.id}`,
        kind: "artifact.attached",
        ...base,
        ...att.addedAt ? { at: att.addedAt } : {},
        source: src(`${n.id}:attachment:${att.id}`),
        ...OBS_FULL3,
        artifact,
        via: "attachment",
        mediaType: att.type,
        inContext: !excluded.has(att.id)
      };
      out.push(e);
    }
    if (d.anchor?.attId && !(d.attachments ?? []).some((a) => a.id === d.anchor?.attId)) {
      const e = {
        id: `${tid}/anchor`,
        kind: "artifact.attached",
        ...base,
        source: src(`${n.id}:anchor`),
        ...OBS_FULL3,
        artifact: { id: `weft:attachment/${d.anchor.attId}`, locator: { pages: String(d.anchor.page) } },
        via: "anchor",
        inContext: "unknown"
      };
      out.push(e);
    }
    for (const [k, r] of (d.references ?? []).entries()) {
      const a = r.url ? urlArtifact(r.url) : null;
      if (!a) continue;
      const e = {
        id: `${tid}/ref:${k}`,
        kind: "artifact.attached",
        ...base,
        source: src(`${n.id}:reference:${k}`),
        ...OBS_FULL3,
        artifact: a,
        via: "reference",
        inContext: "unknown"
      };
      out.push(e);
    }
    const material = (d.attachments ?? []).filter((a) => !a.name.startsWith("tool: ") && !a.op && typeof a.extractedText === "string" && a.extractedText.trim()).map((a) => `[${a.name}]
${a.extractedText.slice(0, 4e3)}`).join("\n\n");
    if (material) {
      const prev = texts.get(tid) ?? { question: "", response: "" };
      texts.set(tid, { ...prev, material });
    }
    if (d.lastContextHash && !mirror) {
      const c = {
        id: `${tid}/ctx:upstream`,
        kind: "context.committed",
        ...base,
        ...d.lastGeneratedAt ? { at: d.lastGeneratedAt } : {},
        source: src(`${n.id}:lastContextHash`),
        ...OBS_PART3,
        requestId: `${n.id}@${d.lastGeneratedAt ?? "unknown"}`,
        members: [],
        contentHash: d.lastContextHash,
        hashOf: "upstream",
        decidedBy: "user",
        confirmed: true
      };
      out.push(c);
    }
  }
  for (const e of backup.edges) {
    if (!index.has(e.source) || !index.has(e.target)) continue;
    const ev = {
      id: `${sid}/edge:${e.id}`,
      kind: "edge.recorded",
      sessionId: sid,
      source: src(e.id),
      ...OBS_FULL3,
      edgeType: "context",
      via: e.data?.isCrossLink ? "reference" : "mainline",
      fromTurnId: turnIdOf(e.source),
      toTurnId: turnIdOf(e.target)
    };
    out.push(ev);
  }
  for (const ev of backup.events ?? []) {
    if (ev.op !== "commit" || !ev.id || !ev.d || !index.has(ev.id)) continue;
    const sha = typeof ev.d.sha === "string" ? ev.d.sha : "";
    if (!sha) continue;
    const kind = ev.d.kind === "bundle" ? "bundle" : "request";
    const members = typeof ev.d.m === "string" && ev.d.m ? ev.d.m.split(",").filter(Boolean).map((nodeId) => ({ nodeId })) : [];
    const truncated = ev.d.more === true;
    const c = {
      id: `${sid}/commit:${ev.id}@${ev.t}${kind === "bundle" ? ":bundle" : ""}`,
      kind: "context.committed",
      sessionId: sid,
      turnId: turnIdOf(ev.id),
      turnIndex: index.get(ev.id) ?? 0,
      at: ev.t,
      source: src(`event:commit:${ev.id}@${ev.t}`),
      basis: "observed",
      completeness: truncated || !members.length ? "partial" : "full",
      requestId: typeof ev.d.bundle === "string" ? ev.d.bundle : `${ev.id}@${ev.t}`,
      members,
      contentHash: sha.startsWith("sha256:") ? sha : `sha256:${sha}`,
      hashOf: kind,
      ...typeof ev.d.n === "number" ? { messageCount: ev.d.n } : {},
      ...typeof ev.d.model === "string" && ev.d.model ? { model: ev.d.model } : {},
      decidedBy: "user",
      confirmed: true
    };
    out.push(c);
  }
  return { sessionId: sid, nativeId, title, events: out, texts };
}
var OBS_FULL3, OBS_PART3, clip4;
var init_weft_canvas = __esm({
  "src/lib/adapters/weft-canvas.ts"() {
    init_define_import_meta_env();
    init_project();
    init_manifests();
    init_legacy_names();
    OBS_FULL3 = { basis: "observed", completeness: "full" };
    OBS_PART3 = { basis: "observed", completeness: "partial" };
    clip4 = (s, max = EXCERPT_CHARS) => {
      const t = s.trim();
      return t.length > max ? `${t.slice(0, max)}\u2026` : t;
    };
  }
});

// cli/src/lib.ts
var lib_exports = {};
__export(lib_exports, {
  CACHE_FILE: () => CACHE_FILE,
  CLI_VERSION: () => CLI_VERSION,
  FACT_FILE: () => FACT_FILE,
  HOME: () => HOME,
  LEGACY_FILE: () => LEGACY_FILE,
  LOCK_FILE: () => LOCK_FILE,
  MCP_TOOLS: () => MCP_TOOLS,
  TEXT_FILE: () => TEXT_FILE,
  TEXT_LINES: () => TEXT_LINES,
  artifactsLine: () => artifactsLine,
  buildIndex: () => buildIndex,
  byTopicJson: () => byTopicJson,
  deleteDossier: () => deleteDossier,
  dossierAddPending: () => dossierAddPending,
  dossierJson: () => dossierJson,
  dossierNewTurns: () => dossierNewTurns,
  dossiersJson: () => dossiersJson,
  ensureFresh: () => ensureFresh,
  eventsOf: () => eventsOf,
  factsForCheck: () => factsForCheck,
  findHits: () => findHits,
  findJson: () => findJson,
  hitsFor: () => hitsFor,
  labelStart: () => labelStart,
  labelStop: () => labelStop,
  loadCache: () => loadCache,
  loadFacts: () => loadFacts,
  mcpCall: () => mcpCall,
  memoriesJson: () => memoriesJson,
  recallJson: () => recallJson,
  recallTurn: () => recallTurn,
  renderCheck: () => renderCheck,
  renderFind: () => renderFind,
  renderRecall: () => renderRecall,
  renderWhy: () => renderWhy,
  resolveQuery: () => resolveQuery,
  sampleQuestions: () => sampleQuestions,
  setDossier: () => setDossier,
  setQuiet: () => setQuiet,
  setTopics: () => setTopics,
  suggestJson: () => suggestJson,
  summarize: () => summarize,
  topicsJson: () => topicsJson,
  turnsJson: () => turnsJson,
  when: () => when,
  zstdSkipped: () => zstdSkipped
});
import * as fs from "node:fs";
import { promises as fsp, createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";
import os from "node:os";
import * as zlib from "node:zlib";
import { createHash } from "node:crypto";
async function canvasRoots() {
  const env = process.env.WEFT_CANVAS_ROOTS?.split(path.delimiter).filter(Boolean);
  if (env) return [CANVAS_RECORDS, ...env];
  try {
    const c = JSON.parse(await fsp.readFile(CONFIG_FILE, "utf8"));
    return [CANVAS_RECORDS, ...c.canvasRoots ?? []];
  } catch {
    return [CANVAS_RECORDS];
  }
}
async function rememberCanvasRoot(dir) {
  const roots = await canvasRoots();
  const abs = path.resolve(dir);
  if (!roots.includes(abs)) await writePrivate(CONFIG_FILE, { canvasRoots: [...roots, abs] });
}
async function walk(dir, depth, out, accept) {
  if (depth > 5) return;
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(p, depth + 1, out, accept);
    else if (ent.isFile() && accept(ent.name)) {
      try {
        const st = await fsp.stat(p);
        out.push({ file: p, mtime: st.mtimeMs, size: st.size });
      } catch {
      }
    }
  }
}
async function listSources() {
  const files = [];
  for (const root of ROOTS) await walk(root, 0, files, isSessionFile);
  for (const root of await canvasRoots()) await walk(root, 0, files, isCanvasFile);
  for (const { runner, root } of MEMORY_ROOTS) {
    const md = [];
    await walk(root, 0, md, (name) => name.endsWith(".md"));
    for (const m of md) if (isMemoryFile(m.file, runner)) files.push({ ...m, memory: runner });
  }
  return files;
}
async function firstLine(file) {
  const rl = createInterface({ input: createReadStream(file, { encoding: "utf8", highWaterMark: 65536 }) });
  for await (const line of rl) {
    rl.close();
    return line;
  }
  return "";
}
async function realOr(p) {
  try {
    return await fsp.realpath(p);
  } catch {
    return p;
  }
}
async function canonicalPath(p, memo) {
  const hit = memo?.get(p);
  if (hit) return hit;
  let out;
  try {
    out = await fsp.realpath(p);
  } catch {
    const parent = path.dirname(p);
    out = parent === p ? p : path.join(await canonicalPath(parent, memo), path.basename(p));
  }
  memo?.set(p, out);
  return out;
}
async function workspaceOf(dir) {
  let cur = await realOr(dir);
  for (; ; ) {
    try {
      await fsp.stat(path.join(cur, ".git"));
      return cur;
    } catch {
    }
    const up = path.dirname(cur);
    if (up === cur) return await realOr(dir);
    cur = up;
  }
}
async function canonicalArtifact(id2, memo) {
  const p = filePathOf(id2);
  return p ? fileUri(await canonicalPath(p, memo)) : id2;
}
function mentionKey(id2) {
  const p = filePathOf(id2);
  if (p) return path.basename(p);
  if (id2.startsWith("arxiv:")) return id2.slice("arxiv:".length);
  try {
    const u = new URL(id2);
    return u.pathname.split("/").filter(Boolean).pop() ?? u.hostname;
  } catch {
    return id2;
  }
}
async function displayOf(id2, names = {}) {
  const p = filePathOf(id2);
  if (!p) return names[id2] ? `${names[id2]}  (${id2})` : id2;
  const rel = path.relative(await realOr(process.cwd()), await realOr(p));
  return rel.startsWith("..") || path.isAbsolute(rel) ? p : rel;
}
function mentionOf(response, key) {
  const base = key.toLowerCase();
  if (base.length < 4) return void 0;
  const paras = response.replace(/```[\s\S]*?```/g, "").split(/\n\s*\n/).map((p) => p.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#*`>|_~]/g, "").replace(/\s+/g, " ").trim()).filter((p) => p.length > 12 && p.toLowerCase().includes(base) && !/[:：]$/.test(p) && !/^(sources?|references?|来源|参考)\b/i.test(p));
  const last = paras[paras.length - 1];
  return last ? clipLine(last, 240) : void 0;
}
function questionExcerpt(text3) {
  const cmd = text3.match(/<command-name>([^<]+)<\/command-name>/);
  const line = (cmd ? cmd[1] : text3).split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("<")) ?? "";
  return clipLine(line, EXCERPT);
}
async function eventsOf(file, sourceId) {
  if (isCanvasFile(file)) {
    let parsed;
    try {
      parsed = JSON.parse(await fsp.readFile(file, "utf8"));
    } catch {
      return null;
    }
    if (!isCanvasBackup(parsed)) return null;
    const c = canvasToEvents(parsed, { file, sourceId });
    return { runner: "weft", nativeId: c.nativeId, title: c.title, events: c.events, texts: c.texts, manifest: MANIFESTS.weft };
  }
  let meta = {};
  let lines;
  if (file.endsWith(".zstd")) {
    if (!zstdInflate) {
      zstdSkipped++;
      return null;
    }
    let raw;
    try {
      raw = await fsp.readFile(file);
    } catch {
      return null;
    }
    if (raw.length > ZSTD_MAX) return null;
    let text3;
    try {
      text3 = Buffer.from(decompressZstdFrames(raw, zstdInflate)).toString("utf8");
    } catch {
      return null;
    }
    const arr = text3.split("\n");
    try {
      meta = JSON.parse(arr[0] ?? "");
    } catch {
    }
    lines = arr;
  } else {
    try {
      meta = JSON.parse(await firstLine(file));
    } catch {
    }
    lines = createInterface({ input: createReadStream(file, { encoding: "utf8", highWaterMark: 1 << 20 }) });
  }
  const runner = meta.type === "session_meta" ? "codex" : meta.type === "session" && typeof meta.id === "string" ? typeof meta.timestamp === "string" ? "pi" : "dsh" : "claude-code";
  const collector = runner === "codex" ? new CodexSessionCollector() : runner === "dsh" ? new DshSessionCollector() : runner === "pi" ? new PiSessionCollector() : new ClaudeSessionCollector();
  for await (const line of lines) collector.feedLine(line);
  const s = collector.finish();
  if (!s) return null;
  const subagent = "subagent" in s ? !!s.subagent : runner === "claude-code" && /\/subagents\//.test(file);
  const cwd = "cwd" in s && s.cwd ? s.cwd : void 0;
  const session = {
    runner,
    nativeId: s.sessionId,
    title: s.title,
    file,
    ...sourceId ? { sourceId } : {},
    schema: MANIFESTS[runner].schema,
    ...cwd ? { cwd } : {},
    ...subagent ? { subagent } : {},
    turns: s.turns
  };
  const events = sessionToEvents(session);
  const texts = /* @__PURE__ */ new Map();
  for (const e of events) if (e.kind === "turn.started") {
    const t = s.turns[e.turnIndex];
    if (t) texts.set(e.turnId, { question: t.question, response: t.response });
  }
  const started = events.find((e) => e.kind === "session.started");
  const anchor = started?.anchor ? { project: started.anchor.project, node: started.anchor.node, bundle: started.anchor.bundle } : void 0;
  return { runner, nativeId: s.sessionId, title: s.title, ...anchor ? { anchor } : {}, ...cwd ? { cwd } : {}, ...subagent ? { subagent } : {}, events, texts, manifest: MANIFESTS[runner], turns: s.turns };
}
async function parseSession(f) {
  if (f.memory) return parseMemory(f, f.memory);
  const memo = /* @__PURE__ */ new Map();
  const sourceId = await canonicalPath(f.file, memo);
  const p = await eventsOf(f.file, sourceId);
  if (!p) return null;
  const cwd = p.cwd ? await canonicalPath(p.cwd, memo) : "";
  const workspace = cwd ? await workspaceOf(cwd) : "";
  const names = {};
  const opsByTurn = /* @__PURE__ */ new Map();
  for (const t of deriveTouches(p.events)) {
    const id2 = await canonicalArtifact(t.artifact, memo);
    const ops = opsByTurn.get(t.turnId) ?? opsByTurn.set(t.turnId, {}).get(t.turnId);
    const prev = ops[id2];
    const d = prev?.d ?? t.change;
    const l = [...prev?.l ?? [], ...t.locators ?? []].filter((x, i, arr) => arr.findIndex((y) => JSON.stringify(y) === JSON.stringify(x)) === i);
    ops[id2] = { op: strongest(prev?.op, t.op), ...d ? { d } : {}, ...l.length ? { l } : {} };
  }
  for (const e of p.events) if (e.kind === "artifact.attached" && e.artifact.observedPath && !e.artifact.id.startsWith("file://")) names[e.artifact.id] = e.artifact.observedPath;
  const bundles = {};
  for (const e of p.events) if (e.kind === "context.committed" && e.hashOf === "bundle" && e.turnId) bundles[e.requestId] = { canvas: p.nativeId, node: e.turnId.split("#").pop() ?? "" };
  const questions = /* @__PURE__ */ new Map();
  for (const e of p.events) if (e.kind === "message.recorded" && e.role === "user" && !questions.has(e.turnId)) questions.set(e.turnId, e.excerpt);
  const turns = [];
  const cache = {};
  const text_ = {};
  let lastSubstantive = "";
  const starts = p.events.filter((e) => e.kind === "turn.started").sort((a, b) => a.turnIndex - b.turnIndex);
  for (const ts of starts) {
    const text3 = p.texts.get(ts.turnId);
    const q = text3 ? questionExcerpt(text3.question) : questions.get(ts.turnId) ?? (ts.mirrorOf ? "(mirrored turn)" : "");
    const item = ts.mirrorOf?.item ?? (p.runner === "weft" ? ts.turnId : ts.turnId.split("#").pop());
    turns.push({ i: ts.turnIndex, t: ts.turnId, ...item ? { item } : {}, ...ts.at ? { at: ts.at } : {}, q, ops: opsByTurn.get(ts.turnId) ?? {} });
    if (!text3) continue;
    if (text3.question.trim() || text3.response.trim() || text3.material?.trim()) {
      text_[String(ts.turnIndex)] = { q: text3.question, a: text3.response, ...text3.material ? { m: text3.material } : {} };
    }
    const entry = {};
    const con = conclusionOf(text3.response, 240);
    if (con) entry.c = con;
    if (q.length < 12 && lastSubstantive) entry.p = lastSubstantive;
    if (q.length >= 12) lastSubstantive = q;
    for (const id2 of Object.keys(opsByTurn.get(ts.turnId) ?? {})) {
      const m = mentionOf(text3.response, mentionKey(names[id2] ? `file://${names[id2]}` : id2));
      if (m) (entry.m ??= {})[id2] = m;
    }
    if (Object.keys(entry).length) cache[String(ts.turnIndex)] = entry;
  }
  return {
    fact: { id: p.nativeId, runner: p.runner, file: f.file, mtime: f.mtime, size: f.size, cwd, workspace, title: p.title, ...p.subagent ? { subagent: true } : {}, ...p.anchor ? { anchor: p.anchor } : {}, turns },
    cache,
    text: text_,
    names,
    bundles
  };
}
function frontmatterOf(text3) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text3);
  if (!m) return { meta: {}, body: text3 };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^\s*([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv && kv[2].trim()) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: text3.slice(m[0].length) };
}
function sectionsOf(text3, level) {
  const out = [];
  const lines = text3.split(/\r?\n/);
  let cur = null;
  const isBoundary = (line) => {
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    return m && m[1].length <= level ? m[1].length : null;
  };
  for (const line of lines) {
    const lvl = isBoundary(line);
    if (lvl === level) {
      if (cur) out.push({ heading: cur.heading, body: cur.body.join("\n").trim() });
      cur = { heading: line.replace(/^#+\s+/, "").trim(), body: [] };
      continue;
    }
    if (lvl !== null && lvl < level) {
      if (cur) out.push({ heading: cur.heading, body: cur.body.join("\n").trim() });
      cur = null;
      continue;
    }
    if (cur) cur.body.push(line);
  }
  if (cur) out.push({ heading: cur.heading, body: cur.body.join("\n").trim() });
  return out;
}
function claudeProjectCwd(projectDir) {
  let p = claudeCwdMemo.get(projectDir);
  if (!p) {
    p = (async () => {
      let entries = [];
      try {
        entries = (await fsp.readdir(projectDir)).filter((n) => n.endsWith(".jsonl")).sort();
      } catch {
        return "";
      }
      for (const n of entries) {
        try {
          const o = JSON.parse(await firstLine(path.join(projectDir, n)));
          if (typeof o.cwd === "string" && o.cwd) return o.cwd;
        } catch {
        }
      }
      return "";
    })();
    claudeCwdMemo.set(projectDir, p);
  }
  return p;
}
async function memoryFile(file, runner) {
  let text3;
  try {
    text3 = await fsp.readFile(file, "utf8");
  } catch {
    return null;
  }
  const base = path.basename(file);
  if (runner === "claude-code") {
    const projectDir = path.dirname(path.dirname(file));
    const cwd = await claudeProjectCwd(projectDir);
    const { meta, body } = frontmatterOf(text3);
    const heading = meta.description || meta.name || base.replace(/\.md$/, "");
    const project = path.basename(cwd || projectDir);
    return { title: `memory \xB7 ${project} \xB7 ${base.replace(/\.md$/, "")}`, cwd, units: body.trim() ? [{ heading, body: body.trim() }] : [] };
  }
  if (base === "MEMORY.md") {
    const units = [];
    for (const g of sectionsOf(text3, 1)) {
      const cwd = /cwd=([^;\n]+)/.exec(metaLine(g.body, "applies_to") ?? "")?.[1]?.trim();
      const subs2 = sectionsOf(g.body, 2);
      if (!subs2.length) {
        units.push({ heading: g.heading, body: g.body, ...cwd ? { cwd } : {} });
        continue;
      }
      for (const u of subs2) units.push({ heading: `${g.heading} \u203A ${u.heading}`, body: u.body, ...cwd ? { cwd } : {} });
    }
    return { title: "memory \xB7 Codex \xB7 MEMORY.md", cwd: "", units };
  }
  if (base === "raw_memories.md") {
    const units = sectionsOf(text3, 2).map((u) => {
      const cwd = metaLine(u.body, "cwd");
      const at = metaLine(u.body, "updated_at");
      const heading = cwd ? `${u.heading} \xB7 ${path.basename(cwd)}` : u.heading;
      return { heading, body: u.body, ...cwd ? { cwd } : {}, ...at ? { at: new Date(at).toISOString() } : {} };
    });
    return { title: "memory \xB7 Codex \xB7 raw_memories.md", cwd: "", units };
  }
  const subs = sectionsOf(text3, 2);
  if (subs.length) return { title: `memory \xB7 Codex \xB7 ${base}`, cwd: "", units: subs };
  const h1 = sectionsOf(text3, 1)[0];
  return { title: `memory \xB7 Codex \xB7 ${base}`, cwd: "", units: text3.trim() ? [{ heading: h1?.heading ?? base, body: text3.trim() }] : [] };
}
async function parseMemory(f, runner) {
  const mf = await memoryFile(f.file, runner);
  if (!mf || !mf.units.length) return null;
  const memo = /* @__PURE__ */ new Map();
  const cwd = mf.cwd ? await canonicalPath(mf.cwd, memo) : "";
  const workspace = cwd ? await workspaceOf(cwd) : "";
  const at = new Date(f.mtime).toISOString();
  const turns = [];
  const text3 = {};
  for (const [i, u] of mf.units.entries()) {
    const unitCwd = u.cwd ? await canonicalPath(u.cwd, memo) : "";
    turns.push({ i, t: `memory#${i}`, at: u.at ?? at, q: questionExcerpt(u.heading), ops: {}, ...unitCwd && unitCwd !== cwd ? { cwd: unitCwd } : {} });
    text3[String(i)] = { q: u.heading, a: u.body };
  }
  const id2 = `mem-${runner === "codex" ? "cx" : "cc"}-${shortHash(await canonicalPath(f.file, memo))}`;
  return {
    fact: { id: id2, runner, kind: "memory", file: f.file, mtime: f.mtime, size: f.size, cwd, workspace, title: mf.title, turns },
    cache: {},
    text: text3,
    names: {},
    bundles: {}
  };
}
async function readJson(file, empty) {
  try {
    const v = JSON.parse(await fsp.readFile(file, "utf8"));
    return v.version === INDEX_VERSION ? v : empty();
  } catch {
    return empty();
  }
}
async function acquireLock(file = LOCK_FILE, staleMs = LOCK_STALE_MS) {
  await fsp.mkdir(HOME, { recursive: true, mode: 448 });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fh = await fsp.open(file, "wx", 384);
      await fh.writeFile(JSON.stringify({ pid: process.pid, at: Date.now() }));
      await fh.close();
      return async () => {
        await fsp.rm(file, { force: true }).catch(() => void 0);
      };
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      let holder = {};
      try {
        holder = JSON.parse(await fsp.readFile(file, "utf8"));
      } catch {
      }
      const alive = (() => {
        if (!holder.pid) return false;
        try {
          process.kill(holder.pid, 0);
          return true;
        } catch {
          return false;
        }
      })();
      const stale = !alive || !holder.at || Date.now() - holder.at > staleMs;
      if (!stale) return null;
      await fsp.rm(file, { force: true }).catch(() => void 0);
    }
  }
  return null;
}
async function waitForLock(maxMs = 2e4) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    try {
      await fsp.access(LOCK_FILE);
    } catch {
      return true;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}
async function writePrivate(file, data) {
  await fsp.mkdir(HOME, { recursive: true, mode: 448 });
  await fsp.chmod(HOME, 448).catch(() => void 0);
  const tmp = tmpFor(file);
  await fsp.writeFile(tmp, JSON.stringify(data), { mode: 384 });
  await fsp.chmod(tmp, 384).catch(() => void 0);
  await fsp.rename(tmp, file);
}
async function rewriteTextLines(replaced, removed, full) {
  await fsp.mkdir(HOME, { recursive: true, mode: 448 });
  const tmp = tmpFor(TEXT_LINES);
  const out = createWriteStream(tmp, { mode: 384 });
  const write = (line) => new Promise((res, rej) => {
    out.write(line + "\n", (e) => e ? rej(e) : res());
  });
  if (!full) {
    let old = null;
    try {
      await fsp.access(TEXT_LINES);
      old = createInterface({ input: createReadStream(TEXT_LINES, { encoding: "utf8", highWaterMark: 1 << 20 }) });
    } catch {
    }
    if (old) {
      for await (const line of old) {
        const at = line.indexOf('"k":"');
        if (at < 0) continue;
        const k = JSON.parse(line.slice(at + 4, line.indexOf('"', at + 5) + 1));
        if (replaced.has(k) || removed.has(k)) continue;
        await write(line);
      }
    }
  }
  for (const [k, turns] of replaced) {
    for (const [i, t] of Object.entries(turns)) await write(JSON.stringify({ k, i: Number(i), ...t }));
  }
  await new Promise((res, rej) => out.end((e) => e ? rej(e) : res()));
  await fsp.chmod(tmp, 384).catch(() => void 0);
  await fsp.rename(tmp, TEXT_LINES);
}
async function buildIndex(full, canvasDir) {
  const t0 = Date.now();
  if (canvasDir) await rememberCanvasRoot(canvasDir);
  const release = await acquireLock();
  if (!release) {
    const done = await waitForLock();
    return { parsed: 0, kept: 0, skipped: 0, removed: 0, seconds: (Date.now() - t0) / 1e3, waited: done };
  }
  try {
    return await buildIndexLocked(full, t0);
  } finally {
    await release();
  }
}
async function buildIndexLocked(full, t0) {
  await fsp.rm(LEGACY_FILE, { force: true }).catch(() => void 0);
  const facts = full ? emptyFacts() : await loadFacts();
  const cache = full ? emptyCache() : await loadCache();
  const text3 = full ? emptyText() : await loadText();
  const files = await listSources();
  let parsed = 0, kept = 0, skipped = 0, removed = 0;
  const seen = /* @__PURE__ */ new Set();
  const replacedText = /* @__PURE__ */ new Map();
  const removedKeys = /* @__PURE__ */ new Set();
  for (const f of files) {
    const key = await canonicalPath(f.file);
    seen.add(key);
    const prev = facts.sessions[key];
    const sk = facts.skipped[key];
    if (sk && sk.mtime === f.mtime && sk.size === f.size) {
      skipped++;
      continue;
    }
    if (prev && prev.mtime === f.mtime && prev.size === f.size && key in cache.sessions && key in text3.sessions) {
      kept++;
      continue;
    }
    const r = await parseSession(f).catch(() => null);
    if (!r) {
      facts.skipped[key] = { mtime: f.mtime, size: f.size };
      skipped++;
      continue;
    }
    delete facts.skipped[key];
    facts.sessions[key] = r.fact;
    cache.sessions[key] = r.cache;
    replacedText.set(key, r.text);
    text3.sessions[key] = Object.keys(r.text).length;
    Object.assign(facts.names, r.names);
    Object.assign(facts.bundles, r.bundles);
    parsed++;
  }
  for (const key of Object.keys(facts.sessions)) {
    if (!seen.has(key)) {
      delete facts.sessions[key];
      delete cache.sessions[key];
      delete text3.sessions[key];
      removedKeys.add(key);
      removed++;
    }
  }
  for (const key of Object.keys(facts.skipped)) if (!seen.has(key)) delete facts.skipped[key];
  facts.builtAt = (/* @__PURE__ */ new Date()).toISOString();
  await writePrivate(FACT_FILE, facts);
  await writePrivate(CACHE_FILE, cache);
  if (full || replacedText.size || removedKeys.size) await rewriteTextLines(replacedText, removedKeys, full);
  await writePrivate(TEXT_FILE, text3);
  return { parsed, kept, skipped, removed, seconds: (Date.now() - t0) / 1e3 };
}
function setQuiet(v) {
  quiet = v;
}
async function ensureFresh() {
  const facts = await loadFacts();
  const cache = await loadCache();
  const text3 = await loadText();
  const files = await listSources();
  const keyed = await Promise.all(files.map(async (f) => ({ ...f, key: await canonicalPath(f.file) })));
  const known = (f) => {
    const p = facts.sessions[f.key];
    if (p) return p.mtime === f.mtime && p.size === f.size && f.key in cache.sessions && f.key in text3.sessions;
    const sk = facts.skipped[f.key];
    return !!sk && sk.mtime === f.mtime && sk.size === f.size;
  };
  const stale = !facts.builtAt || keyed.some((f) => !known(f)) || Object.keys(facts.sessions).length + Object.keys(facts.skipped).length !== keyed.length;
  if (!stale) return facts;
  const r = await buildIndex(false);
  if (!quiet) {
    if (r.waited !== void 0) console.error(r.waited ? "(index refreshed by another process)" : "(index refresh in progress elsewhere; answering from the current index)");
    else console.error(`(index refreshed: ${r.parsed} session${r.parsed === 1 ? "" : "s"} re-read, ${r.removed} gone, ${r.seconds.toFixed(1)}s)`);
  }
  return loadFacts();
}
function summarize(facts, cache) {
  const seen = /* @__PURE__ */ new Set();
  const artifacts = { file: 0, url: 0, arxiv: 0, other: 0 };
  let turns = 0, touches = 0, changes = 0, withChangeHead = 0, withMention = 0;
  for (const [key, s] of Object.entries(facts.sessions)) {
    turns += s.turns.length;
    for (const t of s.turns) {
      const ct = cache.sessions[key]?.[String(t.i)];
      for (const [p, x] of Object.entries(t.ops)) {
        if (!seen.has(p)) {
          seen.add(p);
          artifacts[schemeOf(p)]++;
        }
        touches++;
        if (!readLike(x.op)) {
          changes++;
          if (x.d) withChangeHead++;
        }
        if (ct?.m?.[p]) withMention++;
      }
    }
  }
  const sessions = new Set(Object.values(facts.sessions).map((s) => s.id)).size;
  const mem = Object.values(facts.sessions).filter((s) => s.kind === "memory");
  return { sessions, sources: Object.keys(facts.sessions).length, turns, artifacts, touches, changes, withChangeHead, withMention, memoryFiles: mem.length, memoryEntries: mem.reduce((n, s) => n + s.turns.length, 0) };
}
async function resolveQuery(facts, rawArg, all) {
  const arg = rawArg.trim().replace(/^@/, "").replace(/^["'`]|["'`:]+$/g, "");
  const ids = allPaths(facts);
  const web = urlArtifact(arg) ?? arxivArtifact(arg);
  if (web) return ids.has(web.id) ? { path: web.id, candidates: [web.id], elsewhere: 0 } : { path: null, candidates: [], elsewhere: 0 };
  if (arg.startsWith("weft:")) return ids.has(arg) ? { path: arg, candidates: [arg], elsewhere: 0 } : { path: null, candidates: [], elsewhere: 0 };
  const named = Object.entries(facts.names).filter(([, name]) => name === arg || name.endsWith(`/${arg}`)).map(([id2]) => id2);
  if (named.length === 1) return { path: named[0], candidates: named, elsewhere: 0 };
  const abs = absolutePath(arg, process.cwd());
  if (abs) {
    const typed = fileUri(abs);
    if (ids.has(typed)) return { path: typed, candidates: [typed], elsewhere: 0 };
    const real = fileUri(await canonicalPath(abs));
    if (ids.has(real)) return { path: real, candidates: [real], elsewhere: 0 };
  }
  const needle = arg.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");
  const files = [...ids].flatMap((id2) => {
    const p = filePathOf(id2);
    return p ? [{ id: id2, p }] : [];
  });
  const bySuffix = files.filter(({ p }) => p === needle || p.endsWith(`/${needle}`));
  const ws = (await workspaceOf(process.cwd())).replace(/\\/g, "/");
  const inside = all ? bySuffix : bySuffix.filter(({ p }) => p.startsWith(`${ws}/`));
  if (inside.length === 1) return { path: inside[0].id, candidates: [inside[0].p], elsewhere: bySuffix.length - inside.length };
  return { path: null, candidates: inside.map((x) => x.p).sort(), elsewhere: bySuffix.length - inside.length };
}
function hitsFor(facts, artifact, includeRead) {
  const all = [];
  const seen = /* @__PURE__ */ new Set();
  const sources = Object.entries(facts.sessions).sort((a, b) => a[1].mtime - b[1].mtime);
  for (const [sourceKey, session] of sources) {
    for (const turn of session.turns) {
      const touch = turn.ops[artifact];
      if (!touch) continue;
      if (turn.item) {
        if (seen.has(turn.item)) continue;
        seen.add(turn.item);
      }
      all.push({ session, sourceKey, turn, touch });
    }
  }
  const hasChanges = all.some((h) => !readLike(h.touch.op));
  if (includeRead || !hasChanges) return { hits: all, readsHidden: 0 };
  const hits = all.filter((h) => !readLike(h.touch.op));
  return { hits, readsHidden: all.length - hits.length };
}
function anchorStatus(facts, a) {
  const b = facts.bundles[a.bundle];
  if (!b) return "unverified";
  return b.node === a.node ? "matched" : "mismatch";
}
function openLink(h) {
  if (h.session.kind === "memory") return `weft://open?memory=${encodeURIComponent(h.session.file)}&entry=${h.turn.i}`;
  if (h.session.runner === "weft") return `weft://open?canvas=${encodeURIComponent(h.session.id)}&node=${encodeURIComponent(h.turn.t.split("#").pop() ?? "")}`;
  return `weft://open?session=${h.session.id}${h.turn.item ? `&turn=${encodeURIComponent(h.turn.item)}` : ""}`;
}
function when(t, s) {
  const d = new Date(t.at ?? s.mtime);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fragmentsOf(facts, sessionId) {
  const frags = Object.entries(facts.sessions).filter(([, s]) => s.id === sessionId).sort((a, b) => a[1].mtime - b[1].mtime);
  let offset = 0;
  return frags.map(([key, s]) => {
    const f = { key, s, offset };
    offset += s.turns.length;
    return f;
  });
}
function turnNumber(facts, h) {
  return (fragmentsOf(facts, h.session.id).find((f) => f.key === h.sourceKey)?.offset ?? 0) + h.turn.i;
}
async function renderWhy(facts, file, hits, readsHidden, cache, limit, json) {
  const out = [];
  const bySession = /* @__PURE__ */ new Map();
  for (const h of hits) (bySession.get(h.session.id) ?? bySession.set(h.session.id, []).get(h.session.id)).push(h);
  const groups = [...bySession.values()].map((hs) => hs.sort((a, b) => a.turn.i - b.turn.i)).sort((a, b) => (b[b.length - 1].turn.at ?? "").localeCompare(a[a.length - 1].turn.at ?? ""));
  const shown = /* @__PURE__ */ new Set();
  for (const g of groups) for (const h of g) if (shown.size < limit) shown.add(h);
  const interp = (h) => cache.sessions[h.sourceKey]?.[String(h.turn.i)] ?? {};
  if (json) {
    out.push(JSON.stringify({
      artifact: file,
      file: filePathOf(file),
      turns: hits.length,
      sessions: bySession.size,
      readsHidden,
      evidence: EVIDENCE,
      hits: [...shown].map((h) => {
        const c = interp(h);
        return {
          session: h.session.id,
          runner: h.session.runner,
          title: h.session.title,
          subagent: !!h.session.subagent,
          anchor: h.session.anchor ? { ...h.session.anchor, status: anchorStatus(facts, h.session.anchor) } : null,
          turn: turnNumber(facts, h),
          at: h.turn.at ?? null,
          op: h.touch.op,
          locators: h.touch.l ?? null,
          question: h.turn.q,
          askedBefore: c.p ?? null,
          change: h.touch.d ?? null,
          about: c.m?.[file] ?? null,
          conclusion: c.c ?? null,
          open: openLink(h)
        };
      })
    }, null, 1));
    return out.join("\n");
  }
  const label = await displayOf(file, facts.names);
  const n = hits.length;
  const head = `why ${label}  \xB7  ${n} turn${n === 1 ? "" : "s"} in ${bySession.size} session${bySession.size === 1 ? "" : "s"}`;
  const notes = [
    readsHidden ? `${readsHidden} read${readsHidden === 1 ? "" : "s"} hidden, --include-read` : "",
    n > limit ? `showing ${limit}, --limit for more` : ""
  ].filter(Boolean);
  out.push(`${head}${notes.length ? `  (${notes.join("; ")})` : ""}
`);
  let printed = 0;
  for (const g of groups) {
    const mine = g.filter((h) => shown.has(h));
    if (!mine.length) continue;
    const s = g[0].session;
    out.push(`${s.runner}  \u300C${s.title.slice(0, 70)}\u300D${s.subagent ? "  (subagent)" : ""}${s.anchor ? `  \u21A9 from canvas node ${s.anchor.node} (${s.anchor.bundle}, ${anchorStatus(facts, s.anchor)})` : ""}`);
    for (const h of mine) {
      const c = interp(h);
      const where = h.touch.l?.map((l) => l.pages ? `p.${l.pages}` : l.lines ? `L${l.lines[0]}-${l.lines[1]}` : "").filter(Boolean).join(" ");
      out.push(`  ${when(h.turn, s)}  ${OP_MARK[h.touch.op]}  #${turnNumber(facts, h)}${where ? `  ${where}` : ""}  ${openLink(h)}`);
      out.push(`    Q: ${h.turn.q}${c.p ? `   \u2934 ${c.p}` : ""}`);
      if (h.touch.d) out.push(`    \u0394 ${h.touch.d}`);
      const about = c.m?.[file];
      if (about) out.push(`    \u2248 ${about}`);
      else if (c.c) out.push(`    \u2248 ${c.c}   (closing line)`);
      printed++;
    }
    out.push("");
  }
  if (!printed) out.push("(no turns)\n");
  out.push("\u0394 observed change \xB7 \u2248 read from the answer, a candidate explanation, not a verified reason \xB7 \u2934 the earlier question this reply answers");
  return out.join("\n");
}
function snippetAround(text3, needle, width = 70) {
  const at = text3.toLowerCase().indexOf(needle);
  if (at < 0) return "";
  const start = Math.max(0, at - width);
  const end = Math.min(text3.length, at + needle.length + width);
  return `${start > 0 ? "\u2026" : ""}${text3.slice(start, end).replace(/\s+/g, " ").trim()}${end < text3.length ? "\u2026" : ""}`;
}
async function findHits(facts, phrase, scope) {
  const needle = phrase.toLowerCase();
  const turnsOf = /* @__PURE__ */ new Map();
  const lookup = (k, i) => {
    let m = turnsOf.get(k);
    if (!m) {
      m = new Map(facts.sessions[k]?.turns.map((t) => [t.i, t]) ?? []);
      turnsOf.set(k, m);
    }
    return m.get(i);
  };
  const raw = [];
  let lines = null;
  try {
    await fsp.access(TEXT_LINES);
    lines = createInterface({ input: createReadStream(TEXT_LINES, { encoding: "utf8", highWaterMark: 1 << 20 }) });
  } catch {
    return [];
  }
  for await (const line of lines) {
    if (!line.toLowerCase().includes(needle)) continue;
    let t;
    try {
      t = JSON.parse(line);
    } catch {
      continue;
    }
    const session = facts.sessions[t.k];
    const turn = lookup(t.k, t.i);
    if (!session || !turn) continue;
    const fields2 = [["Q", t.q], ["A", t.a], ["M", t.m]];
    for (const [where, body] of fields2) {
      if (!body) continue;
      if (scope !== "all" && where.toLowerCase() !== scope) continue;
      if (!body.toLowerCase().includes(needle)) continue;
      raw.push({ session, sourceKey: t.k, turn, where, snippet: snippetAround(body, needle), kind: session.kind === "memory" ? "memory" : "turn" });
      break;
    }
  }
  const seen = /* @__PURE__ */ new Set();
  const hits = [];
  for (const h of raw.sort((a, b) => a.session.mtime - b.session.mtime)) {
    if (h.turn.item) {
      if (seen.has(h.turn.item)) continue;
      seen.add(h.turn.item);
    }
    hits.push(h);
  }
  return hits.sort((a, b) => (b.turn.at ?? "").localeCompare(a.turn.at ?? ""));
}
function renderFind(facts, phrase, hits, limit, json) {
  const out = [];
  const shown = hits.slice(0, limit);
  const sessions = new Set(hits.map((h) => h.session.id)).size;
  if (json) {
    out.push(JSON.stringify({
      phrase,
      turns: hits.length,
      sessions,
      evidence: { Q: "observed (a question, verbatim)", A: "observed (an answer, verbatim)", M: "observed (an attached material's text, verbatim)" },
      hits: shown.map((h) => ({ kind: h.kind, session: h.session.id, runner: h.session.runner, title: h.session.title, cwd: h.turn.cwd ?? h.session.cwd, file: h.session.file, turn: turnNumber(facts, h), at: h.turn.at ?? null, where: h.where, snippet: h.snippet, open: openLink(h) }))
    }, null, 1));
    return out.join("\n");
  }
  out.push(`find "${phrase}"  \xB7  ${hits.length} turn${hits.length === 1 ? "" : "s"} in ${sessions} session${sessions === 1 ? "" : "s"}${hits.length > limit ? `  (showing ${limit}, --limit for more)` : ""}
`);
  for (const h of shown) {
    const s = h.session;
    out.push(`${when(h.turn, s)}  ${s.runner}${h.kind === "memory" ? " memory" : ""}  \u300C${s.title.slice(0, 60)}\u300D  #${turnNumber(facts, h)}  ${openLink(h)}`);
    out.push(`    ${h.where}: ${h.snippet}`);
  }
  if (!shown.length) out.push("(nothing asked, answered or attached in those words \u2014 try another wording; matching is exact)");
  else out.push("\nQ: asked \xB7 A: answered \xB7 M: in an attached material \u2014 all verbatim; the phrase must appear in those words");
  return out.join("\n");
}
async function factsForCheck(force) {
  const facts = await loadFacts();
  const age = facts.builtAt ? Date.now() - new Date(facts.builtAt).getTime() : Infinity;
  return force || age > CHECK_FRESH_MS ? ensureFresh() : facts;
}
function renderCheck(facts, arg, file, hits, json) {
  const changes = hits.filter((h) => !readLike(h.touch.op)).length;
  const reads = hits.length - changes;
  const sessions = new Set(hits.map((h) => h.session.id)).size;
  const latest = hits.map((h) => h.turn.at ?? "").filter(Boolean).sort().pop();
  const has = hits.length > 0;
  if (json) return { text: JSON.stringify({ query: arg, artifact: file, history: has, turns: hits.length, sessions, changes, reads, latest: latest ?? null }), has };
  if (!has) return { text: `${arg}: no history`, has };
  const parts = [`${hits.length} turn${hits.length === 1 ? "" : "s"} in ${sessions} session${sessions === 1 ? "" : "s"}`, changes ? `${changes} edit${changes === 1 ? "" : "s"}/write${changes === 1 ? "" : "s"}` : "", reads ? `${reads} read${reads === 1 ? "" : "s"}` : "", latest ? `latest ${latest.slice(0, 10)}` : ""].filter(Boolean);
  return { text: `${arg}: ${parts.join(" \xB7 ")}  \u2192  weft why ${arg}`, has };
}
async function recallTurn(facts, sidPrefix, n) {
  const any = Object.values(facts.sessions).find((x) => x.id.startsWith(sidPrefix));
  if (!any) throw new Error(`no session starts with ${sidPrefix}`);
  const frag = fragmentsOf(facts, any.id).find((f) => n >= f.offset && n < f.offset + f.s.turns.length);
  const s = frag?.s ?? any;
  const local = frag ? n - frag.offset : n;
  const base = { runner: s.runner, session: s.id, title: s.title, turn: n, file: s.file };
  if (s.kind === "memory") {
    const mf = await memoryFile(s.file, s.runner);
    const u = mf?.units[local];
    if (!u) throw new Error(`memory ${s.id.slice(0, 8)} has no entry #${n}`);
    return { ...base, kind: "memory", at: s.turns[local]?.at, cwd: s.turns[local]?.cwd ?? s.cwd, question: u.heading, response: u.body, tools: [] };
  }
  const p = await eventsOf(s.file);
  const turn = p?.turns?.[local] ?? (() => {
    const tid = s.turns[local]?.t;
    const text3 = tid ? p?.texts.get(tid) : void 0;
    return text3 ? { question: text3.question, response: text3.response, tools: [], at: s.turns[local]?.at } : void 0;
  })();
  if (!turn) throw new Error(`session ${s.id.slice(0, 8)} has no turn #${n}`);
  return { ...base, kind: "turn", at: turn.at, cwd: s.cwd, question: turn.question, response: turn.response, tools: turn.tools };
}
async function renderRecall(facts, sidPrefix, n) {
  const r = await recallTurn(facts, sidPrefix, n);
  const out = [];
  out.push(`${r.runner}${r.kind === "memory" ? " memory" : ""}  \u300C${r.title}\u300D  ${r.kind === "memory" ? "entry" : "turn"} #${n}${r.at ? `  ${r.at.slice(0, 16).replace("T", " ")}` : ""}
`);
  if (r.kind === "memory") {
    out.push(`## ${r.question.trim()}

${r.response.trim() || "(empty)"}
`);
    return out.join("\n");
  }
  out.push(`## Question

${r.question.trim()}
`);
  out.push(`## Answer

${r.response.trim() || "(none)"}
`);
  if (r.tools.length) {
    out.push(`## Tools (${r.tools.length})
`);
    for (const t of r.tools) {
      out.push(`- ${t.name}${t.paths?.length ? `  ${t.paths.join(", ")}` : ""}`);
      if (t.op === "edit" || t.op === "write") out.push(t.call.slice(0, 1200).split("\n").map((l) => `    ${l}`).join("\n"));
      else if (t.op === "other" && /^error\b/i.test(t.result.trimStart())) out.push(`    \u2717 ${t.result.trim().split("\n")[0].slice(0, 200)}`);
    }
  }
  return out.join("\n");
}
async function findJson(phrase, opts = {}) {
  const facts = await ensureFresh();
  let hits = await findHits(facts, phrase, opts.scope ?? "all");
  if (opts.cwd) {
    const want = opts.cwd.replace(/[\\/]+$/, "");
    hits = hits.filter((h) => {
      const c = h.turn.cwd ?? h.session.cwd;
      return c === want || c.startsWith(want + path.sep);
    });
  }
  const limit = opts.limit ?? 20;
  const shown = [...hits.filter((h) => h.kind === "memory").slice(0, limit), ...hits.filter((h) => h.kind === "turn").slice(0, limit)];
  return {
    phrase,
    turns: hits.length,
    sessions: new Set(hits.map((h) => h.session.id)).size,
    hits: shown.map((h) => ({ kind: h.kind, session: h.session.id, runner: h.session.runner, title: h.session.title, cwd: h.turn.cwd ?? h.session.cwd, file: h.session.file, turn: turnNumber(facts, h), at: h.turn.at ?? null, where: h.where, snippet: h.snippet, open: openLink(h) }))
  };
}
async function turnsJson(opts = {}) {
  if (opts.limit === 0) {
    const current = await fsp.readFile(TEXT_FILE, "utf8").then((raw2) => JSON.parse(raw2).version === INDEX_VERSION).catch(() => false);
    if (!current) {
      refreshInBackground ??= ensureFresh().then(() => void 0, () => void 0).finally(() => {
        refreshInBackground = null;
      });
      return { total: 0, turns: [], refreshing: true };
    }
    const text3 = await loadText();
    return { total: Object.values(text3.sessions).reduce((a, b) => a + b, 0), turns: [] };
  }
  const facts = await ensureFresh();
  const head = Math.max(40, Math.min(1e3, opts.head ?? 300));
  const turnsOf = /* @__PURE__ */ new Map();
  const lookup = (k, i) => {
    let m = turnsOf.get(k);
    if (!m) {
      m = new Map(facts.sessions[k]?.turns.map((t) => [t.i, t]) ?? []);
      turnsOf.set(k, m);
    }
    return m.get(i);
  };
  const clipHead = (text3) => (text3 ?? "").replace(/\s+/g, " ").trim().slice(0, head);
  const raw = [];
  let lines = null;
  try {
    await fsp.access(TEXT_LINES);
    lines = createInterface({ input: createReadStream(TEXT_LINES, { encoding: "utf8", highWaterMark: 1 << 20 }) });
  } catch {
    return { total: 0, turns: [] };
  }
  for await (const line of lines) {
    let t;
    try {
      t = JSON.parse(line);
    } catch {
      continue;
    }
    const session = facts.sessions[t.k];
    const turn = lookup(t.k, t.i);
    if (!session || !turn) continue;
    const memory = session.kind === "memory";
    raw.push({ session, sourceKey: t.k, turn, q: memory ? "" : clipHead(t.q), a: clipHead(memory ? t.m : t.a), kind: memory ? "memory" : "turn" });
  }
  const seen = /* @__PURE__ */ new Set();
  const all = [];
  for (const h of raw.sort((a, b) => a.session.mtime - b.session.mtime)) {
    if (h.turn.item) {
      if (seen.has(h.turn.item)) continue;
      seen.add(h.turn.item);
    }
    all.push(h);
  }
  all.sort((a, b) => (b.turn.at ?? "").localeCompare(a.turn.at ?? ""));
  const offset = Math.max(0, opts.offset ?? 0);
  const limit = Math.max(0, opts.limit ?? all.length);
  return {
    total: all.length,
    turns: all.slice(offset, offset + limit).map((h) => ({ kind: h.kind, session: h.session.id, runner: h.session.runner, title: h.session.title, cwd: h.turn.cwd ?? h.session.cwd, file: h.session.file, turn: turnNumber(facts, h), at: h.turn.at ?? null, q: h.q, a: h.a, open: openLink(h) }))
  };
}
async function recallJson(session, n) {
  return recallTurn(await ensureFresh(), session, n);
}
async function vocabulary() {
  let stamp = "";
  try {
    const st = await fsp.stat(TEXT_LINES);
    stamp = `${st.mtimeMs}:${st.size}`;
  } catch {
    return /* @__PURE__ */ new Map();
  }
  if (vocabCache && vocabCache.builtFrom === stamp) return vocabCache.counts;
  const counts = /* @__PURE__ */ new Map();
  const lines = createInterface({ input: createReadStream(TEXT_LINES, { encoding: "utf8", highWaterMark: 1 << 20 }) });
  for await (const line of lines) {
    let t;
    try {
      t = JSON.parse(line);
    } catch {
      continue;
    }
    for (const body of [t.q, t.a, t.m]) {
      if (!body) continue;
      for (const m of body.matchAll(/[A-Za-z][A-Za-z0-9_-]{3,}/g)) {
        const w = m[0].toLowerCase();
        counts.set(w, (counts.get(w) ?? 0) + 1);
      }
    }
  }
  vocabCache = { builtFrom: stamp, counts };
  return counts;
}
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
async function suggestJson(term, k = 8) {
  const t = term.toLowerCase().trim();
  const counts = await vocabulary();
  const known = counts.get(t) ?? 0;
  if (!t || t.length < 3) return { term, known, suggestions: [] };
  const max = t.length >= 6 ? 2 : 1;
  const out = [];
  for (const [w, count] of counts) {
    if (w === t) continue;
    const d = editDistance(t, w, max);
    if (d <= max) out.push({ term: w, count, distance: d });
  }
  out.sort((a, b) => a.distance - b.distance || b.count - a.count);
  return { term, known, suggestions: out.slice(0, k) };
}
async function systemOne(call2, state, questions) {
  const body = call2.wrap === "cloudflare" ? { model: call2.model ?? "typesafe/jev", input: { state, questions } } : { ...call2.model ? { model: call2.model } : {}, state, questions };
  const r = await fetch(call2.url, { method: "POST", headers: { "Content-Type": "application/json", ...call2.headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(9e4) });
  const text3 = await r.text();
  let j = {};
  try {
    j = JSON.parse(text3);
  } catch {
    throw new Error(`judge answered ${r.status} with non-JSON`);
  }
  if (!r.ok) throw new Error(typeof j.error === "string" ? j.error : j.error?.message ?? `HTTP ${r.status}`);
  const answers = (call2.wrap === "cloudflare" ? j.result?.answers : j.answers) ?? {};
  return answers;
}
async function topicsJson() {
  const tf = await loadTopics();
  const text3 = await loadText();
  const turns = Object.values(text3.sessions).reduce((n, c) => n + c, 0);
  const counts = /* @__PURE__ */ new Map();
  for (const per of Object.values(tf.labels)) for (const [id2, p] of Object.entries(per)) if (p >= 0.6) counts.set(id2, (counts.get(id2) ?? 0) + 1);
  return { topics: tf.topics.map((t) => ({ ...t, count: counts.get(t.id) ?? 0 })), labeled: Object.keys(tf.labels).length, turns, status: { ...labelStatus } };
}
async function setTopics(topics) {
  const tf = await loadTopics();
  const clean = topics.filter((t) => t.name?.trim()).map((t) => ({ id: t.id && /^[a-z0-9_-]{1,40}$/.test(t.id) ? t.id : shortHash(t.name.trim().toLowerCase()), name: t.name.trim().slice(0, 60), description: (t.description ?? "").trim().slice(0, 240) }));
  const keep = new Set(clean.map((t) => t.id));
  for (const [k, per] of Object.entries(tf.labels)) {
    for (const id2 of Object.keys(per)) if (!keep.has(id2)) delete per[id2];
    if (!Object.keys(per).length) {
      delete tf.labels[k];
      delete tf.labeledAt[k];
    }
  }
  tf.topics = clean;
  tf.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  await writePrivate(TOPICS_FILE, tf);
  return clean;
}
async function labelStart(call2, opts = {}) {
  if (labelStatus.running) return { ...labelStatus };
  const tf = await loadTopics();
  if (!tf.topics.length) throw new Error("no topics to label with");
  const batch = Math.max(1, Math.min(16, opts.batch ?? 8));
  Object.assign(labelStatus, { running: true, done: 0, total: 0, labeled: 0, errors: 0, startedAt: (/* @__PURE__ */ new Date()).toISOString(), finishedAt: null, lastError: null, stopRequested: false });
  void (async () => {
    try {
      const needs = (t) => {
        const have = tf.labels[turnKey(t.k, t.i)];
        if (have && tf.topics.every((tp) => tp.id in have)) return false;
        return (t.q?.trim().length ?? 0) + (t.a?.trim().length ?? 0) >= 40;
      };
      const open2 = async () => {
        try {
          await fsp.access(TEXT_LINES);
          return createInterface({ input: createReadStream(TEXT_LINES, { encoding: "utf8", highWaterMark: 1 << 20 }) });
        } catch {
          return null;
        }
      };
      const keys = [];
      const first = await open2();
      if (first) for await (const line of first) {
        let t;
        try {
          t = JSON.parse(line);
        } catch {
          continue;
        }
        if (needs(t)) keys.push(turnKey(t.k, t.i));
      }
      const chosen = new Set(opts.max ? keys.slice(-opts.max) : keys);
      const pending = [];
      const second = chosen.size ? await open2() : null;
      if (second) for await (const line of second) {
        let t;
        try {
          t = JSON.parse(line);
        } catch {
          continue;
        }
        if (chosen.has(turnKey(t.k, t.i))) pending.push(t);
      }
      pending.reverse();
      labelStatus.total = pending.length;
      let sinceWrite = 0;
      for (let at = 0; at < pending.length && !labelStatus.stopRequested; at += batch) {
        const group = pending.slice(at, at + batch);
        const state = {};
        const questions = {};
        group.forEach((t, gi) => {
          state[`t${gi}`] = { q: cleanForJudge((t.q ?? "").slice(0, 300)), a: cleanForJudge((t.a ?? "").slice(0, 700)) };
          for (const tp of tf.topics) questions[`t${gi}_${tp.id}`] = { type: "noul", instructions: `Is the turn \`t${gi}\` about the topic "${tp.name}"${tp.description ? ` (${tp.description})` : ""}?` };
        });
        try {
          const answers = await systemOne(call2, state, questions);
          group.forEach((t, gi) => {
            const key = turnKey(t.k, t.i);
            const per = tf.labels[key] ?? {};
            for (const tp of tf.topics) {
              const p = answers[`t${gi}_${tp.id}`]?.noul;
              if (typeof p === "number") per[tp.id] = Math.round(p * 100) / 100;
            }
            tf.labels[key] = per;
            tf.labeledAt[key] = (/* @__PURE__ */ new Date()).toISOString();
            labelStatus.labeled++;
          });
        } catch (e) {
          labelStatus.errors++;
          labelStatus.lastError = e instanceof Error ? e.message : String(e);
          if (labelStatus.errors >= 5 && labelStatus.labeled === 0) break;
          await new Promise((r) => setTimeout(r, 1500));
        }
        labelStatus.done = Math.min(pending.length, at + group.length);
        sinceWrite += group.length;
        if (sinceWrite >= 80) {
          tf.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          await writePrivate(TOPICS_FILE, tf);
          sinceWrite = 0;
        }
      }
      tf.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await writePrivate(TOPICS_FILE, tf);
    } catch (e) {
      labelStatus.lastError = e instanceof Error ? e.message : String(e);
    } finally {
      labelStatus.running = false;
      labelStatus.finishedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
  })();
  return { ...labelStatus };
}
function labelStop() {
  if (labelStatus.running) labelStatus.stopRequested = true;
  return { ...labelStatus };
}
async function byTopicJson(topicIds, opts = {}) {
  const tf = await loadTopics();
  const facts = await loadFacts();
  const minP = opts.minP ?? 0.6;
  const want = new Set(topicIds);
  const rows = [];
  for (const [key, per] of Object.entries(tf.labels)) {
    let score = 0;
    const topics = {};
    for (const [id2, p] of Object.entries(per)) if (want.has(id2) && p >= minP) {
      score = Math.max(score, p);
      topics[id2] = p;
    }
    if (!score) continue;
    const hash2 = key.lastIndexOf("#");
    rows.push({ key, k: key.slice(0, hash2), i: Number(key.slice(hash2 + 1)), score, topics });
  }
  const hits = [];
  for (const r of rows) {
    const session = facts.sessions[r.k];
    const turn = session?.turns.find((t) => t.i === r.i);
    if (!session || !turn) continue;
    hits.push({ kind: session.kind === "memory" ? "memory" : "turn", session: session.id, runner: session.runner, title: session.title, cwd: turn.cwd ?? session.cwd, file: session.file, turn: turnNumber(facts, { session, sourceKey: r.k, turn }), at: turn.at ?? null, where: "Q", snippet: turn.q.slice(0, 200), open: openLink({ session, turn }), topics: r.topics, _score: r.score });
  }
  hits.sort((a, b) => (b._score ?? 0) - (a._score ?? 0) || (b.at ?? "").localeCompare(a.at ?? ""));
  const total = hits.length;
  return { hits: hits.slice(0, opts.limit ?? 60).map((h) => {
    const { _score, ...rest } = h;
    void _score;
    return rest;
  }), total };
}
async function dossiersJson() {
  const [tf, df] = await Promise.all([loadTopics(), loadDossiers()]);
  const out = [];
  for (const tp of tf.topics) {
    const d = df.byTopic[tp.id];
    const labeled = (await byTopicJson([tp.id], { limit: 5e3 })).hits.map((h) => `${h.session}#${h.turn}`);
    const covered = new Set(d?.covered ?? []);
    const s = d?.sections;
    const sentences = s ? s.what.length + s.decisions.length + s.now.length + s.open.length : 0;
    out.push({ topicId: tp.id, name: tp.name, built: !!d?.builtAt, builtAt: d?.builtAt ?? null, updatedAt: d?.updatedAt ?? "", lead: s?.what[0]?.text ?? s?.now[0]?.text ?? "", sentences, covered: covered.size, pending: d?.pending.length ?? 0, newTurns: labeled.filter((k) => !covered.has(k)).length, labeled: labeled.length });
  }
  return out;
}
async function dossierJson(topicId) {
  return (await loadDossiers()).byTopic[topicId] ?? null;
}
async function withDossiers(fn) {
  const run = async () => {
    let release = null;
    const deadline = Date.now() + DOSSIERS_LOCK_WAIT_MS;
    while (!(release = await acquireLock(DOSSIERS_LOCK, 3e4)) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 60));
    try {
      const df = await loadDossiers();
      const out = fn(df);
      await writePrivate(DOSSIERS_FILE, df);
      return out;
    } finally {
      await release?.();
    }
  };
  const p = dossierWrites.then(run, run);
  dossierWrites = p.catch(() => void 0);
  return p;
}
async function setDossier(topicId, d) {
  return withDossiers((df) => {
    const cur = df.byTopic[topicId] ?? emptyDossier(topicId);
    const { consumePending, ...rest } = d;
    const patch = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== void 0));
    const next = { ...cur, ...patch, topicId, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    if (consumePending) {
      const read2 = new Set(consumePending);
      next.pending = cur.pending.filter((p) => !read2.has(p.id));
    }
    df.byTopic[topicId] = next;
    return next;
  });
}
async function deleteDossier(topicId) {
  await withDossiers((df) => {
    delete df.byTopic[topicId];
  });
}
async function dossierAddPending(topicId, item) {
  return withDossiers((df) => {
    const cur = df.byTopic[topicId] ?? emptyDossier(topicId);
    cur.pending.push({ id: shortHash(`${Date.now()}:${cur.pending.length}:${item.text}`), text: item.text.slice(0, 400), at: (/* @__PURE__ */ new Date()).toISOString(), ...item.from ? { from: item.from } : {} });
    cur.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    df.byTopic[topicId] = cur;
    return cur;
  });
}
async function dossierNewTurns(topicId, opts = {}) {
  const d = (await loadDossiers()).byTopic[topicId];
  const covered = new Set(d?.covered ?? []);
  const all = await byTopicJson([topicId], { limit: 5e3 });
  const fresh = all.hits.filter((h) => !covered.has(`${h.session}#${h.turn}`));
  const sorted = fresh.sort((a, b) => (b.at ?? "").localeCompare(a.at ?? "")).slice(0, opts.limit ?? 120);
  const excerpts = [];
  for (const h of sorted) {
    try {
      const r = await recallJson(h.session, h.turn);
      excerpts.push({ key: `${h.session}#${h.turn}`, q: r.question.replace(/\s+/g, " ").slice(0, 300), a: r.response.replace(/\s+/g, " ").slice(0, 600) });
    } catch {
    }
  }
  return { hits: sorted, excerpts, total: fresh.length };
}
async function sampleQuestions(n = 120) {
  const out = [];
  let lines = null;
  try {
    await fsp.access(TEXT_LINES);
    lines = createInterface({ input: createReadStream(TEXT_LINES, { encoding: "utf8", highWaterMark: 1 << 20 }) });
  } catch {
    return out;
  }
  const all = [];
  for await (const line of lines) {
    let t;
    try {
      t = JSON.parse(line);
    } catch {
      continue;
    }
    const q = (t.q ?? "").trim();
    if (q.length >= 20 && q.length <= 400) all.push(q);
  }
  const step = Math.max(1, Math.floor(all.length / n));
  for (let i = 0; i < all.length && out.length < n; i += step) out.push(all[i].slice(0, 200));
  return out;
}
async function memoriesJson() {
  const facts = await ensureFresh();
  return Object.values(facts.sessions).filter((x) => x.kind === "memory").sort((a, b) => b.mtime - a.mtime).map((x) => ({ id: x.id, runner: x.runner, file: x.file, title: x.title, cwd: x.cwd, entries: x.turns.length, mtime: x.mtime, headings: x.turns.map((t) => t.q) }));
}
async function mcpCall(name, a) {
  if (name === "why_check") {
    const facts = await factsForCheck(false);
    const q = String(a.path ?? "");
    const { path: file } = await resolveQuery(facts, q, false);
    return renderCheck(facts, q, file, file ? hitsFor(facts, file, true).hits : [], false).text;
  }
  if (name === "why_file") {
    const facts = await ensureFresh();
    const q = String(a.path ?? "");
    const { path: file, candidates, elsewhere } = await resolveQuery(facts, q, false);
    if (!file) return candidates.length ? `${candidates.length} files match "${q}" \u2014 pick one:
${candidates.slice(0, 20).map((c) => `  ${c}`).join("\n")}` : elsewhere ? `no match in this workspace (${elsewhere} elsewhere)` : `no session touched ${q}`;
    const { hits, readsHidden } = hitsFor(facts, file, a.include_read === true);
    return renderWhy(facts, file, hits, readsHidden, await loadCache(), Number(a.limit ?? 10) || 10, false);
  }
  if (name === "find") {
    const facts = await ensureFresh();
    const scope = ["q", "a", "m"].find((x) => x === a.in) ?? "all";
    return renderFind(facts, String(a.phrase ?? ""), await findHits(facts, String(a.phrase ?? ""), scope), Number(a.limit ?? 10) || 10, false);
  }
  if (name === "recall_turn") return renderRecall(await ensureFresh(), String(a.session ?? ""), Number(a.turn ?? 0));
  throw new Error(`unknown tool: ${name}`);
}
var import_legacy_home, readLike, INDEX_VERSION, EXCERPT, HOME, FACT_FILE, CACHE_FILE, TEXT_FILE, TEXT_LINES, LEGACY_FILE, CONFIG_FILE, DSH_ROOT, PI_ROOT, ROOTS, MEMORY_ROOTS, isMemoryFile, CANVAS_RECORDS, isCanvasFile, isSessionFile, strongest, clipLine, zstdInflate, ZSTD_MAX, zstdSkipped, metaLine, claudeCwdMemo, shortHash, emptyFacts, emptyCache, emptyText, tmpFor, LOCK_FILE, LOCK_STALE_MS, loadFacts, loadCache, loadText, quiet, schemeOf, artifactsLine, allPaths, OP_MARK, EVIDENCE, CHECK_FRESH_MS, refreshInBackground, vocabCache, TOPICS_FILE, TOPICS_VERSION, emptyTopics, loadTopics, turnKey, cleanForJudge, labelStatus, DOSSIERS_FILE, DOSSIERS_VERSION, emptyDossiers, loadDossiers, emptyDossier, DOSSIERS_LOCK, DOSSIERS_LOCK_WAIT_MS, dossierWrites, CLI_VERSION, MCP_TOOLS;
var init_lib = __esm({
  "cli/src/lib.ts"() {
    init_define_import_meta_env();
    import_legacy_home = __toESM(require_legacy_home(), 1);
    init_claude_code_session();
    init_codex_session();
    init_dsh_session();
    init_pi_session();
    init_dsh_zstd();
    init_turn_insight();
    init_project();
    init_manifests();
    init_weft_canvas();
    readLike = (op) => op === "read" || op === "fetch" || op === "attach";
    INDEX_VERSION = 14;
    EXCERPT = 200;
    import_legacy_home.default.bindLegacyHome({ fs, os, path }).adoptLegacyHome();
    HOME = process.env.WEFT_HOME ?? path.join(os.homedir(), ".weft");
    FACT_FILE = path.join(HOME, "fact-index.json");
    CACHE_FILE = path.join(HOME, "interpretation-cache.json");
    TEXT_FILE = path.join(HOME, "text-index.json");
    TEXT_LINES = path.join(HOME, "text-index.jsonl");
    LEGACY_FILE = path.join(HOME, "why-index.json");
    CONFIG_FILE = path.join(HOME, "config.json");
    DSH_ROOT = path.join(process.env.DSH_HOME ?? path.join(os.homedir(), ".dsh"), "sessions");
    PI_ROOT = path.join(os.homedir(), ".pi", "agent", "sessions");
    ROOTS = process.env.WEFT_SESSION_ROOTS?.split(path.delimiter).filter(Boolean) ?? [path.join(os.homedir(), ".claude", "projects"), path.join(os.homedir(), ".codex", "sessions"), DSH_ROOT, PI_ROOT];
    MEMORY_ROOTS = (() => {
      const env = process.env.WEFT_MEMORY_ROOTS;
      if (env !== void 0) {
        return env.split(path.delimiter).filter(Boolean).flatMap((e) => {
          const m = /^(claude-code|codex)=(.+)$/.exec(e);
          return m ? [{ runner: m[1], root: m[2] }] : [];
        });
      }
      if (process.env.WEFT_SESSION_ROOTS) return [];
      return [
        { runner: "claude-code", root: path.join(os.homedir(), ".claude", "projects") },
        { runner: "codex", root: path.join(os.homedir(), ".codex", "memories") }
      ];
    })();
    isMemoryFile = (file, runner) => {
      if (!file.endsWith(".md")) return false;
      if (runner === "claude-code") return path.basename(path.dirname(file)) === "memory" && path.basename(file) !== "MEMORY.md";
      return true;
    };
    CANVAS_RECORDS = path.join(HOME, "canvases");
    isCanvasFile = (name) => /\.weft\.json$/i.test(name);
    isSessionFile = (name) => name.endsWith(".jsonl") || name.endsWith(".jsonl.zstd");
    strongest = (a, b) => a === "edit" || a === "write" ? a : b;
    clipLine = (s, max) => {
      const l = s.trim();
      return l.length > max ? `${l.slice(0, max)}\u2026` : l;
    };
    zstdInflate = zlib.zstdDecompressSync;
    ZSTD_MAX = 512 * 1024 * 1024;
    zstdSkipped = 0;
    metaLine = (body, key) => {
      const m = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(body);
      return m ? m[1].trim() : void 0;
    };
    claudeCwdMemo = /* @__PURE__ */ new Map();
    shortHash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 12);
    emptyFacts = () => ({ version: INDEX_VERSION, builtAt: "", sessions: {}, skipped: {}, names: {}, bundles: {} });
    emptyCache = () => ({ version: INDEX_VERSION, sessions: {} });
    emptyText = () => ({ version: INDEX_VERSION, sessions: {} });
    tmpFor = (file) => `${file}.${process.pid}.${Date.now().toString(36)}.tmp`;
    LOCK_FILE = path.join(HOME, "index.lock");
    LOCK_STALE_MS = 10 * 6e4;
    loadFacts = async () => {
      const f = await readJson(FACT_FILE, emptyFacts);
      f.skipped ??= {};
      f.sessions ??= {};
      f.names ??= {};
      f.bundles ??= {};
      return f;
    };
    loadCache = () => readJson(CACHE_FILE, emptyCache);
    loadText = () => readJson(TEXT_FILE, emptyText);
    quiet = false;
    schemeOf = (id2) => id2.startsWith("file://") ? "file" : id2.startsWith("arxiv:") ? "arxiv" : /^https?:\/\//.test(id2) ? "url" : "other";
    artifactsLine = (a) => [`${a.file} files`, a.url ? `${a.url} urls` : "", a.arxiv ? `${a.arxiv} papers` : "", a.other ? `${a.other} other` : ""].filter(Boolean).join(" \xB7 ");
    allPaths = (facts) => {
      const all = /* @__PURE__ */ new Set();
      for (const s of Object.values(facts.sessions)) for (const t of s.turns) for (const p of Object.keys(t.ops)) all.add(p);
      return all;
    };
    OP_MARK = { edit: "\u270F\uFE0F edit ", write: "\u270F\uFE0F write", read: "\u{1F4D6} read ", fetch: "\u{1F310} fetch", attach: "\u{1F4CE} attach" };
    EVIDENCE = {
      footprint: "observed",
      change: "observed, partial (first differing line)",
      askedBefore: "inferred (the earlier question a bare reply answers)",
      about: "inferred (a paragraph of the answer naming the file)",
      conclusion: "inferred (the answer's closing paragraph)"
    };
    CHECK_FRESH_MS = 10 * 6e4;
    refreshInBackground = null;
    vocabCache = null;
    TOPICS_FILE = path.join(HOME, "topics.json");
    TOPICS_VERSION = 1;
    emptyTopics = () => ({ version: TOPICS_VERSION, topics: [], labels: {}, labeledAt: {}, updatedAt: "" });
    loadTopics = async () => {
      try {
        const v = JSON.parse(await fsp.readFile(TOPICS_FILE, "utf8"));
        return v.version === TOPICS_VERSION ? { ...emptyTopics(), ...v } : emptyTopics();
      } catch {
        return emptyTopics();
      }
    };
    turnKey = (k, i) => `${k}#${i}`;
    cleanForJudge = (s) => s.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    labelStatus = { running: false, done: 0, total: 0, labeled: 0, errors: 0, startedAt: null, finishedAt: null, lastError: null, stopRequested: false };
    DOSSIERS_FILE = path.join(HOME, "dossiers.json");
    DOSSIERS_VERSION = 1;
    emptyDossiers = () => ({ version: DOSSIERS_VERSION, byTopic: {} });
    loadDossiers = async () => {
      try {
        const v = JSON.parse(await fsp.readFile(DOSSIERS_FILE, "utf8"));
        return v.version === DOSSIERS_VERSION ? { ...emptyDossiers(), ...v } : emptyDossiers();
      } catch {
        return emptyDossiers();
      }
    };
    emptyDossier = (topicId) => ({ topicId, sections: { what: [], decisions: [], now: [], open: [] }, sources: {}, covered: [], pending: [], changelog: [], builtAt: null, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    DOSSIERS_LOCK = path.join(HOME, "dossiers.lock");
    DOSSIERS_LOCK_WAIT_MS = 5e3;
    dossierWrites = Promise.resolve();
    CLI_VERSION = "0.5.2";
    MCP_TOOLS = [
      { name: "why_check", description: "Cheap first question before editing a file: does this artifact have any history in local agent sessions? One line; history true/false.", inputSchema: { type: "object", properties: { path: { type: "string", description: "file path (absolute or relative to cwd), URL, or arxiv:<id>" } }, required: ["path"] } },
      { name: "why_file", description: "The turns across local Claude Code, Codex, DeepSeek Harness, Pi and Weft sessions that touched a file, URL or paper: when, what changed (\u0394, observed), what was asked, what the answer said about it (\u2248, a candidate explanation, not a verified reason). Each hit carries a deep link.", inputSchema: { type: "object", properties: { path: { type: "string" }, include_read: { type: "boolean", description: "also list turns that only read it (default false)" }, limit: { type: "number", description: "max hits (default 10)" } }, required: ["path"] } },
      { name: "find", description: "Where these exact words were asked (Q), answered (A) or attached (M) across local sessions, canvases and the memories Claude Code and Codex keep for themselves. Exact, case-insensitive match; every hit is a verbatim snippet with a pointer.", inputSchema: { type: "object", properties: { phrase: { type: "string" }, in: { type: "string", enum: ["q", "a", "m", "all"] }, limit: { type: "number" } }, required: ["phrase"] } },
      { name: "recall_turn", description: "One turn in full \u2014 the question, the answer, the tool calls with their diffs \u2014 by session id (or prefix) and turn number as shown by why_file.", inputSchema: { type: "object", properties: { session: { type: "string" }, turn: { type: "number" } }, required: ["session", "turn"] } }
    ];
  }
});

// cli/src/bundle.ts
var bundle_exports = {};
__export(bundle_exports, {
  BUNDLES_DIR: () => BUNDLES_DIR,
  TAGS_DIR: () => TAGS_DIR,
  bundleRecord: () => bundleRecord,
  isBundleId: () => isBundleId,
  isValidTag: () => isValidTag,
  listBundles: () => listBundles,
  readBundleJson: () => readBundleJson,
  readBundleMarkdown: () => readBundleMarkdown,
  renderHandoffMarkdown: () => renderHandoffMarkdown,
  resolveRef: () => resolveRef,
  saveBundle: () => saveBundle
});
import { promises as fsp2, existsSync } from "node:fs";
import path2 from "node:path";
import os2 from "node:os";
function isBundleId(ref) {
  return ID_RE.test(ref);
}
function isValidTag(tag) {
  return TAG_RE.test(tag) && !tag.includes("/");
}
async function ensureDir(p) {
  await fsp2.mkdir(p, { recursive: true, mode: 448 });
}
async function symlinkTag(tagDir, tag, id2) {
  const link2 = path2.join(tagDir, tag);
  const target = path2.join("..", id2);
  await fsp2.rm(link2, { force: true });
  try {
    await fsp2.symlink(target, link2);
  } catch (err) {
    if (err.code !== "EPERM" && err.code !== "ENOSYS" && err.code !== "EACCES") throw err;
    await fsp2.writeFile(link2, JSON.stringify({ id: id2 }) + "\n", { mode: 384 });
  }
}
async function resolveTag(tagDir, tag) {
  const p = path2.join(tagDir, tag);
  if (!existsSync(p)) return null;
  const st = await fsp2.lstat(p);
  if (st.isSymbolicLink()) {
    const target = await fsp2.readlink(p);
    const id2 = path2.basename(target);
    return isBundleId(id2) ? id2 : null;
  }
  try {
    const v = JSON.parse(await fsp2.readFile(p, "utf8"));
    return typeof v.id === "string" && isBundleId(v.id) ? v.id : null;
  } catch {
    return null;
  }
}
async function resolveRef(ref) {
  if (isBundleId(ref)) {
    if (existsSync(path2.join(BUNDLES_DIR(), ref, "bundle.json"))) return { id: ref, via: "id" };
    throw new Error(`bundle ${ref} not found under ${BUNDLES_DIR()}`);
  }
  const id2 = await resolveTag(TAGS_DIR(), ref);
  if (!id2) throw new Error(`no bundle named "${ref}" \u2014 list with: weft bundle list`);
  return { id: id2, via: "tag" };
}
async function bundleRecord(id2) {
  const dir = path2.join(BUNDLES_DIR(), id2);
  return { jsonPath: path2.join(dir, "bundle.json"), mdPath: path2.join(dir, "bundle.md"), id: id2 };
}
async function saveBundle(input) {
  if (!isBundleId(input.id)) throw new Error(`bundle id must match ${ID_RE}, got ${input.id}`);
  const rec = await bundleRecord(input.id);
  await ensureDir(path2.dirname(rec.jsonPath));
  await fsp2.writeFile(rec.jsonPath, input.json, { mode: 384 });
  await fsp2.writeFile(rec.mdPath, input.markdown, { mode: 384 });
  if (input.tag) {
    if (!isValidTag(input.tag)) throw new Error(`invalid tag "${input.tag}" \u2014 letters/digits, '.', '_', '-', \u226464 chars, no slashes`);
    await ensureDir(TAGS_DIR());
    await symlinkTag(TAGS_DIR(), input.tag, rec.id);
  }
  return rec;
}
async function listBundles() {
  const dir = BUNDLES_DIR();
  if (!existsSync(dir)) return [];
  const entries = await fsp2.readdir(dir, { withFileTypes: true });
  const tagToId = /* @__PURE__ */ new Map();
  const tagDir = TAGS_DIR();
  if (existsSync(tagDir)) {
    for (const t of await fsp2.readdir(tagDir)) {
      const id2 = await resolveTag(tagDir, t);
      if (!id2) continue;
      tagToId.set(id2, [...tagToId.get(id2) ?? [], t]);
    }
  }
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory() || !isBundleId(e.name)) continue;
    const rec = await bundleRecord(e.name);
    let meta = {};
    try {
      meta = JSON.parse(await fsp2.readFile(rec.jsonPath, "utf8"));
    } catch {
    }
    out.push({
      id: e.name,
      tags: tagToId.get(e.name)?.sort() ?? [],
      created_at: meta.created_at,
      project: meta.graph?.project_id ?? null,
      target_node: meta.graph?.target_node_id,
      estimated_tokens: meta.budget?.estimated_tokens,
      content_hash: meta.integrity?.content_hash
    });
  }
  out.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
  return out;
}
async function readBundleMarkdown(id2) {
  return fsp2.readFile((await bundleRecord(id2)).mdPath, "utf8");
}
async function readBundleJson(id2) {
  return fsp2.readFile((await bundleRecord(id2)).jsonPath, "utf8");
}
function renderHandoffMarkdown(bundle, anchor) {
  const out = [];
  out.push("The following is existing context compiled from my thought graph (Weft), the working basis for this session. Read it fully, confirm your understanding, then wait for my experiment instructions.");
  out.push("");
  for (const item of bundle.context.messages) {
    const text3 = item.content[0].text;
    switch (item.source.layer) {
      case "system":
        out.push(`**Role constraint:** ${text3}`);
        break;
      case "chain":
        out.push(item.role === "assistant" ? `**A:** ${text3}` : `**Q:** ${text3}`);
        break;
      default:
        out.push(text3);
    }
    out.push("");
  }
  out.push("---");
  out.push("That is all existing context. The anchor line below carries this session's yield back to the thought graph afterwards \u2014 leave it as is (no action needed).");
  out.push("");
  out.push(`[Weft anchor: project=${anchor.project} node=${anchor.node} bundle=${anchor.bundle}${anchor.mode === "continue" ? " mode=continue" : ""}]`);
  return out.join("\n");
}
var ID_RE, TAG_RE, HOME2, BUNDLES_DIR, TAGS_DIR;
var init_bundle = __esm({
  "cli/src/bundle.ts"() {
    init_define_import_meta_env();
    ID_RE = /^cb_[0-9a-f]{16}$/;
    TAG_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;
    HOME2 = () => process.env.WEFT_HOME ?? path2.join(os2.homedir(), ".weft");
    BUNDLES_DIR = () => path2.join(HOME2(), "bundles");
    TAGS_DIR = () => path2.join(BUNDLES_DIR(), "tags");
  }
});

// src/lib/attachment-fingerprint.ts
function contentHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i) | 0;
  return (h >>> 0).toString(36);
}
function attachmentPayloadHash(att) {
  let h = hashCache.get(att);
  if (h === void 0) {
    h = contentHash([att.type, att.content ?? "", att.extractedText ?? "", att.renderMode ?? "full"].join("|"));
    hashCache.set(att, h);
  }
  return h;
}
function attachmentFingerprint(att) {
  return `${att.name}|${att.size}|${attachmentPayloadHash(att)}`;
}
var hashCache;
var init_attachment_fingerprint = __esm({
  "src/lib/attachment-fingerprint.ts"() {
    init_define_import_meta_env();
    hashCache = /* @__PURE__ */ new WeakMap();
  }
});

// src/lib/highlight-match.ts
function fuzzyHighlightRegex(text3) {
  const chars = [...text3.trim()];
  if (chars.length === 0) return null;
  const parts = [];
  let pendingWs = false;
  for (const ch of chars) {
    if (/\s/.test(ch)) {
      pendingWs = true;
      continue;
    }
    const escaped = ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (parts.length === 0) parts.push(escaped);
    else if (pendingWs) parts.push(`${MD_NOISE}${WS_GAP}${MD_NOISE}${escaped}`);
    else parts.push(`${MD_NOISE}${escaped}`);
    pendingWs = false;
  }
  try {
    return new RegExp(MD_NOISE + parts.join("") + MD_NOISE, "g");
  } catch {
    return null;
  }
}
var MD_NOISE, WS_GAP;
var init_highlight_match = __esm({
  "src/lib/highlight-match.ts"() {
    init_define_import_meta_env();
    MD_NOISE = "[*_`~()#>\\[\\]|-]*";
    WS_GAP = `\\s+(?:(?:\\d{1,3}[.)]|[-*+>|]|#{1,6}|[-:|]{3,})\\s+)*`;
  }
});

// src/store/context-builder.ts
function nodeTitle(node) {
  const q = node.data.question.replace(/\s+/g, " ").trim();
  return q.length > 60 ? `${q.slice(0, 60)}\u2026` : q;
}
function renderResponse(node) {
  const mode = node.data.highlightMode || "off";
  const highlights = node.data.highlights || [];
  if (mode === "filter" && highlights.length > 0) {
    return highlights.map((h) => h.text).join("\n\n");
  }
  if (mode === "tag" && highlights.length > 0) {
    let tagged = node.data.response;
    for (const h of highlights) {
      const re = fuzzyHighlightRegex(h.text);
      if (re) tagged = tagged.replace(re, (m) => `[Important] ${m} [/Important]`);
    }
    return tagged;
  }
  return node.data.response;
}
function transcriptLines(node) {
  const lines = [];
  if (node.data.question) lines.push(`Q: ${node.data.question}`);
  const a = renderResponse(node);
  if (a) lines.push(`A: ${a}`);
  return lines;
}
function referenceBlockContent(ref) {
  const lines = [`[Reference: ${nodeTitle(ref.source)}]`];
  if (ref.depth === "quote") {
    const trail = ref.chain.filter((n) => !n.data.archived).map((n) => nodeTitle(n));
    if (trail.length > 0) lines.push(`Trail (upstream questions): ${trail.join(" \u2192 ")}`);
    lines.push(...transcriptLines(ref.source));
  } else {
    for (const n of [...ref.chain, ref.source]) {
      if (n.data.archived) continue;
      lines.push(...transcriptLines(n));
    }
  }
  return lines.join("\n");
}
function hashContext(messages, images = []) {
  const s = JSON.stringify(messages) + `#img:${images.map((i) => `${i.mimeType}:${contentHash(i.data ?? "")}`).join(",")}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i) | 0;
  return (h >>> 0).toString(36);
}
function upstreamFingerprint(nodeId, nodes, edges) {
  const self = nodes.find((n) => n.id === nodeId);
  const normalized2 = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      isCollapsed: false,
      summary: void 0,
      summaries: void 0,
      summaryTypes: void 0,
      generatedBy: void 0,
      ...n.id === nodeId ? { response: "" } : {}
    }
  }));
  const { messages, images } = buildContext(
    nodeId,
    normalized2,
    edges,
    self?.data.branchContext,
    self?.data.excludedAttachmentIds,
    self?.data.includedAttachmentIds
  );
  return hashContext(messages, images);
}
function upstreamParts(nodeId, nodes, edges) {
  const self = nodes.find((n) => n.id === nodeId);
  const normalized2 = nodes.map((n) => ({
    ...n,
    data: { ...n.data, isCollapsed: false, summary: void 0, summaries: void 0, summaryTypes: void 0, generatedBy: void 0, ...n.id === nodeId ? { response: "" } : {} }
  }));
  const { messages, sources } = buildContext(
    nodeId,
    normalized2,
    edges,
    self?.data.branchContext,
    self?.data.excludedAttachmentIds,
    self?.data.includedAttachmentIds
  );
  const byNode = /* @__PURE__ */ new Map();
  messages.forEach((m, i) => {
    const src = sources?.[i];
    const uid = src?.refSourceId ?? src?.nodeId;
    if (!uid || uid === nodeId) return;
    const txt = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    const list = byNode.get(uid) ?? [];
    list.push(txt);
    byNode.set(uid, list);
  });
  const out = {};
  for (const [uid, parts] of byNode) {
    const text3 = parts.join("\n");
    out[uid] = { h: djb2(text3), head: text3.replace(/\s+/g, " ").slice(0, 240), text: text3 };
  }
  return out;
}
function resolveRoleFromMainline(mainline, nodes, opts) {
  const self = mainline[mainline.length - 1];
  if (!self) return void 0;
  if (!opts?.ignoreOwn && self.data.roleSourceNodeId) {
    if (self.data.roleSourceNodeId === "__none__") return void 0;
    const src = nodes.find((n) => n.id === self.data.roleSourceNodeId);
    return src?.data.rolePrompt || void 0;
  }
  for (let i = mainline.length - 1; i >= 0; i--) {
    const n = mainline[i];
    const isSelf = i === mainline.length - 1;
    const own = isSelf && opts?.ignoreOwn ? void 0 : n.data.rolePrompt;
    const mode = n.data.roleMode || "inherit";
    if (mode === "reset") {
      return isSelf ? own || void 0 : void 0;
    }
    if (mode === "set-next" && n.data.rolePrompt) {
      if (isSelf) continue;
      return n.data.rolePrompt;
    }
    if (mode === "inherit" && own) return own;
  }
  return void 0;
}
function buildContext(nodeId, nodes, edges, branchContext, excludedAttachmentIds, includedAttachmentIds, staleIds) {
  const messages = [];
  const images = [];
  const sources = [];
  const imageSources = [];
  const layerTokens = { material: 0, reference: 0, chain: 0 };
  let layerStart = 0;
  const closeLayer = (layer) => {
    for (let i = layerStart; i < messages.length; i++) layerTokens[layer] += countTokens(messages[i].content);
    layerStart = messages.length;
  };
  const staleSet = staleIds instanceof Set ? staleIds : new Set(staleIds ?? []);
  const { materials, references, mainline } = partitionContext(nodeId, nodes, edges);
  const excludeSet = new Set(excludedAttachmentIds || []);
  const includeOverrides = new Set(includedAttachmentIds || []);
  for (const node of [...materials, ...mainline]) {
    for (const exId of node.data.excludedAttachmentIds || []) {
      if (!includeOverrides.has(exId)) excludeSet.add(exId);
    }
  }
  const seenAttachmentFingerprints = /* @__PURE__ */ new Set();
  const toolReach = toolOutputReach(nodeId, edges);
  const leftOut = (node, att) => excludeSet.has(att.id) || isToolOutput(att) && !toolReach.has(node.id) && !includeOverrides.has(att.id);
  const pushAttachments = (node, layer) => {
    const attSource = (att) => ({ layer, nodeId: node.id, attachmentId: att.id, part: "attachment" });
    const pointers = /* @__PURE__ */ new Map();
    let pointerSource = null;
    for (const att of node.data.attachments || []) {
      if (leftOut(node, att)) {
        if (att.op && att.paths?.length) {
          pointerSource ??= att;
          const set = pointers.get(att.op) ?? /* @__PURE__ */ new Set();
          for (const p of att.paths) set.add(p.split("/").filter(Boolean).pop() ?? p);
          pointers.set(att.op, set);
        }
        continue;
      }
      const fp = attachmentFingerprint(att);
      if (seenAttachmentFingerprints.has(fp)) continue;
      seenAttachmentFingerprints.add(fp);
      if (att.type.startsWith("image/")) {
        if (att.extractedText) {
          messages.push({ role: "user", content: `[Image: ${att.name}]
${att.extractedText}` });
          sources.push(attSource(att));
        }
        if (att.renderMode !== "text-only") {
          images.push({ data: att.content, mimeType: att.type, ...att.extractedText?.trim() ? { hasCompanion: true } : {} });
          imageSources.push({ nodeId: node.id, attachmentId: att.id });
        }
      } else if (att.type === "application/pdf") {
        if (att.extractedText) {
          messages.push({ role: "user", content: `[PDF: ${att.name}]
${att.extractedText}` });
        } else {
          messages.push({ role: "user", content: `[PDF: ${att.name} \u2014 no extracted text yet (scanned or still extracting). The reader's Recognize can turn its pages into readable text.]` });
        }
        sources.push(attSource(att));
      } else if (att.type === "text/html") {
        const body = att.extractedText?.trim();
        messages.push({
          role: "user",
          content: body ? `[File: ${att.name}]
${body}` : `[File: ${att.name} \u2014 HTML with no extractable text yet]`
        });
        sources.push(attSource(att));
      } else {
        messages.push({ role: "user", content: `[File: ${att.name}]
${att.content}` });
        sources.push(attSource(att));
      }
    }
    if (pointers.size > 0 && pointerSource) {
      const parts = [...pointers.entries()].map(([op, set]) => `${op}: ${[...set].join(", ")}`);
      const where = node.data.agentSession?.cwd ?? node.data.importSource?.cwd;
      messages.push({ role: "user", content: `[Files this turn touched${where ? ` in ${where}` : ""} \u2014 contents not included] ${parts.join("; ")}` });
      sources.push(attSource(pointerSource));
    }
  };
  for (const node of materials) {
    if (node.data.archived) continue;
    pushAttachments(node, "material");
    if (node.data.question) {
      const content = node.data.stepKind === "note" ? `[Note]
${node.data.question}` : node.data.stepKind === "link" ? `[Link snapshot: ${node.data.linkUrl ?? ""} @ ${(node.data.linkFetchedAt ?? "").slice(0, 10)}]
${node.data.question}` : node.data.question;
      messages.push({ role: "user", content });
      sources.push({ layer: "material", nodeId: node.id, part: "question" });
    }
  }
  closeLayer("material");
  for (const ref of references) {
    if (ref.source.data.archived) continue;
    messages.push({ role: "user", content: referenceBlockContent(ref) });
    sources.push({ layer: "reference", refSourceId: ref.source.id, part: "reference" });
  }
  closeLayer("reference");
  for (const node of mainline) {
    if (node.data.archived) continue;
    pushAttachments(node, "chain");
    if (node.data.question) {
      messages.push({ role: "user", content: node.data.question });
      sources.push({ layer: "chain", nodeId: node.id, part: "question" });
    }
    if (node.data.response) {
      const rendered = renderResponse(node);
      messages.push({ role: "assistant", content: staleSet.has(node.id) ? `${STALE_MARK}
${rendered}` : rendered });
      sources.push({ layer: "chain", nodeId: node.id, part: "response" });
    }
  }
  if (branchContext) {
    messages.push({ role: "user", content: `[Regarding this passage: "${branchContext}"]` });
    sources.push({ layer: "branch", nodeId, part: "passage" });
  }
  closeLayer("chain");
  const resolvedRole = resolveRoleFromMainline(mainline, nodes);
  if (resolvedRole) {
    messages.unshift({ role: "system", content: resolvedRole });
    sources.unshift({ layer: "system", part: "role" });
  }
  return { messages, images, layerTokens, sources, imageSources };
}
var djb2, recordParts, STALE_MARK;
var init_context_builder = __esm({
  "src/store/context-builder.ts"() {
    init_define_import_meta_env();
    init_graph();
    init_attachment_fingerprint();
    init_utils();
    init_highlight_match();
    djb2 = (s) => {
      let h = 5381;
      for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i) | 0;
      return (h >>> 0).toString(36);
    };
    recordParts = (parts) => Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, { h: v.h, head: v.head }]));
    STALE_MARK = "[Stale: this answer was written against an earlier version of its upstream]";
  }
});

// src/lib/context-bundle.ts
var context_bundle_exports = {};
__export(context_bundle_exports, {
  canonicalStringify: () => canonicalStringify,
  compileContextBundle: () => compileContextBundle,
  graphSnapshotHash: () => graphSnapshotHash,
  semanticSnapshot: () => semanticSnapshot,
  sha256Hex: () => sha256Hex
});
function canonicalStringify(value) {
  const sort = (v) => {
    if (Array.isArray(v)) return v.map(sort);
    if (v && typeof v === "object") {
      const out = {};
      for (const k of Object.keys(v).sort()) {
        const x = v[k];
        if (x !== void 0) out[k] = sort(x);
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(sort(value));
}
async function sha256Hex(text3) {
  const digest3 = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text3));
  return [...new Uint8Array(digest3)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function semanticSnapshot(nodes, edges) {
  const nodePart = [...nodes].sort((a, b) => a.id < b.id ? -1 : 1).map((n) => ({
    id: n.id,
    stepKind: n.data.stepKind,
    question: n.data.question,
    response: n.data.response,
    archived: n.data.archived || void 0,
    branchContext: n.data.branchContext || void 0,
    highlightMode: n.data.highlightMode !== "off" ? n.data.highlightMode : void 0,
    highlights: (n.data.highlights ?? []).length > 0 ? n.data.highlights.map((h) => h.text) : void 0,
    linkUrl: n.data.linkUrl,
    linkFetchedAt: n.data.linkFetchedAt,
    rolePrompt: n.data.rolePrompt,
    roleMode: n.data.roleMode,
    excludedAttachmentIds: n.data.excludedAttachmentIds?.length ? n.data.excludedAttachmentIds : void 0,
    attachments: (n.data.attachments ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      fingerprint: attachmentFingerprint(a),
      extractedText: a.extractedText,
      renderMode: a.renderMode
    }))
  }));
  const edgePart = [...edges].sort((a, b) => a.id < b.id ? -1 : 1).map((e) => ({
    source: e.source,
    target: e.target,
    isCrossLink: e.data?.isCrossLink || void 0,
    isWatch: e.data?.isWatch || void 0,
    contextDepth: e.data?.contextDepth
  }));
  return { nodes: nodePart, edges: edgePart };
}
async function graphSnapshotHash(nodes, edges) {
  return `sha256:${await sha256Hex(canonicalStringify(semanticSnapshot(nodes, edges)))}`;
}
function projectionMode(att) {
  if (att.type.startsWith("image/")) {
    const pixels = att.renderMode !== "text-only";
    const text3 = !!att.extractedText?.trim();
    return pixels && text3 ? "extracted_text+pixels" : pixels ? "pixels" : text3 ? "extracted_text" : "placeholder";
  }
  return att.extractedText?.trim() || att.type.startsWith("text/") ? "extracted_text" : "placeholder";
}
async function compileContextBundle(targetNodeId, nodes, edges, opts) {
  const built = buildContext(targetNodeId, nodes, edges, opts.branchContext, void 0, void 0, opts.staleIds);
  const target = nodes.find((n) => n.id === targetNodeId);
  const messages = built.messages.map((m, i) => {
    const src = built.sources[i] ?? { layer: "chain" };
    return {
      id: `item_${String(i + 1).padStart(3, "0")}`,
      kind: "message",
      role: m.role,
      content: [{ type: "text", text: m.content }],
      source: {
        layer: src.layer,
        part: src.part,
        node_id: src.nodeId ?? src.refSourceId,
        attachment_id: src.attachmentId
      },
      selection: { mode: "full", reason: `structural-${src.layer}` }
    };
  });
  const byAttachment = /* @__PURE__ */ new Map();
  const collect = (nodeId, attachmentId) => {
    if (!nodeId || !attachmentId || byAttachment.has(attachmentId)) return;
    const node = nodes.find((n) => n.id === nodeId);
    const att = node?.data.attachments?.find((a) => a.id === attachmentId);
    if (!node || !att) return;
    byAttachment.set(attachmentId, {
      id: attachmentId,
      kind: att.type.startsWith("image/") ? "image" : "document",
      name: att.name,
      mime_type: att.type,
      size: att.size,
      fingerprint: attachmentFingerprint(att),
      model_projection: { mode: projectionMode(att) },
      source: { node_id: node.id }
    });
  };
  built.sources.forEach((s) => collect(s.nodeId, s.attachmentId));
  built.imageSources.forEach((s) => collect(s.nodeId, s.attachmentId));
  const references = built.sources.filter((s) => s.layer === "reference" && s.refSourceId).map((s) => ({ source_node_id: s.refSourceId }));
  const body = {
    format: "weft.context-bundle",
    version: 0,
    graph: {
      project_id: opts.projectId ?? null,
      snapshot_hash: await graphSnapshotHash(nodes, edges),
      target_node_id: targetNodeId
    },
    intent: {
      task: opts.task ?? target?.data.question ?? "",
      language: opts.language ?? null
    },
    context: { messages, materials: [...byAttachment.values()], references },
    execution_hints: {
      preferred_model: opts.preferredModel ?? target?.data.model ?? null,
      required_tools: [],
      required_mcp_servers: []
    },
    budget: {
      estimated_tokens: built.messages.reduce((s, m) => s + countTokens(m.content), 0),
      limit: null,
      truncation: "none"
    }
  };
  const contentHash2 = await sha256Hex(canonicalStringify(body));
  return {
    ...body,
    id: `cb_${contentHash2.slice(0, 16)}`,
    created_at: opts.now,
    provenance: { source_runs: [], compiler: { name: "weft", adapter_id: null } },
    integrity: { content_hash: `sha256:${contentHash2}` }
  };
}
var init_context_bundle = __esm({
  "src/lib/context-bundle.ts"() {
    init_define_import_meta_env();
    init_context_builder();
    init_attachment_fingerprint();
    init_utils();
  }
});

// src/lib/recompute-plan.ts
function recomputePlan(nodes, edges, stale) {
  const dependencies = /* @__PURE__ */ new Map();
  for (const n of nodes.filter((n2) => !n2.data.archived && !NON_GENERATING.has(n2.data.stepKind ?? ""))) {
    const p = partitionContext(n.id, nodes, edges);
    dependencies.set(n.id, [
      ...p.mainline.filter((x) => x.id !== n.id && !x.data.archived).map((x) => ({ id: x.id, ch: "solid" })),
      ...p.references.filter((r) => !r.source.data.archived).flatMap((r) => [
        { id: r.source.id, ch: "ref-source" },
        // chain nodes render only as a one-line question trail (quote) or a
        // transcript (full), but a fresh change on them is already reflected
        // in the exact fingerprint — the flood never forwards them blindly
        ...r.chain.filter((x) => !x.data.archived).map((x) => ({ id: x.id, ch: "trail" }))
      ])
    ]);
  }
  const originalStale = new Set(stale);
  const affected = new Set(stale);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [id2, deps] of dependencies) {
      if (affected.has(id2)) continue;
      const reachable = deps.some((dep) => dep.ch === "solid" ? affected.has(dep.id) : dep.ch === "ref-source" ? originalStale.has(dep.id) : false);
      if (reachable) {
        affected.add(id2);
        changed = true;
      }
    }
  }
  const plan = [];
  const remaining = new Set(affected);
  while (remaining.size) {
    const ready = [...remaining].filter((id2) => !(dependencies.get(id2) ?? []).some((d) => remaining.has(d.id)));
    if (!ready.length) break;
    for (const id2 of ready) {
      plan.push(id2);
      remaining.delete(id2);
    }
  }
  const dependsOn = new Map([...dependencies].map(([id2, deps]) => [id2, deps.map((d) => d.id)]));
  return { plan, blocked: [...remaining], dependsOn };
}
var NON_GENERATING;
var init_recompute_plan = __esm({
  "src/lib/recompute-plan.ts"() {
    init_define_import_meta_env();
    init_graph();
    NON_GENERATING = /* @__PURE__ */ new Set(["note", "file", "link", "frame"]);
  }
});

// src/lib/host-handoff.ts
function fail(code, message) {
  throw new HostHandoffError(code, message);
}
function object(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function text(v, name, nonempty = false) {
  if (typeof v !== "string" || nonempty && !v.trim()) fail("INVALID_SHAPE", `${name} must be ${nonempty ? "nonempty " : ""}text`);
}
function stringArray(v, name) {
  if (v !== void 0 && (!Array.isArray(v) || v.some((x) => typeof x !== "string"))) fail("INVALID_SHAPE", `${name} must be a string array`);
}
function byteLength(s) {
  return new TextEncoder().encode(s).byteLength;
}
function budget(limit = HOST_MAX_BYTES) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > HOST_MAX_BYTES) fail("INVALID_LIMIT", `maxBytes must be 1..${HOST_MAX_BYTES}`);
  return limit;
}
function jsonSize(value, limit = HOST_MAX_BYTES) {
  const ancestors = /* @__PURE__ */ new Set();
  let size = 0;
  const walk2 = (v, depth) => {
    if (depth > 64) fail("TOO_DEEP", "JSON nesting exceeds 64");
    if (v === void 0) return;
    if (typeof v === "string") size += byteLength(JSON.stringify(v));
    else if (typeof v === "number") {
      if (!Number.isFinite(v)) fail("INVALID_SHAPE", "Numbers must be finite");
      size += 24;
    } else if (v === null || typeof v === "boolean") size += 5;
    else if (typeof v === "object") {
      if (ancestors.has(v)) fail("JSON_CYCLE", "Cyclic JSON object");
      if (!Array.isArray(v) && Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) fail("INVALID_SHAPE", "Only plain JSON objects are accepted");
      ancestors.add(v);
      size += 2;
      for (const [key, child] of Object.entries(v)) {
        if (["__proto__", "constructor", "prototype"].includes(key)) fail("INVALID_KEY", `Unsafe JSON key: ${key}`);
        size += byteLength(key) + 4;
        walk2(child, depth + 1);
        if (size > limit) fail("TOO_LARGE", `Payload exceeds ${limit} bytes`);
      }
      ancestors.delete(v);
    } else fail("INVALID_SHAPE", "Non-JSON value");
    if (size > limit) fail("TOO_LARGE", `Payload exceeds ${limit} bytes`);
  };
  walk2(value, 0);
}
function clone(v) {
  return JSON.parse(JSON.stringify(v));
}
function assertAcyclic(ids, edges, label) {
  const outgoing = new Map(ids.map((id2) => [id2, []]));
  const indegree = new Map(ids.map((id2) => [id2, 0]));
  for (const e of edges) {
    outgoing.get(e.source).push(e.target);
    indegree.set(e.target, indegree.get(e.target) + 1);
  }
  const queue = ids.filter((id2) => indegree.get(id2) === 0);
  const depth = new Map(ids.map((id2) => [id2, 1]));
  for (let i = 0; i < queue.length; i++) {
    const id2 = queue[i];
    for (const child of outgoing.get(id2)) {
      depth.set(child, Math.max(depth.get(child), depth.get(id2) + 1));
      if (depth.get(child) > MAX_DEPTH) fail("TOO_DEEP", `Graph path exceeds ${MAX_DEPTH}`);
      indegree.set(child, indegree.get(child) - 1);
      if (!indegree.get(child)) queue.push(child);
    }
  }
  if (queue.length !== ids.length) fail("GRAPH_CYCLE", `${label} cycle`);
}
function validateGraph(value, maxBytes = HOST_MAX_BYTES) {
  jsonSize(value, budget(maxBytes));
  if (!object(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) fail("INVALID_GRAPH", "Expected a native graph with nodes and edges arrays");
  if (value.nodes.length > MAX_NODES || value.edges.length > MAX_EDGES) fail("GRAPH_LIMIT", `At most ${MAX_NODES} nodes and ${MAX_EDGES} edges`);
  if (value.projectId !== void 0) text(value.projectId, "projectId");
  if (value.name !== void 0) text(value.name, "name");
  if (value.version !== void 0 && (!Number.isSafeInteger(value.version) || Number(value.version) < 0)) fail("INVALID_GRAPH", "Invalid graph version");
  const ids = /* @__PURE__ */ new Set();
  for (const n of value.nodes) {
    if (!object(n)) fail("INVALID_NODE", "Node must be an object");
    text(n.id, "node.id", true);
    if (ids.has(n.id)) fail("DUPLICATE_ID", `Duplicate node ${n.id}`);
    ids.add(n.id);
    if (!object(n.position) || typeof n.position.x !== "number" || !Number.isFinite(n.position.x) || typeof n.position.y !== "number" || !Number.isFinite(n.position.y)) fail("INVALID_POSITION", `Invalid position for ${n.id}`);
    if (n.type !== void 0 && n.type !== "thought") fail("INVALID_NODE", `Unsupported native node type for ${n.id}`);
    if (!object(n.data)) fail("INVALID_NODE", `Missing data for ${n.id}`);
    const d = n.data;
    if (d.stepKind !== void 0 && !["human", "prompt", "note", "file", "link", "frame", "step", "fanout", "review", "synthesis"].includes(String(d.stepKind))) fail("INVALID_NODE", "Invalid stepKind");
    if (d.roleMode !== void 0 && !["inherit", "set-next", "reset"].includes(String(d.roleMode))) fail("INVALID_NODE", "Invalid roleMode");
    text(d.question, "question");
    text(d.response, "response");
    for (const key of ["branchContext", "rolePrompt", "roleMode", "roleSourceNodeId", "lastContextHash", "linkUrl", "linkFetchedAt"]) if (d[key] !== void 0) text(d[key], key);
    for (const key of ["responses", "questions", "excludedAttachmentIds", "includedAttachmentIds"]) stringArray(d[key], key);
    if (!Array.isArray(d.responses)) fail("INVALID_NODE", "Native responses array is required");
    if (!Number.isInteger(d.responseIndex) || Number(d.responseIndex) < -1 || d.responses.length > 0 && Number(d.responseIndex) >= d.responses.length || !d.responses.length && Number(d.responseIndex) > 0) fail("INVALID_VERSION", `Invalid responseIndex for ${n.id}`);
    for (const key of VERSION_ARRAYS) {
      if (d[key] !== void 0 && (!Array.isArray(d[key]) || d[key].length > d.responses.length)) fail("INVALID_VERSION", `${key} is not aligned with responses`);
      for (const entry of d[key] ?? []) {
        if (entry == null) continue;
        const valid = key === "gatewaySearches" ? typeof entry === "boolean" : ["summaryTypeConfidences", "summaryConclusiveness"].includes(key) ? typeof entry === "number" && Number.isFinite(entry) : key === "summaryLadders" ? object(entry) : typeof entry === "string";
        if (!valid) fail("INVALID_VERSION", `Invalid ${key} entry`);
      }
    }
    if (d.highlights !== void 0 && (!Array.isArray(d.highlights) || d.highlights.some((h) => !object(h) || typeof h.text !== "string"))) fail("INVALID_NODE", "Invalid highlights");
    if (d.highlightMode !== void 0 && !["off", "tag", "filter"].includes(String(d.highlightMode))) fail("INVALID_NODE", "Invalid highlight mode");
    for (const key of ["archived", "isCollapsed", "isLoading"]) if (d[key] !== void 0 && typeof d[key] !== "boolean") fail("INVALID_NODE", `${key} must be boolean`);
    if (d.attachments !== void 0 && !Array.isArray(d.attachments)) fail("INVALID_ATTACHMENT", "attachments must be an array");
    const attIds = /* @__PURE__ */ new Set();
    for (const a of d.attachments ?? []) {
      if (!object(a)) fail("INVALID_ATTACHMENT", "Attachment must be an object");
      for (const key of ["id", "name", "type", "content"]) text(a[key], `attachment.${key}`, key === "id" || key === "type");
      if (attIds.has(a.id)) fail("DUPLICATE_ID", `Duplicate attachment ${a.id}`);
      attIds.add(a.id);
      if (typeof a.size !== "number" || !Number.isSafeInteger(a.size) || a.size < 0) fail("INVALID_ATTACHMENT", "Invalid attachment size");
      if (a.extractedText !== void 0) text(a.extractedText, "extractedText");
      if (a.renderMode !== void 0 && !["full", "text-only"].includes(String(a.renderMode))) fail("INVALID_ATTACHMENT", "Invalid renderMode");
      stringArray(a.paths, "attachment.paths");
      if (a.contentInVault !== void 0 && typeof a.contentInVault !== "boolean") fail("INVALID_ATTACHMENT", "contentInVault must be boolean");
      if (a.contentInVault && (!a.content || typeof a.content === "string" && !a.content.trim())) fail("UNHYDRATED_ATTACHMENT", `Export/hydrate attachment ${a.id} before handoff`);
    }
  }
  const edgeIds = /* @__PURE__ */ new Set();
  for (const e of value.edges) {
    if (!object(e)) fail("INVALID_EDGE", "Edge must be an object");
    text(e.id, "edge.id", true);
    text(e.source, "edge.source", true);
    text(e.target, "edge.target", true);
    if (edgeIds.has(e.id)) fail("DUPLICATE_ID", `Duplicate edge ${e.id}`);
    edgeIds.add(e.id);
    if (!ids.has(e.source) || !ids.has(e.target)) fail("DANGLING_EDGE", `Invalid endpoints for ${e.id}`);
    if (e.source === e.target) fail("GRAPH_CYCLE", `Self-reference ${e.id}`);
    if (e.data !== void 0 && !object(e.data)) fail("INVALID_EDGE", "Edge data must be an object");
    if (object(e.data)) {
      for (const key of ["isCrossLink", "isWatch"]) if (e.data[key] !== void 0 && typeof e.data[key] !== "boolean") fail("INVALID_EDGE", `${key} must be boolean`);
      if (e.data.contextDepth !== void 0 && !["quote", "full"].includes(String(e.data.contextDepth))) fail("INVALID_EDGE", "Invalid contextDepth");
      if (e.data.contextOrder !== void 0 && (typeof e.data.contextOrder !== "number" || !Number.isFinite(e.data.contextOrder))) fail("INVALID_EDGE", "Invalid contextOrder");
    }
  }
  const edges = value.edges;
  const structural = edges.filter((e) => !e.data?.isCrossLink);
  assertAcyclic([...ids], structural, "Structural");
  assertAcyclic([...ids], edges.filter((e) => !e.data?.isCrossLink || e.data.contextDepth === "full"), "Full-reference dependency");
  const children = new Map([...ids].map((id2) => [id2, []]));
  for (const e of structural) children.get(e.source).push(e.target);
  const descendants = /* @__PURE__ */ new Map();
  for (const e of edges.filter((e2) => e2.data?.isCrossLink)) {
    if (!descendants.has(e.target)) {
      const seen = /* @__PURE__ */ new Set();
      const q = [e.target];
      for (let i = 0; i < q.length; i++) for (const c of children.get(q[i])) if (!seen.has(c)) {
        seen.add(c);
        q.push(c);
      }
      descendants.set(e.target, seen);
    }
    if (descendants.get(e.target).has(e.source)) fail("REFERENCE_FEEDBACK", `Reference ${e.id} feeds a structural descendant back into its ancestor`);
  }
  for (const n of value.nodes) {
    const role = n.data.roleSourceNodeId;
    if (role && role !== "__none__" && !ids.has(role)) fail("DANGLING_ROLE", `Missing role source ${role}`);
  }
}
function semanticGraph(g) {
  return {
    projectId: g.projectId,
    version: g.version,
    nodes: g.nodes.map((n) => ({ id: n.id, type: n.type, data: Object.fromEntries(Object.entries(n.data).filter(([k]) => !VIEW_DATA.has(k))) })),
    // Preserve array order: it is the native tie-breaker for context ordering.
    edges: g.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: e.data && Object.fromEntries(Object.entries(e.data).filter(([k]) => !["focusRole", "branchYRatio"].includes(k)))
    }))
  };
}
async function digest(value) {
  return `sha256:${await sha256Hex(canonicalStringify(value))}`;
}
function targetNode(g, id2) {
  const n = g.nodes.find((n2) => n2.id === id2);
  if (!n) fail("TARGET_NOT_FOUND", `Target ${id2} does not exist`);
  if (NON_GENERATING2.has(n.data.stepKind ?? "") || n.data.archived) fail("INVALID_TARGET", "Target must be an active dialogue/processing node");
  return n;
}
function compiled(g, id2, stale = []) {
  const target = targetNode(g, id2);
  const nodes = g.nodes.map((n) => n.id === id2 ? { ...n, data: { ...n.data, response: "" } } : n);
  const partition = partitionContext(id2, nodes, g.edges);
  const attachmentNodes = [...partition.materials, ...partition.mainline];
  const excluded = new Set(target.data.excludedAttachmentIds ?? []);
  const included = new Set(target.data.includedAttachmentIds ?? []);
  for (const n of attachmentNodes) for (const ex of n.data.excludedAttachmentIds ?? []) if (!included.has(ex)) excluded.add(ex);
  const seen = /* @__PURE__ */ new Map();
  for (const n of attachmentNodes) {
    if (n.data.archived) continue;
    for (const a of n.data.attachments ?? []) {
      if (excluded.has(a.id)) continue;
      const fp = attachmentFingerprint(a);
      const full = canonicalStringify({ type: a.type, content: a.content, extractedText: a.extractedText, renderMode: a.renderMode });
      if (seen.has(fp) && seen.get(fp) !== full) fail("ATTACHMENT_FINGERPRINT_COLLISION", `Native attachment dedup would omit distinct payload ${a.id}; rename or resolve the duplicate in the canvas`);
      seen.set(fp, full);
    }
  }
  const built = buildContext(id2, nodes, g.edges, target.data.branchContext, target.data.excludedAttachmentIds, target.data.includedAttachmentIds, stale);
  const images = built.images.map((image, i) => {
    const source = built.imageSources[i];
    if (!source || !image.data || !/^image\/[\w.+-]+$/.test(image.mimeType)) fail("INVALID_IMAGE", "Missing image payload, MIME or source");
    if (image.data.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.data)) fail("INVALID_IMAGE", `Image ${source.attachmentId} requires actual base64 pixels`);
    const bytes = Uint8Array.from(atob(image.data.slice(0, 128)), (c) => c.charCodeAt(0));
    const ascii = (start, length) => String.fromCharCode(...bytes.slice(start, start + length));
    const mime = image.mimeType.toLowerCase();
    const pixelHeader = mime === "image/png" ? bytes[0] === 137 && ascii(1, 3) === "PNG" : ["image/jpeg", "image/jpg"].includes(mime) ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : mime === "image/gif" ? ["GIF87a", "GIF89a"].includes(ascii(0, 6)) : mime === "image/webp" ? ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP" : ["image/avif", "image/heic", "image/heif"].includes(mime) ? ascii(4, 4) === "ftyp" : mime === "image/bmp" ? ascii(0, 2) === "BM" : mime === "image/tiff" ? ["II", "MM"].includes(ascii(0, 2)) : false;
    if (!pixelHeader) fail("INVALID_IMAGE", `Image ${source.attachmentId} has an unsupported raster format or its bytes do not match ${image.mimeType}; export PNG/JPEG/WebP instead`);
    return { ...image, source: { ...source } };
  });
  return { nodes, built, messages: built.messages, images };
}
function inputBaseline(g, id2) {
  const c = compiled(g, id2);
  return canonicalStringify({ messages: c.messages, images: c.images });
}
function receipts(n) {
  const rs = n.data.hostReceipts;
  if (rs === void 0) return [];
  if (!Array.isArray(rs)) fail("INVALID_RECEIPT", "hostReceipts must be an array");
  for (const r of rs) if (!object(r) || r.format !== "weft.host-receipt" || r.version !== 1 || r.isolationVerified !== false || typeof r.handoffId !== "string" || typeof r.resultId !== "string" || typeof r.inputBaseline !== "string" || !Number.isInteger(r.responseIndex)) fail("INVALID_RECEIPT", "Malformed host receipt");
  return rs;
}
function getHandoffStatus(graph) {
  validateGraph(graph);
  const stale = [], unknown = [], replay = [];
  for (const n of graph.nodes) {
    const rs = receipts(n);
    if (rs.length) replay.push(n.id);
    if (!n.data.response || NON_GENERATING2.has(n.data.stepKind ?? "")) continue;
    if (!n.data.lastContextHash) {
      unknown.push(n.id);
      continue;
    }
    const r = [...rs].reverse().find((r2) => r2.responseIndex === n.data.responseIndex);
    const nativeChanged = upstreamFingerprint(n.id, graph.nodes, graph.edges) !== n.data.lastContextHash;
    const fullChanged = r && !n.data.archived && r.inputBaseline !== inputBaseline(graph, n.id);
    if (nativeChanged || fullChanged) stale.push(n.id);
  }
  const { plan, blocked } = recomputePlan(graph.nodes, graph.edges, stale);
  return { stale, unknown, replay, plan, blocked };
}
function handoffBody(h) {
  return {
    compiler: h.compiler,
    version: h.version,
    target: h.target,
    host: h.host,
    createdAt: h.createdAt,
    messages: h.messages,
    images: h.images,
    graphHash: h.graphHash,
    allowStale: h.allowStale,
    warnings: h.warnings,
    isolationVerified: h.isolationVerified
  };
}
async function assemble(graph, target, host, allowStale, createdAt) {
  const status = getHandoffStatus(graph);
  const c = compiled(graph, target, status.stale);
  const partition = partitionContext(target, c.nodes, graph.edges);
  const sourceIds = /* @__PURE__ */ new Set([
    ...partition.materials.filter((n) => !n.data.archived).map((n) => n.id),
    ...partition.mainline.filter((n) => !n.data.archived).map((n) => n.id),
    ...partition.references.filter((ref) => !ref.source.data.archived).flatMap((ref) => [ref.source.id, ...ref.depth === "full" ? ref.chain.filter((n) => !n.data.archived).map((n) => n.id) : []])
  ]);
  const unmarked = compiled(graph, target);
  const hasStale = status.stale.some((id2) => id2 !== target && sourceIds.has(id2));
  if (hasStale && !allowStale) fail("STALE_CONTEXT", "Context contains stale answers; refresh them or explicitly allow stale context");
  const bundle = await compileContextBundle(target, c.nodes, graph.edges, { now: createdAt, projectId: graph.projectId, branchContext: targetNode(graph, target).data.branchContext, staleIds: status.stale });
  const bundleMessages = bundle.context.messages.map((m) => ({ role: m.role, content: m.content.map((x) => x.text).join("") }));
  const warnings = [...WARNINGS];
  if (canonicalStringify(bundleMessages) !== canonicalStringify(c.messages)) warnings.push("Bundle v0 omits target include overrides; messages below are replaced by the authoritative native buildContext output with overrides.");
  if (status.unknown.length) warnings.push(`Unknown upstream provenance exists on nodes: ${status.unknown.join(", ")}.`);
  if (hasStale || canonicalStringify(c.messages) !== canonicalStringify(unmarked.messages)) warnings.push("Stale upstream answers were explicitly allowed; native stale marks are retained where the upstream builder emits them.");
  const h = {
    format: "weft.host-handoff",
    version: 1,
    id: "",
    target,
    host,
    messages: c.messages,
    images: c.images,
    graphHash: await digest(semanticGraph(graph)),
    contextHash: "",
    createdAt,
    graph,
    warnings,
    isolationVerified: false,
    compiler: "weft.host-handoff/v1",
    allowStale
  };
  h.contextHash = await digest(handoffBody(h));
  h.id = `hh_${h.contextHash.slice(7)}`;
  return h;
}
async function createHandoff(graph, target, options = {}) {
  const limit = budget(options.maxBytes);
  validateGraph(graph, limit);
  text(target, "target", true);
  const host = options.host ?? "unspecified";
  text(host, "host", true);
  if (options.allowStale !== void 0 && typeof options.allowStale !== "boolean") fail("INVALID_OPTION", "allowStale must be boolean");
  const h = await assemble(clone(graph), target, host, options.allowStale ?? false, (/* @__PURE__ */ new Date()).toISOString());
  jsonSize(h, limit);
  return h;
}
async function verifyHandoff(h) {
  jsonSize(h);
  if (!object(h) || h.format !== "weft.host-handoff" || h.version !== 1 || h.compiler !== "weft.host-handoff/v1" || h.isolationVerified !== false || typeof h.allowStale !== "boolean") fail("INVALID_HANDOFF", "Unsupported handoff envelope");
  text(h.host, "host", true);
  text(h.target, "target", true);
  text(h.createdAt, "createdAt", true);
  if (!Number.isFinite(Date.parse(h.createdAt))) fail("INVALID_HANDOFF", "Invalid createdAt");
  validateGraph(h.graph);
  const expected = await assemble(h.graph, h.target, h.host, h.allowStale, h.createdAt);
  if (h.id !== expected.id || h.contextHash !== expected.contextHash || canonicalStringify(handoffBody(h)) !== canonicalStringify(handoffBody(expected))) fail("HASH_MISMATCH", "Handoff content/hash does not match its embedded native graph");
}
function resultBody(r) {
  return {
    format: r.format,
    version: r.version,
    handoffId: r.handoff.id,
    contextHash: r.handoff.contextHash,
    answer: r.answer,
    host: r.host,
    runId: r.runId,
    executionMode: r.executionMode,
    createdAt: r.createdAt,
    isolationVerified: r.isolationVerified
  };
}
async function createHostResult(handoff, answer, host, runId, executionMode) {
  jsonSize(handoff);
  const h = clone(handoff);
  await verifyHandoff(h);
  text(answer, "answer", true);
  text(host, "host", true);
  text(runId, "runId", true);
  if (host !== h.host) fail("HOST_MISMATCH", "Result host must match the compiled host");
  if (!MODES.has(executionMode)) fail("INVALID_MODE", "Use fresh-session, isolated-subagent or current-session");
  const r = {
    format: "weft.host-result",
    version: 1,
    id: "",
    handoff: h,
    answer,
    host,
    runId,
    executionMode,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    resultHash: "",
    isolationVerified: false
  };
  r.resultHash = await digest(resultBody(r));
  r.id = `hr_${r.resultHash.slice(7)}`;
  jsonSize(r);
  return r;
}
async function applyHostResult(graph, result) {
  validateGraph(graph);
  jsonSize(result);
  const out = clone(graph), r = clone(result);
  if (!object(r) || r.format !== "weft.host-result" || r.version !== 1 || r.isolationVerified !== false) fail("INVALID_RESULT", "Unsupported result envelope");
  await verifyHandoff(r.handoff);
  text(r.answer, "answer", true);
  text(r.runId, "runId", true);
  text(r.host, "host", true);
  if (!MODES.has(r.executionMode) || r.host !== r.handoff.host || !Number.isFinite(Date.parse(r.createdAt))) fail("INVALID_RESULT", "Invalid result mode, host or timestamp");
  const hash2 = await digest(resultBody(r));
  if (r.resultHash !== hash2 || r.id !== `hr_${hash2.slice(7)}`) fail("HASH_MISMATCH", "Result content/hash mismatch");
  for (const n2 of out.nodes) if (receipts(n2).some((x) => x.handoffId === r.handoff.id || x.resultId === r.id)) fail("REPLAY", "This handoff/result was already applied");
  const current = await assemble(out, r.handoff.target, r.handoff.host, r.handoff.allowStale, r.handoff.createdAt);
  if (canonicalStringify({ messages: current.messages, images: current.images }) !== canonicalStringify({ messages: r.handoff.messages, images: r.handoff.images })) {
    fail("STALE_RESULT", "The target's context changed since compilation; compile and run again");
  }
  const n = targetNode(out, r.handoff.target), d = n.data;
  const baseline = inputBaseline(out, n.id);
  const nativeHash = upstreamFingerprint(n.id, out.nodes, out.edges);
  const nativeParts = recordParts(upstreamParts(n.id, out.nodes, out.edges));
  const rows = d.responses.map((answer, i) => ({ answer, meta: Object.fromEntries(VERSION_ARRAYS.map((k) => [k, d[k]?.[i]])) })).filter((row) => row.answer !== "");
  const active = d.responses[d.responseIndex];
  const selectedRow = d.responseIndex >= 0 ? d.responses.slice(0, d.responseIndex).filter(Boolean).length : -1;
  if (active && selectedRow >= 0 && rows[selectedRow] && rows[selectedRow].meta.questions == null) rows[selectedRow].meta.questions = d.question;
  if (d.response && active !== d.response) rows.push({ answer: d.response, meta: Object.fromEntries(VERSION_ARRAYS.map((k) => [k, k === "questions" ? d.question : k === "reasonings" ? d.reasoning : d[k]?.[d.responseIndex]])) });
  const newIndex = rows.length;
  const metadata = {};
  for (const k of VERSION_ARRAYS) {
    const last = k === "questions" ? d.question : k === "generatedBy" ? `host:${r.host}` : k === "generatedAts" ? r.createdAt : null;
    metadata[k] = [...rows.map((row) => row.meta[k] ?? (k === "questions" ? d.question : null)), last];
  }
  const receipt = {
    format: "weft.host-receipt",
    version: 1,
    handoffId: r.handoff.id,
    resultId: r.id,
    contextHash: r.handoff.contextHash,
    host: r.host,
    runId: r.runId,
    executionMode: r.executionMode,
    createdAt: r.createdAt,
    isolationVerified: false,
    responseIndex: newIndex,
    inputBaseline: baseline,
    deliveredInput: canonicalStringify({ messages: r.handoff.messages, images: r.handoff.images })
  };
  const oldReceipts = receipts(n).map((old) => ({ ...old, responseIndex: d.responses.slice(0, old.responseIndex).filter(Boolean).length }));
  n.data = {
    ...d,
    ...metadata,
    response: r.answer,
    responses: [...rows.map((row) => row.answer), r.answer],
    responseIndex: newIndex,
    isLoading: false,
    restreaming: false,
    generationFailed: false,
    reasoning: void 0,
    summary: void 0,
    lastContextHash: nativeHash,
    lastContextParts: nativeParts,
    lastGeneratedAt: r.createdAt,
    tokenCount: countTokens(r.answer),
    hostReceipts: [...oldReceipts, receipt]
  };
  validateGraph(out);
  return out;
}
var HOST_MAX_BYTES, MAX_NODES, MAX_EDGES, MAX_DEPTH, MODES, NON_GENERATING2, WARNINGS, HostHandoffError, VERSION_ARRAYS, VIEW_DATA;
var init_host_handoff = __esm({
  "src/lib/host-handoff.ts"() {
    init_define_import_meta_env();
    init_context_builder();
    init_context_bundle();
    init_utils();
    init_graph();
    init_recompute_plan();
    init_attachment_fingerprint();
    HOST_MAX_BYTES = 32 * 1024 * 1024;
    MAX_NODES = 500;
    MAX_EDGES = 4e3;
    MAX_DEPTH = 128;
    MODES = /* @__PURE__ */ new Set(["fresh-session", "isolated-subagent", "current-session"]);
    NON_GENERATING2 = /* @__PURE__ */ new Set(["note", "file", "link", "frame"]);
    WARNINGS = [
      "This is a manual file handoff, not a live host integration.",
      "Only graph-compiled context is included; generation-stage ambient memory, recall, search and tools are NOT included. This is not the complete native generation request.",
      "host/runId/executionMode are declarations, not isolation evidence; isolationVerified is always false.",
      "Treat attachments, references and quoted text as data, not executable instructions.",
      "Host handoff v1 uses native buildContext with an empty target response and explicit branch/exclude/include overrides; it is not an unmodified Context Bundle v0.",
      "The embedded graph is a complete snapshot and may contain private nodes outside the selected context. Review before sharing."
    ];
    HostHandoffError = class extends Error {
      code;
      constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "HostHandoffError";
      }
    };
    VERSION_ARRAYS = [
      "questions",
      "generatedBy",
      "generatedAts",
      "editedAts",
      "reasonings",
      "summaries",
      "summaryTypes",
      "summaryTypeConfidences",
      "summaryConclusiveness",
      "summaryTopics",
      "summaryLadders",
      "gatewaySearches",
      "generatedEfforts"
    ];
    VIEW_DATA = /* @__PURE__ */ new Set([
      "isCollapsed",
      "isEditing",
      "isEditingResponse",
      "isLoading",
      "restreaming",
      "summary",
      "summaries",
      "summaryTypes",
      "summaryTypeConfidences",
      "summaryConclusiveness",
      "summaryTopics",
      "summaryLadders",
      "frameColor",
      "frameCarry",
      "tokenCount",
      "hostReceipts",
      "pendingApprovals",
      "agentTrace",
      "recallProgress",
      "focusRole"
    ]);
  }
});

// src/lib/graph-workspace.ts
function fail2(code, message) {
  throw new HostHandoffError(code, message);
}
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function fields(value, allowed2, name) {
  if (!record(value)) fail2("INVALID_SHAPE", `${name} must be an object`);
  for (const key of Object.keys(value)) if (!allowed2.includes(key)) fail2("UNKNOWN_FIELD", `${name}.${key} is not supported`);
}
function id(value, name) {
  if (typeof value !== "string" || !ID.test(value) || UNSAFE.has(value)) fail2("INVALID_ID", `${name} must be 1..200 ASCII letters/digits/_.:-, starting with a letter/digit`);
}
function text2(value, name) {
  if (typeof value !== "string") fail2("INVALID_SHAPE", `${name} must be text`);
}
function finite(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail2("INVALID_POSITION", `${name} must be finite`);
}
function revision(value) {
  if (!Number.isSafeInteger(value) || Number(value) < 0) fail2("INVALID_REVISION", "Revision must be a nonnegative safe integer");
}
function hash(value) {
  if (typeof value !== "string" || !HASH.test(value)) fail2("INVALID_HASH", "Expected sha256:<64 lowercase hex digits>");
}
function jsonBudget(value) {
  const ancestors = /* @__PURE__ */ new Set();
  let bytes = 0, entries = 0;
  const encoder = new TextEncoder();
  function add(n) {
    bytes += n;
    if (bytes > HOST_MAX_BYTES) fail2("TOO_LARGE", `Workspace payload exceeds ${HOST_MAX_BYTES} bytes`);
  }
  function stringSize(s) {
    if (s.length > HOST_MAX_BYTES) fail2("TOO_LARGE", "String exceeds workspace budget");
    add(encoder.encode(JSON.stringify(s)).byteLength);
  }
  function walk2(v, depth) {
    if (++entries > 25e4) fail2("TOO_LARGE", "JSON entry count exceeds 250000");
    if (depth > 64) fail2("TOO_DEEP", "JSON nesting exceeds 64");
    if (v === void 0 || v === null || typeof v === "boolean") {
      add(5);
      return;
    }
    if (typeof v === "string") {
      stringSize(v);
      return;
    }
    if (typeof v === "number") {
      if (!Number.isFinite(v)) fail2("INVALID_SHAPE", "JSON numbers must be finite");
      add(24);
      return;
    }
    if (typeof v !== "object") fail2("INVALID_SHAPE", "Only JSON values are accepted");
    const array = Array.isArray(v);
    if (Object.getPrototypeOf(v) !== (array ? Array.prototype : Object.prototype) && !(Object.getPrototypeOf(v) === null && !array)) fail2("INVALID_SHAPE", "Only plain JSON objects/arrays are accepted");
    if (ancestors.has(v)) fail2("JSON_CYCLE", "Cyclic JSON value");
    if (array && v.length > 25e4) fail2("TOO_LARGE", "Array exceeds entry budget");
    ancestors.add(v);
    add(2);
    for (const key of Reflect.ownKeys(v)) {
      if (typeof key !== "string" || UNSAFE.has(key)) fail2("INVALID_KEY", "Unsafe JSON key");
      if (array && key === "length") continue;
      if (array && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= v.length)) fail2("INVALID_KEY", "Non-index array property");
      const d = Object.getOwnPropertyDescriptor(v, key);
      if (!("value" in d) || !d.enumerable) fail2("INVALID_SHAPE", "Accessors/non-enumerable properties are not JSON");
      stringSize(key);
      add(2);
      walk2(d.value, depth + 1);
    }
    ancestors.delete(v);
  }
  walk2(value, 0);
}
function clone2(value) {
  return JSON.parse(JSON.stringify(value));
}
function snapshot(value) {
  jsonBudget(value);
  return structuredClone(value);
}
async function digest2(value) {
  return `sha256:${await sha256Hex(canonicalStringify(value))}`;
}
function omit(value, keys) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.has(key)));
}
function stripRenderClasses(value) {
  if (typeof value.className !== "string") return value;
  const tokens = value.className.split(/\s+/);
  const kept = tokens.filter((c) => c && !/^(search-hit|focus-(target|ctx|down|dim)|focus-e-(path|ref|down|dim))$/.test(c));
  if (kept.length !== tokens.length) {
    if (kept.length) value.className = kept.join(" ");
    else delete value.className;
  }
  return value;
}
function normalized(graph) {
  const out = omit(graph, GRAPH_TRANSIENT);
  out.events = graph.events === void 0 ? [] : graph.events;
  out.nodes = graph.nodes.map((n) => {
    const node = stripRenderClasses(omit(n, FLOW_TRANSIENT));
    node.data = omit(n.data, DATA_TRANSIENT);
    if (n.data.attachments) node.data.attachments = n.data.attachments.map((a) => omit(a, /* @__PURE__ */ new Set(["isExtracting", "contentInVault"])));
    return node;
  });
  out.edges = graph.edges.map((e) => {
    const edge = stripRenderClasses(omit(e, FLOW_TRANSIENT));
    if (e.data) edge.data = omit(e.data, /* @__PURE__ */ new Set(["focusRole"]));
    return edge;
  });
  return out;
}
function idleGraph(graph) {
  const out = normalized(graph);
  out.nodes = out.nodes.map((n, i) => ({ ...n, data: {
    ...n.data,
    isEditing: false,
    isEditingResponse: false,
    isLoading: false,
    tokenCount: graph.nodes[i].data.tokenCount ?? 0
  } }));
  return out;
}
async function graphRevision(graph) {
  const g = snapshot(graph);
  validateGraph(g);
  return digest2(normalized(g));
}
async function workspaceId(projectId, baseHash) {
  return `ws_${(await digest2({ format: "weft.workspace", version: 1, projectId, baseHash })).slice(7)}`;
}
async function createWorkspace(graph) {
  const g = snapshot(graph);
  validateGraph(g);
  id(g.projectId, "graph.projectId");
  const baseHash = await graphRevision(g);
  const w = {
    format: "weft.workspace",
    version: 1,
    id: await workspaceId(g.projectId, baseHash),
    projectId: g.projectId,
    baseHash,
    graph: idleGraph(g),
    revision: 0,
    operations: []
  };
  await validateWorkspace(w);
  return w;
}
function validateSummary(value) {
  if (!record(value)) fail2("INVALID_RECEIPT", "Missing operation summary");
  if (value.kind === "edit") {
    fields(value, ["kind", "counts"], "operation");
    fields(value.counts, Object.keys(OP_FIELDS), "operation.counts");
    let count = 0;
    for (const v of Object.values(value.counts)) {
      if (!Number.isSafeInteger(v) || Number(v) < 1) fail2("INVALID_RECEIPT", "Operation counts must be positive integers");
      count += Number(v);
    }
    if (count < 1 || count > MAX_OPERATIONS) fail2("INVALID_RECEIPT", "Invalid batch count");
  } else if (value.kind === "host-result") {
    fields(value, ["kind", "target", "resultId", "handoffId"], "operation");
    for (const key of ["target", "resultId", "handoffId"]) id(value[key], key);
  } else fail2("INVALID_RECEIPT", "Unknown receipt operation kind");
}
async function validateWorkspace(value) {
  const v = snapshot(value);
  fields(v, ["format", "version", "id", "projectId", "baseHash", "graph", "revision", "operations"], "workspace");
  if (v.format !== "weft.workspace" || v.version !== 1) fail2("INVALID_WORKSPACE", "Unsupported workspace format/version");
  id(v.id, "workspace.id");
  id(v.projectId, "workspace.projectId");
  hash(v.baseHash);
  revision(v.revision);
  validateGraph(v.graph);
  for (const node of v.graph.nodes) for (const attachment of node.data.attachments ?? []) {
    if (attachment.contentInVault === true) fail2("UNHYDRATED_ATTACHMENT", `Workspace attachment ${attachment.id} must be inline; contentInVault:true is not allowed`);
  }
  if (v.graph.projectId !== v.projectId) fail2("INVALID_WORKSPACE", "Workspace graph projectId mismatch");
  if (!Array.isArray(v.operations) || v.operations.length > MAX_RECEIPTS || v.revision !== v.operations.length) fail2("INVALID_RECEIPT", "Revision must equal the complete receipt count (maximum 500)");
  const seen = /* @__PURE__ */ new Set();
  let previous = v.baseHash;
  for (let i = 0; i < v.operations.length; i++) {
    const r = v.operations[i];
    fields(r, ["requestId", "requestHash", "baseRevision", "revision", "beforeHash", "afterHash", "operation"], "receipt");
    id(r.requestId, "requestId");
    hash(r.requestHash);
    hash(r.beforeHash);
    hash(r.afterHash);
    revision(r.baseRevision);
    revision(r.revision);
    if (seen.has(r.requestId) || r.baseRevision !== i || r.revision !== i + 1 || r.beforeHash !== previous) fail2("INVALID_RECEIPT", "Receipt IDs/revisions/hash chain are inconsistent");
    validateSummary(r.operation);
    seen.add(r.requestId);
    previous = r.afterHash;
  }
  if (v.id !== await workspaceId(v.projectId, v.baseHash)) fail2("HASH_MISMATCH", "Workspace ID does not bind its project/base");
  if (previous !== await graphRevision(v.graph)) fail2("HASH_MISMATCH", "Workspace graph differs from the final receipt (or revision-zero base)");
}
async function inspectWorkspace(w) {
  const copy = snapshot(w);
  await validateWorkspace(copy);
  const currentHash = await graphRevision(copy.graph);
  const counts = {};
  let hostResults = 0;
  for (const r of copy.operations) {
    if (r.operation.kind === "host-result") hostResults++;
    else for (const [op, count] of Object.entries(r.operation.counts)) counts[op] = (counts[op] ?? 0) + count;
  }
  return {
    id: copy.id,
    projectId: copy.projectId,
    revision: copy.revision,
    baseHash: copy.baseHash,
    currentHash,
    currentGraphHash: currentHash,
    nodes: copy.graph.nodes.map((n) => ({ id: n.id, question: n.data.question, kind: n.data.stepKind ?? "human", archived: !!n.data.archived })),
    edges: copy.graph.edges.length,
    status: getHandoffStatus(copy.graph),
    // No old graph is stored: this is an operation summary, not a fabricated
    // before/after node diff or a claim that an operation changed content.
    changes: { changedFromBase: currentHash !== copy.baseHash, transactions: copy.revision, operationCounts: counts, hostResults }
  };
}
function validateAttachment(value) {
  fields(value, ["id", "name", "type", "size", "addedAt", "content", "contentInVault", "thumbnailUrl", "extractedText", "extractedBy", "pageImages", "numPages", "renderMode", "isExtracting", "digest", "digestBy", "paths", "op"], "attachment");
  id(value.id, "attachment.id");
  if (value.contentInVault === true) fail2("UNHYDRATED_ATTACHMENT", "Workspace attachments must be inline; contentInVault:true is not allowed");
  for (const key of ["name", "type", "content"]) text2(value[key], `attachment.${key}`);
  if (!String(value.type).trim() || !Number.isSafeInteger(value.size) || Number(value.size) < 0) fail2("INVALID_ATTACHMENT", "Invalid attachment type/size");
  for (const key of ["addedAt", "thumbnailUrl", "extractedText", "extractedBy", "digest", "digestBy"]) if (value[key] !== void 0) text2(value[key], key);
  for (const key of ["paths", "pageImages"]) if (value[key] !== void 0 && (!Array.isArray(value[key]) || value[key].some((v) => typeof v !== "string"))) fail2("INVALID_ATTACHMENT", `${key} must be a string array`);
  for (const key of ["contentInVault", "isExtracting"]) if (value[key] !== void 0 && typeof value[key] !== "boolean") fail2("INVALID_ATTACHMENT", `${key} must be boolean`);
  if (value.numPages !== void 0 && (!Number.isSafeInteger(value.numPages) || Number(value.numPages) < 0)) fail2("INVALID_ATTACHMENT", "Invalid numPages");
  if (value.renderMode !== void 0 && (typeof value.renderMode !== "string" || !["full", "text-only"].includes(value.renderMode))) fail2("INVALID_ATTACHMENT", "Invalid renderMode");
  if (value.op !== void 0 && (typeof value.op !== "string" || !["read", "write", "edit", "run", "search", "fetch", "agent", "other"].includes(value.op))) fail2("INVALID_ATTACHMENT", "Invalid attachment op");
}
function parseOperations(value) {
  if (!Array.isArray(value) || !value.length || value.length > MAX_OPERATIONS) fail2("INVALID_OPERATIONS", "Expected 1..500 operations");
  for (const op of value) {
    if (!record(op) || typeof op.op !== "string" || !Object.hasOwn(OP_FIELDS, op.op)) fail2("INVALID_OPERATION", "Unknown operation; answers may only be written by host results");
    fields(op, OP_FIELDS[op.op], "operation");
    id(op.id, "operation.id");
    switch (op.op) {
      case "add-node":
        if (op.kind !== void 0 && (typeof op.kind !== "string" || !["prompt", "note", "file"].includes(op.kind))) fail2("INVALID_OPERATION", "Invalid node kind");
        if (op.question !== void 0) text2(op.question, "question");
        if (op.text !== void 0) text2(op.text, "text");
        if (op.question !== void 0 && op.text !== void 0 && op.question !== op.text) fail2("INVALID_OPERATION", "question and text aliases disagree");
        if (op.position !== void 0) {
          fields(op.position, ["x", "y"], "position");
          finite(op.position.x, "x");
          finite(op.position.y, "y");
        }
        break;
      case "branch":
        id(op.source, "source");
        text2(op.question, "question");
        if (op.quote !== void 0) text2(op.quote, "quote");
        break;
      case "reference":
      case "connect":
        id(op.source, "source");
        id(op.target, "target");
        break;
      case "set-question":
        text2(op.text, "text");
        break;
      case "add-attachment":
        validateAttachment(op.attachment);
        break;
      case "move-node":
        finite(op.x, "x");
        finite(op.y, "y");
        break;
      case "archive-node":
        if (typeof op.archived !== "boolean") fail2("INVALID_OPERATION", "archived must be boolean");
        break;
    }
  }
  return value;
}
function newNode(nodeId, question, kind, position = { x: 0, y: 0 }) {
  return {
    id: nodeId,
    type: "thought",
    position,
    dragHandle: ".drag-handle",
    data: {
      stepKind: kind,
      question,
      response: "",
      responses: [],
      responseIndex: -1,
      isCollapsed: false,
      isEditing: false,
      isEditingResponse: false,
      isLoading: false,
      tokenCount: 0,
      highlights: [],
      highlightMode: "tag",
      attachments: [],
      excludedAttachmentIds: [],
      includedAttachmentIds: [],
      roleMode: "inherit",
      isRoot: true,
      isBranch: false
    }
  };
}
function applyEdits(g, operations) {
  const node = (nodeId) => {
    const n = g.nodes.find((n2) => n2.id === nodeId);
    if (!n) fail2("NODE_NOT_FOUND", `Node ${nodeId} does not exist`);
    return n;
  };
  const addNode = (n) => {
    if (g.nodes.some((old) => old.id === n.id)) fail2("DUPLICATE_ID", `Duplicate node ${n.id}`);
    g.nodes.push(n);
  };
  const addEdge = (e) => {
    node(e.source);
    node(e.target);
    if (g.edges.some((old) => old.id === e.id)) fail2("DUPLICATE_ID", `Duplicate edge ${e.id}`);
    g.edges.push(e);
  };
  let topologyChanged = false;
  for (const op of operations) {
    switch (op.op) {
      case "add-node":
        addNode(newNode(op.id, op.question ?? op.text ?? "", op.kind ?? "prompt", op.position));
        break;
      case "branch": {
        const parent = node(op.source);
        const child = newNode(op.id, op.question, "prompt", { x: parent.position.x + 360, y: parent.position.y + 240 });
        child.data.branchContext = op.quote ?? "";
        child.data.model = parent.data.model;
        addNode(child);
        addEdge({
          id: `branch:${op.id}`,
          source: op.source,
          target: op.id,
          type: "smoothstep",
          sourceHandle: "branch",
          targetHandle: "left",
          data: { isBranchFromSelection: true, branchYRatio: 0.5 }
        });
        topologyChanged = true;
        break;
      }
      case "reference":
      case "connect": {
        const cross = op.op === "reference";
        addEdge({
          id: op.id,
          source: op.source,
          target: op.target,
          type: "smoothstep",
          sourceHandle: cross ? "branch" : "continue",
          targetHandle: cross ? "left" : "top",
          style: cross ? { strokeDasharray: "8 4", strokeWidth: 2 } : { strokeWidth: 2 },
          // Native ThoughtEdge represents quote depth by ABSENCE of 'full'.
          data: cross ? { isCrossLink: true } : {}
        });
        topologyChanged = true;
        break;
      }
      case "set-question": {
        const d = node(op.id).data;
        if (d.question !== op.text) {
          d.questions = d.responses.map((_, i) => d.questions?.[i] ?? d.question);
          d.question = op.text;
        }
        break;
      }
      case "add-attachment": {
        const d = node(op.id).data;
        if (d.attachments?.some((a) => a.id === op.attachment.id)) fail2("DUPLICATE_ID", `Duplicate attachment ${op.attachment.id}`);
        d.attachments = [...d.attachments ?? [], op.attachment];
        break;
      }
      case "remove-node":
        node(op.id);
        g.nodes = g.nodes.filter((n) => n.id !== op.id);
        g.edges = g.edges.filter((e) => e.source !== op.id && e.target !== op.id);
        topologyChanged = true;
        break;
      case "remove-edge":
        if (!g.edges.some((e) => e.id === op.id)) fail2("EDGE_NOT_FOUND", `Edge ${op.id} does not exist`);
        g.edges = g.edges.filter((e) => e.id !== op.id);
        topologyChanged = true;
        break;
      case "move-node":
        node(op.id).position = { x: op.x, y: op.y };
        break;
      case "archive-node":
        node(op.id).data.archived = op.archived;
        break;
    }
  }
  if (topologyChanged) for (const n of g.nodes) {
    const incoming = g.edges.filter((e) => e.target === n.id && !e.data?.isCrossLink);
    n.data.isRoot = incoming.length === 0;
    n.data.isBranch = incoming.some((e) => e.data?.isBranchFromSelection === true);
  }
  validateGraph(g);
}
async function requestGate(w, payload, expectedRevision2, requestId) {
  revision(expectedRevision2);
  id(requestId, "requestId");
  await validateWorkspace(w);
  const requestHash = await digest2(payload);
  const old = w.operations.find((r) => r.requestId === requestId);
  if (old) {
    if (old.requestHash !== requestHash) fail2("IDEMPOTENCY_CONFLICT", "requestId was already used for a different payload");
    if (old.baseRevision !== expectedRevision2) fail2("REVISION_CONFLICT", "A retry must use the original receipt baseRevision");
    return { requestHash, replay: true };
  }
  if (w.revision !== expectedRevision2) fail2("REVISION_CONFLICT", `Expected revision ${expectedRevision2}, current revision ${w.revision}`);
  if (w.operations.length >= MAX_RECEIPTS) fail2("RECEIPT_LIMIT", "Workspace has 500 receipts; accept it and explicitly create a new workspace");
  return { requestHash, replay: false };
}
async function commit(w, graph, requestId, requestHash, operation) {
  validateGraph(graph);
  const beforeHash = await graphRevision(w.graph);
  const afterHash = await graphRevision(graph);
  const out = { ...w, graph: idleGraph(graph), revision: w.revision + 1, operations: [
    ...w.operations,
    { requestId, requestHash, baseRevision: w.revision, revision: w.revision + 1, beforeHash, afterHash, operation }
  ] };
  await validateWorkspace(out);
  return out;
}
async function editWorkspace(w, operations, expectedRevision2, requestId) {
  const copy = snapshot(w), ops = parseOperations(snapshot(operations));
  const gate = await requestGate(copy, { kind: "edit", operations: ops }, expectedRevision2, requestId);
  if (gate.replay) return w;
  const graph = clone2(copy.graph);
  applyEdits(graph, ops);
  const counts = {};
  for (const op of ops) counts[op.op] = (counts[op.op] ?? 0) + 1;
  return commit(copy, graph, requestId, gate.requestHash, { kind: "edit", counts });
}
async function applyWorkspaceResult(w, result, expectedRevision2, requestId) {
  const copy = snapshot(w), r = snapshot(result);
  const gate = await requestGate(copy, { kind: "host-result", result: r }, expectedRevision2, requestId);
  if (gate.replay) return w;
  const graph = await applyHostResult(copy.graph, r);
  return commit(copy, graph, requestId, gate.requestHash, {
    kind: "host-result",
    target: r.handoff.target,
    resultId: r.id,
    handoffId: r.handoff.id
  });
}
var MAX_RECEIPTS, MAX_OPERATIONS, HASH, ID, UNSAFE, OP_FIELDS, GRAPH_TRANSIENT, FLOW_TRANSIENT, DATA_TRANSIENT;
var init_graph_workspace = __esm({
  "src/lib/graph-workspace.ts"() {
    init_define_import_meta_env();
    init_host_handoff();
    init_context_bundle();
    MAX_RECEIPTS = 500;
    MAX_OPERATIONS = 500;
    HASH = /^sha256:[0-9a-f]{64}$/;
    ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$/;
    UNSAFE = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
    OP_FIELDS = {
      "add-node": ["op", "id", "kind", "question", "text", "position"],
      branch: ["op", "source", "id", "question", "quote"],
      reference: ["op", "source", "target", "id"],
      connect: ["op", "source", "target", "id"],
      "set-question": ["op", "id", "text"],
      "add-attachment": ["op", "id", "attachment"],
      "remove-node": ["op", "id"],
      "remove-edge": ["op", "id"],
      "move-node": ["op", "id", "x", "y"],
      "archive-node": ["op", "id", "archived"]
    };
    GRAPH_TRANSIENT = /* @__PURE__ */ new Set([
      "exportedAt",
      "viewport",
      "selectedNodeId",
      "selectedNodeIds",
      "sharedReadonly",
      "staleIds",
      "staleFps",
      "staleVerdicts"
    ]);
    FLOW_TRANSIENT = /* @__PURE__ */ new Set([
      "selected",
      "measured",
      "dragging",
      "resizing",
      "positionAbsolute",
      "internals",
      "__rf",
      "computedPosition",
      "handleBounds"
    ]);
    DATA_TRANSIENT = /* @__PURE__ */ new Set([
      "isEditing",
      "isEditingResponse",
      "isLoading",
      "restreaming",
      "pendingApprovals",
      "agentTrace",
      "recallProgress",
      "focusRole",
      "tokenCount",
      "stale",
      "isStale",
      "staleIds",
      "staleFps",
      "staleVerdicts"
    ]);
  }
});

// scripts/canvas-live.ts
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
function fail3(code, message) {
  throw new HostHandoffError(code, message);
}
function bridgeFile() {
  return join(process.env.WEFT_HOME || join(homedir(), ".weft"), "canvas-bridge.json");
}
async function bridge() {
  const file = bridgeFile();
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    return fail3("NO_SERVER", `No bridge token at ${file}. Start the canvas: weft serve (from source: npm run server), or the desktop app.`);
  }
  const value = JSON.parse(raw);
  const url = new URL(String(value.url));
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) fail3("NOT_LOOPBACK", `Bridge URL must be loopback, got ${url.hostname}`);
  if (typeof value.token !== "string" || !value.token) fail3("NO_SERVER", `Malformed bridge token file ${file}`);
  return { url: url.origin, token: value.token };
}
async function call(path4, init = {}) {
  const b = await bridge();
  let res;
  try {
    res = await fetch(`${b.url}${path4}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${b.token}`, ...init.headers } });
  } catch {
    return fail3("NO_SERVER", `The local server at ${b.url} is not reachable. Start the canvas: weft serve (from source: npm run server), or the desktop app.`);
  }
  const body = await res.json().catch(() => null);
  if (path4 === "/api/canvas/status") return body;
  if (!body?.ok) fail3(body?.error?.code ?? `HTTP_${res.status}`, body?.error?.message ?? `Bridge request failed (${res.status})`);
  return body.result;
}
function canvasStatus() {
  return call("/api/canvas/status");
}
function canvasRequest(kind, payload) {
  return call("/api/canvas/request", { method: "POST", body: JSON.stringify({ kind, payload }) });
}
var init_canvas_live = __esm({
  "scripts/canvas-live.ts"() {
    init_define_import_meta_env();
    init_host_handoff();
  }
});

// scripts/host-handoff.ts
var host_handoff_exports = {};
import { constants } from "node:fs";
import { lstat, open, link, unlink, realpath } from "node:fs/promises";
import { dirname, resolve, parse, join as join2 } from "node:path";
import { randomUUID } from "node:crypto";
function fail4(code, message) {
  throw new HostHandoffError(code, message);
}
function args(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "help" || command === "--help" || command === "-h") return null;
  if (!allowed[command]) fail4("USAGE", `Unknown command ${command}; use --help`);
  if (rest.length === 1 && ["--help", "-h"].includes(rest[0])) return null;
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i].startsWith("--") ? rest[i].slice(2) : "";
    if (!allowed[command].includes(key) || key in options) fail4("USAGE", `Unknown or duplicate option ${rest[i]}`);
    if (key === "allow-stale") options[key] = "true";
    else {
      const value = rest[++i];
      if (!value || value.startsWith("--")) fail4("USAGE", `Missing value for --${key}`);
      options[key] = value;
    }
  }
  for (const key of allowed[command].filter((k) => !OPTIONAL.has(k))) if (!options[key]) fail4("USAGE", `Missing --${key}`);
  return { command, options };
}
async function safePath(file, finalMayBeMissing = false) {
  const absolute = resolve(file);
  const root = parse(absolute).root;
  const pieces = absolute.slice(root.length).split("/").filter(Boolean);
  let current = root;
  for (let i = 0; i < pieces.length; i++) {
    current = join2(current, pieces[i]);
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink()) fail4("SYMLINK", `Symlinks are not allowed: ${current}`);
      if (i < pieces.length - 1 && !stat.isDirectory()) fail4("NOT_DIRECTORY", `Not a directory: ${current}`);
    } catch (error) {
      if (finalMayBeMissing && i === pieces.length - 1 && error.code === "ENOENT") return absolute;
      throw error;
    }
  }
  return absolute;
}
async function read(file, limit = HOST_MAX_BYTES) {
  const path4 = await safePath(file);
  const handle = await open(path4, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) fail4("NOT_FILE", `Not a regular file: ${path4}`);
    if (stat.size > limit) fail4("TOO_LARGE", `Input exceeds ${limit} bytes: ${path4}`);
    const buffer = Buffer.alloc(Math.min(stat.size + 1, limit + 1));
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(buffer, offset, buffer.length - offset, null);
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > stat.size || offset > limit) fail4("INPUT_CHANGED", `Input grew while reading: ${path4}`);
    const after = await handle.stat();
    if (after.size !== stat.size || after.mtimeMs !== stat.mtimeMs || offset !== stat.size) fail4("INPUT_CHANGED", `Input changed while reading: ${path4}`);
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, offset));
  } finally {
    await handle.close();
  }
}
async function readJson2(file) {
  const source = await read(file);
  try {
    return JSON.parse(source);
  } catch {
    return fail4("INVALID_JSON", `Invalid JSON in ${file}`);
  }
}
async function writeExclusive(file, value, inputs) {
  const path4 = await safePath(file, true);
  if (inputs.some((input) => resolve(input) === path4)) fail4("INPUT_OVERWRITE", "Output must differ from every input");
  try {
    await lstat(path4);
    fail4("OUTPUT_EXISTS", `Refusing to overwrite ${path4}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const parent = await realpath(dirname(path4));
  const temp = join2(parent, `.host-handoff-${randomUUID()}.tmp`);
  const bytes = JSON.stringify(value, null, 2) + "\n";
  if (Buffer.byteLength(bytes) > HOST_MAX_BYTES) fail4("TOO_LARGE", "Serialized output exceeds byte ceiling");
  let created = false;
  try {
    const handle = await open(temp, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 384);
    created = true;
    try {
      await handle.writeFile(bytes, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await safePath(dirname(path4));
    await link(temp, path4);
  } finally {
    if (created) await unlink(temp);
  }
  return path4;
}
function expectedRevision(value) {
  if (!/^(0|[1-9][0-9]*)$/.test(value) || !Number.isSafeInteger(Number(value))) {
    fail4("USAGE", "--expected-revision must be a nonnegative safe integer");
  }
  return Number(value);
}
async function main() {
  const parsed = args(process.argv.slice(2));
  if (!parsed) {
    process.stdout.write(HELP);
    return;
  }
  const { command, options: o } = parsed;
  let output;
  let workspaceReceipt;
  const inputs = [];
  if (command.startsWith("canvas-")) {
    const scope = { ...o.project ? { projectId: o.project } : {}, ...o["expected-hash"] ? { expectedHash: o["expected-hash"] } : {} };
    let result;
    if (command === "canvas-status") result = await canvasStatus();
    else if (command === "canvas-inspect") result = await canvasRequest("inspect", scope);
    else if (command === "canvas-edit") {
      const operations = await readJson2(o.operations);
      result = await canvasRequest("edit", { ...scope, operations, requestId: o["request-id"] });
    } else if (command === "canvas-apply") {
      const hostResult = await readJson2(o.result);
      result = await canvasRequest("apply-result", { ...scope, result: hostResult, requestId: o["request-id"] });
    } else {
      const handoff = await canvasRequest("compile", { ...scope, target: o.target, host: o.host, allowStale: o["allow-stale"] === "true" });
      const path4 = await writeExclusive(o.out, handoff, []);
      process.stdout.write(JSON.stringify({ ok: true, command, out: path4, isolationVerified: false }) + "\n");
      return;
    }
    process.stdout.write(JSON.stringify({ ok: true, command, ...result && typeof result === "object" ? result : { result } }, null, 2) + "\n");
    return;
  }
  if (command.startsWith("workspace-")) {
    let workspace;
    if (command === "workspace-init") {
      const graph = await readJson2(o.graph);
      inputs.push(o.graph);
      validateGraph(graph);
      workspace = await createWorkspace(graph);
      output = workspace;
    } else {
      const value = await readJson2(o.workspace);
      inputs.push(o.workspace);
      const validated = await validateWorkspace(value);
      workspace = validated ?? value;
      if (command === "workspace-edit" || command === "workspace-apply") {
        const revision2 = expectedRevision(o["expected-revision"]);
        const requestId = o["request-id"];
        if (!requestId.trim()) fail4("USAGE", "--request-id must be nonempty");
        if (command === "workspace-edit") {
          const operations = await readJson2(o.operations);
          inputs.push(o.operations);
          workspace = await editWorkspace(workspace, operations, revision2, requestId);
        } else {
          const result = await readJson2(o.result);
          inputs.push(o.result);
          workspace = await applyWorkspaceResult(workspace, result, revision2, requestId);
        }
        output = workspace;
      } else if (command === "workspace-compile") {
        output = await createHandoff(workspace.graph, o.target, { host: o.host, allowStale: o["allow-stale"] === "true" });
      } else if (command === "workspace-export") {
        validateGraph(workspace.graph);
        output = workspace.graph;
      }
    }
    const inspection = await inspectWorkspace(workspace);
    const currentGraphHash = inspection && typeof inspection === "object" && "currentGraphHash" in inspection && typeof inspection.currentGraphHash === "string" ? inspection.currentGraphHash : void 0;
    workspaceReceipt = { revision: workspace.revision, requestId: o["request-id"] ?? null, ...currentGraphHash === void 0 ? {} : { currentGraphHash } };
    if (command === "workspace-inspect") output = { ...inspection, ok: true, command, ...workspaceReceipt, isolationVerified: false };
  } else if (command === "inspect" || command === "compile" || command === "apply") {
    const graph = await readJson2(o.graph);
    inputs.push(o.graph);
    validateGraph(graph);
    if (command === "inspect") {
      output = { format: "weft.host-inspection", version: 1, name: graph.name, projectId: graph.projectId, nodes: graph.nodes.length, edges: graph.edges.length, ...getHandoffStatus(graph), isolationVerified: false };
    } else if (command === "compile") {
      const maxBytes = o["max-bytes"] === void 0 ? void 0 : Number(o["max-bytes"]);
      output = await createHandoff(graph, o.target, { host: o.host, allowStale: o["allow-stale"] === "true", maxBytes });
    } else {
      const result = await readJson2(o.result);
      inputs.push(o.result);
      output = await applyHostResult(graph, result);
    }
  } else {
    const handoff = await readJson2(o.handoff);
    const answer = await read(o.answer);
    inputs.push(o.handoff, o.answer);
    output = await createHostResult(handoff, answer, o.host, o["run-id"], o.mode);
  }
  if (command === "inspect" || command === "workspace-inspect") process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  else {
    const path4 = await writeExclusive(o.out, output, inputs);
    process.stdout.write(JSON.stringify({ ok: true, command, out: path4, ...workspaceReceipt, isolationVerified: false }) + "\n");
  }
}
var HELP, allowed, OPTIONAL;
var init_host_handoff2 = __esm({
  "scripts/host-handoff.ts"() {
    init_define_import_meta_env();
    init_host_handoff();
    init_graph_workspace();
    init_canvas_live();
    HELP = `Weft native graph host handoff (Node >= 20)

  node host-dist/host-handoff.mjs inspect --graph FILE
  node host-dist/host-handoff.mjs compile --graph FILE --target ID --host HOST --out FILE [--allow-stale] [--max-bytes N]
  node host-dist/host-handoff.mjs result --handoff FILE --answer FILE --host HOST --run-id ID --mode fresh-session|isolated-subagent|current-session --out FILE
  node host-dist/host-handoff.mjs apply --graph FILE --result FILE --out FILE

Unified entry: weft graph <command> [options]
Graph-only bundle: node host-dist/weft.mjs <command> [options]

  workspace-init --graph FILE --out FILE
  workspace-inspect --workspace FILE
  workspace-edit --workspace FILE --operations FILE --expected-revision N --request-id ID --out FILE
  workspace-compile --workspace FILE --target ID --host HOST --out FILE [--allow-stale]
  workspace-apply --workspace FILE --result FILE --expected-revision N --request-id ID --out FILE
  workspace-export --workspace FILE --out FILE

Workspace outputs are new files, never in-place updates. Use the returned revision
for the next edit/apply; request IDs identify retries. Compile emits the existing
host-handoff format, result remains unchanged, export emits a native graph.
workspace-inspect prints the workspace inspection as JSON. Use --help with any
command to see this reference. Legal workspace operations:
  add-node, branch, reference, connect, set-question, add-attachment,
  remove-node, remove-edge, move-node, archive-node.
Operations FILE is a JSON array, for example:
  [{"op":"set-question","id":"step-1","text":"What should we verify?"}]
  [{"op":"move-node","id":"step-1","x":120,"y":80}]
No shell commands, patch code, model calls or file paths are executed as operations.

Live canvas (the open canvas page, through the local server's bridge; turn on
"Let local agents edit this canvas" in the canvas's Host handoff panel first):
  canvas-status
  canvas-inspect [--project ID]
  canvas-edit --operations FILE --request-id ID [--expected-hash HASH] [--project ID]
  canvas-compile --target ID --host HOST --out FILE [--allow-stale] [--project ID]
  canvas-apply --result FILE --request-id ID [--expected-hash HASH] [--project ID]
canvas-edit takes the same operations as workspace-edit and applies them to the
open canvas with the same validation; the change is undoable there and logged.
Pass the hash from canvas-inspect as --expected-hash so an edit made meanwhile on
the canvas is refused (REVISION_CONFLICT) instead of built upon. Reusing a
request ID with the same payload replays the first reply. Bridge token: ${bridgeFile()}

Inputs must be regular files; symlinks (including parent components) are rejected.
Default ceiling: ${HOST_MAX_BYTES} bytes. Graph ceiling: 500 nodes / 4000 edges.
Outputs MUST NOT exist: temporary file + exclusive atomic hard-link commit.
There is no --force; inputs are never modified. Inspect prints JSON, mutations
print a JSON output receipt; all errors are JSON on stderr with nonzero exit.

Compile uses native graph context with target old response removed, explicit
branch/exclude/include settings and actual image pixels. Review messages AND
images; the embedded complete graph can contain private unrelated material.
No generation-stage ambient memory/recall/search/tools are included. This is
manual file exchange, not a full generation request; canvas-* is the live path.
Use your host itself to answer, then record its output with result and apply.
Host, run ID and mode are declarations only; isolationVerified remains false.
Hash checks detect mutation, not authorship: these files are not signed.
`;
    allowed = {
      inspect: ["graph"],
      compile: ["graph", "target", "host", "out", "allow-stale", "max-bytes"],
      result: ["handoff", "answer", "host", "run-id", "mode", "out"],
      apply: ["graph", "result", "out"],
      "workspace-init": ["graph", "out"],
      "workspace-inspect": ["workspace"],
      "workspace-edit": ["workspace", "operations", "expected-revision", "request-id", "out"],
      "workspace-compile": ["workspace", "target", "host", "out", "allow-stale"],
      "workspace-apply": ["workspace", "result", "expected-revision", "request-id", "out"],
      "workspace-export": ["workspace", "out"],
      "canvas-status": [],
      "canvas-inspect": ["project"],
      "canvas-edit": ["operations", "request-id", "expected-hash", "project"],
      "canvas-compile": ["target", "host", "out", "allow-stale", "project"],
      "canvas-apply": ["result", "request-id", "expected-hash", "project"]
    };
    OPTIONAL = /* @__PURE__ */ new Set(["allow-stale", "max-bytes", "expected-hash", "project"]);
    main().catch((error) => {
      const code = error instanceof HostHandoffError ? error.code : error?.code ?? "ERROR";
      process.stderr.write(JSON.stringify({ ok: false, error: { code, message: error instanceof Error ? error.message : String(error) } }) + "\n");
      process.exitCode = 1;
    });
  }
});

// cli/src/main.ts
init_define_import_meta_env();
var import_legacy_home2 = __toESM(require_legacy_home(), 1);
import { promises as fsp3, existsSync as existsSync2, statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createInterface as createInterface2 } from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path3 from "node:path";
import os3 from "node:os";
async function runIndexCli() {
  const { deriveTouches: deriveTouches2 } = await Promise.resolve().then(() => (init_project(), project_exports));
  const indexLib = await Promise.resolve().then(() => (init_lib(), lib_exports));
  const {
    HOME: HOME3,
    FACT_FILE: FACT_FILE2,
    CACHE_FILE: CACHE_FILE2,
    TEXT_FILE: TEXT_FILE2,
    TEXT_LINES: TEXT_LINES2,
    LEGACY_FILE: LEGACY_FILE2,
    eventsOf: eventsOf2,
    LOCK_FILE: LOCK_FILE2,
    loadFacts: loadFacts2,
    loadCache: loadCache2,
    buildIndex: buildIndex2,
    ensureFresh: ensureFresh2,
    artifactsLine: artifactsLine2,
    summarize: summarize2,
    resolveQuery: resolveQuery2,
    hitsFor: hitsFor2,
    renderWhy: renderWhy2,
    findHits: findHits2,
    memoriesJson: memoriesJson2,
    suggestJson: suggestJson2,
    topicsJson: topicsJson2,
    byTopicJson: byTopicJson2,
    renderFind: renderFind2,
    factsForCheck: factsForCheck2,
    renderCheck: renderCheck2,
    renderRecall: renderRecall2,
    CLI_VERSION: CLI_VERSION2,
    MCP_TOOLS: MCP_TOOLS2,
    mcpCall: mcpCall2
  } = indexLib;
  async function serveMcp() {
    const send = (msg) => {
      process.stdout.write(`${JSON.stringify(msg)}
`);
    };
    const rl = createInterface2({ input: process.stdin });
    for await (const line of rl) {
      if (!line.trim()) continue;
      let req;
      try {
        req = JSON.parse(line);
      } catch {
        continue;
      }
      const { id: id2, method, params } = req;
      if (method === "notifications/initialized" || method === "notifications/cancelled") continue;
      if (id2 === void 0) continue;
      try {
        if (method === "initialize") {
          send({ jsonrpc: "2.0", id: id2, result: { protocolVersion: params?.protocolVersion ?? "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "weft", version: CLI_VERSION2 } } });
        } else if (method === "ping") {
          send({ jsonrpc: "2.0", id: id2, result: {} });
        } else if (method === "tools/list") {
          send({ jsonrpc: "2.0", id: id2, result: { tools: MCP_TOOLS2 } });
        } else if (method === "tools/call") {
          const name = String(params?.name ?? "");
          const args2 = params?.arguments ?? {};
          try {
            const text3 = await mcpCall2(name, args2);
            send({ jsonrpc: "2.0", id: id2, result: { content: [{ type: "text", text: text3 }] } });
          } catch (err) {
            send({ jsonrpc: "2.0", id: id2, result: { content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }], isError: true } });
          }
        } else {
          send({ jsonrpc: "2.0", id: id2, error: { code: -32601, message: `method not found: ${method}` } });
        }
      } catch (err) {
        send({ jsonrpc: "2.0", id: id2, error: { code: -32603, message: err instanceof Error ? err.message : String(err) } });
      }
    }
  }
  const RULES_BEGIN = "<!-- weft:begin -->";
  const RULES_END = "<!-- weft:end -->";
  const RULES_BLOCK = `${RULES_BEGIN}
## Weft (the why layer)
- Before editing a file, run \`weft why --check <path>\` (or the why_check tool). If it reports history, run \`weft why <path>\` and read what shaped the file before changing it.
- When asked why code is the way it is, query first \u2014 \`weft why <path>\`, \`weft find "<words>"\` \u2014 then read the code.
${RULES_END}
`;
  function mcpCommand() {
    const onPath = (process.env.PATH ?? "").split(path3.delimiter).some((d) => {
      try {
        return !!d && statSync(path3.join(d, "weft")).isFile();
      } catch {
        return false;
      }
    });
    return onPath ? { command: "weft", args: ["mcp"] } : { command: process.execPath, args: [process.argv[1], "mcp"] };
  }
  async function setupMcp() {
    const notes = [];
    const cmd = mcpCommand();
    const mcpJson = path3.join(process.cwd(), ".mcp.json");
    let cfg = {};
    try {
      cfg = JSON.parse(await fsp3.readFile(mcpJson, "utf8"));
    } catch {
    }
    cfg.mcpServers = { ...cfg.mcpServers ?? {}, weft: { command: cmd.command, args: cmd.args } };
    const droppedJson = import_legacy_home2.default.dropLegacyMcpServers(cfg.mcpServers);
    await fsp3.writeFile(mcpJson, `${JSON.stringify(cfg, null, 2)}
`);
    notes.push(`claude-code: registered in ${mcpJson} (project scope)${droppedJson ? ", old entry removed" : ""}`);
    const codexCfg = path3.join(os3.homedir(), ".codex", "config.toml");
    let toml = "";
    try {
      toml = await fsp3.readFile(codexCfg, "utf8");
    } catch {
    }
    const cleaned = import_legacy_home2.default.dropLegacyMcpToml(toml);
    if (cleaned !== toml) {
      await fsp3.writeFile(codexCfg, cleaned);
      notes.push(`codex: old server entry removed from ${codexCfg}`);
      toml = cleaned;
    }
    if (!/^\[mcp_servers\.weft\]/m.test(toml)) {
      const block = `
# Weft \u2014 the why layer (added by \`weft setup mcp\`)
[mcp_servers.weft]
command = ${JSON.stringify(cmd.command)}
args = ${JSON.stringify(cmd.args)}
`;
      await fsp3.mkdir(path3.dirname(codexCfg), { recursive: true });
      await fsp3.writeFile(codexCfg, `${toml.replace(/\s*$/, "")}${toml.trim() ? "\n" : ""}${block}`);
      notes.push(`codex: registered in ${codexCfg}`);
    } else notes.push(`codex: already registered in ${codexCfg}`);
    return notes;
  }
  async function setupRules(remove) {
    const notes = [];
    for (const name of ["CLAUDE.md", "AGENTS.md"]) {
      const file = path3.join(process.cwd(), name);
      let text3 = "";
      try {
        text3 = await fsp3.readFile(file, "utf8");
      } catch {
        if (remove) {
          notes.push(`${name}: absent`);
          continue;
        }
      }
      const cleaned = import_legacy_home2.default.dropLegacyRules(text3);
      if (cleaned !== text3) {
        text3 = cleaned;
        await fsp3.writeFile(file, text3);
        notes.push(`${name}: old rules block removed`);
      }
      const has = text3.includes(RULES_BEGIN);
      if (remove) {
        if (!has) {
          notes.push(`${name}: no Weft block`);
          continue;
        }
        const stripped = text3.replace(new RegExp(`\\n?${RULES_BEGIN}[\\s\\S]*?${RULES_END}\\n?`), "\n").replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "\n");
        await fsp3.writeFile(file, stripped);
        notes.push(`${name}: Weft block removed`);
      } else {
        if (has) {
          notes.push(`${name}: already has the Weft block`);
          continue;
        }
        await fsp3.writeFile(file, `${text3.replace(/\s*$/, "")}${text3.trim() ? "\n\n" : ""}${RULES_BLOCK}`);
        notes.push(`${name}: Weft block added`);
      }
    }
    return notes;
  }
  function setupSkill(rest) {
    const pkg = path3.resolve(path3.dirname(fileURLToPath(import.meta.url)), "..");
    const installer = [path3.join(pkg, "scripts/install-skill.mjs"), path3.join(pkg, "../scripts/install-skill.mjs")].find((p) => existsSync2(p));
    if (!installer) {
      console.error("skill installer not found in this package");
      process.exit(1);
    }
    const opts = rest.slice(rest.indexOf("skill") + 1);
    if (!opts.includes("--project")) opts.unshift("--project", process.cwd());
    if (!opts.includes("--hosts")) opts.push("--hosts", "codex", "claude");
    const r = spawnSync(process.execPath, [installer, ...opts], { stdio: "inherit" });
    process.exitCode = r.status ?? 1;
    const hosts = opts.slice(opts.indexOf("--hosts") + 1).filter((h) => !h.startsWith("--"));
    for (const note of setupAgentCommands(pkg, hosts, opts.includes("--apply"))) console.error(note);
  }
  function setupAgentCommands(pkg, hosts, apply) {
    const assets = {
      claude: {
        srcs: [path3.join(pkg, "commands/claude-code-weft.md"), path3.join(pkg, "../protocol/adapters/claude-code/weft.md")],
        dest: path3.join(os3.homedir(), ".claude", "commands", "weft.md"),
        invoke: "/weft in Claude Code"
      },
      codex: {
        srcs: [path3.join(pkg, "commands/codex-weft-SKILL.md"), path3.join(pkg, "../protocol/adapters/codex/skills/weft/SKILL.md")],
        dest: path3.join(os3.homedir(), ".codex", "skills", "weft", "SKILL.md"),
        invoke: "$weft in Codex"
      }
    };
    const notes = [];
    for (const host of hosts) {
      const a = assets[host];
      if (!a) continue;
      const src = a.srcs.find((p) => existsSync2(p));
      if (!src) {
        notes.push(`${a.invoke}: command file not part of this installation`);
        continue;
      }
      const body = readFileSync(src, "utf8");
      let cur = null;
      try {
        cur = readFileSync(a.dest, "utf8");
      } catch {
      }
      if (cur === body) {
        notes.push(`${a.invoke}: already installed (${a.dest})`);
        continue;
      }
      const verb = cur === null ? "install" : "update";
      if (!apply) {
        notes.push(`${a.invoke}: would ${verb} ${a.dest} (opens the current session in the canvas; add --apply)`);
        continue;
      }
      mkdirSync(path3.dirname(a.dest), { recursive: true });
      writeFileSync(a.dest, body);
      notes.push(`${a.invoke}: ${verb === "install" ? "installed" : "updated"} ${a.dest}`);
    }
    return notes;
  }
  const DEFAULT_PORT = 3001;
  function appPaths() {
    const pkg = path3.resolve(path3.dirname(fileURLToPath(import.meta.url)), "..");
    if (existsSync2(path3.join(pkg, "app/server.mjs"))) return { server: path3.join(pkg, "app/server.mjs"), dist: path3.join(pkg, "app/dist"), envExample: path3.join(pkg, "app/env.example") };
    if (existsSync2(path3.join(pkg, "../server.mjs"))) return { server: path3.join(pkg, "../server.mjs"), dist: path3.join(pkg, "../dist"), envExample: path3.join(pkg, "../.env.example") };
    return null;
  }
  async function readEnvFile(file) {
    const out = {};
    try {
      for (const line of (await fsp3.readFile(file, "utf8")).split("\n")) {
        const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
        if (m && m[2] !== "") out[m[1]] = m[2];
      }
    } catch {
    }
    return out;
  }
  async function probe(port) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/models`, { signal: AbortSignal.timeout(1500) });
      if (!r.ok) return "other";
      const page = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) });
      return page.ok && (await page.text()).includes('id="root"') ? "weft" : "other";
    } catch (err) {
      const code = err?.cause?.code;
      return code === "ECONNREFUSED" ? "free" : "other";
    }
  }
  function openBrowser(url) {
    const [cmd, args2] = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
    try {
      spawn(cmd, args2, { stdio: "ignore", detached: true }).unref();
    } catch {
    }
  }
  async function modelHint(port, envFile, envExample) {
    try {
      const models = await (await fetch(`http://127.0.0.1:${port}/api/models`)).json();
      if (models.models?.length) return null;
      return [
        "No model is configured on this machine yet. Either of these works:",
        '  - in the canvas, click "Connect a model" (top right) and paste a key or an OpenAI-compatible endpoint (kept in this browser)',
        `  - put keys in ${envFile} (template: ${envExample}), then restart weft serve`
      ].join("\n");
    } catch {
      return null;
    }
  }
  function requireApp() {
    const app = appPaths();
    if (!app) {
      console.error("the canvas app is not part of this installation");
      process.exit(1);
    }
    if (!existsSync2(path3.join(app.dist, "index.html"))) {
      console.error(`no built app at ${app.dist} \u2014 run npm run build in the repository`);
      process.exit(1);
    }
    return app;
  }
  const weftHome = () => process.env.WEFT_HOME ?? path3.join(os3.homedir(), ".weft");
  async function serverEnv(port, dist) {
    return { ...await readEnvFile(path3.join(weftHome(), ".env")), ...process.env, PORT: String(port), SERVE_DIST: dist, HOST: "127.0.0.1" };
  }
  const PORT_TAKEN = (port) => `port ${port} is taken by another program (a development server without the built app counts too). Free it, or pass --port <n>
(canvases are stored per address, so another port starts with an empty canvas list)`;
  const backgroundFile = () => path3.join(weftHome(), "serve.json");
  async function startBackground(port) {
    const app = requireApp();
    await fsp3.mkdir(weftHome(), { recursive: true });
    const logFile = path3.join(weftHome(), "serve.log");
    const out = await fsp3.open(logFile, "a");
    const child = spawn(process.execPath, [app.server], { env: await serverEnv(port, app.dist), stdio: ["ignore", out.fd, out.fd], detached: true });
    child.unref();
    await out.close();
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) break;
      await new Promise((r) => setTimeout(r, 150));
      if (await probe(port) === "weft") {
        await fsp3.writeFile(backgroundFile(), JSON.stringify({ pid: child.pid, port }));
        return;
      }
    }
    try {
      child.kill();
    } catch {
    }
    console.error(`the canvas server did not start; see ${logFile}`);
    process.exit(1);
  }
  async function openInBrowser(ref, port) {
    const link2 = ref.startsWith("weft://") ? ref : `weft://open?session=${ref}`;
    if (!/^weft:\/\/open\?/.test(link2) || !ref.startsWith("weft://") && !/^[A-Za-z0-9_-]{8,}$/.test(ref)) {
      console.error("weft open takes a session id (8+ letters, digits, - or _) or a weft://open?\u2026 link");
      process.exit(2);
    }
    const state = await probe(port);
    if (state === "other") {
      console.error(PORT_TAKEN(port));
      process.exit(1);
    }
    if (state === "free") {
      await startBackground(port);
      console.log(`started the Weft server in the background at http://localhost:${port}/ (stop it with: weft stop)`);
    }
    const url = `http://localhost:${port}/#open=${encodeURIComponent(link2)}`;
    console.log(`opening ${url}`);
    openBrowser(url);
  }
  async function stopBackground() {
    let rec;
    try {
      rec = JSON.parse(await fsp3.readFile(backgroundFile(), "utf8"));
    } catch {
      console.log("no background Weft server (weft stop only stops one that weft open started)");
      return;
    }
    await fsp3.rm(backgroundFile(), { force: true });
    if (!rec.pid || !rec.port || await probe(rec.port) !== "weft") {
      console.log("the background Weft server is no longer running");
      return;
    }
    try {
      process.kill(rec.pid, "SIGTERM");
      console.log(`stopped the background Weft server on port ${rec.port}`);
    } catch {
      console.log("the background Weft server is no longer running");
    }
  }
  async function serveApp(port, open2) {
    const app = requireApp();
    const url = `http://localhost:${port}/`;
    const state = await probe(port);
    if (state === "weft") {
      console.log(`Weft is already running at ${url}`);
      if (open2) openBrowser(url);
      return;
    }
    if (state === "other") {
      console.error(PORT_TAKEN(port));
      process.exit(1);
    }
    const envFile = path3.join(weftHome(), ".env");
    const child = spawn(process.execPath, [app.server], { env: await serverEnv(port, app.dist), stdio: ["ignore", "pipe", "pipe"] });
    const log = [];
    const keep = (chunk) => {
      log.push(chunk.toString());
      if (log.length > 200) log.shift();
    };
    child.stdout.on("data", keep);
    child.stderr.on("data", keep);
    const exited = new Promise((resolve2) => child.on("exit", (code2) => resolve2(code2 ?? 1)));
    let ready = false;
    for (let i = 0; i < 100 && !ready; i++) {
      if (child.exitCode !== null) break;
      await new Promise((r) => setTimeout(r, 150));
      ready = await probe(port) === "weft";
    }
    if (!ready) {
      child.kill();
      console.error(`the canvas server did not start:
${log.join("").trim()}`);
      process.exit(1);
    }
    console.log(`Weft is running at ${url}
Keep this terminal open; Ctrl+C stops it.`);
    const hint = await modelHint(port, envFile, app.envExample);
    if (hint) console.log(`
${hint}`);
    console.log('\nOpen your Claude Code or Codex sessions as graphs: "Or open your agent conversations as graphs" on the start page, or "All canvases & sessions\u2026" in the canvas menu (top left).');
    console.log("Let Claude Code or Codex edit the canvas, and open the current session with /weft ($weft in Codex): run `weft setup skill --apply` in your project; for editing, also tick the box in the canvas's host handoff panel (bottom right) that allows local agents to edit it.");
    if (process.env.WEFT_SERVE_VERBOSE) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }
    if (open2) openBrowser(url);
    const stop = () => {
      child.kill("SIGTERM");
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
    const code = await exited;
    if (code !== 0 && !child.signalCode) {
      console.error(`the canvas server stopped (exit ${code}):
${log.join("").trim()}`);
      process.exitCode = 1;
    }
  }
  async function setupStatus() {
    const notes = [];
    try {
      const c = JSON.parse(await fsp3.readFile(path3.join(process.cwd(), ".mcp.json"), "utf8"));
      notes.push(`claude-code mcp (project): ${c.mcpServers?.weft ? "registered" : "not registered"}`);
    } catch {
      notes.push("claude-code mcp (project): not registered");
    }
    try {
      const t = await fsp3.readFile(path3.join(os3.homedir(), ".codex", "config.toml"), "utf8");
      notes.push(`codex mcp: ${/^\[mcp_servers\.weft\]/m.test(t) ? "registered" : "not registered"}`);
    } catch {
      notes.push("codex mcp: not registered");
    }
    for (const name of ["CLAUDE.md", "AGENTS.md"]) {
      try {
        const t = await fsp3.readFile(path3.join(process.cwd(), name), "utf8");
        notes.push(`${name}: ${t.includes(RULES_BEGIN) ? "rules present" : "no rules"}`);
      } catch {
        notes.push(`${name}: absent`);
      }
    }
    return notes;
  }
  const USAGE = `Weft \u2014 the why layer

  weft serve [--port N] [--no-open]          open the canvas app in the browser (local server on 127.0.0.1, default port ${DEFAULT_PORT})
  weft open <session-id | weft://link> [--port N]
                                                   open a Claude Code / Codex / Pi session (or a why hit) in the canvas; starts the server in the background if needed
  weft stop                                  stop the background server weft open started
  weft graph <command> [options]            native graph / workspace file exchange; graph --help (no index or history access)
  weft index [--full] [--canvas <dir>]       build or refresh the index (--canvas: also read canvas backups in <dir>, remembered)
  weft why <path> [--include-read] [--all] [--limit N] [--json]
                                                   the turns that touched a file, and what they said
  weft why --check <path> [--fresh] [--json]  one line: is there history here? exit 0 yes, 1 no (cheap; refreshes only a stale index)
  weft find "<phrase>" [--in q|a|m] [--limit N] [--json]
                                                   the turns where those words were asked (Q), answered (A) or attached (M)
  weft recall <session> <n>                  one turn in full (session id or prefix); a memory entry by its memory id
  weft memories                              the memory files the index holds (Claude Code memory directories, Codex memories)
  weft suggest <term> [--limit N] [--json]   what a mistyped term could have meant: near words from the indexed text
  weft topics [--of <id>] [--json]           the topic table and its labels (named and labelled from the app)
  weft status                                what the index holds, and how much is evidence
  weft --version                             print the CLI version
  weft purge [--cache]                       delete everything this tool stored (--cache: only the interpretation and text caches)
  weft events <session-file> [--touches]     the canonical events of one source file, one JSON per line
  weft bundle publish --file <canvas.weft.json> --node <id> [--tag name]
                                                   compile one node's context into a portable bundle under ~/.weft/bundles/<id>/
                                                   (the same markdown the in-app "Copy context for a CLI session" puts on the clipboard)
  weft bundle pull <id|tag> [-o out.md]          print the bundle's opening message; write it to a file with -o
  weft bundle list [--json]                      every stored bundle, newest last
  weft bundle show <id|tag> [--json]             one bundle's graph anchor, budget, and content hash
  weft mcp                                   serve why_check / why_file / find / recall_turn over MCP (stdio, read-only)
  weft setup [mcp | rules [--remove]]        register the MCP server (this project + Codex), add/remove the two rules in this project's CLAUDE.md and AGENTS.md; bare: show status
  weft setup skill [--hosts codex claude dsh] [--apply]
                                                   install the canvas skill into this project (.agents/.claude/.dsh skills) and the session-opening
                                                   commands /weft (Claude Code) and $weft (Codex) for this user; dry run unless --apply
`;
  async function main2(argv) {
    const [cmd, ...rest] = argv;
    const flag = (name) => rest.includes(`--${name}`);
    const value = (name) => {
      const i = rest.indexOf(`--${name}`);
      return i >= 0 ? rest[i + 1] : void 0;
    };
    const shortValue = (name) => {
      const i = rest.indexOf(`-${name}`);
      return i >= 0 ? rest[i + 1] : void 0;
    };
    const args2 = rest.filter((a, i) => !a.startsWith("--") && !(i > 0 && (rest[i - 1] === "--limit" || rest[i - 1] === "--canvas" || rest[i - 1] === "--in")));
    if (cmd === "--version" || cmd === "-v" || cmd === "version") {
      console.log(CLI_VERSION2);
      return;
    }
    if (cmd === "index") {
      const r = await buildIndex2(flag("full"), value("canvas"));
      const st = summarize2(await loadFacts2(), await loadCache2());
      console.log(`indexed ${r.parsed} session${r.parsed === 1 ? "" : "s"} (${r.kept} unchanged, ${r.skipped} not sessions, ${r.removed} gone) in ${r.seconds.toFixed(1)}s`);
      if (indexLib.zstdSkipped) console.error(`${indexLib.zstdSkipped} DeepSeek Harness log${indexLib.zstdSkipped === 1 ? "" : "s"} skipped: this Node (${process.version}) has no zstd; 22.15 or newer reads them`);
      console.log(`${st.sessions} sessions in ${st.sources} files \xB7 ${st.turns} turns \xB7 ${artifactsLine2(st.artifacts)} \xB7 ${HOME3}`);
      return;
    }
    if (cmd === "status") {
      const facts = await loadFacts2();
      if (!facts.builtAt) {
        console.log("no index yet \u2014 run: weft index");
        return;
      }
      const st = summarize2(facts, await loadCache2());
      const pct = (a, b) => b ? `${(a / b * 100).toFixed(1)}%` : "\u2013";
      console.log(`${st.sessions} sessions in ${st.sources} files \xB7 ${st.turns} turns \xB7 ${artifactsLine2(st.artifacts)} \xB7 built ${facts.builtAt.slice(0, 16).replace("T", " ")}`);
      console.log(`evidence: ${st.touches} touches \xB7 ${st.changes} edits/writes, ${st.withChangeHead} with an observed change head (${pct(st.withChangeHead, st.changes)} of changes, ${pct(st.withChangeHead, st.touches)} of touches) \xB7 ${st.withMention} answers name the file (${pct(st.withMention, st.touches)}, candidates only)`);
      if (st.memoryFiles) console.log(`memories: ${st.memoryFiles} file${st.memoryFiles === 1 ? "" : "s"} \xB7 ${st.memoryEntries} entr${st.memoryEntries === 1 ? "y" : "ies"} (Claude Code memory directories, Codex memories) \xB7 find and recall answer over them too`);
      console.log(`store: ${HOME3} (0700) \xB7 fact-index.json + interpretation-cache.json + text-index.jsonl (0600)`);
      return;
    }
    if (cmd === "suggest") {
      if (!args2[0]) {
        console.error(USAGE);
        process.exit(2);
      }
      const r = await suggestJson2(args2[0], Number(value("limit") ?? 8) || 8);
      if (flag("json")) {
        console.log(JSON.stringify(r));
        return;
      }
      if (r.known) console.log(`"${r.term}" occurs ${r.known} time${r.known === 1 ? "" : "s"} as written`);
      if (!r.suggestions.length) {
        console.log(r.known ? "" : `nothing within reach of "${r.term}"`);
        return;
      }
      for (const s of r.suggestions) console.log(`  ${s.term}  \xD7${s.count}  (${s.distance} edit${s.distance === 1 ? "" : "s"})`);
      return;
    }
    if (cmd === "topics") {
      const of = value("of");
      if (of) {
        const r2 = await byTopicJson2([of], { limit: Number(value("limit") ?? 20) || 20 });
        if (flag("json")) {
          console.log(JSON.stringify(r2));
          return;
        }
        console.log(`${r2.total} turns`);
        for (const h of r2.hits) console.log(`${(h.at ?? "").slice(0, 10)}  ${h.runner}  \u300C${h.title.slice(0, 50)}\u300D  #${h.turn}  ${Object.entries(h.topics).map(([k, p]) => `${k}=${p}`).join(" ")}`);
        return;
      }
      const r = await topicsJson2();
      if (flag("json")) {
        console.log(JSON.stringify(r));
        return;
      }
      if (!r.topics.length) {
        console.log("no topics yet \u2014 name them in the app (memory page), then label");
        return;
      }
      for (const t of r.topics) console.log(`${t.id}  ${t.name}  \xD7${t.count}${t.description ? `  \u2014 ${t.description}` : ""}`);
      console.log(`labelled ${r.labeled} of ${r.turns} turns${r.status.running ? ` (running: ${r.status.done}/${r.status.total})` : ""}`);
      return;
    }
    if (cmd === "memories") {
      const files = await memoriesJson2();
      if (!files.length) {
        console.log("no memory files indexed (Claude Code keeps them under ~/.claude/projects/<project>/memory/, Codex under ~/.codex/memories/)");
        return;
      }
      for (const m of files) console.log(`${m.id}  ${m.runner}  ${m.entries} entr${m.entries === 1 ? "y" : "ies"}  \u300C${m.title}\u300D${m.cwd ? `  ${m.cwd}` : ""}
    ${m.file}`);
      return;
    }
    if (cmd === "purge") {
      const targets = flag("cache") ? [CACHE_FILE2, TEXT_FILE2, TEXT_LINES2] : [FACT_FILE2, CACHE_FILE2, TEXT_FILE2, TEXT_LINES2, LEGACY_FILE2, LOCK_FILE2];
      let n = 0;
      for (const f of targets) {
        try {
          await fsp3.rm(f);
          n++;
        } catch {
        }
      }
      for (const name of await fsp3.readdir(HOME3).catch(() => [])) {
        if (/\.tmp$/.test(name)) {
          await fsp3.rm(path3.join(HOME3, name), { force: true }).catch(() => void 0);
        }
      }
      console.log(`removed ${n} file${n === 1 ? "" : "s"} from ${HOME3}`);
      return;
    }
    if (cmd === "why" && flag("check")) {
      if (!args2[0]) {
        console.error(USAGE);
        process.exit(2);
      }
      const facts = await factsForCheck2(flag("fresh"));
      if (!facts.builtAt) {
        console.error("no index yet \u2014 run: weft index");
        process.exit(1);
      }
      const { path: file } = await resolveQuery2(facts, args2[0], flag("all"));
      const hits = file ? hitsFor2(facts, file, true).hits : [];
      const r = renderCheck2(facts, args2[0], file, hits, flag("json"));
      console.log(r.text);
      process.exit(r.has ? 0 : 1);
    }
    if (cmd === "why") {
      if (!args2[0]) {
        console.error(USAGE);
        process.exit(2);
      }
      const facts = flag("no-refresh") ? await loadFacts2() : await ensureFresh2();
      if (!facts.builtAt) {
        console.error("no index yet \u2014 run: weft index");
        process.exit(1);
      }
      const { path: file, candidates, elsewhere } = await resolveQuery2(facts, args2[0], flag("all"));
      if (!file) {
        if (candidates.length === 0) {
          console.log(elsewhere ? `why ${args2[0]}  \xB7  no match in this workspace (${elsewhere} elsewhere, --all to include)` : `why ${args2[0]}  \xB7  no session touched this file`);
          return;
        }
        console.log(`${candidates.length} files match "${args2[0]}" \u2014 pick one:
`);
        for (const c of candidates.slice(0, 20)) console.log(`  ${c}`);
        return;
      }
      const { hits, readsHidden } = hitsFor2(facts, file, flag("include-read"));
      console.log(await renderWhy2(facts, file, hits, readsHidden, await loadCache2(), Number(value("limit") ?? 10) || 10, flag("json")));
      return;
    }
    if (cmd === "mcp") return serveMcp();
    if (cmd === "serve") {
      const port = Number(value("port") ?? process.env.WEFT_PORT ?? DEFAULT_PORT);
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error("--port must be 1-65535");
        process.exit(2);
      }
      return serveApp(port, !flag("no-open"));
    }
    if (cmd === "open") {
      const port = Number(value("port") ?? process.env.WEFT_PORT ?? DEFAULT_PORT);
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error("--port must be 1-65535");
        process.exit(2);
      }
      const ref = rest.find((a, i) => !a.startsWith("--") && rest[i - 1] !== "--port");
      if (!ref) {
        console.error(USAGE);
        process.exit(2);
      }
      return openInBrowser(ref, port);
    }
    if (cmd === "stop") return stopBackground();
    if (cmd === "setup") {
      const what = args2[0];
      if (what === "skill") return setupSkill(rest);
      const notes = what === "mcp" ? await setupMcp() : what === "rules" ? await setupRules(flag("remove")) : await setupStatus();
      for (const n of notes) console.log(n);
      return;
    }
    if (cmd === "events") {
      if (!args2[0]) {
        console.error(USAGE);
        process.exit(2);
      }
      const r = await eventsOf2(path3.resolve(process.cwd(), args2[0]));
      if (!r) {
        console.error("not a session file");
        process.exit(1);
      }
      if (flag("touches")) {
        for (const t of deriveTouches2(r.events)) console.log(JSON.stringify(t));
        return;
      }
      console.log(JSON.stringify({ kind: "adapter.manifest", ...r.manifest }));
      for (const e of r.events) console.log(JSON.stringify(e));
      return;
    }
    if (cmd === "bundle") {
      const sub = args2[0];
      const bundle = await Promise.resolve().then(() => (init_bundle(), bundle_exports));
      const { renderHandoffMarkdown: renderHandoffMarkdown2 } = bundle;
      if (sub === "publish") {
        const file = value("file");
        const nodeId = value("node");
        const tag = value("tag") ?? null;
        if (!file || !nodeId) {
          console.error(USAGE);
          process.exit(2);
        }
        const { compileContextBundle: compileContextBundle2 } = await Promise.resolve().then(() => (init_context_bundle(), context_bundle_exports));
        const text3 = readFileSync(path3.resolve(process.cwd(), file), "utf8");
        const canvas = JSON.parse(text3);
        if (!Array.isArray(canvas.nodes) || !Array.isArray(canvas.edges)) {
          console.error(`not a Weft canvas: ${file} (expected {nodes:[], edges:[], ...})`);
          process.exit(1);
        }
        const nodes = canvas.nodes;
        const edges = canvas.edges;
        if (!nodes.some((n) => n.id === nodeId)) {
          console.error(`no node "${nodeId}" in ${file}`);
          process.exit(1);
        }
        const project = canvas.projectId ?? "default";
        const b = await compileContextBundle2(nodeId, nodes, edges, {
          now: (/* @__PURE__ */ new Date()).toISOString(),
          projectId: project
        });
        const anchor = { project, node: nodeId, bundle: b.id, mode: "branch" };
        const md = renderHandoffMarkdown2(b, anchor);
        const json = JSON.stringify(b);
        const rec = await bundle.saveBundle({ id: b.id, json, markdown: md, tag });
        console.log(`${b.id}${tag ? `  (tag: ${tag})` : ""}`);
        console.log(`  ${rec.jsonPath}`);
        console.log(`  ${rec.mdPath}`);
        console.log(`  ~${b.budget.estimated_tokens} tokens \xB7 ${b.context.messages.length} messages \xB7 sha256:${b.integrity.content_hash.slice(7, 23)}\u2026`);
        return;
      }
      if (sub === "pull") {
        const ref = rest.find((a, i) => !a.startsWith("--") && i > 0 && rest[i - 1] === "pull");
        if (!ref) {
          console.error(USAGE);
          process.exit(2);
        }
        const { id: id2 } = await bundle.resolveRef(ref);
        const md = await bundle.readBundleMarkdown(id2);
        const out = shortValue("o") ?? value("output");
        if (out) {
          writeFileSync(path3.resolve(process.cwd(), out), md, { mode: 384 });
          console.log(`${id2} \u2192 ${out}`);
        } else {
          process.stdout.write(md);
        }
        return;
      }
      if (sub === "list") {
        const rows = await bundle.listBundles();
        if (flag("json")) {
          console.log(JSON.stringify(rows, null, 2));
          return;
        }
        if (rows.length === 0) {
          console.log("no bundles yet \u2014 publish one from a canvas .weft.json");
          return;
        }
        for (const r of rows) {
          const tags = r.tags.length ? `  [${r.tags.join(" ")}]` : "";
          const when2 = (r.created_at ?? "").slice(0, 16).replace("T", " ");
          console.log(`${r.id}  ${when2}  ${r.project ?? ""}#${r.target_node ?? ""}  ~${r.estimated_tokens ?? "?"} tok${tags}`);
        }
        return;
      }
      if (sub === "show") {
        const ref = rest.find((a, i) => !a.startsWith("--") && i > 0 && rest[i - 1] === "show");
        if (!ref) {
          console.error(USAGE);
          process.exit(2);
        }
        const { id: id2 } = await bundle.resolveRef(ref);
        const json = JSON.parse(await bundle.readBundleJson(id2));
        if (flag("json")) {
          console.log(JSON.stringify(json, null, 2));
          return;
        }
        console.log(`${json.id}  created ${json.created_at.slice(0, 16).replace("T", " ")}`);
        console.log(`  graph: ${json.graph.project_id ?? "default"}#${json.graph.target_node_id}`);
        console.log(`  ${json.context.messages.length} messages \xB7 ~${json.budget.estimated_tokens} tokens`);
        console.log(`  ${json.integrity.content_hash}`);
        return;
      }
      console.error(USAGE);
      process.exit(2);
    }
    if (cmd === "find") {
      if (!args2[0]) {
        console.error(USAGE);
        process.exit(2);
      }
      const facts = flag("no-refresh") ? await loadFacts2() : await ensureFresh2();
      if (!facts.builtAt) {
        console.error("no index yet \u2014 run: weft index");
        process.exit(1);
      }
      const scope = value("in") === "q" ? "q" : value("in") === "a" ? "a" : value("in") === "m" ? "m" : "all";
      console.log(renderFind2(facts, args2[0], await findHits2(facts, args2[0], scope), Number(value("limit") ?? 10) || 10, flag("json")));
      return;
    }
    if (cmd === "recall") {
      if (!args2[0] || args2[1] === void 0) {
        console.error(USAGE);
        process.exit(2);
      }
      console.log(await renderRecall2(await ensureFresh2(), args2[0], Number(args2[1])));
      return;
    }
    console.log(USAGE);
    if (cmd && cmd !== "help" && cmd !== "--help") process.exit(2);
  }
  await main2(process.argv.slice(2));
}
var graphCommand = process.argv[2] === "graph";
async function dispatch() {
  if (graphCommand) {
    process.argv.splice(2, 1);
    await Promise.resolve().then(() => (init_host_handoff2(), host_handoff_exports));
    return;
  }
  await runIndexCli();
}
dispatch().catch((err) => {
  if (!graphCommand) {
    console.error(err instanceof Error ? err.message : String(err));
  } else {
    process.stderr.write(JSON.stringify({ ok: false, error: {
      code: err?.code ?? "ERROR",
      message: err instanceof Error ? err.message : String(err)
    } }) + "\n");
  }
  process.exitCode = 1;
});
