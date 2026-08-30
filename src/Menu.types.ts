import type {
  ComponentRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

export type MenuItemState = 'off' | 'on' | 'mixed';

export interface MenuProps extends Omit<ViewProps, 'children'> {
  /** The trigger and content declarations for this menu. */
  children: ReactNode;
  /** Called on a normal tap. When set, a long press opens the menu. */
  onPrimaryAction?: () => void;
}

export interface MenuTriggerProps {
  children: ReactNode;
  /** VoiceOver label for the transparent native menu control. */
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface MenuContentProps {
  children: ReactNode;
}

export interface MenuItemProps {
  /** Stable identifier returned by the native selection event. */
  id?: string;
  /** Text shown by iOS. Falls back to string children. */
  title?: string;
  children?: ReactNode;
  subtitle?: string;
  /** SF Symbol name. */
  systemImage?: string;
  state?: MenuItemState;
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  /** Keep the menu visible after selection on iOS 16 and newer. */
  keepOpen?: boolean;
  onSelect?: () => void;
}

export interface MenuSubmenuProps {
  title: string;
  subtitle?: string;
  /** SF Symbol name. */
  systemImage?: string;
  children: ReactNode;
}

export interface MenuSectionProps {
  title?: string;
  children: ReactNode;
}

export type MenuDividerProps = Record<string, never>;

export type MenuMarkerComponent<Props> = (props: Props) => ReactNode;

export interface MenuComponent extends ForwardRefExoticComponent<
  MenuProps & RefAttributes<ComponentRef<typeof View>>
> {
  Trigger: MenuMarkerComponent<MenuTriggerProps>;
  Content: MenuMarkerComponent<MenuContentProps>;
  Item: MenuMarkerComponent<MenuItemProps>;
  Submenu: MenuMarkerComponent<MenuSubmenuProps>;
  Section: MenuMarkerComponent<MenuSectionProps>;
  Divider: MenuMarkerComponent<MenuDividerProps>;
}
