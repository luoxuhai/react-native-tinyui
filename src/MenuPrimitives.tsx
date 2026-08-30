import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import type {
  MenuContentProps,
  MenuDividerProps,
  MenuItemProps,
  MenuSectionProps,
  MenuSubmenuProps,
  MenuTriggerProps,
} from './Menu.types';

export function MenuTrigger(_props: MenuTriggerProps): ReactNode {
  return null;
}

export function MenuContent(_props: MenuContentProps): ReactNode {
  return null;
}

export function MenuItem(_props: MenuItemProps): ReactNode {
  return null;
}

export function MenuSubmenu(_props: MenuSubmenuProps): ReactNode {
  return null;
}

export function MenuSection(_props: MenuSectionProps): ReactNode {
  return null;
}

export function MenuDivider(_props: MenuDividerProps): ReactNode {
  return null;
}

MenuTrigger.displayName = 'Menu.Trigger';
MenuContent.displayName = 'Menu.Content';
MenuItem.displayName = 'Menu.Item';
MenuSubmenu.displayName = 'Menu.Submenu';
MenuSection.displayName = 'Menu.Section';
MenuDivider.displayName = 'Menu.Divider';

export interface NativeMenuAction {
  type: 'action';
  id: string;
  title: string;
  subtitle?: string;
  systemImage?: string;
  state: 'off' | 'on' | 'mixed';
  destructive: boolean;
  disabled: boolean;
  hidden: boolean;
  keepOpen: boolean;
}

export interface NativeMenuSubmenu {
  type: 'submenu';
  title: string;
  subtitle?: string;
  systemImage?: string;
  children: NativeMenuElement[];
}

export interface NativeMenuSection {
  type: 'section';
  title?: string;
  children: NativeMenuElement[];
}

export interface NativeMenuSeparator {
  type: 'separator';
}

export type NativeMenuElement =
  | NativeMenuAction
  | NativeMenuSubmenu
  | NativeMenuSection
  | NativeMenuSeparator;

export interface ParsedMenu {
  trigger: MenuTriggerProps;
  config: string;
  callbacks: Map<string, () => void>;
}

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

export function textFromNode(node: ReactNode): string | undefined {
  const parts: string[] = [];

  function visit(value: ReactNode) {
    Children.forEach(value, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        parts.push(String(child));
      } else if (isValidElement<{ children?: ReactNode }>(child)) {
        visit(child.props.children);
      }
    });
  }

  visit(node);
  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  return text || undefined;
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

function parseElements(
  node: ReactNode,
  callbacks: Map<string, () => void>,
  usedIds: Set<string>,
  path: string
): NativeMenuElement[] {
  return flattenNodes(node).map((child, index) => {
    const childPath = `${path}.${index}`;

    const item = markerProps(child, MenuItem);
    if (item) {
      const title = item.title ?? textFromNode(item.children);
      if (!title) {
        throw new Error('Menu.Item requires a title or string children.');
      }

      const id = item.id ?? `item${childPath}`;
      if (usedIds.has(id)) {
        throw new Error(`Menu.Item id "${id}" must be unique within a menu.`);
      }
      usedIds.add(id);
      if (item.onSelect) {
        callbacks.set(id, item.onSelect);
      }

      return {
        type: 'action',
        id,
        title,
        subtitle: item.subtitle,
        systemImage: item.systemImage,
        state: item.state ?? 'off',
        destructive: item.destructive ?? false,
        disabled: item.disabled ?? false,
        hidden: item.hidden ?? false,
        keepOpen: item.keepOpen ?? false,
      };
    }

    const submenu = markerProps(child, MenuSubmenu);
    if (submenu) {
      return {
        type: 'submenu',
        title: submenu.title,
        subtitle: submenu.subtitle,
        systemImage: submenu.systemImage,
        children: parseElements(
          submenu.children,
          callbacks,
          usedIds,
          `${childPath}.submenu`
        ),
      };
    }

    const section = markerProps(child, MenuSection);
    if (section) {
      return {
        type: 'section',
        title: section.title,
        children: parseElements(
          section.children,
          callbacks,
          usedIds,
          `${childPath}.section`
        ),
      };
    }

    if (markerProps(child, MenuDivider)) {
      return { type: 'separator' };
    }

    throw new Error(
      'Menu.Content only accepts Menu.Item, Menu.Submenu, Menu.Section, and Menu.Divider.'
    );
  });
}

export function parseMenu(children: ReactNode): ParsedMenu {
  let trigger: MenuTriggerProps | undefined;
  let content: MenuContentProps | undefined;

  for (const child of flattenNodes(children)) {
    const triggerProps = markerProps(child, MenuTrigger);
    if (triggerProps) {
      if (trigger) {
        throw new Error('Menu accepts exactly one Menu.Trigger.');
      }
      trigger = triggerProps;
      continue;
    }

    const contentProps = markerProps(child, MenuContent);
    if (contentProps) {
      if (content) {
        throw new Error('Menu accepts exactly one Menu.Content.');
      }
      content = contentProps;
      continue;
    }

    throw new Error('Menu only accepts Menu.Trigger and Menu.Content.');
  }

  if (!trigger || !content) {
    throw new Error('Menu requires one Menu.Trigger and one Menu.Content.');
  }

  const callbacks = new Map<string, () => void>();
  const items = parseElements(content.children, callbacks, new Set(), 'root');
  return {
    trigger,
    callbacks,
    config: JSON.stringify({ items }),
  };
}
