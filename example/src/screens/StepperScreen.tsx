import { useState } from 'react';
import { PlatformColor, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stepper } from 'react-native-tinyui';

import {
  Choices,
  ControlPanel,
  PanelDivider,
  PlaygroundPage,
  Setting,
  ToggleSetting,
  playgroundStyles,
} from '../components/Playground';

const ranges = [
  { label: '0…10', minimum: 0, maximum: 10 },
  { label: '−5…5', minimum: -5, maximum: 5 },
  { label: '100…200', minimum: 100, maximum: 200 },
] as const;
const steps = [0.5, 1, 5] as const;

export function StepperScreen() {
  const [value, setValue] = useState(5);
  const [rangeIndex, setRangeIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(1);
  const [isContinuous, setIsContinuous] = useState(true);
  const [autorepeat, setAutorepeat] = useState(true);
  const [wraps, setWraps] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [acceptChanges, setAcceptChanges] = useState(true);
  const [lastValue, setLastValue] = useState<number>();
  const [uncontrolledValue, setUncontrolledValue] = useState(3);
  const range = ranges[rangeIndex] ?? ranges[0];
  const step = steps[stepIndex] ?? steps[1];

  return (
    <PlaygroundPage
      title={'One step\nat a time.'}
      description="A native UIStepper. Tap or hold either button, then explore its range and repeat behavior."
    >
      <View style={styles.preview}>
        <Text style={playgroundStyles.caption}>CONTROLLED VALUE</Text>
        <Text style={styles.value} testID="stepper-value">
          {value}
        </Text>
        <Stepper
          accessibilityLabel="Preview value"
          autorepeat={autorepeat}
          disabled={disabled}
          isContinuous={isContinuous}
          maximumValue={range.maximum}
          minimumValue={range.minimum}
          onValueChange={(nextValue) => {
            setLastValue(nextValue);
            if (acceptChanges) setValue(nextValue);
          }}
          stepValue={step}
          style={styles.stepper}
          testID="stepper-preview"
          value={value}
          wraps={wraps}
        />
        <Text style={playgroundStyles.caption}>
          Last change: {lastValue ?? 'Tap + or − to begin'}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setValue(range.minimum)}
          style={playgroundStyles.trigger}
        >
          <Text style={playgroundStyles.triggerLabel}>Set to minimum</Text>
        </Pressable>
      </View>

      <ControlPanel>
        <Setting
          title="Range"
          hint="Changing the range clamps the current value."
        >
          <Choices
            label="Value range"
            labels={ranges.map((item) => item.label)}
            onSelect={(index) => {
              const next = ranges[index] ?? ranges[0];
              setRangeIndex(index);
              setValue((current) =>
                Math.min(next.maximum, Math.max(next.minimum, current))
              );
            }}
            selected={rangeIndex}
          />
        </Setting>
        <PanelDivider />
        <Setting title="Step amount">
          <Choices
            label="Step amount"
            labels={steps.map(String)}
            onSelect={setStepIndex}
            selected={stepIndex}
          />
        </Setting>
        <PanelDivider />
        <ToggleSetting
          title="Continuous events"
          hint="When off, the value is reported only after you release the button."
          onValueChange={setIsContinuous}
          value={isContinuous}
        />
        <PanelDivider />
        <ToggleSetting
          title="Autorepeat"
          hint="Keep stepping while a button is held."
          onValueChange={setAutorepeat}
          value={autorepeat}
        />
        <PanelDivider />
        <ToggleSetting
          title="Wrap at bounds"
          hint="Step beyond either end to continue from the opposite bound."
          onValueChange={setWraps}
          value={wraps}
        />
        <PanelDivider />
        <ToggleSetting
          title="Disabled"
          hint="Prevent changes from either button."
          onValueChange={setDisabled}
          value={disabled}
        />
        <PanelDivider />
        <ToggleSetting
          title="Accept changes"
          hint="Turn off to keep the controlled value fixed while still receiving events."
          onValueChange={setAcceptChanges}
          value={acceptChanges}
        />
      </ControlPanel>

      <ControlPanel>
        <Setting
          title="Uncontrolled"
          value={String(uncontrolledValue)}
          hint="Starts at 3. UIKit keeps the value without a value prop."
        >
          <Stepper
            accessibilityLabel="Uncontrolled value"
            defaultValue={3}
            maximumValue={10}
            onValueChange={setUncontrolledValue}
            testID="stepper-uncontrolled"
          />
        </Setting>
      </ControlPanel>
    </PlaygroundPage>
  );
}

const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    gap: 16,
    padding: 24,
    borderRadius: 22,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  value: {
    color: PlatformColor('labelColor'),
    fontSize: 56,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  stepper: { alignSelf: 'center' },
});
