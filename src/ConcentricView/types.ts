import type { ViewProps } from 'react-native';

export interface ConcentricViewProps extends ViewProps {
  /** Fixed fallback radius on iOS < 26. Defaults to 0. Ignored on iOS 26+. */
  minimumRadius?: number;
}
