import type {
  ComponentRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from 'react';
import type { PressableProps, View, ViewProps } from 'react-native';

export type PopoverAttachmentAnchor =
  'leading' | 'trailing' | 'center' | 'top' | 'bottom';

export type PopoverArrowEdge =
  'leading' | 'trailing' | 'top' | 'bottom' | 'none';

export interface PopoverSize {
  width: number;
  height: number;
}

export interface PopoverProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  /** Controlled presentation state. */
  open?: boolean;
  /** Initial state when `open` is not controlled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  attachmentAnchor?: PopoverAttachmentAnchor;
  arrowEdge?: PopoverArrowEdge;
  /** Explicit native popover size. Defaults to 320 × 240 points. */
  contentSize?: PopoverSize;
}

export interface PopoverTriggerProps extends PressableProps {
  children: PressableProps['children'];
}

export interface PopoverContentProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
}

export interface PopoverCloseProps extends PressableProps {
  children: PressableProps['children'];
}

export type PopoverMarkerComponent<Props> = (props: Props) => ReactNode;

export interface PopoverComponent extends ForwardRefExoticComponent<
  PopoverProps & RefAttributes<ComponentRef<typeof View>>
> {
  Trigger: PopoverMarkerComponent<PopoverTriggerProps>;
  Content: PopoverMarkerComponent<PopoverContentProps>;
  Close: (props: PopoverCloseProps) => ReactNode;
}
