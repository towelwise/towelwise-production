/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Towelwise contributors. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Emitter } from '../../../../../base/common/event.js';
import { KeyCode, KeyMod } from '../../../../../base/common/keyCodes.js';
import { OS } from '../../../../../base/common/platform.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { ICommandActionTitle } from '../../../../../platform/action/common/action.js';
import { IMenuItem, isIMenuItem, ISubmenuItem, isISubmenuItem, MenuId, MenuRegistry } from '../../../../../platform/actions/common/actions.js';
import { HiddenCommands } from '../../../../../platform/commands/common/hiddenCommands.js';
import { ConfigurationTarget } from '../../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../../platform/configuration/common/configurationRegistry.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { IContextKeyChangeEvent } from '../../../../../platform/contextkey/common/contextkey.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../../../platform/keybinding/common/keybindingsRegistry.js';
import { MockContextKeyService } from '../../../../../platform/keybinding/test/common/mockKeybindingService.js';
import { NullLogService } from '../../../../../platform/log/common/log.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { HIDDEN_SETTING, MENU_SETTING } from '../../browser/menuSettings.js';
import { TowelwiseContribution } from '../../browser/towelwise.contribution.js';

class CapturingLogService extends NullLogService {
	readonly warnings: string[] = [];
	override warn(message: string | Error): void {
		this.warnings.push(String(message));
	}
}

class ChangingContextKeyService extends MockContextKeyService {
	readonly changes = new Emitter<IContextKeyChangeEvent>();
	override get onDidChangeContext() {
		return this.changes.event;
	}
}

function registeredDefault(setting: string): unknown {
	return Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).getConfigurationProperties()[setting]?.default;
}

function titleParts(title: string | ICommandActionTitle) {
	return typeof title === 'string' ? { value: title, mnemonic: undefined } : { value: title.value, mnemonic: title.mnemonicTitle };
}

