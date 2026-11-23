---
description: Open the current Codex session in Weft (desktop app direct; `weft open` in the browser as the fallback — data never leaves this machine)
---

[[weft:command]] (this marker lets the canvas importer prune this command turn — keep it as is)

Open the current Codex session in Weft. Communicate with the user in THEIR language (the one they have been using); these instructions being English does not make English the reply language. Rules and steps:

1. **Locate the session file**: Codex rollout JSONL files live under `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` (global, not per project). The current session = the **most recently modified** file within the last three days whose first `session_meta` line has `"cwd"` equal to the current working directory. Search newest-first:

```bash
for f in $(find ~/.codex/sessions -name 'rollout-*.jsonl' -mtime -3 -print0 | xargs -0 ls -t); do
  head -c 65536 "$f" | grep -q "\"cwd\":\"$PWD\"" && echo "$f" && break
done
```

If the argument is `list`, list the 5 most recent matching files (name, size, mtime) for the user to pick; if it is a session-id prefix, pick the matching file. The sessionId = the trailing UUID in the filename (`rollout-<timestamp>-<uuid>.jsonl`).

2. **Main road (desktop app)**: run `open "weft://open?session=<sessionId>"` (macOS; `xdg-open` on Linux, `start` on Windows). Exit code 0 = success — tell the user: the session is now open in the Weft desktop app; the canvas routes itself (an existing canvas for this session continues at its break point, otherwise a fresh canvas is minted), and from now on the canvas follows this session automatically. **Never print or summarize the session content** — that is Weft's job. Done.

3. **Fallback (open failed = desktop app missing or too old)**: if `command -v weft` finds the Weft command line, run `weft open <sessionId>`. It starts (or reuses) the local Weft server on this machine and opens this session in the browser; the server reads the session file itself, nothing is copied. Exit code 0 = success — tell the user the session is open in Weft in the browser, with the same routing as step 2, and that the canvas follows the session while that page stays open (`weft stop` ends a server `weft open` started). **Never print or summarize the session content.** Done.

4. **Last resort (no `weft` command)**: use the local bridge. Mention that installing Weft from source (see the main README) makes step 3 work next time. ① **Copy** the session JSONL to `~/Desktop/weft-session-$(date +%Y%m%d-%H%M).jsonl` (never modify the source). ② Clear leftovers with `lsof -ti :38017 | xargs kill 2>/dev/null`, then run in the background (`nohup … >/dev/null 2>&1 &`) with the snapshot path as `TD_SNAP`:

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

③ Probe `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/` (`weft serve`), then `http://localhost:5173/` (a development server): the first that answers 200 → `open "http://localhost:<port>/#import-url=http://127.0.0.1:38017/session.jsonl"`; neither → offer three options: start `weft serve` (or `npm run dev` in the repository) and retry / open the hosted app `open "https://zyaochen.github.io/weft/app/#import-url=http://127.0.0.1:38017/session.jsonl"` (data still never leaves the machine; the bridge lives two minutes) / drag the desktop snapshot into the canvas switcher → import. Close by telling the user the snapshot path and the opened address.
