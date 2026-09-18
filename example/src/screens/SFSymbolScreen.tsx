import { useState } from 'react';
import {
  Platform,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SFSymbol,
  type SFSymbolEffect,
  type SFSymbolRenderingMode,
  type SFSymbolScale,
  type SFSymbolWeight,
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

const names = [
  'bell.badge.fill',
  'wifi',
  'heart.fill',
  'gearshape.2.fill',
  'checkmark',
];
const effects = [
  'none',
  'bounce',
  'pulse',
  'variableColor',
  'scale',
  'appear',
  'disappear',
  'wiggle',
  'rotate',
  'breathe',
  'drawOn',
  'drawOff',
] as const;
const weights: readonly SFSymbolWeight[] = [
  'unspecified',
  'ultraLight',
  'thin',
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'heavy',
  'black',
];
const modes: readonly SFSymbolRenderingMode[] = [
  'automatic',
  'monochrome',
  'hierarchical',
  'palette',
  'multicolor',
];
const scales: readonly SFSymbolScale[] = [
  'default',
  'unspecified',
  'small',
  'medium',
  'large',
];

function Select<T extends string>({
  title,
  values,
  value,
  onChange,
  hint,
}: {
  title: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
  hint?: string;
}) {
  return (
    <Setting title={title} hint={hint}>
      <Choices
        label={title}
        labels={values}
        selected={values.indexOf(value)}
        onSelect={(index) => onChange(values[index] ?? values[0]!)}
      />
    </Setting>
  );
}

export function SFSymbolScreen() {
  const [name, setName] = useState('bell.badge.fill');
  const [size, setSize] = useState('64');
  const [weight, setWeight] = useState<SFSymbolWeight>('regular');
  const [scale, setScale] = useState<SFSymbolScale>('default');
  const [renderingMode, setRenderingMode] =
    useState<SFSymbolRenderingMode>('hierarchical');
  const [color, setColor] = useState('Blue');
  const [gradient, setGradient] = useState(false);
  const [allowFontScaling, setAllowFontScaling] = useState(true);
  const [variableValue, setVariableValue] = useState('1');
  const [variableMode, setVariableMode] = useState<
    'automatic' | 'color' | 'draw'
  >('automatic');
  const [type, setType] = useState<(typeof effects)[number]>('bounce');
  const [active, setActive] = useState(true);
  const [trigger, setTrigger] = useState(0);
  const [scope, setScope] = useState<
    'byLayer' | 'wholeSymbol' | 'individually'
  >('byLayer');
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [wiggleDirection, setWiggleDirection] = useState<
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'forward'
    | 'backward'
    | 'clockwise'
    | 'counterClockwise'
  >('clockwise');
  const [customAngle, setCustomAngle] = useState(false);
  const [rotation, setRotation] = useState<'clockwise' | 'counterClockwise'>(
    'clockwise'
  );
  const [breatheStyle, setBreatheStyle] = useState<'plain' | 'pulse'>('plain');
  const [iteration, setIteration] = useState<'iterative' | 'cumulative'>(
    'iterative'
  );
  const [reversing, setReversing] = useState(false);
  const [inactiveLayers, setInactiveLayers] = useState<'hide' | 'dim'>('dim');
  const [speed, setSpeed] = useState('1');
  const [repeat, setRepeat] = useState('1');
  const [repeatDelay, setRepeatDelay] = useState('0');
  const [continuous, setContinuous] = useState(false);
  const [animated, setAnimated] = useState(true);
  const [respectReduceMotion, setRespectReduceMotion] = useState(true);
  const [transition, setTransition] = useState<
    'none' | 'automatic' | 'replace' | 'magicReplace'
  >('magicReplace');
  const [transitionDirection, setTransitionDirection] = useState<
    'downUp' | 'upUp' | 'offUp'
  >('downUp');
  const iosVersion = parseInt(String(Platform.Version), 10);
  const tint =
    color === 'Blue'
      ? PlatformColor('systemBlueColor')
      : color === 'Pink'
        ? PlatformColor('systemPinkColor')
        : PlatformColor('labelColor');
  const layerScope = scope === 'individually' ? 'byLayer' : scope;
  const playback = {
    active,
    trigger,
    animated,
    options: continuous
      ? { speed: Number(speed), repeatBehavior: 'continuous' as const }
      : {
          speed: Number(speed),
          repeat: repeat === 'forever' ? ('forever' as const) : Number(repeat),
          repeatDelay: Number(repeatDelay),
        },
  };
  const effect: SFSymbolEffect | undefined = (() => {
    switch (type) {
      case 'none':
        return undefined;
      case 'variableColor':
        return { ...playback, type, iteration, reversing, inactiveLayers };
      case 'wiggle':
        return {
          ...playback,
          type,
          scope: layerScope,
          direction: wiggleDirection,
          angle: customAngle ? 45 : undefined,
        };
      case 'rotate':
        return { ...playback, type, scope: layerScope, direction: rotation };
      case 'breathe':
        return { ...playback, type, scope: layerScope, style: breatheStyle };
      case 'drawOn':
        return { ...playback, type, scope };
      case 'drawOff':
        return { ...playback, type, scope, reversed: reversing };
      case 'pulse':
        return { ...playback, type, scope: layerScope };
      default:
        return { ...playback, type, scope: layerScope, direction };
    }
  })();

  return (
    <PlaygroundPage
      title={'Symbols with\nnative motion.'}
      description="Explore SF Symbols, layer colors and Apple's animation presets. Replay an effect or switch symbols to try the replacement transition."
    >
      <View style={styles.preview}>
        <SFSymbol
          accessible
          accessibilityLabel="Symbol preview"
          testID="sf-symbol-preview"
          name={name}
          size={Number(size)}
          weight={weight}
          scale={scale}
          color={tint}
          renderingMode={renderingMode}
          paletteColors={[
            tint,
            PlatformColor('systemYellowColor'),
            PlatformColor('systemPinkColor'),
          ]}
          colorRenderingMode={gradient ? 'gradient' : 'flat'}
          allowFontScaling={allowFontScaling}
          variableValue={Number(variableValue)}
          variableValueMode={variableMode}
          effect={effect}
          contentTransition={
            transition === 'none'
              ? undefined
              : {
                  type: transition,
                  direction: transitionDirection,
                  scope: layerScope,
                  speed: Number(speed),
                }
          }
          respectReduceMotion={respectReduceMotion}
          style={styles.symbol}
        />
        <Text style={styles.symbolName}>{name || 'Enter a symbol name'}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setTrigger((value) => value + 1)}
          style={playgroundStyles.trigger}
          testID="sf-symbol-replay"
        >
          <Text style={playgroundStyles.triggerLabel}>Replay animation</Text>
        </Pressable>
      </View>

      <ControlPanel>
        <Setting
          title="Symbol name"
          hint="Use a complete SF Symbol name, including variants such as .fill. Unknown names render empty."
        >
          <TextInput
            accessibilityLabel="Symbol name"
            autoCapitalize="none"
            autoCorrect={false}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <Choices
            label="Suggested symbols"
            labels={names}
            selected={names.indexOf(name)}
            onSelect={(index) => setName(names[index] ?? names[0]!)}
          />
        </Setting>
        <PanelDivider />
        <Select
          title="Point size"
          values={['32', '64', '96']}
          value={size}
          onChange={setSize}
        />
        <Select
          title="Weight"
          values={weights}
          value={weight}
          onChange={setWeight}
        />
        <Select
          title="Scale"
          values={scales}
          value={scale}
          onChange={setScale}
        />
        <ToggleSetting
          title="Font scaling"
          hint="Follow the system text-size setting."
          value={allowFontScaling}
          onValueChange={setAllowFontScaling}
        />
      </ControlPanel>

      <ControlPanel>
        <Select
          title="Rendering mode"
          values={modes}
          value={renderingMode}
          onChange={setRenderingMode}
        />
        <Select
          title="Primary color"
          values={['Blue', 'Pink', 'Label']}
          value={color}
          onChange={setColor}
          hint="Palette mode adds yellow and pink layers. Layer support varies by symbol."
        />
        <ToggleSetting
          title="Gradient colors · iOS 26"
          hint="Let the system generate gradients for the symbol's colors."
          value={gradient}
          onValueChange={setGradient}
        />
        <Select
          title="Variable value"
          values={['0', '0.25', '0.5', '0.75', '1']}
          value={variableValue}
          onChange={setVariableValue}
          hint="Try wifi for variable color, or a draw-enabled symbol on iOS 26."
        />
        <Select
          title="Variable mode · iOS 26"
          values={['automatic', 'color', 'draw']}
          value={variableMode}
          onChange={setVariableMode}
        />
      </ControlPanel>

      <ControlPanel>
        <Select
          title="Animation preset"
          values={effects}
          value={type}
          onChange={setType}
        />
        <ToggleSetting
          title="Effect active"
          hint="Turn off to remove the effect and restore the symbol."
          value={active}
          onValueChange={setActive}
        />
        {type !== 'variableColor' && type !== 'none' && (
          <Select
            title="Layer behavior"
            values={
              type === 'drawOn' || type === 'drawOff'
                ? ['byLayer', 'wholeSymbol', 'individually']
                : ['byLayer', 'wholeSymbol']
            }
            value={type === 'drawOn' || type === 'drawOff' ? scope : layerScope}
            onChange={setScope}
          />
        )}
        {['bounce', 'scale', 'appear', 'disappear'].includes(type) && (
          <Select
            title="Direction"
            values={['up', 'down']}
            value={direction}
            onChange={setDirection}
          />
        )}
        {type === 'wiggle' && (
          <>
            <Select
              title="Wiggle direction"
              values={[
                'up',
                'down',
                'left',
                'right',
                'forward',
                'backward',
                'clockwise',
                'counterClockwise',
              ]}
              value={wiggleDirection}
              onChange={setWiggleDirection}
            />
            <ToggleSetting
              title="Custom angle"
              hint="Use a 45° axis instead of the selected direction."
              value={customAngle}
              onValueChange={setCustomAngle}
            />
          </>
        )}
        {type === 'rotate' && (
          <Select
            title="Rotation"
            values={['clockwise', 'counterClockwise']}
            value={rotation}
            onChange={setRotation}
          />
        )}
        {type === 'breathe' && (
          <Select
            title="Breathe style"
            values={['plain', 'pulse']}
            value={breatheStyle}
            onChange={setBreatheStyle}
          />
        )}
        {type === 'variableColor' && (
          <>
            <Select
              title="Iteration"
              values={['iterative', 'cumulative']}
              value={iteration}
              onChange={setIteration}
            />
            <Select
              title="Inactive layers"
              values={['hide', 'dim']}
              value={inactiveLayers}
              onChange={setInactiveLayers}
            />
          </>
        )}
        {(type === 'variableColor' || type === 'drawOff') && (
          <ToggleSetting
            title="Reverse"
            hint="Reverse the variable-color cycle or the draw-off direction."
            value={reversing}
            onValueChange={setReversing}
          />
        )}
        <PanelDivider />
        <Select
          title="Speed"
          values={['0.5', '1', '2']}
          value={speed}
          onChange={setSpeed}
        />
        <ToggleSetting
          title="Continuous repetition · iOS 18"
          hint="Keep repeating with a continuous intro, loop and outro when supported."
          value={continuous}
          onValueChange={setContinuous}
        />
        {!continuous && (
          <>
            <Select
              title="Play count"
              values={['1', '3', 'forever']}
              value={repeat}
              onChange={setRepeat}
            />
            <Select
              title="Repeat delay · iOS 18"
              values={['0', '0.5', '1', '2']}
              value={repeatDelay}
              onChange={setRepeatDelay}
            />
          </>
        )}
        <ToggleSetting
          title="Animate state changes"
          hint="Animate when applying or removing the effect."
          value={animated}
          onValueChange={setAnimated}
        />
        <ToggleSetting
          title="Respect Reduce Motion"
          hint="Honor the device's accessibility motion preference."
          value={respectReduceMotion}
          onValueChange={setRespectReduceMotion}
        />
      </ControlPanel>

      <ControlPanel>
        <Select
          title="Content transition"
          values={['none', 'automatic', 'replace', 'magicReplace']}
          value={transition}
          onChange={setTransition}
          hint="Change the symbol name above to see the transition. Magic Replace requires iOS 18."
        />
        <Select
          title="Replace direction"
          values={['downUp', 'upUp', 'offUp']}
          value={transitionDirection}
          onChange={setTransitionDirection}
        />
      </ControlPanel>

      <Text style={playgroundStyles.caption}>
        iOS {iosVersion}:{' '}
        {iosVersion >= 26
          ? 'All presets are available.'
          : iosVersion >= 18
            ? 'Draw On/Off, variable draw and gradients require iOS 26.'
            : 'Wiggle, Rotate, Breathe and advanced repetition require iOS 18; draw effects and gradients require iOS 26.'}{' '}
        Scale and visibility effects hold their state while active. Animation
        details depend on each symbol's layer annotations.
      </Text>
      <ControlPanel>
        <Setting
          title="Intrinsic sizing"
          hint="These symbols have no explicit frame. Fabric measures each symbol at its configured size."
        >
          <View style={styles.inline}>
            <SFSymbol
              name="heart.fill"
              size={16}
              color={PlatformColor('systemPinkColor')}
            />
            <SFSymbol
              name="heart.fill"
              size={28}
              color={PlatformColor('systemPinkColor')}
            />
            <SFSymbol
              name="heart.fill"
              size={40}
              color={PlatformColor('systemPinkColor')}
            />
          </View>
        </Setting>
      </ControlPanel>
    </PlaygroundPage>
  );
}

const styles = StyleSheet.create({
  preview: {
    minHeight: 250,
    padding: 24,
    gap: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  symbol: { width: 160, height: 140, alignSelf: 'center' },
  symbolName: { color: PlatformColor('secondaryLabelColor'), fontSize: 13 },
  input: {
    borderRadius: 12,
    padding: 12,
    color: PlatformColor('labelColor'),
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
    fontSize: 15,
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 20 },
});
