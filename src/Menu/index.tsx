import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
} from 'react';
import { View, type HostInstance } from 'react-native';

import { assertComponentEnabled } from '../utils';
import type { MenuComponent, MenuProps, MenuRef } from './types';
import NativeMenuView, { Commands } from './MenuNativeComponent';
import { serializeMenuOptions } from './options';

const MenuRoot = forwardRef<MenuRef, MenuProps>(function Menu(
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

  const viewRef = useRef<HostInstance>(null);
  const nativeRef = useRef<ComponentRef<typeof NativeMenuView>>(null);

  useImperativeHandle(
    ref,
    () =>
      Object.assign(viewRef.current!, {
        open() {
          if (!disabled && nativeRef.current) {
            Commands.open(nativeRef.current);
          }
        },
      }),
    [disabled]
  );

  const menuConfig = serializeMenuOptions(options);

  return (
    <View {...viewProps} ref={viewRef} collapsable={false}>
      <NativeMenuView
        ref={nativeRef}
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
  MenuRef,
  MenuSectionOption,
  MenuSubmenuOption,
} from './types';
