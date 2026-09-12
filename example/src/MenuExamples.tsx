import { useState } from 'react';
import {
  DynamicColorIOS,
  PlatformColor,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Menu, type MenuItemState, type MenuOption } from 'react-native-tinyui';

export function MenuExamples() {
  const [lastAction, setLastAction] = useState('No action selected');
  const [selectedAction, setSelectedAction] = useState<'edit' | 'share' | null>(
    null
  );
  const [isPinned, setIsPinned] = useState(false);
  const [mixedState, setMixedState] = useState<MenuItemState>('mixed');

  const allOptions: readonly MenuOption[] = [
    {
      type: 'section',
      title: 'Actions and states',
      options: [
        {
          type: 'action',
          id: 'rename-document',
          title: 'Rename',
          subtitle: 'Action with an explicit type and id',
          systemImage: 'square.and.pencil',
          iconColor: PlatformColor('systemBlueColor'),
          titleColor: DynamicColorIOS({
            light: '#2457C5',
            dark: '#79A8FF',
          }),
          state: 'off',
          onSelect: () => setLastAction('Rename selected'),
        },
        {
          title: 'Pinned',
          subtitle: 'Tap to toggle the on/off state',
          systemImage: 'pin',
          state: isPinned ? 'on' : 'off',
          onSelect: () => {
            setIsPinned((value) => !value);
            setLastAction('Pinned state toggled');
          },
        },
        {
          id: 'mixed-state',
          title: 'Mixed selection',
          subtitle: 'keepOpen keeps this menu visible after selection',
          systemImage: 'slider.horizontal.3',
          state: mixedState,
          keepOpen: true,
          onSelect: () => {
            setMixedState((value) => (value === 'mixed' ? 'off' : 'mixed'));
            setLastAction('Mixed state toggled');
          },
        },
        {
          title: 'Unavailable action',
          systemImage: 'lock',
          disabled: true,
          onSelect: () => setLastAction('Disabled actions cannot be selected'),
        },
        {
          title: 'Hidden action',
          hidden: true,
          onSelect: () => setLastAction('Hidden actions are not rendered'),
        },
      ],
    },
    { type: 'divider' },
    {
      type: 'section',
      title: 'Submenus and assets',
      options: [
        {
          type: 'submenu',
          title: 'Share',
          subtitle: 'A standard nested submenu',
          systemImage: 'square.and.arrow.up',
          iconColor: '#6E6BFF',
          titleColor: PlatformColor('labelColor'),
          options: [
            {
              title: 'Copy link',
              systemImage: 'link',
              onSelect: () => setLastAction('Copy link selected'),
            },
            {
              title: 'App asset icon',
              subtitle: 'icon takes precedence over systemImage when found',
              icon: 'AppIcon',
              systemImage: 'photo',
              iconColor: PlatformColor('systemPurpleColor'),
              onSelect: () => setLastAction('Asset icon action selected'),
            },
          ],
        },
        {
          type: 'submenu',
          title: 'Inline tools',
          systemImage: 'ellipsis.circle',
          displayInline: true,
          options: [
            {
              title: 'Archive',
              systemImage: 'archivebox',
              onSelect: () => setLastAction('Archive selected'),
            },
          ],
        },
        {
          type: 'submenu',
          title: 'Danger zone',
          systemImage: 'exclamationmark.triangle',
          destructive: true,
          options: [
            {
              title: 'Delete permanently',
              systemImage: 'trash',
              onSelect: () => setLastAction('Delete selected'),
            },
          ],
        },
        {
          type: 'submenu',
          title: 'Disabled submenu',
          systemImage: 'nosign',
          disabled: true,
          options: [{ title: 'Unavailable child' }],
        },
        {
          type: 'submenu',
          title: 'Hidden submenu',
          hidden: true,
          options: [{ title: 'Hidden child' }],
        },
      ],
    },
    { type: 'divider' },
    {
      title: 'Delete now',
      systemImage: 'trash',
      destructive: true,
      onSelect: () => setLastAction('Delete now selected'),
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Menu</Text>
      <Text style={styles.body}>
        The examples below cover every Menu prop and option field.
      </Text>
      <Text style={styles.result}>Last event: {lastAction}</Text>

      <Text style={styles.exampleTitle}>Complete options menu</Text>
      <Text style={styles.caption}>
        Tap to open. Includes actions, sections, dividers, nested and inline
        submenus, state, colors, icons, disabled, hidden and destructive items.
      </Text>
      <Menu
        accessibilityLabel="Open the complete Menu API example"
        options={allOptions}
        style={styles.control}
        testID="menu-all-options"
        title="Complete Menu API"
      >
        <View style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Open all options</Text>
          <Text style={styles.primaryButtonText}>⌄</Text>
        </View>
      </Menu>

      <Text style={styles.exampleTitle}>onSelect callback</Text>
      <Text style={styles.caption}>
        Each action owns an onSelect callback and derives its state from the
        selected value.
      </Text>
      <Menu
        accessibilityLabel="Choose an onSelect example"
        options={[
          {
            id: 'on-select-edit',
            title: 'Edit',
            systemImage: 'pencil',
            state: selectedAction === 'edit' ? 'on' : 'off',
            onSelect: () => setSelectedAction('edit'),
          },
          {
            id: 'on-select-share',
            title: 'Share',
            systemImage: 'square.and.arrow.up',
            state: selectedAction === 'share' ? 'on' : 'off',
            onSelect: () => setSelectedAction('share'),
          },
        ]}
        style={styles.control}
        testID="menu-on-select"
        title="onSelect example"
      >
        <View style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Select an action</Text>
        </View>
      </Menu>
      <Text style={styles.callbackResult}>
        {selectedAction === null
          ? 'Nothing selected'
          : `${selectedAction === 'edit' ? 'Edit' : 'Share'} selected`}
      </Text>

      <Text style={styles.exampleTitle}>Primary action</Text>
      <Text style={styles.caption}>
        Tap runs onPrimaryAction; long press opens the options menu.
      </Text>
      <Menu
        accessibilityLabel="Open document"
        onPrimaryAction={() => setLastAction('Primary action selected')}
        options={[
          {
            title: 'Open in new window',
            systemImage: 'macwindow.badge.plus',
            onSelect: () => setLastAction('Open in new window selected'),
          },
          {
            title: 'Get info',
            systemImage: 'info.circle',
            onSelect: () => setLastAction('Get info selected'),
          },
        ]}
        style={styles.control}
        testID="menu-primary-action"
        title="Long-press actions"
      >
        <View style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Tap or long press</Text>
        </View>
      </Menu>

      <Text style={styles.exampleTitle}>Disabled trigger</Text>
      <Text style={styles.caption}>
        disabled prevents the trigger from opening the menu.
      </Text>
      <Menu
        accessibilityLabel="Disabled menu example"
        disabled
        options={[{ title: 'This option cannot be opened' }]}
        style={styles.control}
        testID="menu-disabled"
      >
        <View style={[styles.secondaryButton, styles.disabledButton]}>
          <Text style={styles.disabledButtonText}>Menu disabled</Text>
        </View>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#101015',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  cardTitle: {
    color: '#17171B',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 6,
  },
  body: {
    color: '#72727C',
    fontSize: 15,
    lineHeight: 21,
  },
  result: {
    color: '#4D4D57',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  callbackResult: {
    color: '#6E6BFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  exampleTitle: {
    color: '#24242A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 22,
  },
  caption: {
    color: '#72727C',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  control: {
    marginTop: 12,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: '#6E6BFF',
    paddingHorizontal: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D8D8E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#33333A',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#F0F0F3',
    borderColor: '#E2E2E7',
  },
  disabledButtonText: {
    color: '#A0A0A8',
    fontSize: 16,
    fontWeight: '700',
  },
});
