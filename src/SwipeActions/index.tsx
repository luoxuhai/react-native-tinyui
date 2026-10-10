import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import { serializeSwipeActions } from './actions';
import NativeSwipeActionsView from './SwipeActionsNativeComponent';
import type { SwipeActionsProps } from './types';

export const SwipeActions = forwardRef<
  ComponentRef<typeof View>,
  SwipeActionsProps
>(function SwipeActionsRoot(
  {
    actions,
    children,
    contentContainerStyle,
    edge = 'trailing',
    allowsFullSwipe = true,
    disabled = false,
    style,
    ...viewProps
  },
  ref
) {
  assertComponentEnabled('SwipeActions');

  return (
    <NativeSwipeActionsView
      {...viewProps}
      ref={ref}
      actionsConfig={serializeSwipeActions(actions)}
      edge={edge}
      allowsFullSwipe={allowsFullSwipe}
      disabled={disabled}
      style={[styles.container, style]}
    >
      <View collapsable={false} style={[styles.content, contentContainerStyle]}>
        {children}
      </View>
    </NativeSwipeActionsView>
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  content: { flexGrow: 1 },
});

export type {
  SwipeAction,
  SwipeActionPressEvent,
  SwipeActionsEdge,
  SwipeActionsProps,
} from './types';
