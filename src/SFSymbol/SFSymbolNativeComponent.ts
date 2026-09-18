import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeSFSymbolProps extends ViewProps {
  configuration: CodegenTypes.UnsafeMixed;
  effects: CodegenTypes.UnsafeMixed;
  contentTransition: CodegenTypes.UnsafeMixed;
  resizeMode?: CodegenTypes.WithDefault<string, 'center'>;
  respectReduceMotion?: CodegenTypes.WithDefault<boolean, true>;
}

export default codegenNativeComponent<NativeSFSymbolProps>(
  'TinyuiSFSymbolView',
  {
    excludedPlatforms: ['android'],
  }
);
