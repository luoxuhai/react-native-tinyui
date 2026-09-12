import type { ColorValue, StyleProp, TextStyle, ViewProps } from 'react-native';

export type LiquidGlassTextFontDesign =
  'default' | 'serif' | 'monospaced' | 'rounded';

export type LiquidGlassTextEffect = 'clear' | 'regular' | 'identity';

/** React Native text styles supported by the native glass renderer. */
export type LiquidGlassTextStyle = Readonly<
  Pick<
    TextStyle,
    | 'color'
    | 'fontFamily'
    | 'fontSize'
    | 'fontStyle'
    | 'fontWeight'
    | 'letterSpacing'
    | 'textAlign'
  >
>;

export interface LiquidGlassTextProps extends Omit<ViewProps, 'children'> {
  /** Text to display. Pass translated strings from JavaScript if needed. */
  text: string;
  /** Glass effect. Defaults to clear. Native glass requires iOS 26+. */
  effect?: LiquidGlassTextEffect;
  /** Glass tint and fallback text color. */
  tint?: ColorValue;
  /** Whether the glass responds to pointer and touch interaction. */
  interactive?: boolean;
  /** Overrides the system font design. */
  fontDesign?: LiquidGlassTextFontDesign;
  /** Familiar React Native text styles. Explicit alignment takes precedence. */
  textStyle?: StyleProp<LiquidGlassTextStyle>;
  /** Aligns explicit newline-separated lines. Defaults to leading. */
  multilineTextAlignment?: 'leading' | 'center' | 'trailing';
}
