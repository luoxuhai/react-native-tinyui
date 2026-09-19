import { useRef, useState } from 'react';
import {
  Button,
  DynamicColorIOS,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import {
  Menu,
  type MenuActionPressEvent,
  type MenuItemState,
  type MenuOption,
  type MenuRef,
} from 'react-native-tinyui';

import {
  Choices,
  ControlPanel,
  PanelDivider,
  PlaygroundPage,
  Setting,
  ToggleSetting,
  playgroundStyles,
} from '../components/Playground';

const compositions = [
  {
    label: 'Actions',
    title: 'Document actions',
    hint: 'Icons and subtitles give each action a little more context.',
    testID: 'menu-basic',
  },
  {
    label: 'Selection',
    title: 'View options',
    hint: 'Checkmarks and mixed states update as you select an item.',
    testID: 'menu-states',
  },
  {
    label: 'Nested',
    title: 'Organize & share',
    hint: 'Explore sections, inline groups, and a second level of actions.',
    testID: 'menu-hierarchy',
  },
] as const;

const basicOptions: readonly MenuOption[] = [
  {
    id: 'rename',
    title: 'Rename',
    subtitle: 'Give this document a new name',
    systemImage: 'square.and.pencil',
    iconColor: PlatformColor('systemBlueColor'),
  },
  {
    id: 'share',
    title: 'Share',
    subtitle: 'Send a copy or link',
    systemImage: 'square.and.arrow.up',
  },
  { id: 'duplicate', title: 'Duplicate', systemImage: 'plus.square.on.square' },
];

const nestedOptions: readonly MenuOption[] = [
  {
    type: 'section',
    title: 'Sharing',
    options: [
      {
        type: 'submenu',
        title: 'Share with',
        subtitle: 'Choose a destination',
        systemImage: 'person.2',
        options: [
          { id: 'copy-link', title: 'Copy link', systemImage: 'link' },
          { id: 'messages', title: 'Messages', systemImage: 'message' },
        ],
      },
    ],
  },
  { type: 'divider' },
  {
    type: 'submenu',
    title: 'Organize',
    displayInline: true,
    options: [
      { id: 'archive', title: 'Archive', systemImage: 'archivebox' },
      { id: 'move', title: 'Move to folder', systemImage: 'folder' },
    ],
  },
  { id: 'delete', title: 'Delete', systemImage: 'trash', destructive: true },
];

export function MenuScreen() {
  const menuRef = useRef<MenuRef>(null);
  const [compositionIndex, setCompositionIndex] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [keepOpen, setKeepOpen] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [mixedState, setMixedState] = useState<MenuItemState>('mixed');
  const [lastEvent, setLastEvent] = useState('No action selected yet.');
  const [selectionCount, setSelectionCount] = useState(0);
  const [touchCounts, setTouchCounts] = useState({
    start: 0,
    in: 0,
    out: 0,
    press: 0,
  });
  const countTouch = (kind: keyof typeof touchCounts) => {
    setTouchCounts((counts) => ({ ...counts, [kind]: counts[kind] + 1 }));
  };
  const composition = compositions[compositionIndex] ?? compositions[0];

  const stateOptions: readonly MenuOption[] = [
    {
      id: 'pinned',
      title: 'Pinned',
      subtitle: 'Tap to toggle',
      systemImage: 'pin',
      state: isPinned ? 'on' : 'off',
      keepOpen,
    },
    {
      id: 'mixed',
      title: 'Mixed selection',
      systemImage: 'slider.horizontal.3',
      state: mixedState,
      keepOpen,
    },
    { title: 'Unavailable action', systemImage: 'lock', disabled: true },
  ];
  const options =
    compositionIndex === 1
      ? stateOptions
      : compositionIndex === 2
        ? nestedOptions
        : basicOptions;

  const handleAction = ({ nativeEvent }: MenuActionPressEvent) => {
    setSelectionCount((value) => value + 1);
    if (nativeEvent.id === 'pinned') {
      setIsPinned((value) => !value);
      setLastEvent(isPinned ? 'Pinned turned off.' : 'Pinned turned on.');
    } else if (nativeEvent.id === 'mixed') {
      setMixedState((value) => (value === 'mixed' ? 'off' : 'mixed'));
      setLastEvent(
        mixedState === 'mixed'
          ? 'Mixed selection turned off.'
          : 'Mixed selection restored.'
      );
    } else {
      setLastEvent(`${nativeEvent.title} selected.`);
    }
  };

  return (
    <PlaygroundPage
      title={'Every action.\nRight at hand.'}
      description="Explore native menus, from a quick choice to a whole collection of actions."
    >
      <View style={styles.stage}>
        <View style={styles.stageHeader}>
          <Text style={styles.eyebrow}>LIVE PREVIEW</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>
              {disabled ? 'Disabled' : composition.label}
            </Text>
          </View>
        </View>
        <View style={styles.document}>
          <Text style={styles.documentOverline}>SAMPLE DOCUMENT</Text>
          <Text style={styles.documentTitle}>Weekend notes</Text>
          <Text style={styles.documentDetail}>
            {isPinned
              ? 'Pinned to your collection'
              : 'Ideas worth keeping around'}
          </Text>
        </View>
        <Menu
          ref={menuRef}
          accessibilityLabel={`Open ${composition.title.toLowerCase()}`}
          disabled={disabled}
          onActionPress={handleAction}
          options={options}
          testID={disabled ? 'menu-disabled' : composition.testID}
          title={composition.title}
        >
          <View
            style={[
              playgroundStyles.trigger,
              disabled && styles.disabledTrigger,
            ]}
          >
            <Text
              style={[
                playgroundStyles.triggerLabel,
                disabled && styles.disabledLabel,
              ]}
            >
              {disabled ? 'Menu disabled' : 'Open menu'}
            </Text>
          </View>
        </Menu>
        <Button
          title="Open from another button (iOS 17.4+)"
          testID="menu-open-imperatively"
          disabled={disabled}
          onPress={() => menuRef.current?.open()}
        />
      </View>

      <Pressable
        testID="menu-background-button"
        accessibilityRole="button"
        onTouchStart={() => countTouch('start')}
        onPressIn={() => countTouch('in')}
        onPressOut={() => countTouch('out')}
        onPress={() => countTouch('press')}
        style={playgroundStyles.trigger}
      >
        <Text style={playgroundStyles.triggerLabel}>
          Test background button
        </Text>
      </Pressable>
      <Text testID="menu-background-events" style={playgroundStyles.caption}>
        {`Touch: ${touchCounts.start} · In: ${touchCounts.in} · Out: ${touchCounts.out} · Press: ${touchCounts.press}`}
      </Text>
      <Text style={playgroundStyles.caption}>
        Open the menu, then tap this button. The menu should close without
        changing any counter. Tap again to count a normal press.
      </Text>

      <NestedMenuExample kind="Pressable" disabled={disabled} />

      <ControlPanel>
        <Setting
          title="Composition"
          value={composition.label}
          hint={composition.hint}
        >
          <Choices
            label="Menu composition"
            labels={compositions.map((item) => item.label)}
            selected={compositionIndex}
            onSelect={setCompositionIndex}
          />
        </Setting>
        <PanelDivider />
        <ToggleSetting
          title="Disable trigger"
          hint="Prevent the preview from opening its menu."
          value={disabled}
          onValueChange={setDisabled}
        />
        {compositionIndex === 1 && (
          <>
            <PanelDivider />
            <ToggleSetting
              title="Keep menu open"
              hint="Continue selecting without opening it again."
              value={keepOpen}
              onValueChange={setKeepOpen}
            />
          </>
        )}
      </ControlPanel>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={playgroundStyles.sectionTitle}>
          Selection, at a glance
        </Text>
        <View style={styles.stateGrid}>
          <View style={styles.stateCell}>
            <Text style={styles.stateLabel}>PINNED</Text>
            <Text style={[styles.stateValue, isPinned && styles.activeValue]}>
              {isPinned ? 'On' : 'Off'}
            </Text>
          </View>
          <View style={styles.stateCell}>
            <Text style={styles.stateLabel}>SELECTION</Text>
            <Text style={styles.stateValue}>
              {mixedState === 'mixed' ? 'Mixed' : 'Off'}
            </Text>
          </View>
        </View>
        <Text style={playgroundStyles.caption}>
          Choose the Selection composition to change these states.
        </Text>
      </View>

      <View accessibilityLiveRegion="polite" style={styles.eventPanel}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventEyebrow}>LAST ACTION</Text>
          <Text style={playgroundStyles.caption}>
            {selectionCount} {selectionCount === 1 ? 'selection' : 'selections'}
          </Text>
        </View>
        <Text style={styles.eventTitle}>{lastEvent}</Text>
        <Text style={playgroundStyles.caption}>
          Demo actions report their selection here. No files are changed or
          shared.
        </Text>
      </View>
    </PlaygroundPage>
  );
}

