import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Components'>;

const components = [
  {
    description: 'SF Symbols, native animations, rendering and transitions.',
    glyph: '􀆿',
    route: 'SFSymbol',
    title: 'SF Symbol',
  },
  {
    description: 'Native UIMenu actions, states, sections and submenus.',
    glyph: '⌄',
    route: 'Menu',
    title: 'Menu',
  },
  {
    description: 'Native popover presentation with React Native content.',
    glyph: '◫',
    route: 'Popover',
    title: 'Popover',
  },
  {
    description: 'Interactive glass lettering and typography controls.',
    glyph: 'Aa',
    route: 'LiquidGlassText',
    title: 'Liquid Glass Text',
  },
  {
    description: 'Native UIStepper with ranges, increments and autorepeat.',
    glyph: '±',
    route: 'Stepper',
    title: 'Stepper',
  },
  {
    description: 'Nested corners that adapt to their container on iOS 26.',
    glyph: '▢',
    route: 'ConcentricView',
    title: 'Concentric View',
  },
] as const;

export function ComponentListScreen({ navigation }: Props) {
  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.eyebrow}>NATIVE iOS · FABRIC</Text>
      <Text style={styles.heading}>Playground</Text>
      <View style={styles.list}>
        {components.map((component) => (
          <Pressable
            accessibilityRole="button"
            key={component.route}
            onPress={() => navigation.navigate(component.route)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.copy}>
              <Text style={styles.title}>{component.title}</Text>
              <Text style={styles.description}>{component.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eyebrow: {
    color: PlatformColor('systemBlueColor'),
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  heading: {
    color: PlatformColor('labelColor'),
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginTop: 8,
  },
  intro: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  list: {
    borderRadius: 20,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
    marginTop: 24,
    overflow: 'hidden',
  },
  row: {
    minHeight: 92,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PlatformColor('separatorColor'),
  },
  rowPressed: {
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: PlatformColor('systemGray5Color'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: PlatformColor('systemBlueColor'),
    fontSize: 19,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: PlatformColor('labelColor'),
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  chevron: {
    color: PlatformColor('tertiaryLabelColor'),
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 10,
  },
});
