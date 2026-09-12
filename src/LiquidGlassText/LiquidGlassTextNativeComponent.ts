import {
  codegenNativeComponent,
  type CodegenTypes,
  type ColorValue,
  type ViewProps,
} from 'react-native';

export interface NativeLiquidGlassTextProps extends ViewProps {
  configuration: CodegenTypes.UnsafeMixed;
  tintColor?: ColorValue;
}

export default codegenNativeComponent<NativeLiquidGlassTextProps>(
  'TinyuiLiquidGlassTextView',
  { excludedPlatforms: ['android'] }
);
