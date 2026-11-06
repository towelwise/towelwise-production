# Ported features keep the extension's storage folder and lock

Status: superseded the same day by [0004](0004-features-are-built-from-scratch-in-core.md): nothing is ported, so there is no storage or lock to stay compatible with.

## Decision

When hyperspace, the saved layout or the held-setting recovery moves from `extensions/towelwise/` into core:

- Core uses the same folder the extension uses today: `<globalStorageHome>/towelwise.towelwise`. The recovery files already there (`hyperspace.json`, `layout.saving.json`, `closeEmptyGroups.held.json`) keep their names and formats.
- Core uses the same lock protocol as `extensions/towelwise/src/lock.ts`: one uniquely named `hyperspace.lock.<uuid>` per window, published by renaming `hyperspace.tmp.<uuid>`, a lock treated as abandoned when its process is dead or it is more than an hour old, and a window backs off if any other live lock exists. Code still in the extension and code already in core share this one lock.
- The tests for each such slice load recovery files written before the port and run the extension's code and core's code against one lock.

## Why

The recovery files hold the only record of a person's original settings. A different folder after an update or crash would strand them. Two different locks would let two writers change settings at once. Relocating the folder or sharing a new service would be a larger change with more ways to lose data, so it needs its own decision if it is ever wanted.

## Consequences

The lock code moves with the first settings-changing slice and stays byte-compatible until the extension is gone. Nothing in the menu slice uses it.
