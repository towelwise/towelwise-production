# Towelwise AI agent workflow

Towelwise AI is a full IDE, a fork of Code-OSS, not an extension. Its first features were built as a VS Code extension; that code has been removed, and every feature is now built from scratch in core from the vision in the roadmap ([decision 0004](docs/decisions/0004-features-are-built-from-scratch-in-core.md)). Describe the work that way.

Read this file in both Claude Code and Codex. The roadmap is [ROADMAP.md](ROADMAP.md). Decisions are in [docs/decisions/](docs/decisions/), starting with [0001](docs/decisions/0001-constraints-carried-forward.md). For the Code-OSS codebase itself, Microsoft's root `AGENTS.md` and `.github/copilot-instructions.md` still apply.

## Roles and scope

- Claude Code is the primary implementer. Codex reviews, challenges plans, and handles explicitly scoped tests or mechanical tasks. Gemini/Antigravity provides advisory and UI help.
- Work on the current phase in `ROADMAP.md`. Phases can be divided into smaller agreed slices, each with a spec.
- **Build from scratch in core.** Never port or adapt extension-era code; start from the vision and what core makes possible. Settle a feature's open questions as decisions, then write its spec, before building it.
- Preserve approved decisions. Propose unresolved architecture and tooling choices for the user to decide before implementing dependent work. Create a decision record only for an approved trade-off.

## Where things go

- `towelwise/`: our docs, decisions and build scripts (`towelwise/ide/`).
- `src/vs/workbench/contrib/towelwise/`: Towelwise code in core, by habit.
- Microsoft's files are edited when that is the right change, but deliberately: every edit raises the cost of each upstream merge. Keep such diffs small and say why in the commit.
- The `upstream` remote is Microsoft's, with push disabled. Upstream merges land as real merge commits, never squashed or rebased.

## Constraints that bind every change

Summarized from [decision 0001](docs/decisions/0001-constraints-carried-forward.md) as amended by [0004](docs/decisions/0004-features-are-built-from-scratch-in-core.md); read them for the full rules and sources.

- Files Towelwise creates carry the Towelwise header ([decision 0002](docs/decisions/0002-towelwise-files-carry-a-towelwise-header.md)).
- No agent is bundled. Agents install from Open VSX only, never Microsoft's Marketplace; people sign in in the agent's own panel. Say "works with", never "official" or "supported by". Keep MIT notices; no Microsoft trademarks.
- VSCodium's update feed stays off (`DISABLE_UPDATE=yes`).
- In an untrusted project everything works except terminal startup commands (and any later feature that runs project code). Granting trust never starts anything on its own.
- Before code changes a user setting, save the old value to disk, not only in memory. Multi-setting writes recover from a partial failure, and the crash and partial-write paths are tested.

## Shared skills

The catalog is `grill-with-docs`, `grilling`, `domain-modeling`, `codebase-design`, `to-spec`, `tdd`, `diagnosing-bugs`, `handoff`, and `code-review`. Claude Code's copies are in `~/.claude/skills/`, Codex's in `~/.agents/skills/`. If a skill is missing, say so instead of substituting general advice.

- Unclear work: `grilling` or `grill-with-docs`. Agreed work: `to-spec` before substantial implementation.
- `tdd` for meaningful behavior at agreed boundaries; no tautological tests.
- `diagnosing-bugs` when a failure needs investigation. `code-review` in Codex for the independent review. `handoff` when switching agents or ending a session.

## Project artifacts

- Specs: `.work/specs/`. A ready spec has `Status: ready-for-agent`.
- Handoff: `.work/HANDOFF.md`, newest entry first, headed `## YYYY-MM-DD — <assistant>: <one-line purpose>` with `### For the reviewer`, `### Status`, `### Checks`, `### Still open` and `### Next action`. Read only its top entry (`head -n 80`) once per session. It is local and **never committed**.

## Work discipline

- One agent at a time in this folder; concurrent implementers need separate worktrees.
- Read narrowly: grep for the symbol, then read only the relevant range. This repository is large; never explore it whole.
- Keep output bounded (`tail -n 40` or a filtered `grep`) while preserving exit status and failure details.
- **Never build, commit or push without the user's go-ahead.** Leave work uncommitted for the second opinion unless asked to commit. Stage by explicit path, never `git add -A`.
- Git: protected `main`, short task branches, conventional commits, small pull requests squash-merged (upstream merges excepted, above).
- Bash heredocs containing backticks or quotes break the agent's shell tool. Write scripts with the Write tool and run them with `node`.
- When replacing a feature, delete the old code and its tests in the same change.
- After two failed attempts at the same fix, report the attempts and ask the user.
- At the end of a slice or commit, suggest `/clear` or `/compact`.

## Verification

- Editor: follow the validation section of `.github/copilot-instructions.md` and choose the smallest check that covers the change (`npm run typecheck-client` for `src/`, `npm run gulp compile-extensions` for built-in extensions). Builds and type checks are slow; don't run them as a ritual.
- Towelwise core tests run under plain Node: `npm run build-fast -- --client-only`, then `npm run test-node -- --runGlob "vs/workbench/contrib/towelwise/**/*.test.js"`. Put tests in `src/vs/workbench/contrib/towelwise/test/`; pull-request CI runs that glob.
- Pull-request CI compiles the editor and runs our tests. The full app build is a release and hand-check step.
- Build the app: `towelwise/ide/build.sh` from Git Bash (`C:\Program Files\Git\bin\bash.exe`; the `bash` on PATH is the WSL stub). It takes about 14 minutes, uses the machine heavily, and needs the app closed. Run it in the background and log to `C:\towel-builds\logs\build-*.log`. It builds the committed `HEAD`, not uncommitted changes. The VSCodium clone and the zip live in `C:\towel-builds\build\` (reused between builds); the old `C:\tw-build` is not used any more.
- Launch the built app for manual checks with `towelwise/ide/launch.cmd`. Each launch gets a brand-new profile in `C:\towel-builds\profiles\<timestamp>\` (agent config folders, user data and extensions all empty), so earlier sign-ins and installs never carry over. To reopen the same profile, set `TW_PROFILE` to that folder before launching. The script also clears `ELECTRON_RUN_AS_NODE` and `VSCODE_*`.

Record each check's command and exit status. Compile, CI and manual checks in the built app are distinct results; one does not prove another.
