import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, type TextStyle, type View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import type { LiquidGlassTextProps } from './types';
import NativeLiquidGlassTextView from './LiquidGlassTextNativeComponent';

function normalizeFontWeight(
  fontWeight: TextStyle['fontWeight']
): string | undefined {
  if (fontWeight == null) {
    return undefined;
  }

  const value = String(fontWeight);
  const aliases: Readonly<Record<string, string>> = {
    'normal': 'regular',
    'ultralight': 'ultraLight',
    'condensed': 'regular',
    'condensedBold': 'bold',
    '100': 'ultraLight',
    '200': 'thin',
    '300': 'light',
    '400': 'regular',
    '500': 'medium',
    '600': 'semibold',
    '700': 'bold',
    '800': 'heavy',
    '900': 'black',
  };
  return aliases[value] ?? value;
}

function resolveAlignment(
  textAlign: TextStyle['textAlign']
): 'leading' | 'center' | 'trailing' | undefined {
  switch (textAlign) {
    case 'center':
      return 'center';
    case 'right':
      return 'trailing';
    case 'left':
      return 'leading';
    default:
      return undefined;
  }
}

export const LiquidGlassText = forwardRef<
  ComponentRef<typeof View>,
  LiquidGlassTextProps
>(function LiquidGlassTextRoot(
  {
    text,
    effect = 'clear',
    tint,
    interactive = false,
    fontDesign,
    textStyle,
    multilineTextAlignment,
    style,
    accessibilityLabel,
    accessible = true,
    accessibilityRole = 'text',
    ...viewProps
  },
  ref
) {
  assertComponentEnabled('LiquidGlassText');

  const flattenedTextStyle = StyleSheet.flatten(textStyle);
  const normalizedTextStyle = flattenedTextStyle
    ? {
        fontSize: flattenedTextStyle.fontSize,
        fontFamily: flattenedTextStyle.fontFamily,
        fontWeight: normalizeFontWeight(flattenedTextStyle.fontWeight),
        fontStyle: flattenedTextStyle.fontStyle,
        letterSpacing: flattenedTextStyle.letterSpacing,
      }
    : undefined;
  const resolvedAlignment =
    multilineTextAlignment ??
    resolveAlignment(flattenedTextStyle?.textAlign) ??
    'leading';

  const configuration = {
    text,
    effect,
    interactive,
    fontDesign,
    ...(normalizedTextStyle ? { textStyle: normalizedTextStyle } : {}),
    multilineTextAlignment: resolvedAlignment,
  };
  return (
    <NativeLiquidGlassTextView
      {...viewProps}
      ref={ref}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? text}
      configuration={configuration}
      tintColor={tint ?? flattenedTextStyle?.color}
      style={style}
    />
  );
});

export type {
  LiquidGlassTextFontDesign,
  LiquidGlassTextEffect,
  LiquidGlassTextProps,
  LiquidGlassTextStyle,
} from './types';
