import { forwardRef, type ComponentRef } from 'react';
import type { View as ReactNativeView } from 'react-native';

import { assertComponentEnabled } from '../utils';
import NativeTipView from './TipViewNativeComponent';
import type { TipViewProps, TipInvalidationEvent } from './types';
import { validateTip } from './validation';
import { useTipGroup } from './Group';

export const View = forwardRef<
  ComponentRef<typeof ReactNativeView>,
  TipViewProps
>(function TipViewRoot(props, ref) {
  assertComponentEnabled('TipKit');
  validateTip(props, 'TipKit.View');
  const group = useTipGroup(props.tipId);
  const {
    tipId,
    title,
    message,
    systemImage,
    actions,
    enabled = true,
    showsCloseButton = group?.showsCloseButton ?? true,
    maxDisplayCount,
    ignoresDisplayFrequency = false,
    arrowEdge = 'none',
    onActionPress,
    onInvalidated,
    onError,
    ...viewProps
  } = props;

  return (
    <NativeTipView
      {...viewProps}
      children={undefined}
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
          console.warn(`[TinyUI] TipKit.View ${error.code}: ${error.message}`);
      }}
    />
  );
});

View.displayName = 'TipKit.View';
