import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ReactElement } from 'react';
import { DynamicColorIOS, StyleSheet } from 'react-native';

import { LiquidGlassText } from '..';
import type { LiquidGlassTextProps } from '../types';
import type { NativeLiquidGlassTextProps } from '../LiquidGlassTextNativeComponent';
import { assertComponentEnabled } from '../../utils';

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
    expect(props.configuration).toEqual({
      text: 'welcome.key\n你好',
      effect: 'clear',
      interactive: false,
      multilineTextAlignment: 'leading',
    });
    expect(props.accessibilityLabel).toBe('welcome.key\n你好');
    expect(props.accessibilityRole).toBe('text');
    expect(props.style).toBeUndefined();
  });

  it('preserves supplied effect, interaction, dynamic tint and design', () => {
    const tint = DynamicColorIOS({ light: '#00ffff', dark: '#ff00ff' });
    const text = '你好，玻璃！';
    const props = render({
      text,
      effect: 'regular',
      tint,
      interactive: true,
      fontDesign: 'rounded',
      textStyle: { fontSize: 48, fontWeight: '800' },
      multilineTextAlignment: 'trailing',
      style: { width: 300 },
    });
    expect(props.configuration).toEqual({
      text,
      effect: 'regular',
      interactive: true,
      fontDesign: 'rounded',
      textStyle: {
        fontSize: 48,
        fontWeight: 'heavy',
      },
      multilineTextAlignment: 'trailing',
    });
    expect(props.tintColor).toBe(tint);
    expect(props.accessibilityLabel).toBe(text);
    expect(StyleSheet.flatten(props.style)).toEqual({ width: 300 });
  });

  it('maps flattened React Native text styles to native configuration', () => {
    const textStyle = StyleSheet.create({
      glass: {
        color: '#12AACC',
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: '700',
        letterSpacing: 1.5,
        textAlign: 'center',
      },
    });
    const props = render({
      text: 'Styled glass',
      textStyle: [textStyle.glass, { fontSize: 40 }],
    });

    expect(props.configuration).toMatchObject({
      textStyle: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: 40,
        fontStyle: 'italic',
        fontWeight: 'bold',
        letterSpacing: 1.5,
      },
      multilineTextAlignment: 'center',
    });
    expect(props.tintColor).toBe('#12AACC');
  });

  it('prefers dedicated alignment and tint over textStyle equivalents', () => {
    const props = render({
      text: 'Overrides',
      tint: '#FFFFFF',
      multilineTextAlignment: 'trailing',
      textStyle: {
        color: '#000000',
        fontWeight: '300',
        textAlign: 'center',
      },
    });

    expect(props.configuration).toMatchObject({
      textStyle: { fontWeight: 'light' },
      multilineTextAlignment: 'trailing',
    });
    expect(props.tintColor).toBe('#FFFFFF');
  });

  it('resets tint and modifiers when they are removed', () => {
    const props = render({ text: '', effect: 'identity' });
    expect(props.tintColor).toBeUndefined();
    expect(props.configuration).toMatchObject({
      text: '',
      effect: 'identity',
      interactive: false,
    });
    expect(props.accessibilityLabel).toBe('');
  });
});
