import { forwardRef, type ComponentRef } from 'react';
import { View } from 'react-native';

import { assertComponentEnabled } from '../utils';
import type { MenuComponent, MenuProps } from './types';
import NativeMenuView from './MenuNativeComponent';
import { serializeMenuOptions } from './options';

const MenuRoot = forwardRef<ComponentRef<typeof View>, MenuProps>(function Menu(
  {
    accessibilityLabel,
    children,
    disabled,
    onActionPress,
    options,
    title,
    testID,
    ...viewProps
  },
  ref
) {
  assertComponentEnabled('Menu');

  const menuConfig = serializeMenuOptions(options);

  return (
    <View {...viewProps} ref={ref} collapsable={false}>
      <NativeMenuView
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        menuConfig={menuConfig}
        onActionPress={onActionPress}
        testID={testID}
        title={title}
      >
        <View collapsable={false}>{children}</View>
      </NativeMenuView>
    </View>
  );
});

export const Menu = MenuRoot as MenuComponent;

export type {
  MenuActionOption,
  MenuActionPressEvent,
  MenuActionPressEventData,
  MenuDividerOption,
  MenuItemState,
  MenuOption,
  MenuProps,
  MenuSectionOption,
  MenuSubmenuOption,
} from './types';
