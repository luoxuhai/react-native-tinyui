import { processColor, type ColorValue } from 'react-native';

import type { MenuOption } from './types';

type NativeMenuColor = ReturnType<typeof processColor>;

interface NativeMenuLabel {
  title: string;
  subtitle?: string;
  systemImage?: string;
  icon?: string;
  iconColor?: NativeMenuColor;
  titleColor?: NativeMenuColor;
}

interface NativeMenuAction extends NativeMenuLabel {
  type: 'action';
  id: string;
  state: 'off' | 'on' | 'mixed';
  destructive: boolean;
  disabled: boolean;
  hidden: boolean;
  keepOpen: boolean;
}

interface NativeMenuSubmenu extends NativeMenuLabel {
  type: 'submenu';
  destructive: boolean;
  disabled: boolean;
  hidden: boolean;
  displayInline: boolean;
  children: NativeMenuElement[];
}

interface NativeMenuSection {
  type: 'section';
  title?: string;
  children: NativeMenuElement[];
}

interface NativeMenuSeparator {
  type: 'separator';
}

type NativeMenuElement =
  | NativeMenuAction
  | NativeMenuSubmenu
  | NativeMenuSection
  | NativeMenuSeparator;

interface NativeMenuConfiguration {
  items: NativeMenuElement[];
}

export interface SerializedMenuOptions {
  config: NativeMenuConfiguration;
  callbacks: Map<string, () => void>;
}

function serializeColor(color: ColorValue | undefined): NativeMenuColor {
  return color === undefined ? undefined : processColor(color);
}

export function serializeMenuOptions(
  options: readonly MenuOption[]
): SerializedMenuOptions {
  const callbacks = new Map<string, () => void>();
  const items = serializeOptions(options, callbacks, new Set(), 'root');

  return {
    callbacks,
    config: { items },
  };
}

function serializeOptions(
  options: readonly MenuOption[],
  callbacks: Map<string, () => void>,
  usedIds: Set<string>,
  path: string
): NativeMenuElement[] {
  return options.map((option, index) => {
    const optionPath = `${path}.${index}`;

    if (option.type === 'divider') {
      return { type: 'separator' };
    }

    if (option.type === 'submenu') {
      return {
        type: 'submenu',
        title: option.title,
        subtitle: option.subtitle,
        systemImage: option.systemImage,
        icon: option.icon,
        iconColor: serializeColor(option.iconColor),
        titleColor: serializeColor(option.titleColor),
        destructive: option.destructive ?? false,
        disabled: option.disabled ?? false,
        hidden: option.hidden ?? false,
        displayInline: option.displayInline ?? false,
        children: serializeOptions(
          option.options,
          callbacks,
          usedIds,
          `${optionPath}.submenu`
        ),
      };
    }

    if (option.type === 'section') {
      return {
        type: 'section',
        title: option.title,
        children: serializeOptions(
          option.options,
          callbacks,
          usedIds,
          `${optionPath}.section`
        ),
      };
    }

    const id = option.id ?? `item.${optionPath}`;
    if (usedIds.has(id)) {
      throw new Error(`Menu option id "${id}" must be unique within a menu.`);
    }
    usedIds.add(id);

    if (option.onSelect) {
      callbacks.set(id, option.onSelect);
    }

    return {
      type: 'action',
      id,
      title: option.title,
      subtitle: option.subtitle,
      systemImage: option.systemImage,
      icon: option.icon,
      iconColor: serializeColor(option.iconColor),
      titleColor: serializeColor(option.titleColor),
      state: option.state ?? 'off',
      destructive: option.destructive ?? false,
      disabled: option.disabled ?? false,
      hidden: option.hidden ?? false,
      keepOpen: option.keepOpen ?? false,
    };
  });
}
