---
name: weft
description: 把当前 Codex 会话在 Weft 中打开（桌面版直连；无桌面版时 `weft open` 在浏览器打开）；或用 why / find / recall 查本机会话历史。USE WHEN 用户输入 `$weft`（可跟 why / find / recall / status / list / session-id 前缀 / harvest），或要求查历史 / 在画布打开当前会话。DO NOT USE WHEN 需要在画布上继续推理或编辑图——那是 weft-canvas skill。
---

[[weft:command]] (this marker lets the canvas importer prune this command turn — keep it as is)

# $weft：会话打开 + 历史查询

两种用法，按参数分流。回答用用户语言——本说明是英文不代表回答也用英文。

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

把 `$weft` 之后的所有参数原样透传。Codex 会把参数里的 `@file` 变成附件：当只有 `why`（或 `why` + 其它 flag）且有附件到达时，那份附件就是目标——用它的路径（或名字）作为参数传给命令行；命令行只需要名字，**不要**读它的正文。永远不带参运行命令。索引查询前自刷新，一般不用手动 `weft index`。

## B. 打开会话

1. **定位会话文件**：Codex rollout JSONL 在 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`（全局，不按项目分）。当前会话 = 最近三天内 mtime 最新、且首行 `session_meta` 里 `"cwd"` 等于当前工作目录的文件。从新到旧扫：

   ```bash
   for f in $(find ~/.codex/sessions -name 'rollout-*.jsonl' -mtime -3 -print0 | xargs -0 ls -t); do
     head -c 65536 "$f" | grep -q "\"cwd\":\"$PWD\"" && echo "$f" && break
   done
   ```

   参数为 `list` 时列最近 5 个匹配让用户挑；为 session-id 前缀时选中匹配文件。sessionId = 文件名末尾的 UUID（`rollout-<timestamp>-<uuid>.jsonl` 里的 uuid 段）。

2. **主路（桌面版）**：`open "weft://open?session=<sessionId>"`（macOS；Linux 用 `xdg-open`，Windows 用 `start`）。退出码 0 = 成功。告诉用户：会话已在 Weft 桌面版打开；画布自动路由（已有画布则续接到断点，否则造新画布），并会持续跟随。**不要打印或总结会话内容**——那是 Weft 的工作。

3. **回退（open 失败 = 未装桌面版 / 版本过旧）**：`command -v weft` 能找到时，运行 `weft open <sessionId>`。它在本机起（或复用）Weft 服务并在浏览器打开这个会话；会话文件由本地服务直接读取，不复制。退出码 0 = 成功，画布路由同 (2)，页面开着画布持续跟随（`weft stop` 关掉 `weft open` 起的服务）。**不要打印或总结会话内容。**

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

   ③ 依次探测 `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/`（`weft serve`）和 `http://localhost:5173/`（开发服务器）：第一个返回 200 的 → `open "http://localhost:<端口>/#import-url=http://127.0.0.1:38017/session.jsonl"`；都不在跑 → 给用户三选一：`weft serve`（或仓内 `npm run dev`）后重试 / `open "https://zyaochen.github.io/weft/app/#import-url=http://127.0.0.1:38017/session.jsonl"`（数据不出本机，桥两分钟有效）/ 把桌面快照手动拖进画布切换器导入。收尾告知快照路径与打开的地址。
