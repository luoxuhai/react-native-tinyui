import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ReactElement } from 'react';
import { DynamicColorIOS, StyleSheet } from 'react-native';

import { LiquidGlassText } from '..';
import type { LiquidGlassTextProps } from '../types';
import type { NativeLiquidGlassTextProps } from '../LiquidGlassTextNativeComponent';
import { assertComponentEnabled } from '../../utils';

const mockSetMeasurement = jest.fn();

jest.mock('react', () => ({
  ...jest.requireActual<typeof import('react')>('react'),
  useState: () => [{ width: 120, height: 40 }, mockSetMeasurement],
}));
jest.mock('../../utils', () => ({
  assertComponentEnabled: jest.fn(),
}));
jest.mock(
  '../LiquidGlassTextNativeComponent',
  () => 'TinyuiLiquidGlassTextView'
);

// Exercise the bridge boundary without mounting a Fabric view in Node.
function render(props: LiquidGlassTextProps) {
  return (
    LiquidGlassText as unknown as {
      render: (
        props: LiquidGlassTextProps,
        ref: null
      ) => ReactElement<NativeLiquidGlassTextProps>;
    }
  ).render(props, null).props;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LiquidGlassText bridge', () => {
  it('checks native availability and sends literal text with upstream defaults', () => {
    const props = render({ text: 'welcome.key\n你好' });
    expect(assertComponentEnabled).toHaveBeenCalledWith('LiquidGlassText');
    expect(JSON.parse(props.configuration)).toEqual({
      text: 'welcome.key\n你好',
      glass: 'clear',
      interactive: false,
      font: { style: 'body' },
      multilineTextAlignment: 'leading',
    });
    expect(props.accessibilityLabel).toBe('welcome.key\n你好');
    expect(props.accessibilityRole).toBe('text');
    expect(StyleSheet.flatten(props.style)).toEqual({ width: 120, height: 40 });
  });

  it('preserves supplied text, dynamic tint and font overrides', () => {
    const tint = DynamicColorIOS({ light: '#00ffff', dark: '#ff00ff' });
    const text = '你好，玻璃！';
    const props = render({
      text,
      glass: { effect: 'regular', tint, interactive: true },
      font: { size: 48, weight: 'bold', design: 'serif' },
      fontWeight: 'heavy',
      fontDesign: 'rounded',
      multilineTextAlignment: 'trailing',
      style: { width: 300 },
    });
    expect(JSON.parse(props.configuration)).toEqual({
      text,
      glass: 'regular',
      interactive: true,
      font: { size: 48, weight: 'bold', design: 'serif' },
      fontWeight: 'heavy',
      fontDesign: 'rounded',
      multilineTextAlignment: 'trailing',
    });
    expect(props.tintColor).toBe(tint);
    expect(props.accessibilityLabel).toBe(text);
    expect(StyleSheet.flatten(props.style)).toEqual({ width: 300, height: 40 });
  });

  it('ignores stale native measurements after text changes', () => {
    const oldProps = render({ text: 'Old' });
    const props = render({ text: 'New', accessibilityLabel: 'Custom label' });
    const size = { width: 240, height: 80 };
    props.onContentSizeChange?.({
      nativeEvent: { ...size, configuration: oldProps.configuration },
    });
    expect(mockSetMeasurement).not.toHaveBeenCalled();
    props.onContentSizeChange?.({
      nativeEvent: { ...size, configuration: props.configuration },
    });
    const update = mockSetMeasurement.mock.calls[0]?.[0] as (
      previous: typeof size
    ) => typeof size;
    expect(update({ width: 0, height: 0 })).toEqual(size);
    expect(update(size)).toBe(size);
    expect(props.accessibilityLabel).toBe('Custom label');
  });

  it('resets tint and modifiers when they are removed', () => {
    const props = render({ text: '', glass: 'identity' });
    expect(props.tintColor).toBeUndefined();
    expect(JSON.parse(props.configuration)).toMatchObject({
      text: '',
      glass: 'identity',
      interactive: false,
      font: { style: 'body' },
    });
    expect(props.accessibilityLabel).toBe('');
  });
});
