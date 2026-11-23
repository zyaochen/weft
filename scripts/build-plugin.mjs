#!/usr/bin/env node
// Generate the Claude Code / Codex plugin under plugins/weft/ and the
// marketplace file that lists it, from the same sources the CLI package
// ships: the weft-canvas Skill with its two host scripts, the /weft command
// (Claude Code) and the $weft skill (Codex). The MCP server is the CLI bundle
// itself (cli/dist/weft.mjs, self-contained, ~0.3 MB), run as `weft mcp`, so
// the plugin works without downloading the npm package.
//
//   node scripts/build-plugin.mjs           write plugins/weft and .claude-plugin/marketplace.json
//   node scripts/build-plugin.mjs --check   exit 1 if the committed copy differs (CI)
//
// Prerequisite: npm run cli:build and host:build (cli/dist/, host-dist/).
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const cli = JSON.parse(readFileSync(path.join(root, 'cli/package.json'), 'utf8'));
const version = cli.version;

const author = { name: 'zyaochen', url: 'https://github.com/zyaochen' };
const repository = 'https://github.com/zyaochen/weft';
const description = 'Open the current session on the Weft canvas (/weft), query local session history (why / find / recall), and let the agent branch, cite and write back on a live canvas (weft-canvas skill). MCP: the read-only why layer.';
const keywords = ['canvas', 'context-engineering', 'session-history', 'mcp'];
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

// Claude Code substitutes ${CLAUDE_PLUGIN_ROOT}; Codex resolves ./ paths against cwd ".", the plugin root.
const claudeMcp = { weft: { command: 'node', args: ['${CLAUDE_PLUGIN_ROOT}/server/weft.mjs', 'mcp'] } };
const codexMcp = { mcpServers: { weft: { command: 'node', args: ['./server/weft.mjs', 'mcp'], cwd: '.' } } };

// path inside the repository → contents
const files = new Map();
const plugin = 'plugins/weft';
const copy = (from, to) => files.set(`${plugin}/${to}`, readFileSync(path.join(root, from)));
copy('skill/weft-canvas/SKILL.md', 'skills/weft-canvas/SKILL.md');
copy('host-dist/host-handoff.mjs', 'skills/weft-canvas/scripts/host-handoff.mjs');
copy('host-dist/weft.mjs', 'skills/weft-canvas/scripts/weft.mjs');
copy('LICENSE', 'skills/weft-canvas/LICENSE');
copy('LICENSE', 'LICENSE');
copy('protocol/adapters/claude-code/weft.md', 'commands/weft.md');
copy('protocol/adapters/codex/skills/weft/SKILL.md', 'codex-skills/weft/SKILL.md');
copy('cli/dist/weft.mjs', 'server/weft.mjs');
files.set(`${plugin}/codex-mcp.json`, json(codexMcp));
files.set(`${plugin}/.claude-plugin/plugin.json`, json({
  name: 'weft', displayName: 'Weft', version, description, author, homepage: 'https://zyaochen.github.io/weft/', repository, license: 'MIT', keywords,
  mcpServers: claudeMcp,
}));
// Codex reads skills from the listed directories only: the shared canvas skill plus $weft.
files.set(`${plugin}/.codex-plugin/plugin.json`, json({
  name: 'weft', version, description, author, homepage: 'https://zyaochen.github.io/weft/', repository, license: 'MIT', keywords,
  skills: ['./skills/', './codex-skills/'],
  mcpServers: './codex-mcp.json',
  interface: { displayName: 'Weft', shortDescription: 'Session history and canvas handoff for coding agents', developerName: 'zyaochen', category: 'Developer Tools', capabilities: ['Interactive', 'Read', 'Write'], websiteURL: 'https://zyaochen.github.io/weft/' },
}));
files.set('.claude-plugin/marketplace.json', json({
  name: 'weft',
  owner: author,
  description: 'Weft plugins for Claude Code and Codex',
  plugins: [{ name: 'weft', source: './plugins/weft', description, category: 'productivity' }],
}));

const listed = (dir) => (existsSync(dir) ? readdirSync(dir, { recursive: true, withFileTypes: true }) : [])
  .filter((e) => e.isFile()).map((e) => path.relative(root, path.join(e.parentPath, e.name)));

if (check) {
  const stale = [...files].filter(([p, body]) => !existsSync(path.join(root, p)) || !readFileSync(path.join(root, p)).equals(Buffer.from(body)));
  const extra = listed(path.join(root, plugin)).filter((p) => !files.has(p));
  for (const p of [...stale.map(([p]) => p), ...extra]) console.error(`out of date: ${p}`);
  if (stale.length || extra.length) { console.error('run: npm run plugin:build'); process.exit(1); }
  console.log(`plugin ${version} is up to date`);
} else {
  rmSync(path.join(root, plugin), { recursive: true, force: true });
  for (const [p, body] of files) {
    mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    writeFileSync(path.join(root, p), body);
  }
  console.log(`wrote plugin ${version}: ${files.size} files`);
}
