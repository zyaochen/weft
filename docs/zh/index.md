---
description: 从源码运行开源 Weft，连接模型，在对话画布上编辑 AI 上下文、展开分支并复用过去的思路。
---

# 安装与快速开始

> **Weft 是开源思维画布。** 目前从源码运行；仓库还没有发布预编译的桌面安装包。

Weft 把 LLM 对话变成一张可编辑的图。每个节点是一轮问答，连进节点的内容决定模型下一次真正看到什么。

## 从源码运行

需要 Node.js 20 或更新版本：

```bash
git clone https://github.com/zyaochen/weft.git
cd weft
npm install
npm run server   # 模型代理：http://localhost:3001
npm run dev      # 画布：http://localhost:5173
```

打开 `http://localhost:5173`。模型接口可以直接在应用里配置，`.env` 不是必需的。

想要一条 `weft` 命令（`weft serve` 一步起服务并打开画布，另带 why 层和 Agent Skill 安装器）：

```bash
npm install -g weft-canvas                # 或只跑一次：npx weft-canvas serve
weft serve                                # http://localhost:3001
```

## 从一个问题开始

[移除不需要的上下文](/zh/tutorials/edit-ai-context) · [展开支线问题](/zh/tutorials/branch-ai-conversations) · [接上过去的讨论](/zh/tutorials/reuse-past-ai-discussions)

<img src="../hero-demo-zh.gif" alt="Weft 总览：文档提问、编辑上下文边、语义缩放、备份，以及用 Session Atlas 延续项目上下文" width="100%" loading="lazy"/>

## 第一次打开：选择开始方式

首次页面提供四个入口。你可以先浏览示例和现有工作，再决定是否连接模型。

![Weft 中文首次页面：提问、材料、Agent 对话地图与模型连接入口](/screenshots/onboarding/zh/landing-zh-annotated.png)

> 红色说明框与虚线是文档标注，不属于 Weft 界面。[查看无标注截图](/screenshots/onboarding/zh/landing-zh.png)。

1. **提出问题**：连接模型后，从一个真实问题建立第一张图；
2. **加入材料**：拖入 PDF、图片或其他文件。打开和阅读不需要模型，提问与识读需要模型；
3. **打开本地 Agent 会话**：进入 [Agent 对话地图](/zh/guides/session-atlas)，查看镜像图不需要模型；
4. **连接模型**：为生成回答、识读图片和凝练内容准备模型。

如果只想先认识软件，页面下方的**载入示例画布**无需任何配置。

## 连接第一个模型

需要生成内容时，点击**连接模型**。选择一种方式即可，不需要同时配置所有入口。

![Weft 中文模型连接窗口：连接方式、授权、API key 与保存边界](/screenshots/onboarding/zh/connect-model-zh-annotated.png)

> 截图中的红色说明框是文档标注。[查看无标注截图](/screenshots/onboarding/zh/connect-model-zh.png)。

- **最快开始**：使用界面中的一键授权；
- **已有 API key**：选择对应服务商预设并粘贴 key；
- **本地模型**：选择 Ollama，或使用自定义 endpoint。

完成流程是：**选择入口 → 授权或填写 key → 获取模型列表 → 勾选模型 → 保存**。连接信息的保存边界会显示在窗口中；服务商、订阅、本地模型和开发者配置见[连接模型](/zh/setup)。

## 接下来

1. 加载示例画布，或者提出第一个真实问题；
2. 进入[认识界面](/zh/guides/interface-overview)，了解工具栏、节点、连线和侧栏；
3. 如果要继续本地 Agent 工作，查看 [Agent 对话地图配置](/zh/guides/session-atlas#配置-sources-与一键接入)。

**[按功能区查看完整说明 →](/zh/guides/)**

## 其他运行方式

### 桌面版

桌面外壳（Electron）在 `desktop/` 下，可以从源码启动：`npm run desktop`。推送 `v*` 版本标签时，`desktop` GitHub Actions 工作流会为 macOS、Windows、Linux 打包并生成 Release 草稿；没有配置签名证书时产出的是未签名构建。已发布的版本见 [GitHub Releases](https://github.com/zyaochen/weft/releases)。

### 只读分享页

`#view=` 分享链接是纯静态页面，不经过服务端；仓库的 GitHub Pages 工作流会把网站、文档和一份静态画布发布到 `https://zyaochen.github.io/weft/` 下。
