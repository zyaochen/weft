---
description: 把当前 Claude Code 会话在 Weft 中打开（桌面版直连；无桌面版时 `weft open` 在浏览器打开）；或用 why / find / recall 查本机会话历史
---

# /weft：会话打开 + 历史查询

两种用法，按参数分流。回答用用户语言。

## USE WHEN / DO NOT USE WHEN

- **USE WHEN**
  - 用户输入 `/weft`（可选跟 `why` / `find` / `recall` / `status` / `list` / 会话 id 前缀 / `harvest`）。
  - 用户让 agent 查「这个文件过往的会话历史」「某句话在哪里说过」或「把当前会话在画布上打开」。
- **DO NOT USE WHEN**
  - 需要在画布上继续推理、开分支、互信引用——那是 `weft-canvas` skill。

## 决策

```
参数以 why / find / recall / status 开头 → A. 查历史
否则（无参数 / list / session-id 前缀 / harvest）→ B. 打开会话
```

## A. 查历史

把参数**原样**交给 Weft 命令行，把输出**逐字**展示——不要自己读会话文件，不要总结或改写。输出本身就是为阅读设计的：`Δ` 是观察到的改动，`≈` 是回答里的候选解释，`⤴` 是空应答承接的上一个问题；每行末尾的 `weft://…` 深链用 `open` 落到那一轮。

找命令行的顺序：

1. `command -v weft` — 有则直接用
2. 本仓开发者：`node cli/dist/weft.mjs`（`cli/dist` 缺失时先 `npm run cli:build`）
3. 都没有：`npx -y weft-canvas <参数>`（首次下载约 16 MB），并建议用户 `npm install -g weft-canvas`

```bash
weft why --check src/lib/api.ts  # 一行：有没有历史（exit 0 有 / 1 无），改文件前先问
weft why src/lib/api.ts          # 哪几轮动过这个文件、改了什么、当时说了什么
weft why arxiv:2506.07962        # 论文、URL、画布附件名都是合法对象
weft find "surrogate gradient"   # 在哪几轮被问过（Q）或说过（≈），精确匹配
weft recall <session> <n>        # 把某一轮完整摊开
weft status                      # 索引里有什么、多少是确定证据
```

**跨启动 / 跨 agent 共享上下文**:`weft bundle publish --file <canvas.weft.json> --node <id> [--tag name]` 把某节点的上下文冻结成可移植 bundle;`weft bundle pull <tag>` 输出 Markdown 直接喂给新 agent;`weft bundle list / show` 浏览。详细说明见仓库 `docs/guides/data-sharing.md` 的「跨启动 / 跨 agent 共享一份上下文 bundle」一节。

**不要**直接把跑了几十几百轮的长会话 JSONL `import-url` 整份喂给下一个 agent——早期的工具输出会把上下文撑爆而且把同一个坑又挖一遍。看 / 改一个长程 agent 的轨迹要走 Session Atlas mirror(默认驱逐旧工具输出),动完刀决定要哪段,再 `weft bundle publish` 冻结成 bundle。

参数里的 `@文件` 是 Claude Code 的引用语法——会把整份文件读进对话。查询只需要名字，剥掉 `@` 传给命令行（命令行自己也会剥），**不要读或引用被带进对话的正文**。提醒用户下次直接写文件名。索引查询前自刷新，一般不用手动 `weft index`。

## B. 打开会话

1. **定位会话文件**：本项目的会话 JSONL 在 `~/.claude/projects/<slug>/`（slug = 项目绝对路径把 `/` 和 `.` 换成 `-`）。`ls -t` 取**最近修改**的 `.jsonl`。参数为 `list` 时列最近 5 个（文件名、大小、mtime）让用户挑；为会话 id 前缀时选中匹配文件。sessionId = 文件名去掉 `.jsonl`。

2. **主路（桌面版）**

   ```bash
   open "weft://open?session=<sessionId>"
   ```

   退出码 0 = 成功。告诉用户：会话已在 Weft 桌面版打开；画布自动路由（已有画布则续接到断点，否则造新画布），并会持续跟随。**不要打印或总结会话内容**——那是 Weft 的工作。

3. **回退（open 失败 = 未装桌面版 / 版本过旧）**

   ```bash
   command -v weft && weft open <sessionId>
   ```

   在本机起（或复用）Weft 服务并在浏览器打开这个会话；会话文件由本地服务直接读取，不复制。退出码 0 = 成功，画布路由同 (2)，页面开着画布持续跟随（`weft stop` 关掉 `weft open` 起的服务）。**不要打印或总结会话内容。**

4. **再回退（没有 `weft` 命令）——本机桥。** 提一句 `npm install -g weft-canvas` 后下次就能走 (3)，然后：

   ① 把会话 JSONL **复制**到 `~/Desktop/weft-session-$(date +%Y%m%d-%H%M).jsonl`（绝不改源文件）
   ② 清残留 `lsof -ti :38017 | xargs kill 2>/dev/null`，再以快照路径为 `TD_SNAP` 后台运行（`nohup … >/dev/null 2>&1 &`）：

   ```python
   import http.server, socketserver, os, threading, re
   data = open(os.environ['TD_SNAP'], 'rb').read()
   OK = re.compile(r'^(http://(localhost|127\.0\.0\.1)(:\d+)?|https://app\.weft\.workers\.dev)$')
   class H(http.server.BaseHTTPRequestHandler):
       def do_GET(self):
           o = self.headers.get('Origin', '')
           self.send_response(200)
           if OK.match(o): self.send_header('Access-Control-Allow-Origin', o)
           self.send_header('Content-Type', 'application/x-ndjson')
           self.end_headers()
           self.wfile.write(data)
       def log_message(self, *a): pass
   socketserver.TCPServer.allow_reuse_address = True
   srv = socketserver.TCPServer(('127.0.0.1', 38017), H)
   threading.Timer(120, lambda: os._exit(0)).start()
   srv.serve_forever()
   ```

   ③ 依次探测 `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/`（`weft serve`）和 `http://localhost:5173/`（开发服务器）：第一个返回 200 的 → `open "http://localhost:<端口>/#import-url=http://127.0.0.1:38017/session.jsonl"`；都不在跑 → 给用户三选一：`weft serve` 后重试 / `open "https://zyaochen.github.io/weft/app/#import-url=http://127.0.0.1:38017/session.jsonl"`（数据不出本机，桥两分钟有效）/ 把桌面快照手动拖进画布切换器导入。收尾告知快照路径与打开的地址。
