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
    onPrimaryAction,
    options,
    title,
    testID,
    ...viewProps
  },
  ref
) {
  assertComponentEnabled('Menu');

  const { config, callbacks } = serializeMenuOptions(options);

  return (
    <View {...viewProps} ref={ref} collapsable={false}>
      <NativeMenuView
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        hasPrimaryAction={onPrimaryAction != null}
        menuConfig={config}
        onItemPress={(event) => callbacks.get(event.nativeEvent.id)?.()}
        onPrimaryAction={onPrimaryAction}
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
  MenuDividerOption,
  MenuItemState,
  MenuOption,
  MenuProps,
  MenuSectionOption,
  MenuSubmenuOption,
} from './types';
