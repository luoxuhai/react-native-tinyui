import { forwardRef, type ComponentRef } from 'react';
import { View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeTipPopoverView from './TipPopoverNativeComponent';
import type { TipPopoverProps, TipStatus } from './types';
import { validateTip } from './validation';

export const Popover = forwardRef<ComponentRef<typeof View>, TipPopoverProps>(
  function TipPopoverRoot(props, ref) {
    assertComponentEnabled('TipKit');
    validateTip(props);
    const {
      children,
      tipId,
      title,
      message,
      systemImage,
      actions,
      enabled = true,
      maxDisplayCount,
      ignoresDisplayFrequency = false,
      arrowEdge = 'auto',
      onStatusChange,
      onVisibleChange,
      onActionPress,
      onError,
      ...viewProps
    } = props;

    return (
      <NativeTipPopoverView
        {...viewProps}
        ref={ref}
        collapsable={false}
        tipId={tipId}
        title={title}
        message={message}
        systemImage={systemImage}
        actions={actions}
        enabled={enabled}
        maxDisplayCount={maxDisplayCount ?? 0}
        ignoresDisplayFrequency={ignoresDisplayFrequency}
        arrowEdge={arrowEdge}
        onTipStatusChange={({ nativeEvent }) => {
          if (nativeEvent.tipId !== tipId) return;
          if (nativeEvent.status === 'invalidated') {
            onStatusChange?.({
              status: 'invalidated',
              reason: nativeEvent.reason,
            } as TipStatus);
          } else if (
            nativeEvent.status === 'pending' ||
            nativeEvent.status === 'available'
          ) {
            onStatusChange?.({ status: nativeEvent.status });
          }
        }}
        onTipVisibleChange={({ nativeEvent }) => {
          if (nativeEvent.tipId === tipId)
            onVisibleChange?.(nativeEvent.visible);
        }}
        onTipAction={({ nativeEvent }) => {
          if (nativeEvent.tipId === tipId) {
            onActionPress?.({ id: nativeEvent.id, title: nativeEvent.title });
          }
        }}
        onTipError={({ nativeEvent }) => {
          if (nativeEvent.tipId !== tipId) return;
          const error = {
            code: nativeEvent.code,
            message: nativeEvent.message,
          };
          if (onError) onError(error);
          else
            console.warn(
              `[TinyUI] TipKit.Popover ${error.code}: ${error.message}`
            );
        }}
      >
        <View collapsable={false}>{children}</View>
      </NativeTipPopoverView>
    );
  }
);

Popover.displayName = 'TipKit.Popover';
