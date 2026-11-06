# Towelwise AI — Roadmap

> **YOUR IDE Built for Hyperspace**
> *Don't Panic.*

Updated November 6, 2026 · Johnny T

Towelwise AI is now a fork of Code-OSS ([archived decision 0007](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0007-towelwise-ai-is-a-fork-of-code-oss.md)). The constraints it carries forward are in [decision 0001](docs/decisions/0001-constraints-carried-forward.md). The extension-era roadmap is in the [archived repository](https://github.com/towelwise/Towelwise/blob/main/ROADMAP.md): its Phases 0 to 3 are done and most of its Phase 4 (the layout editor) works.

The guiding rule stays: **a small, real prototype in weeks, not a finished suite in 2027.** Each slice leaves the app usable, because work can stop for days at a time.

**Every feature is built from scratch in core (owner, 2026-11-06; [decision 0004](docs/decisions/0004-features-are-built-from-scratch-in-core.md)).** Nothing is ported from the extension-era code, which has been removed. Each feature starts from what the vision below needs and what core makes possible.

## The vision

Towelwise AI is a workspace built around AI agents and extensions, for people who mainly build by directing agents. Its layout makes that workflow feel natural while keeping the code easy to inspect.

1. **The layout is a defining part of the product.** Towelwise takes deliberate ownership of the workspace layout and menus, and decides what belongs from its intended workflow.
2. **Simpler menus.** Consider removing the Select, Run and Go menus, and keep only the actions that still matter to someone working mainly through agents.
3. **Code stays easy to inspect.** File browsing, syntax highlighting and a read-only code view stay, for people who want to understand what the agents are changing.
4. **A focused Command Palette.** Commands for the agent workflow come first; less relevant editor features are reduced.
5. **Walkthrough screens.** Onboarding explains the workspace, its layout and how to work with agents.
6. **One consistent visual theme**, using the Gemini Argon theming work as the reference once its Markdown document is available.
7. **Future "featured cells"** to explore: dedicated panels for live file updates during agent work, GitHub logs and activity, and running usage totals if the extensions expose them.

## The plan at a glance

| Phase | What | Status |
|---|---|---|
| 1 | **Bring-up**: the fork builds as an app | Done |
| 2 | **The workspace**: the vision, built from scratch in core | Next |
| 3 | **First upstream merge**, timed | — |
| 4 | ~~Finish the layout editor~~ folded into Phase 2 | — |
| 5 | The memory experiment (Hindsight on Windows) | — |
| 6 | **Towelwise Recall** | — |
| 7 | **Towelwise Guide** | — |
| 8 | **DOUG** | — |

## Phase 1 — Bring-up

Done 2026-11-06 (PR #1). Main starts at `e646868` with an `upstream` remote. The archived `ide/` build moves into `towelwise/`, VSCodium's scripts stay pinned to `1.143.17232`, and their Code-OSS clone step uses this repository. The extension's source was bundled unchanged in `extensions/towelwise/` for this phase and removed under decision 0004. Root `AGENTS.md` and `CLAUDE.md` point to `towelwise/AGENTS.md`.

**Done when:**

- The build script builds the fork with the features of the time, then carried in `extensions/towelwise/`.
- In the built app, the archived app's checks pass: Claude Code and Codex install from Open VSX and sign in, hyperspace jumps and restores, My layout applies and notices drift, and an untrusted project gets everything but startup commands.
- Pull-request CI compiles the editor and runs the Towelwise tests, and is green.

## Phase 2 — The workspace

The vision's items, each built from scratch in `src/vs/workbench/contrib/towelwise/` (or as a small, deliberate edit to Microsoft's code) with core tests that CI runs. The open questions below come first, settled and recorded as decisions; each item then gets a spec before it is built. The extension-era features (hyperspace, the layout editor, shells) are gone until rebuilt, and new ones choose their own setting IDs, command IDs and formats.

**Done when:** items 1 to 5 work in the built app, item 6 is applied once the Argon document is available, and item 7 has been explored and its first cell decided.

## Phase 3 — First upstream merge

Merge a newer Code-OSS release, as a real merge commit, and record the hours it took.

**Done when:** the merged app passes the checks current at the time, the time is recorded, and the limit on how far behind a public release may be is set as a decision.

## Phases 5 to 8

Carried from the archived roadmap, planned after Phase 3: the memory experiment, Recall, Guide and DOUG.

## Open questions, by when they need an answer

| Question | Needed by |
|---|---|
| Which menus are removed, and which of their actions stay somewhere? | Phase 2 (first) |
| How broadly does read-only code viewing apply: everywhere, per file or folder, or only to what agents change? | Phase 2 (first) |
| What do "featured cells" look like, and which comes first? | Phase 2 |
| How far behind upstream may a public release be? | Phase 3 |
| Is upstream upkeep sustainable at this pace? (0007: revisit if one merge takes more than a day) | Phase 3 |
| Which agents go on the "more agents" list? | Phase 2 |
| What is left of the quiet profile idea? | Phase 2 |
| When is the first public release, and what does it need? (Signing, installer, update feed, Anthropic's answer on install buttons, OpenAI's terms) | After Phase 3 |
| Hindsight on Windows; what the Hindsight fork changes | Phase 5 |
