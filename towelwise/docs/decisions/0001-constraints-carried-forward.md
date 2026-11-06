# Constraints carried forward from the archived repository

Status: accepted (2026-11-06). Carries forward approved records; the one new rule is marked.

This repository starts from [decision 0007](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0007-towelwise-ai-is-a-fork-of-code-oss.md) of the archived [towelwise/Towelwise](https://github.com/towelwise/Towelwise) repository. Its earlier records are not copied here. The constraints below still bind this repository until a numbered decision here changes one. Links point to the archived originals.

**The fork (0007)**

- A normal repository, not a GitHub fork, with Microsoft's history and an `upstream` remote whose push URL is disabled. `main` starts at `e646868`, the Code-OSS commit used by VSCodium `1.143.17232`. The first upstream merge comes after the port.
- VSCodium's build scripts sit on top, pinned to a tag, for branding, telemetry removal and Open VSX. Only their Code-OSS clone step is replaced by this fork.
- Towelwise code goes in `src/vs/workbench/contrib/towelwise/` by habit, and Microsoft's files are edited when that is the right change. Edits to Microsoft's files stay deliberate, because they set the cost of every upstream merge.
- Our docs and build scripts live in the top-level `towelwise/` folder. Microsoft's root `AGENTS.md` keeps a short Towelwise section at its top pointing to `towelwise/AGENTS.md`, and a root `CLAUDE.md` does the same.
- The port first carries the extension-era features in `extensions/towelwise/`, then integrates each into `contrib/towelwise/` with its tests rewritten as core unit tests. The menu hook moves first, the layout last.
- Every `towelwise.*` setting and command ID and the saved-layout format stay unchanged, so people's settings, keys and saved layouts survive. Renaming any of them needs its own decision.
- Upstream releases are taken when we choose. VSCodium's update feed stays off (`DISABLE_UPDATE=yes`). Our own update feed is release work.
- Pull-request checks compile the editor and run our tests. The full app build is a release step.
- **Revisit 0007** if one upstream merge takes more than a day, or if upstream keeps breaking our edits to the same files.

**Vendors and licences ([0004](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0004-towelwise-ai-is-an-ide-built-from-code-oss-patches.md))**

- No agent is bundled. People install agents from Open VSX and sign in in the agent's own panel. The product says "works with", never "official" or "supported by".
- Open VSX only, never Microsoft's Marketplace. Extensions not on Open VSX (Copilot today) are not offered.
- MIT notices are kept. No Microsoft trademarks.
- Recall, Guide and DOUG ship inside the IDE, so memory stays contained to it.

**Hyperspace ([0001](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0001-hyperspace-works-by-area-not-by-agent.md), [0002](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0002-hyperspace-writes-user-settings-and-restores-exactly.md), [0003](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0003-hyperspace-never-reads-or-reopens-layout-state.md))**

- Hyperspace works by layout area, never by detecting agents or their view IDs.
- Hyperspace writes user settings, never workspace settings. It saves each previous value (including "not set") to disk once before the first change and restores it exactly. Jumps and restores are serialized across windows.
- Areas hyperspace closes stay closed on restore. The editor area is always kept. Full screen is toggled back only in the window that entered it.
- 0002 and 0003 were shaped by what an extension could not do. Core can now read and set layout state directly, so either may be replaced by a decision here; until then the behavior above holds.

**Untrusted projects ([0006](https://github.com/towelwise/Towelwise/blob/main/docs/decisions/0006-untrusted-projects-get-everything-but-startup-commands.md))**

- In an untrusted project everything works except terminal startup commands, which are withheld. Granting trust never starts anything on its own; the person is told the commands run after a reload.
- Any later feature that runs project code (tasks, agent commands) is withheld the same way.

**Settings safety (archived `AGENTS.md`)**

- Before code changes a user setting, the old value is saved to disk, not only in memory, so a crash can restore it. Multi-setting writes recover from a partial failure, and the crash and partial-write paths are tested.

**Promises every phase keeps (archived roadmap)**

1. You drive your AI; Towelwise never does.
2. Vendor rules first, no gray areas.
3. Nothing counts until you approve it.
4. Memory keeps track of *why*.
5. Free and local where it can be.
6. Calm by default. Nothing steals your focus.
7. Cheerful and honest.
8. The tool that grows with you.

**Git**

- Protected `main`, short task branches, conventional commits, files staged by explicit path, small pull requests squash-merged.
- **New rule:** upstream merges are the exception. They land as real merge commits, never squashed or rebased, because a squash drops Microsoft's history from `main` and the next upstream merge loses its merge base.
