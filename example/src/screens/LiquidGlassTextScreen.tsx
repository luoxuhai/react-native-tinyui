import { useState } from 'react';
import {
  Image,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LiquidGlassText } from 'react-native-tinyui';

import {
  Choices,
  ControlPanel,
  PanelDivider,
  PlaygroundPage,
  Setting,
  ToggleSetting,
  playgroundStyles,
} from '../components/Playground';

const effects = [
  {
    label: 'Clear',
    value: 'clear',
    hint: 'A transparent material that lets the backdrop show through.',
  },
  {
    label: 'Regular',
    value: 'regular',
    hint: 'A fuller glass material with more separation from the backdrop.',
  },
] as const;
const fonts = [
  { label: 'Default', value: 'default' },
  { label: 'Rounded', value: 'rounded' },
  { label: 'Serif', value: 'serif' },
  { label: 'Mono', value: 'monospaced' },
] as const;
const tints = [
  { label: 'None', value: undefined, swatch: '#8A8E98' },
  { label: 'Frost', value: '#FFFFFF', swatch: '#FFFFFF' },
  { label: 'Cyan', value: '#6CDEFF', swatch: '#6CDEFF' },
  { label: 'Rose', value: '#FF9BBB', swatch: '#FF9BBB' },
] as const;
const fontSizes = [36, 52, 68] as const;
const alignments = [
  { label: 'Start', value: 'leading' },
  { label: 'Center', value: 'center' },
  { label: 'End', value: 'trailing' },
] as const;
const defaultText = 'Liquid Glass\n液态玻璃\n1234567890';

