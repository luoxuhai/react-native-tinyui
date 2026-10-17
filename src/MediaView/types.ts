import type { ImageRequireSource } from 'react-native';

import type { NativeMediaViewProps } from './MediaViewNativeComponent';

export type ResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

/** @deprecated Use ResizeMode instead. */
export type ContentMode = ResizeMode;

export interface MediaViewProps extends Omit<
  NativeMediaViewProps,
  'source' | 'resizeMode'
> {
  /** Bundled image/video asset or a local/remote URI. */
  source: ImageRequireSource | { uri: string };
  /** How the media fits its frame. Defaults to contain. */
  resizeMode?: ResizeMode;
}

export type {
  MediaSourceProps,
  MediaViewComponent,
} from './MediaViewNativeComponent';
