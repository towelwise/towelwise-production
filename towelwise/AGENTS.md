# Towelwise AI agent workflow

Towelwise AI is a full IDE, a fork of Code-OSS, not an extension. Its first features were built as a VS Code extension; they are now being integrated into core as first-class code. Describe the work that way.

Read this file in both Claude Code and Codex. The roadmap is [ROADMAP.md](ROADMAP.md). Decisions are in [docs/decisions/](docs/decisions/), starting with [0001](docs/decisions/0001-constraints-carried-forward.md). For the Code-OSS codebase itself, Microsoft's root `AGENTS.md` and `.github/copilot-instructions.md` still apply.

## Roles and scope

- Claude Code is the primary implementer. Codex reviews, challenges plans, and handles explicitly scoped tests or mechanical tasks. Gemini/Antigravity provides advisory and UI help.
- Work on the current phase in `ROADMAP.md`. Phases can be divided into smaller agreed slices, each with a spec.
- **No new features until Phase 2 is done.** Fixes only.
- Preserve approved decisions. Propose unresolved architecture and tooling choices for the user to decide before implementing dependent work. Create a decision record only for an approved trade-off.

## Where things go

- `towelwise/`: our docs, decisions and build scripts (`towelwise/ide/`).
- `src/vs/workbench/contrib/towelwise/`: Towelwise code in core, by habit.
- `extensions/towelwise/`: the extension-era features, carried in the tree only until Phase 2 integrates each into core and deletes the folder. Fix them there; build nothing new there.
- Microsoft's files are edited when that is the right change, but deliberately: every edit raises the cost of each upstream merge. Keep such diffs small and say why in the commit.
- The `upstream` remote is Microsoft's, with push disabled. Upstream merges land as real merge commits, never squashed or rebased.

## Constraints that bind every change

Summarized from [decision 0001](docs/decisions/0001-constraints-carried-forward.md); read it for the full rules and sources.

- Every `towelwise.*` setting and command ID and the saved-layout format stay unchanged. Renaming any of them needs its own decision.
- No agent is bundled. Agents install from Open VSX only, never Microsoft's Marketplace; people sign in in the agent's own panel. Say "works with", never "official" or "supported by". Keep MIT notices; no Microsoft trademarks.
- VSCodium's update feed stays off (`DISABLE_UPDATE=yes`).
- Hyperspace works by layout area, never by detecting agents or their view IDs. It writes user settings, never workspace settings, saves each previous value (including "not set") to disk before the first change, and restores it exactly. Jumps and restores are serialized across windows.
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
- Tests for the features still in `extensions/towelwise/`: run from that folder (commands land with step 5 of Phase 1).
- Pull-request CI compiles the editor and runs our tests. The full app build is a release and hand-check step.
- Build the app: `towelwise/ide/build.sh` from Git Bash (`C:\Program Files\Git\bin\bash.exe`; the `bash` on PATH is the WSL stub). It takes about 14 minutes, uses the machine heavily, and needs the app closed. Run it in the background and log to `C:\tw-build\build-*.log`. It builds the committed `HEAD`, not uncommitted changes.
- Launch the built app for manual checks with `C:\tw-build\launch-towelwise.cmd` (it clears `ELECTRON_RUN_AS_NODE` and `VSCODE_*` and uses empty agent config folders).

Record each check's command and exit status. Compile, CI and manual checks in the built app are distinct results; one does not prove another.
