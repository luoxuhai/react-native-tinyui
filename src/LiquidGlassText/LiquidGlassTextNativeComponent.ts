import {
  codegenNativeComponent,
  type ColorValue,
  type ViewProps,
} from 'react-native';
import type {
  DirectEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeLiquidGlassTextProps extends ViewProps {
  configuration: string;
  tintColor?: ColorValue;
  onContentSizeChange?: DirectEventHandler<
    Readonly<{
      width: Double;
      height: Double;
      configuration: string;
    }>
  >;
}

export default codegenNativeComponent<NativeLiquidGlassTextProps>(
  'TinyuiLiquidGlassTextView',
  { excludedPlatforms: ['android'] }
);
