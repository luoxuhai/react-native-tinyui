import { forwardRef, useCallback, useState, type ComponentRef } from 'react';
import { PlatformColor, Pressable, StyleSheet, View } from 'react-native';

import type { PopoverComponent, PopoverProps } from './Popover.types';
import {
  PopoverClose,
  PopoverContent,
  PopoverOpenContext,
  PopoverTrigger,
  parsePopover,
} from './PopoverPrimitives';
import NativePopoverView from './PopoverNativeComponent';

const DEFAULT_CONTENT_SIZE = { width: 320, height: 240 } as const;

const PopoverRoot = forwardRef<ComponentRef<typeof View>, PopoverProps>(
  function Popover(
    {
      children,
      open,
      defaultOpen = false,
      onOpenChange,
      attachmentAnchor = 'center',
      arrowEdge = 'none',
      contentSize = DEFAULT_CONTENT_SIZE,
      ...viewProps
    },
    ref
  ) {
    const { trigger, content } = parsePopover(children);
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

    const {
      children: triggerChildren,
      onPress: onTriggerPress,
      ...triggerProps
    } = trigger;
    const {
      children: contentChildren,
      style: contentStyle,
      ...contentProps
    } = content;

    return (
      <PopoverOpenContext.Provider value={setOpen}>
        <View {...viewProps} ref={ref} collapsable={false}>
          <Pressable
            {...triggerProps}
            onPress={(event) => {
              onTriggerPress?.(event);
              setOpen(true);
            }}
          >
            {triggerChildren}
          </Pressable>
          <NativePopoverView
            attachmentAnchor={attachmentAnchor}
            arrowEdge={arrowEdge}
            contentHeight={contentSize.height}
            contentWidth={contentSize.width}
            isPresented={isOpen}
            onIsPresentedChange={(event) => {
              if (!event.nativeEvent.isPresented && isOpen) {
                setOpen(false);
              }
            }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          >
            <View
              {...contentProps}
              style={[
                styles.content,
                contentStyle,
                {
                  width: contentSize.width,
                  height: contentSize.height,
                },
              ]}
            >
              {contentChildren}
            </View>
          </NativePopoverView>
        </View>
      </PopoverOpenContext.Provider>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    backgroundColor: PlatformColor('systemBackground'),
    overflow: 'hidden',
  },
});

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
}) as PopoverComponent;
