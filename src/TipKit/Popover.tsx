import { forwardRef, type ComponentRef } from 'react';
import { View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeTipPopoverView from './TipPopoverNativeComponent';
import type { TipPopoverProps, TipInvalidationEvent } from './types';
import { validateTip } from './validation';
import { useTipGroup } from './Group';

export const Popover = forwardRef<ComponentRef<typeof View>, TipPopoverProps>(
  function TipPopoverRoot(props, ref) {
    assertComponentEnabled('TipKit');
    validateTip(props);
    const group = useTipGroup(props.tipId);
    const {
      children,
      tipId,
      title,
      message,
      systemImage,
      actions,
      enabled = true,
      showsCloseButton = group?.showsCloseButton ?? true,
      maxDisplayCount,
      ignoresDisplayFrequency = false,
      arrowEdge = 'auto',
      onActionPress,
      onInvalidated,
      dismissOnOutsidePress = group?.dismissOnOutsidePress ?? true,
      invalidateOnOutsideDismiss = group?.invalidateOnOutsideDismiss ?? false,
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
        showsCloseButton={showsCloseButton}
        enabled={
          enabled && (!group || (group.enabled && group.currentTipId === tipId))
        }
        dismissOnOutsidePress={dismissOnOutsidePress}
        invalidateOnOutsideDismiss={invalidateOnOutsideDismiss}
        maxDisplayCount={maxDisplayCount ?? 0}
        ignoresDisplayFrequency={ignoresDisplayFrequency}
        arrowEdge={arrowEdge}
        onTipAction={({ nativeEvent }) => {
          if (nativeEvent.tipId === tipId) {
            onActionPress?.({ id: nativeEvent.id, title: nativeEvent.title });
          }
        }}
        onTipInvalidated={({ nativeEvent }) => {
          if (nativeEvent.tipId !== tipId) return;
          group?.complete(tipId);
          onInvalidated?.({
            reason: nativeEvent.reason as TipInvalidationEvent['reason'],
          });
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
