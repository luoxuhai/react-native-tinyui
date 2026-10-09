import { forwardRef, type ComponentRef } from 'react';
import { View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeTipPopoverView from './TipPopoverNativeComponent';
import type { TipPopoverProps } from './types';
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
