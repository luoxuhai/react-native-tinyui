import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, useWindowDimensions, type View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeSFSymbolView from './SFSymbolNativeComponent';
import { serializeSFSymbol } from './options';
import type { SFSymbolProps } from './types';

export const SFSymbol = forwardRef<ComponentRef<typeof View>, SFSymbolProps>(
  function SFSymbolRoot(
    {
      name,
      source,
      size,
      weight,
      scale,
      allowFontScaling,
      maxFontSizeMultiplier,
      renderingMode,
      color,
      paletteColors,
      variableValue,
      variableValueMode,
      colorRenderingMode,
      effect,
      contentTransition,
      respectReduceMotion = true,
      resizeMode = 'center',
      style,
      accessible = false,
      accessibilityRole = 'image',
      ...viewProps
    },
    ref
  ) {
    assertComponentEnabled('SFSymbol');
    const { fontScale } = useWindowDimensions();
    const serialized = serializeSFSymbol(
      {
        name,
        source,
        size,
        weight,
        scale,
        allowFontScaling,
        maxFontSizeMultiplier,
        renderingMode,
        color,
        paletteColors,
        variableValue,
        variableValueMode,
        colorRenderingMode,
        effect,
        contentTransition,
      },
      fontScale
    );

    return (
      <NativeSFSymbolView
        {...viewProps}
        {...serialized}
        ref={ref}
        accessible={accessible}
        accessibilityRole={accessibilityRole}
        respectReduceMotion={respectReduceMotion}
        resizeMode={resizeMode}
        style={[styles.symbol, style]}
      />
    );
  }
);

const styles = StyleSheet.create({ symbol: { alignSelf: 'flex-start' } });

export type {
  SFSymbolContentTransition,
  SFSymbolEffect,
  SFSymbolEffectOptions,
  SFSymbolProps,
  SFSymbolRenderingMode,
  SFSymbolScale,
  SFSymbolWeight,
} from './types';
