import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MenuComponent, MenuProps } from './Menu.types';
import {
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuSection,
  MenuSubmenu,
  MenuTrigger,
  parseMenu,
  textFromNode,
} from './MenuPrimitives';
import NativeMenuView from './MenuNativeComponent';

const MenuRoot = forwardRef<ComponentRef<typeof View>, MenuProps>(function Menu(
  { children, onPrimaryAction, ...viewProps },
  ref
) {
  const { trigger, config, callbacks } = parseMenu(children);
  const accessibilityLabel =
    trigger.accessibilityLabel ?? textFromNode(trigger.children);

  return (
    <View {...viewProps} ref={ref} collapsable={false}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={trigger.style}
      >
        {trigger.children}
      </View>
      <NativeMenuView
        accessibilityLabel={accessibilityLabel}
        disabled={trigger.disabled}
        hasPrimaryAction={onPrimaryAction != null}
        menuConfig={config}
        onItemPress={(event) => callbacks.get(event.nativeEvent.id)?.()}
        onPrimaryAction={onPrimaryAction}
        style={StyleSheet.absoluteFill}
        testID={trigger.testID}
      />
    </View>
  );
});

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Submenu: MenuSubmenu,
  Section: MenuSection,
  Divider: MenuDivider,
}) as MenuComponent;
