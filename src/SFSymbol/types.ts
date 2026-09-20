import type { ColorValue, ViewProps } from 'react-native';

export type SFSymbolWeight =
  | 'unspecified'
  | 'ultraLight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

export type SFSymbolScale =
  'default' | 'unspecified' | 'small' | 'medium' | 'large';
export type SFSymbolRenderingMode =
  'automatic' | 'monochrome' | 'hierarchical' | 'palette' | 'multicolor';

export interface SFSymbolEffectOptions {
  /** Positive speed multiplier. Defaults to the system speed (1). */
  speed?: number;
  /** Play count, forever, or false for one play. Omit for the system default. */
  repeat?: number | 'forever' | false;
  /** iOS 18+. Continuous repeats forever; periodic supports count and delay. */
  repeatBehavior?: 'periodic' | 'continuous';
  /** Seconds between periodic repetitions (iOS 18+). */
  repeatDelay?: number;
}

interface EffectPlayback {
  /** Whether this effect is applied. Defaults to true. */
  active?: boolean;
  /** Change this value to replay the same effect. Stable values do not replay. */
  trigger?: string | number;
  /** Animate applying/removing the effect. Defaults to true. */
  animated?: boolean;
  options?: SFSymbolEffectOptions;
}

type LayerBehavior = 'byLayer' | 'wholeSymbol';
type VerticalDirection = 'up' | 'down';

/** Only modifiers supported by each Apple preset are accepted. */
export type SFSymbolEffect = EffectPlayback &
  (
    | { type: 'pulse'; scope?: LayerBehavior }
    | {
        type: 'bounce' | 'scale' | 'appear' | 'disappear';
        direction?: VerticalDirection;
        scope?: LayerBehavior;
      }
    | {
        type: 'variableColor';
        iteration?: 'iterative' | 'cumulative';
        reversing?: boolean;
        inactiveLayers?: 'hide' | 'dim';
      }
    | {
        /** iOS 18+. */
        type: 'wiggle';
        direction?:
          | VerticalDirection
          | 'left'
          | 'right'
          | 'forward'
          | 'backward'
          | 'clockwise'
          | 'counterClockwise';
        /** Custom angle in degrees, clockwise from +x; overrides direction. */
        angle?: number;
        scope?: LayerBehavior;
      }
    | {
        /** iOS 18+. */
        type: 'rotate';
        direction?: 'clockwise' | 'counterClockwise';
        scope?: LayerBehavior;
      }
    | {
        /** iOS 18+. */
        type: 'breathe';
        style?: 'plain' | 'pulse';
        scope?: LayerBehavior;
      }
    | {
        /** iOS 26+. */
        type: 'drawOn';
        scope?: LayerBehavior | 'individually';
      }
    | {
        /** iOS 26+. */
        type: 'drawOff';
        scope?: LayerBehavior | 'individually';
        reversed?: boolean;
      }
  );

export interface SFSymbolContentTransition {
  /** Magic Replace requires iOS 18; earlier versions use the configured replace. */
  type: 'automatic' | 'replace' | 'magicReplace';
  /** Replace style, also used as the Magic Replace fallback. */
  direction?: 'downUp' | 'upUp' | 'offUp';
  scope?: LayerBehavior;
  /** Positive transition speed multiplier. Defaults to 1. */
  speed?: number;
}

export interface SFSymbolProps extends Omit<ViewProps, 'children'> {
  /** Full SF Symbol name, including variants such as .circle.fill. */
  name: string;
  /** Load a system symbol (default) or a custom symbol in the app asset catalog. */
  source?: 'system' | 'asset';
  /** Point size before font scaling. Defaults to 17. */
  size?: number;
  weight?: SFSymbolWeight;
  scale?: SFSymbolScale;
  /** Apply React Native's fontScale to the point size. Defaults to true. */
  allowFontScaling?: boolean;
  /** Maximum font scale, >= 1. Zero/undefined means no limit. */
  maxFontSizeMultiplier?: number;
  renderingMode?: SFSymbolRenderingMode;
  /** Tint / primary hierarchical color. Defaults to the semantic label color. */
  color?: ColorValue;
  /** One to three colors for palette rendering, in primary-to-tertiary order. */
  paletteColors?: readonly [ColorValue, ColorValue?, ColorValue?];
  /** Variable color/draw progress, from 0 to 1. Omit for the symbol default. */
  variableValue?: number;
  /** iOS 26+. Earlier versions retain the system's variable color behavior. */
  variableValueMode?: 'automatic' | 'color' | 'draw';
  /** iOS 26+. Earlier versions use flat colors. */
  colorRenderingMode?: 'automatic' | 'flat' | 'gradient';
  /** Native image fitting within an explicitly sized frame. Defaults to center. */
  resizeMode?: 'center' | 'contain' | 'cover' | 'stretch';
  /** One preset or multiple distinct presets. Unsupported OS presets are ignored. */
  effect?: SFSymbolEffect | readonly SFSymbolEffect[];
  /** Animate changes to the name or image configuration. Omit to update instantly. */
  contentTransition?: SFSymbolContentTransition;
  /** Honor the system Reduce Motion setting. Defaults to true. */
  respectReduceMotion?: boolean;
}
