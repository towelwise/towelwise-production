# Features are built from scratch in core

Status: accepted (2026-11-06). Supersedes the port rules of [0001](0001-constraints-carried-forward.md) and all of [0003](0003-ported-features-keep-the-extensions-storage-and-lock.md).

## Decision

- Every feature, and all work on it, is built from scratch in core from here on. Work starts from the vision in [ROADMAP.md](../../ROADMAP.md) and what core makes possible, never from making extension-era code work in core.
- `extensions/towelwise/` is removed now, with its build and lint registrations, its CI step, and the core layout bridge that existed only to serve it (`layoutBridge.contribution.ts`, archived patch 0003). Hyperspace, the layout editor and the shell commands are gone until they are rebuilt.
- The rule that every `towelwise.*` setting ID, command ID and the saved-layout format stay unchanged no longer applies. New features choose their own; a spec notes any reuse of an old name.
- The rule "no new features until Phase 2 is done" is replaced: Phase 2 is now the vision, built from scratch.
- Kept from the first port slice: the Towelwise menu and hide-list hook in core, with its two settings (`towelwise.menus.hidden`, `towelwise.menus.towelwise`), its core tests and CI step, and the header rule of [0002](0002-towelwise-files-carry-a-towelwise-header.md). The menu's default is empty until the menus are redesigned, since its old entries named removed commands.

## Still binding from 0001

No agent is bundled; agents come from Open VSX only and people sign in in the agent's own panel; "works with", never "official". MIT notices kept, no Microsoft trademarks. VSCodium's update feed stays off. Code that changes a user setting saves the old value to disk first and recovers from partial writes. An untrusted project gets everything except what runs project code. Microsoft's files are edited deliberately, with small diffs. These apply to whatever the rebuilt features do.

## Why

The owner's vision (2026-11-06) is a workspace shaped around directing agents: owned layout and menus, a focused Command Palette, read-only code inspection, onboarding and a single theme. Porting extension-era code would carry the limits an extension worked around (decisions 0002, 0003 and 0005 of the archived repository) into core, where they no longer apply. Pre-release, the only saved settings and layouts are the owner's, so nothing outside the project depends on the old IDs.

## Consequences

- The app loses hyperspace, layouts and shell commands until the vision's layout work rebuilds what is wanted. The Towelwise menu does not show until it has entries.
- The open questions that decide the first slices (which menus go, how broad read-only viewing is) are settled before implementation.
- Archived decisions 0001 to 0003 on hyperspace remain history, not constraints; a rebuilt feature records its own.
