# AGENTS.md

Weft：把 LLM 对话变成无限画布上可编辑的思维 DAG（节点=一轮问答，边=上下文流）。React 19 + Vite + TypeScript 前端，Express 代理后端。状态：活跃开发中的开放原型（https://github.com/zyaochen/weft，fork 自 chenxiachan/thoughtdag）。

## 常用命令

```bash
npm run dev      # Vite 前端 (默认 5173)
npm run server   # LLM 代理 server.mjs (端口 3001，前端默认指向它)
npm run build    # tsc -b && vite build
npm run smoke    # scripts/smoke.mjs 冒烟测试
npm run lint
npm test         # CLI 单测 + layout / live-log / subagent 检查
```

`.env` 可选（见 `.env.example`）：没有 key 时代理以空模型启动，用户在浏览器里「连接模型」填 key 或 OpenAI 兼容端点。

## 架构

- `server.mjs` — 唯一后端文件：Express 代理，用 Vercel AI SDK（`ai` + `@ai-sdk/*` providers，智谱等走 `@ai-sdk/openai-compatible`）调 LLM；含 agentic 网页搜索 + 行内引用（搜索后保证有综合回答）。
- `src/store/` — zustand 全局状态；持久化用 idb-keyval（IndexedDB）。
- `src/components/` — 画布基于 `@xyflow/react`（React Flow）：`ThoughtNode`、`ThoughtEdgeView`、`SelectionToolbar`（圈选对齐，对齐前有确认提示）、`focus-panel/`。
- `src/lib/api.ts` — 前端到 server.mjs 的调用层。
- `src/i18n/` — 中英双语。
- Markdown 渲染：react-markdown + KaTeX + highlight.js；PDF 附件用 pdfjs-dist。

## 约定

- 布局必须遵守箭头（上下文流）顺序，同一对话链节点竖向对齐——这是用户明确要求过的行为，改布局逻辑时不要破坏。
- 与用户交流用中文；代码标识符和注释保持英文。
- 提交流程：新建分支 → 提交推送 → `gh pr create` 开 PR → CI（`.github/workflows/ci.yml`）全绿且有人 review 后再合并；不 force push、不改已推送历史。
- UI 文案（i18n、tooltip、toast、placeholder）不出现第三方品牌名。功能性标识除外：环境变量名、导入格式的身份（如 ChatGPT 导出文件）、实际数据源（arXiv、Semantic Scholar）。举例、推荐、宣传式的品牌提及一律用通称（"外部 OCR 工具""其他助手"）或扩展名（.docx）替代。

## State / Event 写入纪律

下面三条源自 dsh-context（DeepSeek Harness 的 context 观测插件）在持久化与 fold 上的真实踩坑。以后写或改 reducer / 状态写盘 / 修剪与凝练时遵守，与现有代码无关，**不重构现有代码**：

1. **状态字段永远 `delete s.x`，不要 `s.x = undefined`。** 一个字段被赋成 `undefined` 会让整个 checkpoint 序列化失败，进而拖垮 session 列表——这么检查点会连 `title` 都写不进；显式 `delete` 才能让字段真正消失并让 JSON.stringify 跳过。
2. **修剪/淘汰的单位是「一整轮」（一个 user→assistant 闭环），不是单个 message。** 按 token / 字节阈值剪会产生振荡：剪到 1200、长到 1500、又剪一遍。自动修剪或 condense 触发时，永远考虑「以轮为边界的连续段」，而不是「到这条 message 为止」。
3. **单条事件进 fold 是 all-or-nothing。** 上游来的 event 视为不可信输入，单条事件失败整体不进状态——不留半挂的 private clone、不写入部分字段。后续的 query 要看到的世界只由成功落盘的事件组成。

## Condense 与派生节点

「凝练」产生的新节点把来源记到 `node.data.condensedFrom: string[]`（被折叠的原始 node id），已在 `src/lib/condense.ts` 实现。约定：

- 这个字段 UI 不直接展示，但 `weft why`、evaluation 脚本、回执窗口都应能拿到。
- 删除 / 重新凝练时 `condensedFrom` 写新值；不要悄悄丢弃旧指针。
- 其它「由既有节点派生」的新节点（合并、汇总、加视角等）沿用同一字段名，便于一次性查询派生链。
