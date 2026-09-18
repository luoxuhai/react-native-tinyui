import { useState } from 'react';
import {
  DynamicColorIOS,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Popover,
  PopoverClose,
  type PopoverArrowEdge,
  type PopoverAttachmentAnchor,
  type PopoverContentRenderArgs,
} from 'react-native-tinyui';

const sizes = [
  { label: 'Compact', width: 200, height: 140 },
  { label: 'Roomy', width: 300, height: 240 },
  { label: 'Tall', width: 100, height: 300 },
] as const;

const placements: {
  label: string;
  anchor: PopoverAttachmentAnchor;
  arrow: PopoverArrowEdge;
}[] = [
  { label: 'Auto', anchor: 'center', arrow: 'none' },
  { label: 'Above', anchor: 'top', arrow: 'bottom' },
  { label: 'Below', anchor: 'bottom', arrow: 'top' },
  { label: 'Left', anchor: 'leading', arrow: 'trailing' },
  { label: 'Right', anchor: 'trailing', arrow: 'leading' },
];

function PreviewContent({
  close,
  onResize,
  size,
}: PopoverContentRenderArgs & {
  onResize: () => void;
  size: (typeof sizes)[number];
}) {
  const isTall = size.label === 'Tall';

  return (
    <View
      style={[
        styles.previewContent,
        { width: size.width, height: size.height },
        isTall && styles.tallContent,
      ]}
    >
      <View style={styles.sizeHeading}>
        <Text style={[styles.contentEyebrow, isTall && styles.centeredText]}>
          {size.label.toUpperCase()}
        </Text>
        <Text style={[styles.dimensions, isTall && styles.tallDimensions]}>
          {isTall
            ? `${size.width}\n×\n${size.height}`
            : `${size.width} × ${size.height}`}
        </Text>
      </View>
      {size.label === 'Roomy' && (
        <Text style={styles.contentBody}>
          A little more room. Resize again to watch this window adapt.
        </Text>
      )}
      <View style={[styles.contentActions, isTall && styles.tallActions]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch to the next popover size"
          onPress={onResize}
          style={({ pressed }) => [
            styles.contentButton,
            styles.resizeButton,
            isTall && styles.tallButton,
            pressed && styles.pressed,
          ]}
          testID="popover-change-size"
        >
          <Text style={styles.resizeButtonText}>Resize</Text>
        </Pressable>
        <PopoverClose
          accessibilityRole="button"
          close={close}
          style={[styles.contentButton, isTall && styles.tallButton]}
        >
          <Text style={styles.textButtonLabel}>Done</Text>
        </PopoverClose>
      </View>
    </View>
  );
}

function ExpandingContent({ close }: PopoverContentRenderArgs) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.readingContent}>
      <Text style={styles.contentEyebrow}>CONTENT THAT GROWS</Text>
      <Text style={styles.contentTitle}>Room for one more thought.</Text>
      <Text style={styles.contentBody}>
        This popover follows the height of its content.
      </Text>
      {expanded && (
        <Text style={styles.contentBody}>
          Add a paragraph and the window grows with it. Hide it again and the
          window returns to its original size, all without closing.
        </Text>
      )}
      <View style={styles.contentActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((value) => !value)}
          style={styles.contentButton}
          testID="popover-toggle-text"
        >
          <Text style={styles.textButtonLabel}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
        <PopoverClose
          accessibilityRole="button"
          close={close}
          style={styles.contentButton}
        >
          <Text style={styles.textButtonLabel}>Done</Text>
        </PopoverClose>
      </View>
    </View>
  );
}

function ConfirmationContent({ close }: PopoverContentRenderArgs) {
  return (
    <View style={styles.readingContent}>
      <Text style={styles.contentEyebrow}>RIGHT WHERE YOU ARE</Text>
      <Text style={styles.contentTitle}>A quick pause.</Text>
      <Text style={styles.contentBody}>
        Keep the context. Dismiss this window and pick up where you left off.
      </Text>
      <PopoverClose
        accessibilityRole="button"
        close={close}
        style={[styles.contentButton, styles.resizeButton]}
        testID="popover-done"
      >
        <Text style={styles.resizeButtonText}>Got it</Text>
      </PopoverClose>
    </View>
  );
}

function renderExpandingContent(args: PopoverContentRenderArgs) {
  return <ExpandingContent {...args} />;
}

