import type { ViewProps } from 'react-native';

export interface StepperProps extends Omit<ViewProps, 'children'> {
  /** Controlled value. Update it from onValueChange to accept user changes. */
  value?: number;
  /** Initial uncontrolled value. Defaults to 0. */
  defaultValue?: number;
  /** Lower bound. Defaults to 0. */
  minimumValue?: number;
  /** Upper bound, greater than or equal to minimumValue. Defaults to 100. */
  maximumValue?: number;
  /** Positive increment/decrement amount. Defaults to 1. */
  stepValue?: number;
  /** Emit changes while interacting, rather than only on release. Defaults to true. */
  isContinuous?: boolean;
  /** Repeatedly step while holding either button. Defaults to true. */
  autorepeat?: boolean;
  /** Wrap between the bounds instead of stopping at them. Defaults to false. */
  wraps?: boolean;
  /** Disable user interaction. Defaults to false. */
  disabled?: boolean;
  /** Called with the new value after a user interaction. */
  onValueChange?: (value: number) => void;
}
