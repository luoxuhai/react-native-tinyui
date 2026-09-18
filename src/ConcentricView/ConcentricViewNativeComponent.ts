import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeConcentricViewProps extends ViewProps {
  minimumRadius?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
}

export default codegenNativeComponent<NativeConcentricViewProps>(
  'TinyuiConcentricView',
  { excludedPlatforms: ['android'] }
);