function ChoiceGroup({
  label,
  labels,
  onSelect,
  selected,
}: {
  label: string;
  labels: readonly string[];
  onSelect: (index: number) => void;
  selected: number;
}) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      style={styles.choices}
    >
      {labels.map((title, index) => (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: index === selected }}
          key={title}
          onPress={() => onSelect(index)}
          style={({ pressed }) => [
            styles.choice,
            selected === index && styles.selectedChoice,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.choiceLabel,
              selected === index && styles.selectedChoiceLabel,
            ]}
          >
            {title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function PopoverScreen() {
  const [sizeIndex, setSizeIndex] = useState(0);
  const [placementIndex, setPlacementIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastEvent, setLastEvent] = useState('Ready when you are.');
  const size = sizes[sizeIndex] ?? sizes[0];
  const placement = placements[placementIndex] ?? placements[0]!;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setLastEvent(open ? 'Preview opened.' : 'Preview dismissed.');
  };

  const resize = () => {
    const nextIndex = (sizeIndex + 1) % sizes.length;
    const nextSize = sizes[nextIndex]!;
    setSizeIndex(nextIndex);
    setLastEvent(`Resized to ${nextSize.width} × ${nextSize.height} pt.`);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>COMPONENT PLAYGROUND</Text>
          <Text accessibilityRole="header" style={styles.heading}>
            {'Small window.\nMore possibilities.'}
          </Text>
          <Text style={styles.intro}>
            Explore a popover that feels right at home on iOS.
          </Text>
        </View>

        <View style={styles.stage}>
          <View pointerEvents="none" style={styles.stageBackdrop}>
            <View style={styles.stageWarm} />
            <View style={styles.stageCool} />
          </View>
          <View style={styles.stageHeader}>
            <Text style={styles.stageEyebrow}>LIVE PREVIEW</Text>
            <Text style={styles.stageMeasurement}>
              {size.width} × {size.height} pt
            </Text>
          </View>
          <View style={styles.stageCenter}>
            <Popover
              accessibilityLabel="Open the popover preview"
              attachmentAnchor={placement.anchor}
              arrowEdge={placement.arrow}
              // eslint-disable-next-line react/no-unstable-nested-components -- Popover.content is a render prop
              content={({ close }) => (
                <PreviewContent close={close} onResize={resize} size={size} />
              )}
              onOpenChange={handleOpenChange}
              open={isOpen}
              testID="popover-controlled"
            >
              <View style={styles.previewTrigger}>
                <Text style={styles.previewTriggerLabel}>Open popover</Text>
              </View>
            </Popover>
          </View>
          <Text style={styles.stageHint}>
            Tap to open. Tap outside to dismiss.
          </Text>
        </View>

        <View style={styles.settings}>
          <View style={styles.settingSection}>
            <View style={styles.settingHeading}>
              <Text style={styles.settingTitle}>Size</Text>
              <Text style={styles.settingValue}>{size.label}</Text>
            </View>
            <ChoiceGroup
              label="Popover size"
              labels={sizes.map((item) => item.label)}
              onSelect={setSizeIndex}
              selected={sizeIndex}
            />
            <Text style={styles.settingHint}>
              You can also resize from inside the popover.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingSection}>
            <View style={styles.settingHeading}>
              <Text style={styles.settingTitle}>Placement</Text>
              <Text style={styles.settingValue}>{placement.label}</Text>
            </View>
            <ChoiceGroup
              label="Popover placement"
              labels={placements.map((item) => item.label)}
              onSelect={setPlacementIndex}
              selected={placementIndex}
            />
            <Text style={styles.settingHint}>
              The available space helps iOS find the best fit.
            </Text>
          </View>
        </View>

        <View style={styles.examplesSection}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            More to explore
          </Text>
          <View style={styles.examples}>
            <Popover
              content={renderExpandingContent}
              onOpenChange={(open) =>
                setLastEvent(
                  open
                    ? 'Auto-height example opened.'
                    : 'Auto-height example dismissed.'
                )
              }
              testID="popover-auto-height"
            >
              <View style={styles.exampleRow}>
                <View style={styles.exampleCopy}>
                  <Text style={styles.exampleTitle}>Let content lead</Text>
                  <Text style={styles.exampleDescription}>
                    Add a little text. Watch the window grow.
                  </Text>
                </View>
                <Text style={styles.exampleAction}>Try it</Text>
              </View>
            </Popover>
            <View style={styles.divider} />
            <Popover
              content={ConfirmationContent}
              onOpenChange={(open) =>
                setLastEvent(
                  open
                    ? 'Dismissal example opened.'
                    : 'Dismissal example closed.'
                )
              }
              testID="popover-dismissible"
            >
              <View style={styles.exampleRow}>
                <View style={styles.exampleCopy}>
                  <Text style={styles.exampleTitle}>Stay in the moment</Text>
                  <Text style={styles.exampleDescription}>
                    A small interaction, with a close button.
                  </Text>
                </View>
                <Text style={styles.exampleAction}>Try it</Text>
              </View>
            </Popover>
          </View>
        </View>

        <View accessibilityLiveRegion="polite" style={styles.status}>
          <View style={[styles.statusDot, isOpen && styles.statusDotActive]} />
          <Text style={styles.statusLabel}>{lastEvent}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PlatformColor('systemGroupedBackgroundColor'),
  },
  scrollContent: { paddingBottom: 40 },
  page: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
  },
  header: { gap: 9, paddingBottom: 4 },
  eyebrow: {
    color: PlatformColor('systemBlueColor'),
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heading: {
    color: PlatformColor('labelColor'),
    fontSize: 32,
    lineHeight: 37,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  intro: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 310,
  },
  stage: {
    minHeight: 220,
    borderRadius: 26,
    overflow: 'hidden',
    padding: 20,
    gap: 20,
  },
  stageBackdrop: { ...StyleSheet.absoluteFill, flexDirection: 'row' },
  stageWarm: {
    flex: 1,
    backgroundColor: DynamicColorIOS({ light: '#EBD3B7', dark: '#594435' }),
  },
  stageCool: {
    flex: 1,
    backgroundColor: DynamicColorIOS({ light: '#C2DAEA', dark: '#29485D' }),
  },
  stageHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stageEyebrow: {
    color: PlatformColor('labelColor'),
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  stageMeasurement: {
    color: PlatformColor('labelColor'),
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  stageCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  previewTrigger: {
    minHeight: 52,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 26,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  previewTriggerLabel: {
    color: PlatformColor('labelColor'),
    fontSize: 16,
    fontWeight: '600',
  },
  stageHint: {
    color: PlatformColor('labelColor'),
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  settings: {
    borderRadius: 22,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  settingSection: { padding: 18, gap: 12 },
  settingHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 16,
    fontWeight: '600',
  },
  settingValue: { color: PlatformColor('secondaryLabelColor'), fontSize: 13 },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    borderRadius: 13,
    padding: 4,
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
  },
  choice: {
    flexGrow: 1,
    flexBasis: 'auto',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  selectedChoice: { backgroundColor: PlatformColor('systemBlueColor') },
  choiceLabel: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
    fontWeight: '500',
  },
  selectedChoiceLabel: { color: '#FFFFFF', fontWeight: '600' },
  settingHint: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 12,
    lineHeight: 17,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: PlatformColor('separatorColor'),
    marginHorizontal: 18,
  },
  examplesSection: { gap: 12, marginTop: 6 },
  sectionTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  examples: {
    borderRadius: 22,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  exampleRow: {
    minHeight: 90,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  exampleCopy: { flex: 1, gap: 5 },
  exampleTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 16,
    fontWeight: '600',
  },
  exampleDescription: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
    lineHeight: 18,
  },
  exampleAction: {
    color: PlatformColor('systemBlueColor'),
    fontSize: 13,
    fontWeight: '600',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PlatformColor('systemGrayColor'),
  },
  statusDotActive: { backgroundColor: PlatformColor('systemGreenColor') },
  statusLabel: {
    flex: 1,
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 12,
    lineHeight: 18,
  },
  previewContent: { padding: 16, justifyContent: 'space-between', gap: 8 },
  tallContent: { paddingHorizontal: 18, paddingVertical: 26 },
  centeredText: { textAlign: 'center' },
  tallButton: { paddingHorizontal: 4 },
  sizeHeading: { gap: 3 },
  contentEyebrow: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dimensions: {
    color: PlatformColor('labelColor'),
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.8,
  },
  tallDimensions: { textAlign: 'center', fontSize: 25, lineHeight: 29 },
  contentActions: { flexDirection: 'row', gap: 6 },
  tallActions: { flexDirection: 'column' },
  contentButton: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizeButton: { backgroundColor: PlatformColor('systemBlueColor') },
  resizeButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  textButtonLabel: {
    color: PlatformColor('systemBlueColor'),
    fontSize: 14,
    fontWeight: '600',
  },
  readingContent: { width: 280, padding: 22, gap: 12 },
  contentTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  contentBody: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 14,
    lineHeight: 21,
  },
  pressed: { opacity: 0.65 },
});