function NestedMenuExample({
  kind,
  disabled,
}: {
  kind: 'Pressable' | 'TouchableHighlight';
  disabled: boolean;
}) {
  const menuRef = useRef<MenuRef>(null);
  const [pressInCount, setPressInCount] = useState(0);
  const [pressCount, setPressCount] = useState(0);
  const [lastAction, setLastAction] = useState('None');
  const Container = kind === 'Pressable' ? Pressable : TouchableHighlight;

  return (
    <View style={styles.section}>
      <Container
        testID={`menu-parent-${kind}`}
        disabled={disabled}
        onPressIn={() => setPressInCount((count) => count + 1)}
        onPress={() => {
          setPressCount((count) => count + 1);
          menuRef.current?.open();
        }}
        style={styles.nestedParent}
      >
        <View style={styles.nestedRow}>
          <Text style={playgroundStyles.caption}>{kind} parent</Text>
          <Menu
            ref={menuRef}
            disabled={disabled}
            options={basicOptions}
            onActionPress={({ nativeEvent }) =>
              setLastAction(nativeEvent.title)
            }
            testID={`menu-nested-${kind}`}
          >
            <View style={playgroundStyles.trigger}>
              <Text style={playgroundStyles.triggerLabel}>Actions</Text>
            </View>
          </Menu>
        </View>
      </Container>
      <Text style={playgroundStyles.caption}>
        {`Parent in: ${pressInCount} · Press: ${pressCount} · Action: ${lastAction}`}
      </Text>
      <Text style={playgroundStyles.caption}>
        Tap the parent label to open the menu (iOS 17.4+). Tap Actions to open
        it directly without changing the parent counters.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nestedParent: {
    borderRadius: 12,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  nestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  stage: {
    borderRadius: 26,
    padding: 20,
    gap: 24,
    backgroundColor: DynamicColorIOS({ light: '#DCEBE5', dark: '#263D37' }),
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  eyebrow: {
    color: PlatformColor('labelColor'),
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: DynamicColorIOS({ light: '#C7DDD3', dark: '#38534A' }),
  },
  badgeLabel: {
    color: PlatformColor('labelColor'),
    fontSize: 11,
    fontWeight: '600',
  },
  document: { gap: 7, paddingVertical: 2 },
  documentOverline: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  documentTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 27,
    fontWeight: '600',
    letterSpacing: -0.7,
  },
  documentDetail: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
    lineHeight: 19,
  },
  disabledTrigger: { opacity: 0.55 },
  disabledLabel: { color: PlatformColor('secondaryLabelColor') },
  section: { gap: 12, marginTop: 6 },
  stateGrid: { flexDirection: 'row', gap: 12 },
  stateCell: {
    flex: 1,
    padding: 18,
    gap: 10,
    borderRadius: 20,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  stateLabel: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
  stateValue: {
    color: PlatformColor('labelColor'),
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  activeValue: { color: PlatformColor('systemGreenColor') },
  eventPanel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PlatformColor('separatorColor'),
    paddingTop: 20,
    gap: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventEyebrow: {
    color: PlatformColor('systemBlueColor'),
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  eventTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '500',
  },
});
