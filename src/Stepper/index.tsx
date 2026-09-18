import { forwardRef, useState, type ComponentRef } from 'react';
import { StyleSheet, type View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeStepperView from './StepperNativeComponent';
import type { StepperProps } from './types';

export const Stepper = forwardRef<ComponentRef<typeof View>, StepperProps>(
  function StepperRoot(
    {
      value,
      defaultValue = 0,
      minimumValue = 0,
      maximumValue = 100,
      stepValue = 1,
      isContinuous = true,
      autorepeat = true,
      wraps = false,
      disabled,
      onValueChange,
      style,
      accessibilityState,
      ...viewProps
    },
    ref
  ) {
    assertComponentEnabled('Stepper');

    const [initialValue] = useState(defaultValue);
    const [mostRecentEventCount, setMostRecentEventCount] = useState(0);
    const resolvedValue = value ?? initialValue;
    const resolvedDisabled = disabled ?? accessibilityState?.disabled ?? false;

    for (const [name, number] of Object.entries({
      value: resolvedValue,
      minimumValue,
      maximumValue,
      stepValue,
    })) {
      if (!Number.isFinite(number)) {
        throw new RangeError(
          `[TinyUI] Stepper ${name} must be a finite number.`
        );
      }
    }
    if (maximumValue < minimumValue) {
      throw new RangeError(
        '[TinyUI] Stepper maximumValue must be greater than or equal to minimumValue.'
      );
    }
    if (stepValue <= 0) {
      throw new RangeError(
        '[TinyUI] Stepper stepValue must be greater than 0.'
      );
    }

    return (
      <NativeStepperView
        {...viewProps}
        ref={ref}
        accessibilityState={{
          ...accessibilityState,
          disabled: resolvedDisabled,
        }}
        autorepeat={autorepeat}
        isContinuous={isContinuous}
        controlled={value !== undefined}
        disabled={resolvedDisabled}
        maximumValue={maximumValue}
        minimumValue={minimumValue}
        mostRecentEventCount={mostRecentEventCount}
        onChange={(event) => {
          // Acknowledge every event, even if the parent rejects a controlled
          // change by keeping the same value. Native ignores stale replies.
          setMostRecentEventCount(event.nativeEvent.eventCount);
          onValueChange?.(event.nativeEvent.value);
        }}
        stepValue={stepValue}
        style={[styles.stepper, style]}
        value={Math.min(maximumValue, Math.max(minimumValue, resolvedValue))}
        wraps={wraps}
      />
    );
  }
);

const styles = StyleSheet.create({
  stepper: { alignSelf: 'flex-start' },
});

export type { StepperProps } from './types';
