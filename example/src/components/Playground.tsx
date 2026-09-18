import type { PropsWithChildren } from 'react';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export function PlaygroundPage({
  children,
  title,
  description,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>COMPONENT PLAYGROUND</Text>
          <Text accessibilityRole="header" style={styles.heading}>
            {title}
          </Text>
          <Text style={styles.intro}>{description}</Text>
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function ControlPanel({ children }: PropsWithChildren) {
  return <View style={styles.panel}>{children}</View>;
}

export function Setting({
  children,
  title,
  value,
  hint,
}: PropsWithChildren<{ title: string; value?: string; hint?: string }>) {
  return (
    <View style={styles.setting}>
      <View style={styles.settingHeading}>
        <Text style={styles.settingTitle}>{title}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {children}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export function Choices({
  label,
  labels,
  selected,
  onSelect,
}: {
  label: string;
  labels: readonly string[];
  selected: number;
  onSelect: (index: number) => void;
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
          accessibilityState={{ checked: selected === index }}
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

export function ToggleSetting({
  title,
  hint,
  value,
  onValueChange,
}: {
  title: string;
  hint: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
}

export function PanelDivider() {
  return <View style={styles.divider} />;
}

export const playgroundStyles = StyleSheet.create({
  sectionTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  caption: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 12,
    lineHeight: 18,
  },
  trigger: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  triggerLabel: {
    color: PlatformColor('labelColor'),
    fontSize: 16,
    fontWeight: '600',
  },
});

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
    maxWidth: 330,
  },
  panel: {
    borderRadius: 22,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  setting: { padding: 18, gap: 12 },
  settingHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  settingTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 16,
    fontWeight: '600',
  },
  settingValue: { color: PlatformColor('secondaryLabelColor'), fontSize: 13 },
  hint: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 12,
    lineHeight: 17,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    padding: 4,
    borderRadius: 13,
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
  },
  choice: {
    flexGrow: 1,
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChoice: { backgroundColor: PlatformColor('systemBlueColor') },
  choiceLabel: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
    fontWeight: '500',
  },
  selectedChoiceLabel: { color: '#FFFFFF', fontWeight: '600' },
  toggleRow: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleCopy: { flex: 1, gap: 5 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 18,
    backgroundColor: PlatformColor('separatorColor'),
  },
  pressed: { opacity: 0.65 },
});
