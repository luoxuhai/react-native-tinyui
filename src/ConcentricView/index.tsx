import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, type View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeConcentricView from './ConcentricViewNativeComponent';
import type { ConcentricViewProps } from './types';

export const ConcentricView = forwardRef<
  ComponentRef<typeof View>,
  ConcentricViewProps
>(function ConcentricViewRoot({ minimumRadius = 0, style, ...viewProps }, ref) {
  assertComponentEnabled('ConcentricView');

  if (!Number.isFinite(minimumRadius) || minimumRadius < 0) {
    throw new RangeError(
      '[TinyUI] ConcentricView minimumRadius must be a finite, nonnegative number.'
    );
  }

  return (
    <NativeConcentricView
      {...viewProps}
      ref={ref}
      minimumRadius={minimumRadius}
      style={[styles.container, style]}
    />
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});

export type { ConcentricViewProps } from './types';
