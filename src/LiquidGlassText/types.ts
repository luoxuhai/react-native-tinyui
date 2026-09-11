import type { ColorValue, ViewProps } from 'react-native';

export type LiquidGlassTextFontDesign =
  'default' | 'serif' | 'monospaced' | 'rounded';

export type LiquidGlassTextFontWeight =
  | 'ultraLight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

export type LiquidGlassTextFontStyle =
  | 'largeTitle'
  | 'title'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'subheadline'
  | 'body'
  | 'callout'
  | 'footnote'
  | 'caption'
  | 'caption2';

export type LiquidGlassTextFont =
  | LiquidGlassTextFontStyle
  | Readonly<{
      size: number;
      weight?: LiquidGlassTextFontWeight;
      design?: LiquidGlassTextFontDesign;
      /** PostScript name of a font installed in the containing app. */
      family?: string;
    }>;

export type LiquidGlassTextGlass =
  | 'clear'
  | 'regular'
  | 'identity'
  | Readonly<{
      effect?: 'clear' | 'regular' | 'identity';
      tint?: ColorValue;
      interactive?: boolean;
    }>;

export interface LiquidGlassTextProps extends Omit<ViewProps, 'children'> {
  /** Text to display. Pass translated strings from JavaScript if needed. */
  text: string;
  /** Defaults to clear. Native glass requires iOS 26+. */
  glass?: LiquidGlassTextGlass;
  /** SwiftUI text style or an explicit system/custom font. Defaults to body. */
  font?: LiquidGlassTextFont;
  /** Overrides the weight specified in font. */
  fontWeight?: LiquidGlassTextFontWeight;
  /** Overrides the design specified in font. */
  fontDesign?: LiquidGlassTextFontDesign;
  /** Aligns explicit newline-separated lines. Defaults to leading. */
  multilineTextAlignment?: 'leading' | 'center' | 'trailing';
}
