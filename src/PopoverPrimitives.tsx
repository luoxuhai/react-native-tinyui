import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import type { PopoverCloseProps } from './Popover.types';

/**
 * A button that dismisses the popover. Render it inside the `content` prop
 * and pass the `close` callback from the render-function arguments:
 *
 * ```tsx
 * <Popover
 *   content={({ close }) => (
 *     <Popover.Close close={close}>Done</Popover.Close>
 *   )}
 * >
 *   <Button title="Open" />
 * </Popover>
 * ```
 */
export function PopoverClose({
  close,
  onPress,
  ...props
}: PopoverCloseProps): ReactNode {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        onPress?.(event);
        close();
      }}
    />
  );
}

PopoverClose.displayName = 'Popover.Close';
