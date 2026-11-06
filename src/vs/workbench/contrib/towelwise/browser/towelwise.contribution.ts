/*---------------------------------------------------------------------------------------------
 *  Towelwise AI: the hide list and the Towelwise menu, both read from settings that the built-in Towelwise
 *  extension ships. The settings are the whole interface: this file holds no list of its own beyond the
 *  startup default in hiddenCommands.ts, and no menu contents.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, DisposableStore, IDisposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { HiddenCommands } from '../../../../platform/commands/common/hiddenCommands.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, ContextKeyExpression, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';

const HIDDEN_SETTING = 'towelwise.menus.hidden';
const MENU_SETTING = 'towelwise.menus.towelwise';

const MenubarTowelwiseMenu = new MenuId('MenubarTowelwiseMenu');

// One entry of the menu setting, as the extension's contract defines it.
interface MenuEntry {
	command: string;
	title: string;
	group: string;
	when: ContextKeyExpression | undefined;
}

class TowelwiseContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.towelwise';

	private readonly menuItems = this._register(new DisposableStore());
	// The top-level item is kept apart from the entries so it can be registered again on its own.
	private readonly topLevel = this._register(new MutableDisposable<IDisposable>());
	private hasEntries = false;
	// The context keys the entries' conditions read, so the menu can be told when one of them changes.
	private watchedKeys = new Set<string>();

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ILogService private readonly logService: ILogService,
		@IExtensionService extensionService: IExtensionService,
	) {
		super();

		this.applyHidden();
		this.applyMenu();
		this._register(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(HIDDEN_SETTING)) {
				this.applyHidden();
			}
			if (e.affectsConfiguration(MENU_SETTING)) {
				this.applyMenu();
			}
		}));
		// On a first launch this runs before the built-in extension has registered its settings, so they read as
		// missing and a change event is not guaranteed to follow. Read them again once extensions are registered.
		extensionService.whenInstalledExtensionsRegistered().then(() => {
			this.applyHidden();
			this.applyMenu();
		});
		// The menu bar drops a submenu with nothing to show and does not watch the conditions of entries inside it,
		// so a menu whose entries were all hidden would never come back when one became true. Register the
		// top-level item again whenever a condition one of the entries reads changes.
		this._register(contextKeyService.onDidChangeContext(e => {
			if (this.hasEntries && this.watchedKeys.size > 0 && e.affectsSome(this.watchedKeys)) {
				this.registerTopLevel();
			}
		}));
	}

	private applyHidden(): void {
		const value = this.configurationService.getValue<unknown>(HIDDEN_SETTING);
		if (Array.isArray(value)) {
			HiddenCommands.set(value.filter((v): v is string => typeof v === 'string'));
		}
	}

	// Rebuilds the whole menu from the setting. Entries with a mistake are skipped and named in the log.
	private applyMenu(): void {
		this.menuItems.clear();
		this.hasEntries = false;
		this.watchedKeys = new Set();
		const raw = this.configurationService.getValue<unknown>(MENU_SETTING);
		if (!Array.isArray(raw)) {
			if (raw !== undefined) {
				this.logService.warn(`[towelwise] ${MENU_SETTING} must be a list of entries; the menu is empty`);
			}
			this.registerTopLevel();
			return;
		}

		const entries: MenuEntry[] = [];
		raw.forEach((item: unknown, index) => {
			const entry = this.readEntry(item, index + 1, entries[entries.length - 1]?.group);
			if (entry) {
				entries.push(entry);
			}
		});

		// Entries keep the array order, and the menu would otherwise sort them by name, so each gets an explicit order.
		// A group name that comes back after another group is a new section, not a return to the first one, or the
		// menu would rearrange what was typed: sections are counted by runs.
		let section = -1;
		let previousGroup: string | undefined;
		entries.forEach((entry, order) => {
			if (entry.group !== previousGroup) {
				section++;
				previousGroup = entry.group;
			}
			// In the setting, one & marks the shortcut letter; the menu's own form uses two.
			const plain = entry.title.replace(/&(?!&)/g, '');
			this.menuItems.add(MenuRegistry.appendMenuItem(MenubarTowelwiseMenu, {
				command: { id: entry.command, title: { value: plain, original: plain, mnemonicTitle: entry.title.replace(/&(?!&)/g, '&&') } },
				when: entry.when,
				group: `${String(section).padStart(2, '0')}_${entry.group}`,
				order
			}));
			if (entry.when) {
				for (const key of entry.when.keys()) {
					this.watchedKeys.add(key);
				}
			}
		});

		this.hasEntries = entries.length > 0;
		this.registerTopLevel();
	}

	// The menu bar only redraws when its main menu changes, not when a submenu gains entries, so the top-level item is
	// added after its entries, and again whenever they or their conditions change. It sits between Terminal and Help;
	// the mnemonic is the W, since T is Terminal's. With no entries there is no menu.
	private registerTopLevel(): void {
		if (!this.hasEntries) {
			this.topLevel.clear();
			return;
		}
		this.topLevel.value = MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
			submenu: MenubarTowelwiseMenu,
			title: { value: 'Towelwise', original: 'Towelwise', mnemonicTitle: 'To&&welwise' },
			order: 7.5
		});
	}

	private readEntry(item: unknown, position: number, previousGroup: string | undefined): MenuEntry | undefined {
		const skip = (why: string) => {
			this.logService.warn(`[towelwise] ${MENU_SETTING}: entry ${position} ${why}; skipped`);
			return undefined;
		};
		if (typeof item !== 'object' || item === null || Array.isArray(item)) {
			return skip('is not an object');
		}
		const { command, title, group, when } = item as Record<string, unknown>;
		if (typeof command !== 'string' || command.trim() === '') {
			return skip('needs a non-empty text "command"');
		}
		if (typeof title !== 'string' || title.trim() === '') {
			return skip('needs a non-empty text "title"');
		}
		if (group !== undefined && typeof group !== 'string') {
			return skip('has a "group" that is not text');
		}
		let condition: ContextKeyExpression | undefined;
		if (when !== undefined) {
			condition = typeof when === 'string' ? ContextKeyExpr.deserialize(when) : undefined;
			if (condition === undefined) {
				return skip('has a "when" that is not a valid condition');
			}
		}
		return { command, title, group: group ?? previousGroup ?? '', when: condition };
	}
}

registerWorkbenchContribution2(TowelwiseContribution.ID, TowelwiseContribution, WorkbenchPhase.BlockStartup);