suite('Towelwise menu settings and hook', () => {

	const store = ensureNoDisposablesAreLeakedInTestSuite();

	teardown(() => HiddenCommands.set([]));

	// What a first launch sees: the registered defaults stand in for the settings the person has not touched.
	function create(settings: Record<string, unknown> = {}) {
		const configuration = new TestConfigurationService({
			[HIDDEN_SETTING]: registeredDefault(HIDDEN_SETTING),
			[MENU_SETTING]: registeredDefault(MENU_SETTING),
			...settings,
		});
		const contextKeys = new ChangingContextKeyService();
		store.add(contextKeys.changes);
		const log = new CapturingLogService();
		store.add(new TowelwiseContribution(configuration, contextKeys, log));
		return {
			log,
			contextKeys,
			change(setting: string, value: unknown) {
				void configuration.setUserConfiguration(setting, value);
				configuration.onDidChangeConfigurationEmitter.fire({
					source: ConfigurationTarget.USER,
					affectedKeys: new Set([setting]),
					change: { keys: [setting], overrides: [] },
					affectsConfiguration: key => key === setting,
				});
			},
		};
	}

	function topLevel(): ISubmenuItem | undefined {
		return MenuRegistry.getMenuItems(MenuId.MenubarMainMenu).filter(isISubmenuItem).find(item => titleParts(item.title).value === 'Towelwise');
	}

	// The entries as the menu bar would list them: grouped, then in order.
	function entries(): IMenuItem[] {
		const top = topLevel();
		if (!top) {
			return [];
		}
		return MenuRegistry.getMenuItems(top.submenu).filter(isIMenuItem).sort((a, b) =>
			(a.group ?? '').localeCompare(b.group ?? '') || (a.order ?? 0) - (b.order ?? 0));
	}

	test('registers both settings with their defaults', () => {
		const properties = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).getConfigurationProperties();
		assert.deepStrictEqual([HIDDEN_SETTING, MENU_SETTING].map(id => properties[id]?.type), ['array', 'array']);
		assert.deepStrictEqual([registeredDefault(HIDDEN_SETTING), registeredDefault(MENU_SETTING)], [[], []]);
	});

	test('with the default settings there is no Towelwise menu and nothing is hidden', () => {
		const { log } = create();
		assert.deepStrictEqual([topLevel(), HiddenCommands.isHidden('workbench.action.files.save'), log.warnings], [undefined, false, []]);
	});

	test('a configured menu shows at once on first launch, with no extension service involved', () => {
		create({ [MENU_SETTING]: [{ command: 'a', title: 'A', group: 'g' }] });
		assert.deepStrictEqual(entries().map(item => [item.group, item.command.id]), [['00_g', 'a']]);
	});

	test('an entry with a mistake is skipped and named, and its neighbours stay', () => {
		const { log } = create({
			[MENU_SETTING]: [
				{ command: 'a.ok', title: 'Fine', group: 'g' },
				{ title: 'No command' },
				'text',
				{ command: 'x', title: 'T', when: '&& y' },
				{ command: 'b.ok', title: 'Also fine' },
			]
		});
		assert.deepStrictEqual(entries().map(item => [item.group, item.command.id]), [['00_g', 'a.ok'], ['00_g', 'b.ok']]);
		assert.deepStrictEqual(log.warnings, [
			'[towelwise] towelwise.menus.towelwise: entry 2 needs a non-empty text "command"; skipped',
			'[towelwise] towelwise.menus.towelwise: entry 3 is not an object; skipped',
			'[towelwise] towelwise.menus.towelwise: entry 4 has a "when" that is not a valid condition; skipped',
		]);
	});

	test('a group that comes back is a new section, and & marks the shortcut letter', () => {
		create({
			[MENU_SETTING]: [
				{ command: 'a', title: '&Alpha', group: 'one' },
				{ command: 'b', title: 'Beta', group: 'two' },
				{ command: 'c', title: 'Gamma', group: 'one' },
			]
		});
		assert.deepStrictEqual(entries().map(item => [item.group, item.command.id, titleParts(item.command.title)]), [
			['00_one', 'a', { value: 'Alpha', mnemonic: '&&Alpha' }],
			['01_two', 'b', { value: 'Beta', mnemonic: 'Beta' }],
			['02_one', 'c', { value: 'Gamma', mnemonic: 'Gamma' }],
		]);
	});

	test('editing the setting rebuilds the menu; an empty list or a non-list leaves no menu', () => {
		const { log, change } = create();

		change(MENU_SETTING, [{ command: 'only.one', title: 'Only' }]);
		assert.deepStrictEqual(entries().map(item => item.command.id), ['only.one']);

		change(MENU_SETTING, []);
		assert.strictEqual(topLevel(), undefined);

		change(MENU_SETTING, [{ command: 'back', title: 'Back' }]);
		assert.deepStrictEqual(entries().map(item => item.command.id), ['back']);

		change(MENU_SETTING, 'text');
		assert.strictEqual(topLevel(), undefined);
		assert.deepStrictEqual(log.warnings, ['[towelwise] towelwise.menus.towelwise must be a list of entries; the menu is empty']);
	});

	test('a condition one entry reads coming true registers the top-level item again', () => {
		const { contextKeys } = create({ [MENU_SETTING]: [{ command: 'x', title: 'X', when: 'towelwise.test.key' }] });
		const before = topLevel();
		assert.ok(before);

		contextKeys.changes.fire({ affectsSome: keys => keys.has('some.other.key'), allKeysContainedIn: () => false });
		assert.strictEqual(topLevel(), before);

		contextKeys.changes.fire({ affectsSome: keys => keys.has('towelwise.test.key'), allKeysContainedIn: () => false });
		const after = topLevel();
		assert.ok(after);
		assert.notStrictEqual(after, before);
	});

	test('the hide list hides by exact id, by prefix and by menu id', () => {
		const { change } = create();
		change(HIDDEN_SETTING, ['towelwise.exact', 'towelwise.group.*', 'menu:TestMenu']);
		assert.deepStrictEqual(
			['towelwise.exact', 'towelwise.exactly', 'towelwise.group.one', 'towelwise.groups'].map(id => HiddenCommands.isHidden(id)),
			[true, false, true, false]);
		assert.deepStrictEqual(['TestMenu', 'TestMenuMore'].map(id => HiddenCommands.isMenuHidden(id)), [true, false]);
	});

	test('a hidden command leaves the Towelwise menu and the Command Palette, and comes back', () => {
		const { change } = create({ [MENU_SETTING]: [{ command: 'towelwise.test.menu.entry', title: 'Entry' }] });
		store.add(MenuRegistry.addCommand({ id: 'towelwise.test.palette', title: 'Palette Test' }));
		const inPalette = () => MenuRegistry.getMenuItems(MenuId.CommandPalette).filter(isIMenuItem).some(item => item.command.id === 'towelwise.test.palette');
		const inMenu = () => entries().some(item => item.command.id === 'towelwise.test.menu.entry');
		assert.deepStrictEqual([inPalette(), inMenu()], [true, true]);

		change(HIDDEN_SETTING, ['towelwise.test.palette', 'towelwise.test.menu.*']);
		assert.deepStrictEqual([inPalette(), inMenu()], [false, false]);

		change(HIDDEN_SETTING, []);
		assert.deepStrictEqual([inPalette(), inMenu()], [true, true]);
	});

	test('a hidden command loses its default shortcuts but keeps its removal rules', () => {
		const { change } = create();
		const rule = { weight: KeybindingWeight.WorkbenchContrib, primary: KeyMod.CtrlCmd | KeyCode.KeyJ };
		store.add(KeybindingsRegistry.registerKeybindingRule({ id: 'towelwise.test.shortcut', ...rule }));
		store.add(KeybindingsRegistry.registerKeybindingRule({ id: '-towelwise.test.shortcut', ...rule }));
		const defaults = () => KeybindingsRegistry.getDefaultKeybindings().map(item => item.command).filter(command => command?.endsWith('towelwise.test.shortcut')).sort();
		const defaultsForOS = () => KeybindingsRegistry.getDefaultKeybindingsForOS(OS).map(item => item.command).filter(command => command === 'towelwise.test.shortcut');
		assert.deepStrictEqual([defaults(), defaultsForOS()], [['-towelwise.test.shortcut', 'towelwise.test.shortcut'], ['towelwise.test.shortcut']]);

		change(HIDDEN_SETTING, ['towelwise.test.shortcut']);
		assert.deepStrictEqual([defaults(), defaultsForOS()], [['-towelwise.test.shortcut'], []]);

		change(HIDDEN_SETTING, []);
		assert.deepStrictEqual(defaults(), ['-towelwise.test.shortcut', 'towelwise.test.shortcut']);
	});
});
