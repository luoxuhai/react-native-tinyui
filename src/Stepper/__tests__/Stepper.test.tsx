import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { StyleSheet } from 'react-native';

import { Stepper } from '..';
import type { StepperProps } from '../types';
import NativeStepperView, {
  type NativeStepperProps,
} from '../StepperNativeComponent';
import { assertComponentEnabled } from '../../utils';

jest.mock('../../utils', () => ({ assertComponentEnabled: jest.fn() }));
jest.mock('../StepperNativeComponent', () => 'TinyuiStepperView');

const roots: ReactTestRenderer[] = [];

function render(props: StepperProps = {}) {
  let root!: ReactTestRenderer;
  act(() => {
    root = create(<Stepper {...props} />);
  });
  roots.push(root);
  return {
    props: () =>
      root.root.findByType(NativeStepperView).props as NativeStepperProps,
    update: (next: StepperProps) => {
      act(() => root.update(<Stepper {...next} />));
    },
  };
}

function change(props: NativeStepperProps, value: number, eventCount: number) {
  act(() => {
    props.onChange?.({ nativeEvent: { value, eventCount } } as Parameters<
      NonNullable<NativeStepperProps['onChange']>
    >[0]);
  });
}

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  jest.clearAllMocks();
});

describe('Stepper bridge', () => {
  it('checks availability and uses UIKit defaults without stretching', () => {
    const view = render();
    expect(assertComponentEnabled).toHaveBeenCalledWith('Stepper');
    expect(view.props()).toMatchObject({
      value: 0,
      minimumValue: 0,
      maximumValue: 100,
      stepValue: 1,
      isContinuous: true,
      autorepeat: true,
      wraps: false,
      disabled: false,
      controlled: false,
      mostRecentEventCount: 0,
    });
    expect(StyleSheet.flatten(view.props().style)).toEqual({
      alignSelf: 'flex-start',
    });
  });

  it('acknowledges rejected controlled changes even when the value stays the same', () => {
    const onValueChange = jest.fn();
    const view = render({ value: 4, onValueChange });
    change(view.props(), 5, 1);
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    expect(view.props()).toMatchObject({
      value: 4,
      controlled: true,
      mostRecentEventCount: 1,
    });
    change(view.props(), 5, 2);
    expect(view.props().mostRecentEventCount).toBe(2);
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('synchronizes accepted and programmatic controlled updates without extra callbacks', () => {
    const onValueChange = jest.fn();
    const view = render({ value: 1, onValueChange });
    change(view.props(), 2, 1);
    view.update({ value: 2, onValueChange });
    expect(view.props()).toMatchObject({ value: 2, mostRecentEventCount: 1 });
    view.update({ value: 10, onValueChange });
    expect(view.props().value).toBe(10);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('keeps the uncontrolled seed stable and leaves ongoing values in UIKit', () => {
    const onValueChange = jest.fn();
    const view = render({ defaultValue: 2.5, stepValue: 0.5, onValueChange });
    change(view.props(), 3, 1);
    view.update({ defaultValue: 99, stepValue: 0.5, onValueChange });
    expect(view.props()).toMatchObject({
      value: 2.5,
      controlled: false,
      mostRecentEventCount: 1,
      stepValue: 0.5,
    });
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it('clamps supplied values, including disjoint and equal ranges', () => {
    const view = render({ value: -10, minimumValue: -5, maximumValue: 5 });
    expect(view.props().value).toBe(-5);
    view.update({ value: 3, minimumValue: 100, maximumValue: 200 });
    expect(view.props().value).toBe(100);
    view.update({ value: 300, minimumValue: 100, maximumValue: 200 });
    expect(view.props().value).toBe(200);
    view.update({ value: 20, minimumValue: 5, maximumValue: 5 });
    expect(view.props().value).toBe(5);
  });

  it('preserves behavior flags, accessibility and style', () => {
    const view = render({
      isContinuous: false,
      autorepeat: false,
      wraps: true,
      accessibilityLabel: 'Quantity',
      accessibilityHint: 'Adjust the quantity',
      accessibilityState: { disabled: true },
      style: { width: 150, alignSelf: 'center' },
      testID: 'quantity',
    });
    expect(view.props()).toMatchObject({
      isContinuous: false,
      autorepeat: false,
      wraps: true,
      accessibilityHint: 'Adjust the quantity',
      accessibilityState: { disabled: true },
      disabled: true,
      accessibilityLabel: 'Quantity',
      testID: 'quantity',
    });
    expect(StyleSheet.flatten(view.props().style)).toEqual({
      width: 150,
      alignSelf: 'center',
    });
    view.update({ disabled: false, accessibilityState: { disabled: true } });
    expect(view.props().disabled).toBe(false);
    expect(view.props().accessibilityState?.disabled).toBe(false);
    view.update({});
    expect(view.props()).toMatchObject({
      isContinuous: true,
      autorepeat: true,
      wraps: false,
      disabled: false,
    });
  });

  it.each<[StepperProps, string]>([
    [{ stepValue: 0 }, 'stepValue'],
    [{ stepValue: -1 }, 'stepValue'],
    [{ stepValue: NaN }, 'stepValue'],
    [{ value: Infinity }, 'value'],
    [{ defaultValue: NaN }, 'value'],
    [{ minimumValue: -Infinity }, 'minimumValue'],
    [{ maximumValue: Infinity }, 'maximumValue'],
    [{ minimumValue: 10, maximumValue: 5 }, 'maximumValue'],
  ])('rejects unsafe numeric props %p', (props, name) => {
    expect(() => render(props)).toThrow(new RegExp(`Stepper ${name}`));
  });
});
