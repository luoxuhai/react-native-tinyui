import type {
  ComponentRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';
import type { ReactNode } from 'react';
import type { PressableProps, View, ViewProps } from 'react-native';

export type PopoverAttachmentAnchor =
  'leading' | 'trailing' | 'center' | 'top' | 'bottom';

export type PopoverArrowEdge =
  'leading' | 'trailing' | 'top' | 'bottom' | 'none';

/** Arguments passed to a render-function `content`. */
export interface PopoverContentRenderArgs {
  /** Dismisses the popover. */
  close: () => void;
}

export type PopoverContent =
  ReactNode | ((args: PopoverContentRenderArgs) => ReactNode);

export interface PopoverProps extends Omit<ViewProps, 'children'> {
  /** The trigger element. Tapping it opens the popover. */
  children: ReactNode;
  /**
   * Content shown inside the popover. Pass a node, or a render function that
   * receives `{ close }` to dismiss the popover from within the content.
   */
  content: PopoverContent;
  /** Controlled presentation state. */
  open?: boolean;
  /** Initial state when `open` is not controlled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  attachmentAnchor?: PopoverAttachmentAnchor;
  arrowEdge?: PopoverArrowEdge;
}

export interface PopoverComponent extends ForwardRefExoticComponent<
  PopoverProps & RefAttributes<ComponentRef<typeof View>>
> {}

/** Props for the `Popover.Close` helper button. */
export interface PopoverCloseProps extends PressableProps {
  /** Dismisses the popover. Pass the `close` callback from the content render args. */
  close: () => void;
}
