/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Towelwise contributors. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Towelwise AI: the two settings behind the hide list and the Towelwise menu. They are registered when this module is
// first imported, so they exist, with their defaults, before the contribution reads them.

import { localize } from '../../../../nls.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';

export const HIDDEN_SETTING = 'towelwise.menus.hidden';
export const MENU_SETTING = 'towelwise.menus.towelwise';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'towelwise.menus',
	title: localize('towelwise.menus.title', "Towelwise: Menus"),
	type: 'object',
	properties: {
		[HIDDEN_SETTING]: {
			type: 'array',
			items: {
				type: 'string',
				pattern: '^(menu:[A-Za-z][A-Za-z0-9._-]*|[A-Za-z][A-Za-z0-9._-]*(\\.\\*)?)$',
				patternErrorMessage: localize('towelwise.menus.hidden.patternError', "Use a command id, a prefix ending in .*, or menu: followed by a menu id.")
			},
			default: [],
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('towelwise.menus.hidden.description', "Commands to hide from the menus, the Command Palette and keyboard shortcuts. Each entry is a command id, or a prefix ending in `.*`. An entry of the form `menu:MenuId` hides the submenu item that opens that menu, such as `menu:MenubarLayoutMenu`, but not the commands inside it. Hidden commands still run when other code calls them. Empty the list to bring everything back. Needs Towelwise AI.")
		},
		[MENU_SETTING]: {
			type: 'array',
			items: {
				type: 'object',
				required: ['command', 'title'],
				properties: {
					command: {
						type: 'string',
						description: localize('towelwise.menus.towelwise.command', "The command id to run when the entry is chosen.")
					},
					title: {
						type: 'string',
						description: localize('towelwise.menus.towelwise.title', "The text shown. Put & before a letter to use it as the shortcut letter.")
					},
					group: {
						type: 'string',
						description: localize('towelwise.menus.towelwise.group', "Entries with the same group sit together; a change of group draws a separator. Defaults to the previous entry's group.")
					},
					when: {
						type: 'string',
						description: localize('towelwise.menus.towelwise.when', "A condition (a context-key expression). The entry shows only while it is true.")
					}
				}
			},
			// shortcut: empty until the menu is redesigned from the vision (decision 0004); the old entries named removed commands.
			default: [],
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('towelwise.menus.towelwise.description', "The entries of the Towelwise menu in the menu bar, in order. Each needs a `command` and a `title`; `group` separates sections and `when` shows an entry only while a condition holds. Entries with a mistake are skipped and named in the Window log. Needs Towelwise AI.")
		}
	}
});
