import type {
  ComponentRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from 'react';
import type { ColorValue, View, ViewProps } from 'react-native';

export type MenuItemState = 'off' | 'on' | 'mixed';

interface MenuOptionLabel {
  title: string;
  subtitle?: string;
  /** SF Symbol name. */
  systemImage?: string;
  /** Image name from the containing app's asset catalog. Takes precedence over `systemImage`. */
  icon?: string;
  /** Tint applied to `icon` or `systemImage`. */
  iconColor?: ColorValue;
  /** Foreground color applied to the option title. */
  titleColor?: ColorValue;
}

export interface MenuActionOption extends MenuOptionLabel {
  /** Actions are the default option type, so this can be omitted. */
  type?: 'action';
  /** Stable identifier returned by the native selection event. */
  id?: string;
  state?: MenuItemState;
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  /** Keep the menu visible after selection on iOS 16 and newer. */
  keepOpen?: boolean;
  onSelect?: () => void;
}

export interface MenuSubmenuOption extends MenuOptionLabel {
  type: 'submenu';
  /** Marks the submenu and its children as destructive. */
  destructive?: boolean;
  /** Prevents the submenu from being opened. */
  disabled?: boolean;
  /** Removes the submenu from the rendered menu. */
  hidden?: boolean;
  /** Displays the children inline instead of opening a nested menu. */
  displayInline?: boolean;
  options: readonly MenuOption[];
}

export interface MenuSectionOption {
  type: 'section';
  title?: string;
  options: readonly MenuOption[];
}

export interface MenuDividerOption {
  type: 'divider';
}

export type MenuOption =
  MenuActionOption | MenuSubmenuOption | MenuSectionOption | MenuDividerOption;

export interface MenuProps extends Omit<ViewProps, 'children'> {
  /** The trigger element. */
  children: ReactNode;
  /** Native menu actions, submenus, sections, and dividers. */
  options: readonly MenuOption[];
  /** Prevents the trigger from opening the menu. */
  disabled?: boolean;
  /** Called on a normal tap. When set, a long press opens the menu. */
  onPrimaryAction?: () => void;
}

export interface MenuComponent extends ForwardRefExoticComponent<
  MenuProps & RefAttributes<ComponentRef<typeof View>>
> {}
