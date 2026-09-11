import { forwardRef, useCallback, useState, type ComponentRef } from 'react';
import type { ReactNode } from 'react';
import { PlatformColor, Pressable, StyleSheet, View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import { PopoverClose } from './PopoverClose';
import type {
  PopoverComponent,
  PopoverContentRenderArgs,
  PopoverContent as PopoverContentType,
  PopoverProps,
} from './types';
import NativePopoverView from './PopoverNativeComponent';

const PopoverRoot = forwardRef<ComponentRef<typeof View>, PopoverProps>(
  function Popover(
    {
      children,
      content,
      open,
      defaultOpen = false,
      onOpenChange,
      attachmentAnchor = 'center',
      arrowEdge = 'none',
      ...viewProps
    },
    ref
  ) {
    assertComponentEnabled('Popover');

    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : uncontrolledOpen;

    const setOpen = useCallback(
      (nextOpen: boolean) => {
        if (!isControlled) {
          setUncontrolledOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
      },
      [isControlled, onOpenChange]
    );

    const close = useCallback(() => setOpen(false), [setOpen]);

    const renderedContent = renderContent(content, { close });

    return (
      <View {...viewProps} ref={ref} collapsable={false}>
        <NativePopoverView
          attachmentAnchor={attachmentAnchor}
          arrowEdge={arrowEdge}
          isPresented={isOpen}
          onIsPresentedChange={(event) => {
            if (!event.nativeEvent.isPresented && isOpen) {
              setOpen(false);
            }
          }}
        >
          <Pressable onPress={() => setOpen(true)}>{children}</Pressable>
          <View style={styles.content} pointerEvents="box-none">
            {renderedContent}
          </View>
        </NativePopoverView>
      </View>
    );
  }
);

function renderContent(
  content: PopoverContentType,
  args: PopoverContentRenderArgs
): ReactNode {
  return typeof content === 'function' ? content(args) : content;
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    backgroundColor: PlatformColor('systemBackground'),
    overflow: 'hidden',
  },
});

export const Popover = Object.assign(PopoverRoot, {
  Close: PopoverClose,
}) as PopoverComponent & {
  Close: typeof PopoverClose;
};

export { PopoverClose };

export type {
  PopoverArrowEdge,
  PopoverAttachmentAnchor,
  PopoverCloseProps,
  PopoverContent,
  PopoverContentRenderArgs,
  PopoverProps,
} from './types';
