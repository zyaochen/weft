# Changelog

All notable changes to this repository are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The web app
(`package.json`, 0.2.0) and the CLI package (`cli/package.json`, `weft-canvas`)
carry separate version numbers; CLI releases are tagged `cli-v<version>`.

## [Unreleased]

### Added

- `COMPARISON.md` / `COMPARISON_ZH.md`: how Weft differs from
  episodic-memory, claude-historian-mcp and claude-code-history-viewer, from
  their READMEs.
- OpenSSF Scorecard and CodeQL workflows; `glama.json` for the Glama MCP
  directory.

### Changed

- The plugin runs its MCP server from the CLI bundle it carries
  (`plugins/weft/server/weft.mjs`, about 0.3 MB) instead of
  `npx weft-canvas@<version> mcp`, so it needs no npm download and no
  published version.
- `eslint-plugin-react-hooks` 7.1 and its React Compiler rules. Of the 28
  errors they raised, 14 are fixed in code (state reset during render instead
  of in an effect, a ref read replaced by state, effects moved below the
  function they call); the other 14 carry a one-line `eslint-disable` with the
  reason, mostly effects that load from a bridge or reset a dialog when it
  opens.
- Workflows default to read-only tokens; only the jobs that write a release
  or publish get `contents: write` / `id-token: write`. `cli/Dockerfile`
  pins its base image by digest, and Dependabot updates the digest.

### Fixed

- Text extracted from fetched web pages (proxy, Pages function, DSH plugin,
  attachment fallback) drops `<script>` / `<style>` blocks whose end tag has
  trailing whitespace, and keeps `&amp;lt;` as the literal text `&lt;`
  instead of decoding it twice.
- Pasting a tab-separated table escapes backslashes in cells, so a cell
  ending in `\` no longer breaks the table.
- `SECURITY.md` lists the CodeQL findings accepted by design and why.

### Security

- Desktop: Electron 43.3.0 → 43.8.12 and `npm audit fix` in
  `desktop/package-lock.json`, which clears the six high advisories there
  (Electron sandbox and protocol-handler issues, undici, js-yaml, fast-uri,
  @xmldom/xmldom, brace-expansion). Six moderate ones remain in
  electron-builder's own dependencies; npm offers only a downgrade to 25.

## [cli-v0.5.2] - 2026-11-23

### Changed

- The GitHub account was renamed from `chenziyaos` to `zyaochen`. The MCP
  Registry name is now `io.github.zyaochen/weft` (it was
  `io.github.chenziyaos/weft`), and the package's repository, homepage and
  issue links point at `github.com/zyaochen/weft` and
  `zyaochen.github.io/weft/`.
- The bundled app and server are built from the current main branch, so they
  include the changes listed under [Unreleased] above.

## [v0.5.18] - 2026-11-20

The first desktop release that can update itself: from this version on, the
app finds later releases through the update feed attached to each release.
v0.5.17 cannot, so move from it by installing this version by hand.

### Changed

- The session atlas, material reader, thought-map dialog, model-key dialog,
  condense dialog, response viewer, host handoff panel and example canvas load
  on first use. The startup chunk drops from 1,187.5 kB (395.3 kB gzip) to
  880.5 kB (284.8 kB gzip) in `npm run build`.

### Fixed

- Desktop builds carry the update feed: the release gets `latest.yml`,
  `latest-mac.yml` and `latest-linux.yml`, and each app gets the
  `app-update.yml` that points at them. v0.5.17 shipped without either, so
  its in-app update check always fails.
- OpenRouter OAuth sign-in preselects OpenRouter's recommended models, not
  those of whichever preset was chosen before in the same session.

### Known limitations

- All builds are still unsigned. On macOS the app is ad-hoc signed and not
  notarized: allow the first launch under System Settings → Privacy &
  Security → Open Anyway. The macOS updater checks the signature of a
  download, so an in-app update there may fail to install; download the new
  version from Releases if it does. Windows SmartScreen asks once.
- An update from one release to the next has not been tried yet, because
  this is the first release with a feed.

## [v0.5.17] - 2026-11-19

First desktop release of this fork. Desktop releases are tagged
`v<version>` after `desktop/package.json`; the canvas inside is the web app at
the tagged commit.

### Added

- Installers: macOS `.dmg` and `.zip` for Apple silicon (`arm64`) and Intel,
  a Windows x64 installer, and a Linux x64 `.AppImage`.
- `dsh-weft-<version>.tgz`, the DeepSeek Harness plugin, attached to the
  release; `dsh plugin add` accepts its URL.

### Known limitations

- All builds are unsigned. On macOS the app is ad-hoc signed and not
  notarized: allow the first launch under System Settings → Privacy &
  Security → Open Anyway, and download later versions from Releases, since
  in-app updates may not install. Windows SmartScreen asks once.

## [cli-v0.5.1] - 2026-11-19

### Added

- Claude Code and Codex plugin (`plugins/weft`, listed in
  `.claude-plugin/marketplace.json`): the `/weft` command, the `weft-canvas`
  Skill and the read-only MCP server through `npx weft-canvas mcp`.
  `npm run plugin:build` regenerates it; CI fails when it is out of date.

### Changed

- When no `weft` command is installed, `/weft` and `$weft` fall back to
  `npx -y weft-canvas` and suggest `npm install -g weft-canvas`, instead of
  pointing at a source install.
- The npm package is smaller: three unreferenced cover images (4.8 MB) are
  gone from the bundled app, the bundled server is whitespace- and
  syntax-minified, and the PDF worker is pdfjs's minified build.

### Fixed

- The website download block, the Pages build and the desktop update notice
  read only desktop releases (`v<version>` tags); a `cli-v*` release no longer
  shows up as a desktop version. CLI releases are created without the
  "Latest" mark.

## [cli-v0.5.0] - 2026-11-19

### Added

- `weft-canvas` is published to npm: `npm install -g weft-canvas`, or
  `npx weft-canvas serve` without a global install.
- `.github/workflows/publish-cli.yml` publishes later `cli-v*` tags to npm
  with provenance (Trusted Publishing) and to the MCP Registry.
- `weft --version` (also `-v`, `version`) prints the CLI version.

### Changed

- Dependencies updated to the newest versions within their ranges (#13, #14,
  #17); `zhipu-ai-provider` removed because it had no call sites.

## Initial public release

### Added

- First public release of this fork of
  [ThoughtDAG](https://github.com/chenxiachan/thoughtdag), with a fresh git
  history.
- `npm run cli:pack` builds the `weft-canvas` tarball from source; `npm test`
  runs the CLI unit tests plus the layout, live-log and subagent checks.
- GitHub Actions CI (lint, build, test on Node 20, 22 and 24), issue templates,
  `SECURITY.md`, `CODE_OF_CONDUCT.md` and Dependabot configuration.
- The Pages workflow also publishes a static build of the app under `/app/`,
  so `#view=` share links work without a server.

### Changed

- The CLI package is named `weft-canvas`.
- The MCP container (`cli/Dockerfile`) builds the CLI from source.
- `VERIFICATION.md` now records the acceptance scripts as run on this tree,
  with a list of what was not run.
- Agents launched from the canvas (Claude Code, Codex) run on their own login
  and model configuration.

### Removed

- Integration with a private model gateway: its provider, the single sign-on
  routes, the gateway-backed decision model and the related settings card.
- Guides, manual chapters and screenshots that depended on private services
  or showed private model catalogs.
- Git LFS tracking; media files are stored as ordinary git objects.
