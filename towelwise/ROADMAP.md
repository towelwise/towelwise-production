# Towelwise AI — Roadmap

> **YOUR IDE Built for Hyperspace**
> *Don't Panic.*

Updated November 6, 2026 · Johnny T

Towelwise AI is now a fork of Code-OSS ([archived decision 0007](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0007-towelwise-ai-is-a-fork-of-code-oss.md)). The constraints it carries forward are in [decision 0001](docs/decisions/0001-constraints-carried-forward.md). The extension-era roadmap is in the [archived repository](https://github.com/towelwise/Towelwise/blob/main/ROADMAP.md): its Phases 0 to 3 are done and most of its Phase 4 (the layout editor) works.

The guiding rule stays: **a small, real prototype in weeks, not a finished suite in 2027.** Each slice leaves the app usable, because work can stop for days at a time.

## The plan at a glance

| Phase | What | Status |
|---|---|---|
| 1 | **Bring-up**: the fork builds as today's app | Next |
| 2 | **The port**: extension-era features become integrated core code | — |
| 3 | **First upstream merge**, timed | — |
| 4 | Finish the layout editor | — |
| 5 | The memory experiment (Hindsight on Windows) | — |
| 6 | **Towelwise Recall** | — |
| 7 | **Towelwise Guide** | — |
| 8 | **DOUG** | — |

**No new features until Phase 2 is done (owner, 2026-11-06).** Fixes only.

## Phase 1 — Bring-up

Main starts at `e646868` with an `upstream` remote. The archived `ide/` build moves into `towelwise/`, VSCodium's scripts stay pinned to `1.143.17232`, and their Code-OSS clone step uses this repository. The extension's source is bundled unchanged in `extensions/towelwise/`. Root `AGENTS.md` and `CLAUDE.md` point to `towelwise/AGENTS.md`.

**Done when:**

- The build script builds the fork with today's features, still carried in `extensions/towelwise/`.
- In the built app, the archived app's checks pass: Claude Code and Codex install from Open VSX and sign in, hyperspace jumps and restores, My layout applies and notices drift, and an untrusted project gets everything but startup commands.
- Pull-request CI compiles the editor and runs the Towelwise tests, and is green.

## Phase 2 — The port

Each feature moves from `extensions/towelwise/` into `src/vs/workbench/contrib/towelwise/`, with its tests rewritten as core unit tests, and leaves the extension in the same change. The menu hook moves first, the layout last. Setting and command IDs and the saved-layout format do not change.

**Done when:** `extensions/towelwise/` is gone, every feature works in the built app as before, and CI runs the core tests.

## Phase 3 — First upstream merge

Merge a newer Code-OSS release, as a real merge commit, and record the hours it took.

**Done when:** the merged app passes the Phase 1 checks, the time is recorded, and the limit on how far behind a public release may be is set as a decision.

## Phases 4 to 8

Carried from the archived roadmap, planned after Phase 3: default keys and the first-run screen for the layout editor, then the memory experiment, Recall, Guide and DOUG.

## Open questions, by when they need an answer

| Question | Needed by |
|---|---|
| How far behind upstream may a public release be? | Phase 3 |
| Is upstream upkeep sustainable at this pace? (0007: revisit if one merge takes more than a day) | Phase 3 |
| Which agents go on the "more agents" list? | Phase 4 |
| What is left of the quiet profile idea? | Phase 4 |
| When is the first public release, and what does it need? (Signing, installer, update feed, Anthropic's answer on install buttons, OpenAI's terms) | After Phase 4 |
| Hindsight on Windows; what the Hindsight fork changes | Phase 5 |
