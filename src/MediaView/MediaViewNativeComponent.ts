import {
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

/** Media source after resolving a bundled asset. */
export interface MediaSourceProps {
  uri?: string;
}

export interface NativeMediaViewProps extends ViewProps {
  source?: MediaSourceProps;
  resizeMode?: string;
  onLoadStart?: CodegenTypes.DirectEventHandler<null>;
  onLoad?: CodegenTypes.DirectEventHandler<null>;
  onLoadEnd?: CodegenTypes.DirectEventHandler<null>;
  onError?: CodegenTypes.DirectEventHandler<Readonly<{ error: string }>>;
}

export type MediaViewComponent = HostComponent<NativeMediaViewProps>;

export default codegenNativeComponent<NativeMediaViewProps>('TinyuiMediaView', {
  excludedPlatforms: ['android'],
});
