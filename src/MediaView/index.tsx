import { forwardRef, type ComponentRef } from 'react';
import { Image } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeMediaView from './MediaViewNativeComponent';
import type { MediaViewComponent, MediaViewProps } from './types';

/** Native images and muted, automatically looping videos on iOS. */
export const MediaView = forwardRef<
  ComponentRef<MediaViewComponent>,
  MediaViewProps
>(function MediaViewRoot(
  { source, resizeMode = 'contain', ...viewProps },
  ref
) {
  assertComponentEnabled('MediaView');

  const uri =
    typeof source === 'object'
      ? source.uri
      : (Image.resolveAssetSource(source)?.uri ?? '');

  return (
    <NativeMediaView
      {...viewProps}
      ref={ref}
      source={{ uri }}
      resizeMode={resizeMode}
    />
  );
});

export type {
  ContentMode,
  MediaSourceProps,
  MediaViewComponent,
  MediaViewProps,
  ResizeMode,
} from './types';

export default MediaView;
