<div align="center">

<img src="public/favicon.svg" width="72" alt="Weft 图标"/>

# Weft

**让模型读到的上下文看得见、改得动。**

和模型、和 Agent 的每一轮问答，是无限画布上的一个节点；节点之间的连线，就是上下文。<br/>
节点能看到的，恰好是沿箭头流进来的内容。剪掉一条线，下一次回答就变了。

[![CI](https://github.com/zyaochen/weft/actions/workflows/ci.yml/badge.svg)](https://github.com/zyaochen/weft/actions/workflows/ci.yml) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-%E2%89%A520-339933) · [English](./README.md) · [文档站](https://zyaochen.github.io/weft/docs/zh/) · [用户手册](docs/zh/guides/user-manual.md)

</div>

<img src="docs/hero-demo-zh.gif" width="100%" alt="Weft 使用中：从文档提问、展开对话分支、编辑承载上下文的连线"/>

Weft 面向跑长会话的人：开发、研究、排查问题，一聊几十轮，想精确决定下一轮读到什么。它是一个本机 Web 应用加一个小代理；它不是模型、不是 Agent 运行时，也不是托管服务。

> **Fork 说明。** Weft fork 自 Xia Chen 的 [ThoughtDAG](https://github.com/chenxiachan/thoughtdag)（MIT）。画布本身来自上游，本仓库新增了打包好的 `weft` 命令、Agent Skill 和让终端 Agent 改画布的实时桥。见[与 ThoughtDAG 的关系](#与-thoughtdag-的关系)。

- [快速开始](#快速开始)
- [能做什么](#能做什么)
- [配置](#配置)
- [限制](#限制)
- [常见问题](#常见问题)
- [文档](#文档)
- [开发](#开发)

## 快速开始

需要 Node.js 20 或更新版本和 git。

```bash
git clone https://github.com/zyaochen/weft.git
cd weft
npm install
npm run server         # 模型代理：打印 "Weft proxy (Vercel AI SDK) running on http://localhost:3001"
npm run dev            # 画布：http://localhost:5173（另开一个终端）
```

打开 `http://localhost:5173`，点右上角**连接模型**，粘贴一家服务商的 key，或填任意 OpenAI 兼容接口的地址。然后在首页输入问题、回车。想先看看不接模型，点**载入示例画布**。

**不 clone 也能用。** npm 上的 `weft-canvas` 包带着构建好的画布、代理和 `weft` 命令：

```bash
npm install -g weft-canvas
weft serve                               # 在 http://localhost:3001 提供画布并打开浏览器
```

只想跑一次、不全局安装，用 `npx weft-canvas serve`。画布存在浏览器里（IndexedDB），每次请打开同一个地址。

**作为 Claude Code 或 Codex 插件安装。** 插件包含会话命令（Claude Code 里是 `/weft:weft`，Codex 里是 `weft` Skill）、`weft-canvas` Skill 和只读 MCP server（直接运行插件里自带的 CLI，约 0.3 MB，不从 npm 下载）。插件不含画布应用，画布仍用 `weft serve` 或桌面版打开。`--sparse` 只检出插件相关的文件，不拉整个仓库。

```bash
claude plugin marketplace add zyaochen/weft --sparse .claude-plugin plugins
claude plugin install weft@weft

codex plugin marketplace add zyaochen/weft --sparse .claude-plugin --sparse plugins
codex plugin add weft@weft
```

## 能做什么

**针对的问题。** Agent 任务聊到第四十轮，模型还在追一个第八轮就被推翻的假设，因为每一轮新提问都会把之前所有轮次重读一遍。新开窗口重讲，会丢掉一路攒下的证据；自动压缩会丢信息，却不告诉你丢了哪些。在 Weft 里，下一轮的输入是一组看得见、剪得断、接得回的连线。

| 画布上 | 模型收到的 |
|---|---|
| 追问长出一个实线子节点 | 完整的上游链路，别的都没有 |
| 从回答或选中的一段话开分支 | 兄弟分支互相看不见 |
| 虚线引用连进别处的节点 | 只带那个节点自己的问答，不带它的祖先 |
| 连进材料（笔记、文件、PDF、图片、网页快照） | 放在最前面，标明来源 |
| 剪断一条线 | 那段历史离开下一次请求；Cmd+Z 可以撤回 |
| 多条线汇入一个节点 | 合并线索、多模型对照、汇总 |

### 1. 把对话画成地图

- **追问与分支**：从任意节点继续；选中回答里的一段，只针对那一段开分支。
- **引用与材料**：只有连上的才算数。
- **多模型对照**：几个模型在各自分支上独立作答，汇总节点只读这几条连线。

见[展开对话分支](docs/zh/tutorials/branch-ai-conversations.md)和[对话节点](docs/zh/guides/conversations.md)。

### 2. 看见模型读了什么

- **发送前**：输入框上方「将发送约 N tok · M 条消息」可以展开成完整请求，顺序就是模型读的顺序。预览和真实请求出自同一个编译器。
- **发送后**：每个回答版本都保存生成它时的请求；和节点现在会读到的内容不同的行标为**现已不同**。
- **上游变了**：回答标为**上游已变**，不会悄悄过期。

[用户手册](docs/zh/guides/user-manual.md)走查里的一个例子（发送前预估，不是计费 token）：剪断一个分支和第一问之间的连线，这个分支下一次请求从约 2,603 tok 降到约 1,384 tok。

### 3. 改上下文就是改连线

剪（选中连线按 Delete）、连接与改接（拖动连线端点；成环会被拒绝）、在实线上右键选**在中间插入一步**、归档节点（节点留在画布上，内容离开上下文），以及**重放**：按依赖顺序重算受影响的节点，每个节点追加一个新版本。见[编辑 AI 上下文](docs/zh/tutorials/edit-ai-context.md)和[版本与重放](docs/zh/guides/versions-replay.md)。

### 4. Agent 遵循同一条规则

- **Agent 节点**：在模型菜单里选 Codex 或 Claude Code；Agent 在画布目录里工作，节点记下它改了哪些文件。
- **会话即图**：本机的 Claude Code、Codex、DeepSeek Harness 和 Pi 会话打开成持续跟随的镜像，可以修剪、分支、凝练；原会话文件不会被改写。在 Claude Code 里输入 `/weft`（Codex 里是 `$weft`）打开当前会话。
- **终端 Agent 改画布**：`weft setup skill --apply` 安装 Skill；在右下角宿主交接面板勾选**允许本机 Agent 编辑此画布**。多个 Agent 同时写时，后写的拿到 `REVISION_CONFLICT` 并重新读取，不会互相覆盖。
- **Why 层**：`weft why src/lib/api.ts` 列出改过这个文件的轮次；`weft mcp` 以只读 MCP 服务提供同样的查询。

见 [Agent 对话地图](docs/zh/guides/session-atlas.md)、[Why 层](docs/zh/guides/why-layer.md)和 [cli/README.md](cli/README.md)。

## 配置

接模型任选一种即可。

| 方式 | 在哪里 | 说明 |
|---|---|---|
| 服务商 key | 浏览器里的**连接模型** | 只存在本浏览器（localStorage）和代理进程内存里，不写磁盘 |
| OpenAI 兼容接口 | **连接模型 → 自定义端点** | 自己的网关、vLLM、LM Studio、中转服务 |
| `.env` 里的 key | `cp .env.example .env` | `OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GOOGLE_API_KEY`、`DEEPSEEK_API_KEY`、`MOONSHOT_API_KEY`、`OPENROUTER_API_KEY`、`ZHIPU_API_KEY`、`DASHSCOPE_API_KEY`；改完重启代理 |
| 本地模型 | `.env`：`OLLAMA_MODELS=qwen3:8b,llama3.2` | `OLLAMA_BASE_URL` 默认 `http://localhost:11434` |

可选项：

- **判断模型**（给分支打分、给回忆排序）：OpenRouter Jev、TypeSafe、Cloudflare、自建 `/v1/systemone` 接口，或用对话模型做未校准的替身。没有判断模型时，每个判断都退回规则。见 [docs/setup_ZH.md](docs/setup_ZH.md)。
- **Agent**：把 `claude`（Claude Code）或 `codex` 装到 `PATH` 上；各自用自己的登录。
- **端口**：`.env` 里的 `PORT` 控制代理端口（默认 3001）；画布要连别处的代理时设 `VITE_API_BASE`；`weft serve --port N`。

## 限制

- 预览和回执覆盖的是画布编译出的输入，不含服务商侧状态；用 Agent 运行时，Agent 运行时自己的系统提示词不在预览里。
- 画布和回执存在你使用的那个浏览器配置里，没有同步也没有账号。用**导出备份（.json）**做备份。
- [Releases](https://github.com/zyaochen/weft/releases) 上的桌面安装包未签名。macOS 版只有 ad-hoc 签名、没有公证：第一次打开会被拦下，要到「系统设置 → 隐私与安全性 → 仍要打开」放行；应用内更新可能装不上，新版本请从 Releases 下载。Windows 的 SmartScreen 会提示一次（更多信息 → 仍要运行）。
- 宿主交接面板目前只有中文；界面其余部分中英双语。
- 会话镜像按观察到的磁盘格式读取 Claude Code、Codex、DeepSeek Harness 和 Pi；这些工具改格式后，镜像可能失效，直到读取器跟上。
- 不需要模型的浏览器验收脚本在 macOS 上手动跑，并在 CI 里每晚在 Linux 上跑；Windows 没有覆盖。跑了什么、不能说明什么，见 [VERIFICATION_ZH.md](VERIFICATION_ZH.md)。

## 常见问题

| 现象 | 原因与处理 |
|---|---|
| 代理打印 `No LLM API key in .env — starting empty` | 没有 `.env` 时的正常提示。在浏览器里连接模型，或在 `.env` 加 key 后重启 `npm run server`。 |
| `weft serve` 提示端口被占用 | 3001 被别的程序占着。运行 `weft serve --port 3002`。 |
| 模型菜单里没有 Codex / Claude Code | 对应 CLI 不在 `PATH` 上。菜单会列出它查找过的目录；安装 CLI 或加进 `PATH` 后重新打开菜单。 |
| 画布能打开，但每次请求都失败 | 页面连不到代理。保持 `npm run server` 运行，或把 `VITE_API_BASE` 设成代理地址。 |

更多见 [docs/zh/reference/troubleshooting.md](docs/zh/reference/troubleshooting.md)。

## 文档

| 从这里开始 | 读 |
|---|---|
| 跟着一次完整会话一步步走 | [用户手册](docs/zh/guides/user-manual.md) · [English](docs/guides/user-manual.md) |
| 安装与连接模型 | [docs/zh/index.md](docs/zh/index.md) · [连接模型](docs/setup_ZH.md) |
| 查某个功能 | [功能地图](docs/zh/guides/index.md) · [教程](docs/zh/tutorials/index.md) · [参考](docs/zh/reference/index.md) |
| CLI、Why 层、MCP | [cli/README.md](cli/README.md) |
| 设计与验收 | [ARCHITECTURE_ZH.md](ARCHITECTURE_ZH.md) · [VERIFICATION_ZH.md](VERIFICATION_ZH.md) · [DEPLOYING.md](DEPLOYING.md) |
| 和同类工具的区别 | [COMPARISON_ZH.md](COMPARISON_ZH.md) |

文档可以用 VitePress 带搜索地浏览：`npm run docs:dev`，或看 Pages 工作流发布的 <https://zyaochen.github.io/weft/docs/zh/>。

## 开发

| 命令 | 作用 |
|---|---|
| `npm run build` | 类型检查并构建生产 Web 包到 `dist/` |
| `npm run lint` | ESLint |
| `npm test` | CLI 单测（先构建 CLI），加布局、实时日志、子 Agent 检查 |
| `npm run cli:pack` | 构建 `weft-canvas` CLI tarball（画布、Skill、CLI 一起），与发布到 npm 的是同一份产物 |
| `node scripts/verify-cli-package.mjs cli/weft-canvas-<版本>.tgz` | 把 tarball 装进空项目，在 Chrome 里实际驱动一遍 |
| `npm run docs:dev` | 文档站 |
| `npm run desktop` | 从源码启动 Electron 外壳 |

| 路径 | 内容 |
|---|---|
| `src/` | React 19 + Vite 画布：`components/`、zustand `store/`、图与上下文 `lib/`、`i18n/`（中英） |
| `server.mjs` | 基于 Vercel AI SDK 的 Express 代理，带 agentic 网页搜索 |
| `cli/` · `skill/` · `protocol/` | `weft` CLI、画布 Skill、context-bundle 协议与宿主适配 |
| `runtime/` | 本机 Agent 运行时（Claude Code、Codex、Pi）与画布桥 |
| `desktop/` · `dsh/` | Electron 外壳；DeepSeek Harness 插件 |
| `scripts/` | 构建辅助、Skill 安装器、验收脚本（`verify-*.mjs`） |
| `docs/` · `website/` · `video/` | 文档、静态网站、Remotion 视频源 |
| `benchmark/` | 上下文干预基准：用例、标准答案、采集的运行、工具 |

贡献见 [CONTRIBUTING_ZH.md](CONTRIBUTING_ZH.md)；安全问题见 [SECURITY.md](SECURITY.md)。

## 与 ThoughtDAG 的关系

Weft 从 ThoughtDAG（[chenxiachan/thoughtdag](https://github.com/chenxiachan/thoughtdag)，MIT，© 2026 Xia Chen）起步并改名。画布模型（节点、连线即上下文、版本、重放、Agent 对话地图）、Why 层（`why`、`mcp`）和 context-bundle 协议来自上游。本仓库新增：打包好的 CLI（`weft serve`、`open`、`graph`、`bundle`、`setup skill`）、画布 Skill 及其安装器、让终端 Agent 编辑已打开画布的实时桥，以及 `scripts/` 下的验收脚本。本仓库的 git 历史从头开始，上游历史见上游仓库。两个项目各自独立演进，上游的改动不会定期合入 Weft。

## 许可证

MIT，见 [LICENSE](./LICENSE)。按许可证要求保留了上游的版权声明。
