<p align="center">
  <img alt="Towelwise AI" src="towelwise/ide/icons/code-icon.svg" width="96">
</p>

<h1 align="center">Towelwise AI</h1>

<p align="center"><strong>YOUR IDE Built for Hyperspace.</strong> <em>Don't Panic.</em></p>

Towelwise AI is a workspace built around AI agents and extensions, for people who mainly build by directing agents. Its layout is meant to make that way of working feel natural while keeping the code easy to inspect. It is a fork of Code-OSS, built with VSCodium's build scripts (pinned to VSCodium 1.143.17232).

Towelwise AI does not bundle any AI agent and never drives one. You install the agents you already use and work with them in their own panels.

## Where it is going

Towelwise is being built from scratch in the IDE's core around these goals:

- **The layout is part of the product.** Towelwise owns the workspace layout and menus and keeps what fits a workflow of directing agents.
- **Simpler menus.** Menus such as Select, Run and Go are being reviewed, keeping only the actions that still matter when agents do most of the editing.
- **Code stays easy to inspect.** File browsing, syntax highlighting and a read-only code view stay, so you can follow what the agents change.
- **A focused Command Palette.** Commands for working with agents come first, with less clutter from general editor features.
- **Walkthrough screens** that explain the workspace, its layout and how to work with agents.
- **One consistent visual theme.**
- **Featured cells, later.** Dedicated panels for live file updates while agents work, GitHub logs and activity, and running usage totals where extensions expose them.

None of these are finished yet. See the [roadmap](towelwise/ROADMAP.md) for what is decided and what is still open.

<!-- screenshot: the Towelwise workspace, once the layout work lands -->

## Working with AI agents

Install agents from Open VSX in the Extensions view, then sign in inside each agent's own panel. Claude Code and Codex have been installed and signed in this way in an earlier build.

## Status

Towelwise AI is in pre-release.

- **Phase 1 (done):** the fork builds and runs as its own application.
- **Phase 2 (next):** the workspace, built from scratch in core. Features from an earlier extension-based version (hyperspace, the layout editor, shell commands) have been removed and will come back only in a form the new design calls for.
- **Builds:** the only build output is a portable Windows x64 zip. There is no installer and no public download yet.
- **Updates:** automatic updates are off.
- **Platforms:** Windows x64 only. macOS and Linux are not built or tested.

## Building from source (Windows)

You need Windows x64 and these tools on your PATH: git, node and npm, jq, python, 7z and cargo (Rust), plus Git for Windows.

Close Towelwise AI if it is running, then run the build script with Git Bash from the repository root:

```sh
"C:\Program Files\Git\bin\bash.exe" towelwise/ide/build.sh
```

A full build takes about 15 to 16 minutes and uses the machine heavily. It builds the committed `HEAD`, not uncommitted changes. The zip lands in `C:\towel-builds\build\dist`.

To start the built app in a brand-new profile each time, run:

```cmd
towelwise\ide\launch.cmd
```

Build and workflow details are in [towelwise/AGENTS.md](towelwise/AGENTS.md); decisions are in [towelwise/docs/decisions](towelwise/docs/decisions/).

## Roadmap

The full plan is in [towelwise/ROADMAP.md](towelwise/ROADMAP.md). No dates are set.

| Phase | What | Status |
|---|---|---|
| 1 | The fork builds as Towelwise AI | Done |
| 2 | The workspace, built from scratch in core | Next |
| 3 | First upstream merge, timed | Planned |
| 5 | Memory experiment | Planned |
| 6 | Towelwise Recall | Planned |
| 7 | Towelwise Guide | Planned |
| 8 | DOUG | Planned |

## Contributing

Read [towelwise/AGENTS.md](towelwise/AGENTS.md) before making changes. Features are built from scratch in core, and each feature's open questions are settled as decisions before it is specified and built.

Contact: [towelwiseai@gmail.com](mailto:towelwiseai@gmail.com)

## Licence

Licensed under the MIT License. See [LICENSE.txt](LICENSE.txt).

- Copyright (c) 2015 - present Microsoft Corporation
- Copyright (c) 2026 - present Towelwise contributors

## Disclaimers

Towelwise AI is an independent project ([github.com/towelwise/towelwise-production](https://github.com/towelwise/towelwise-production)). It is not affiliated with or endorsed by Microsoft, VSCodium, Anthropic or OpenAI. Code-OSS is developed by Microsoft. Claude Code is a product of Anthropic. Codex is a product of OpenAI.