export function LiquidGlassTextScreen() {
  const [text, setText] = useState(defaultText);
  const [effectIndex, setEffectIndex] = useState(1);
  const [fontIndex, setFontIndex] = useState(1);
  const [tintIndex, setTintIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(1);
  const [alignmentIndex, setAlignmentIndex] = useState(1);
  const [interactive, setInteractive] = useState(true);
  const effect = effects[effectIndex] ?? effects[1];
  const font = fonts[fontIndex] ?? fonts[1];
  const tint = tints[tintIndex] ?? tints[0];
  const fontSize = fontSizes[sizeIndex] ?? fontSizes[1];
  const alignment = alignments[alignmentIndex] ?? alignments[1];

  const reset = () => {
    setText(defaultText);
    setEffectIndex(1);
    setFontIndex(1);
    setTintIndex(0);
    setSizeIndex(1);
    setAlignmentIndex(1);
    setInteractive(true);
  };

  return (
    <PlaygroundPage
      title={'Letters with\nanother dimension.'}
      description="Shape the words. Change the material. Make the light your own."
    >
      <View style={styles.stage}>
        <Image
          accessible={false}
          pointerEvents="none"
          resizeMode="cover"
          source={require('../assets/liquid-glass-background.jpg')}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.stageHeader}>
          <Text style={styles.stageEyebrow}>LIVE TYPE</Text>
          <Text style={styles.stageDetail}>
            {fontSize} pt · {effect.label}
          </Text>
        </View>
        <ScrollView
          horizontal
          contentContainerStyle={styles.typeCanvas}
          showsHorizontalScrollIndicator
          style={styles.typeViewport}
        >
          {text.length > 0 ? (
            <LiquidGlassText
              effect={effect.value}
              fontDesign={font.value}
              interactive={interactive}
              multilineTextAlignment={alignment.value}
              testID="liquid-glass-preview"
              text={text}
              textStyle={[styles.glassText, { fontSize }]}
              tint={tint.value}
            />
          ) : (
            <Text style={styles.emptyText}>Your words go here.</Text>
          )}
        </ScrollView>
        <Text style={styles.stageHint}>
          {interactive
            ? 'Touch the letters to explore the glass.'
            : 'A still moment. Touch response is off.'}
        </Text>
      </View>

      <ControlPanel>
        <Setting
          title="Your words"
          value={`${text.length} / 48`}
          hint="Up to three lines. Swipe the preview if a line runs wide."
        >
          <TextInput
            accessibilityLabel="Preview text"
            autoCorrect={false}
            maxLength={48}
            multiline
            onChangeText={(value) =>
              setText(value.split('\n').slice(0, 3).join('\n'))
            }
            placeholder="Write something…"
            placeholderTextColor={PlatformColor('tertiaryLabelColor')}
            selectionColor={PlatformColor('systemBlueColor')}
            style={styles.textInput}
            testID="liquid-glass-text-input"
            value={text}
          />
        </Setting>
        <PanelDivider />
        <Setting title="Material" value={effect.label} hint={effect.hint}>
          <Choices
            label="Glass material"
            labels={effects.map((item) => item.label)}
            selected={effectIndex}
            onSelect={setEffectIndex}
          />
        </Setting>
        <PanelDivider />
        <Setting title="Tint" value={tint.label}>
          <View
            accessibilityLabel="Glass tint"
            accessibilityRole="radiogroup"
            style={styles.swatches}
          >
            {tints.map((item, index) => (
              <Pressable
                accessibilityLabel={`${item.label} tint`}
                accessibilityRole="radio"
                accessibilityState={{ checked: index === tintIndex }}
                key={item.label}
                onPress={() => setTintIndex(index)}
                style={({ pressed }) => [
                  styles.swatchChoice,
                  index === tintIndex && styles.selectedSwatch,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[styles.swatch, { backgroundColor: item.swatch }]}
                />
                <Text
                  style={[
                    styles.swatchLabel,
                    index === tintIndex && styles.selectedSwatchLabel,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Setting>
        <PanelDivider />
        <ToggleSetting
          title="Interactive glass"
          hint="Let the glass respond to your touch."
          value={interactive}
          onValueChange={setInteractive}
        />
      </ControlPanel>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={playgroundStyles.sectionTitle}>
          Give it character
        </Text>
        <ControlPanel>
          <Setting title="Font design" value={font.label}>
            <Choices
              label="Font design"
              labels={fonts.map((item) => item.label)}
              selected={fontIndex}
              onSelect={setFontIndex}
            />
          </Setting>
          <PanelDivider />
          <Setting title="Size" value={`${fontSize} pt`}>
            <Choices
              label="Font size"
              labels={fontSizes.map((size) => `${size} pt`)}
              selected={sizeIndex}
              onSelect={setSizeIndex}
            />
          </Setting>
          <PanelDivider />
          <Setting title="Multiline alignment" value={alignment.label}>
            <Choices
              label="Multiline alignment"
              labels={alignments.map((item) => item.label)}
              selected={alignmentIndex}
              onSelect={setAlignmentIndex}
            />
          </Setting>
        </ControlPanel>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={reset}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.pressed,
          ]}
          testID="liquid-glass-reset"
        >
          <Text style={styles.resetLabel}>Reset playground</Text>
        </Pressable>
        <Text style={[playgroundStyles.caption, styles.footerNote]}>
          Glass effects appear on iOS 26 and later. Earlier versions display
          standard text.
        </Text>
      </View>
    </PlaygroundPage>
  );
}

const styles = StyleSheet.create({
  glassText: { fontWeight: '800' },
  stage: {
    borderRadius: 26,
    overflow: 'hidden',
    paddingVertical: 20,
    gap: 8,
    backgroundColor: '#272C3C',
  },
  stageHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  stageEyebrow: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  stageDetail: {
    color: '#FFFFFF',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  typeViewport: { flexGrow: 0 },
  typeCanvas: {
    flexGrow: 1,
    minHeight: 200,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageHint: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  emptyText: { color: '#FFFFFF', fontSize: 18 },
  textInput: {
    minHeight: 82,
    borderRadius: 13,
    padding: 12,
    color: PlatformColor('labelColor'),
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
    fontSize: 16,
    lineHeight: 23,
  },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchChoice: {
    flexGrow: 1,
    minWidth: 56,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
    padding: 8,
    borderWidth: 1,
    borderColor: PlatformColor('separatorColor'),
  },
  selectedSwatch: {
    borderColor: PlatformColor('systemBlueColor'),
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#777777',
  },
  swatchLabel: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 12,
    fontWeight: '500',
  },
  selectedSwatchLabel: {
    color: PlatformColor('systemBlueColor'),
    fontWeight: '600',
  },
  section: { gap: 12, marginTop: 6 },
  footer: { alignItems: 'center', gap: 8 },
  resetButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  resetLabel: {
    color: PlatformColor('systemBlueColor'),
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: { textAlign: 'center', maxWidth: 310 },
  pressed: { opacity: 0.65 },
});
