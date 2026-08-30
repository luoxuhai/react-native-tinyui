import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Pressable } from 'react-native';

import type {
  PopoverCloseProps,
  PopoverContentProps,
  PopoverTriggerProps,
} from './Popover.types';

export const PopoverOpenContext = createContext<
  ((open: boolean) => void) | null
>(null);

export function PopoverTrigger(_props: PopoverTriggerProps): ReactNode {
  return null;
}

export function PopoverContent(_props: PopoverContentProps): ReactNode {
  return null;
}

export function PopoverClose({
  onPress,
  ...props
}: PopoverCloseProps): ReactNode {
  const setOpen = useContext(PopoverOpenContext);
  if (!setOpen) {
    throw new Error('Popover.Close must be rendered inside Popover.Content.');
  }

  return (
    <Pressable
      {...props}
      onPress={(event) => {
        onPress?.(event);
        setOpen(false);
      }}
    />
  );
}

PopoverTrigger.displayName = 'Popover.Trigger';
PopoverContent.displayName = 'Popover.Content';
PopoverClose.displayName = 'Popover.Close';

function flattenNodes(node: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];

  Children.forEach(node, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      const fragment = child as ReactElement<{ children?: ReactNode }>;
      result.push(...flattenNodes(fragment.props.children));
    } else if (child !== null && child !== undefined && child !== false) {
      result.push(child);
    }
  });

  return result;
}

function markerProps<Props>(
  node: ReactNode,
  marker: (props: Props) => ReactNode
): Props | undefined {
  if (!isValidElement(node) || node.type !== marker) {
    return undefined;
  }
  return (node as ReactElement<Props>).props;
}

export interface ParsedPopover {
  trigger: PopoverTriggerProps;
  content: PopoverContentProps;
}

export function parsePopover(children: ReactNode): ParsedPopover {
  let trigger: PopoverTriggerProps | undefined;
  let content: PopoverContentProps | undefined;

  for (const child of flattenNodes(children)) {
    const triggerProps = markerProps(child, PopoverTrigger);
    if (triggerProps) {
      if (trigger) {
        throw new Error('Popover accepts exactly one Popover.Trigger.');
      }
      trigger = triggerProps;
      continue;
    }

    const contentProps = markerProps(child, PopoverContent);
    if (contentProps) {
      if (content) {
        throw new Error('Popover accepts exactly one Popover.Content.');
      }
      content = contentProps;
      continue;
    }

    throw new Error(
      'Popover only accepts Popover.Trigger and Popover.Content.'
    );
  }

  if (!trigger || !content) {
    throw new Error(
      'Popover requires one Popover.Trigger and one Popover.Content.'
    );
  }

  return { trigger, content };
}
