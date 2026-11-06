# Files Towelwise creates carry a Towelwise header

Status: accepted (2026-11-06).

## Decision

A source file that Towelwise creates carries this header, not Microsoft's:

```
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Towelwise contributors. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
```

- Microsoft's files keep Microsoft's header. A file takes one complete header, never a mix.
- The wording follows `LICENSE.txt` ("Copyright (c) 2026 - present Towelwise contributors"). The file is named `LICENSE.txt` in this repository; Microsoft's header says `License.txt`.
- Two tools enforce headers, and both were changed:
  - `build/hygiene.ts` accepts either complete header.
  - `eslint.config.js` requires the Towelwise header on `src/vs/workbench/contrib/towelwise/**` and `src/vs/platform/commands/common/hiddenCommands.ts`, in a block after the Microsoft rule. Add a path there when a new Towelwise file lands outside the contrib folder.

## Why

The code is ours, so claiming Microsoft's copyright on it is wrong, and the default rule made every Towelwise file fail hygiene. Until this decision the three core files carried a temporary exception.

## Consequences

Each upstream merge leaves these two config edits in Microsoft's files; they are small. Hygiene accepts a Microsoft header on a Towelwise file; ESLint does not for the listed paths.
