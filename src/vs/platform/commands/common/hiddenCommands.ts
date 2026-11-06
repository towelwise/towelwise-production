/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Towelwise contributors. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Towelwise AI: commands hidden from menus, the Command Palette and default keyboard shortcuts.
//
// The list comes from the `towelwise.menus.hidden` setting (see the Towelwise contribution). Hiding is not
// disabling: commands still run when other code calls them. Only what the person is shown changes.

import { Emitter, Event } from '../../../base/common/event.js';

// The same list as the setting's default (empty: everything is shown). It applies from the start, so nothing
// flashes on screen before the setting has been read; the setting then replaces it.
export const DEFAULT_HIDDEN_COMMANDS: readonly string[] = [];

class HiddenCommandsImpl {

	private patterns: readonly string[] = DEFAULT_HIDDEN_COMMANDS;
	private readonly _onDidChange = new Emitter<void>();

	readonly onDidChange: Event<void> = this._onDidChange.event;

	// An entry is an exact command id, a prefix ending in `*`, or `menu:MenuId` (see isMenuHidden).
	set(patterns: readonly string[]): void {
		const next = patterns.filter(p => typeof p === 'string' && p.length > 0);
		if (next.length === this.patterns.length && next.every((p, i) => p === this.patterns[i])) {
			return;
		}
		this.patterns = next;
		this._onDidChange.fire();
	}

	isHidden(commandId: string): boolean {
		for (const pattern of this.patterns) {
			if (pattern.startsWith('menu:')) {
				continue; // a menu entry never names a command
			}
			if (pattern.endsWith('*') ? commandId.startsWith(pattern.slice(0, -1)) : commandId === pattern) {
				return true;
			}
		}
		return false;
	}

	// `menu:MenuId` hides the submenu item that opens that menu, never the commands inside it. Exact match only.
	isMenuHidden(menuId: string): boolean {
		return this.patterns.includes('menu:' + menuId);
	}
}

export const HiddenCommands = new HiddenCommandsImpl();
