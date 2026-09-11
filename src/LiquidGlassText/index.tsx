import { forwardRef, useState, type ComponentRef } from 'react';
import type { View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import type { LiquidGlassTextProps } from './types';
import NativeLiquidGlassTextView from './LiquidGlassTextNativeComponent';

export const LiquidGlassText = forwardRef<
  ComponentRef<typeof View>,
  LiquidGlassTextProps
>(function LiquidGlassTextRoot(
  {
    text,
    glass = 'clear',
    font = 'body',
    fontWeight,
    fontDesign,
    multilineTextAlignment = 'leading',
    style,
    accessibilityLabel,
    accessible = true,
    accessibilityRole = 'text',
    ...viewProps
  },
  ref
) {
  assertComponentEnabled('LiquidGlassText');

  const [measurement, setMeasurement] = useState({
    width: 0,
    height: 0,
  });
  const configuration = JSON.stringify({
    text,
    glass: typeof glass === 'string' ? glass : (glass.effect ?? 'clear'),
    interactive: typeof glass === 'object' && (glass.interactive ?? false),
    font: typeof font === 'string' ? { style: font } : font,
    fontWeight,
    fontDesign,
    multilineTextAlignment,
  });

  return (
    <NativeLiquidGlassTextView
      {...viewProps}
      ref={ref}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? text}
      configuration={configuration}
      tintColor={typeof glass === 'object' ? glass.tint : undefined}
      style={[{ width: measurement.width, height: measurement.height }, style]}
      onContentSizeChange={({ nativeEvent }) => {
        // Ignore measurements queued before a newer text/font update.
        if (nativeEvent.configuration !== configuration) {
          return;
        }
        setMeasurement((previous) =>
          previous.width === nativeEvent.width &&
          previous.height === nativeEvent.height
            ? previous
            : {
                width: nativeEvent.width,
                height: nativeEvent.height,
              }
        );
      }}
    />
  );
});

export type {
  LiquidGlassTextFont,
  LiquidGlassTextFontDesign,
  LiquidGlassTextFontStyle,
  LiquidGlassTextFontWeight,
  LiquidGlassTextGlass,
  LiquidGlassTextProps,
} from './types';
