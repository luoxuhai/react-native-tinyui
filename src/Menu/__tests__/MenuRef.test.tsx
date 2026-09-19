import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { createRef } from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { Menu, type MenuRef } from '..';
import { Commands } from '../MenuNativeComponent';

jest.mock('../../utils', () => ({ assertComponentEnabled: jest.fn() }));
jest.mock('../MenuNativeComponent', () => ({
  __esModule: true,
  default: 'TinyuiMenuView',
  Commands: { open: jest.fn() },
}));

const roots: ReactTestRenderer[] = [];

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  jest.clearAllMocks();
});

function renderMenu(disabled = false) {
  const ref = createRef<MenuRef>();
  const nativeView = { nativeID: 'menu' };
  const element = (nextDisabled: boolean) => (
    <Menu
      ref={ref}
      disabled={nextDisabled}
      options={[{ id: 'rename', title: 'Rename' }]}
    >
      <Text>Actions</Text>
    </Menu>
  );
  let root!: ReactTestRenderer;
  act(() => {
    root = create(element(disabled), {
      createNodeMock: ({ type }) =>
        type === 'TinyuiMenuView' ? nativeView : null,
    });
  });
  roots.push(root);
  return {
    ref,
    nativeView,
    update: (nextDisabled: boolean) => {
      act(() => root.update(element(nextDisabled)));
    },
    unmount: () => {
      act(() => root.unmount());
      roots.splice(roots.indexOf(root), 1);
    },
  };
}

describe('Menu ref', () => {
  it('opens the native menu while preserving the outer View methods', () => {
    const { ref, nativeView } = renderMenu();

    expect(ref.current?.measure).toEqual(expect.any(Function));
    expect(ref.current?.measureInWindow).toEqual(expect.any(Function));
    act(() => ref.current?.open());
    expect(Commands.open).toHaveBeenCalledTimes(1);
    expect(Commands.open).toHaveBeenCalledWith(nativeView);
  });

  it('respects disabled changes on the same ref', () => {
    const { ref, update } = renderMenu(true);
    act(() => ref.current?.open());
    expect(Commands.open).not.toHaveBeenCalled();

    update(false);
    act(() => ref.current?.open());
    expect(Commands.open).toHaveBeenCalledTimes(1);

    update(true);
    act(() => ref.current?.open());
    expect(Commands.open).toHaveBeenCalledTimes(1);
  });

  it('ignores a retained handle after unmount', () => {
    const { ref, unmount } = renderMenu();
    const handle = ref.current!;
    unmount();

    expect(ref.current).toBeNull();
    act(() => handle.open());
    expect(Commands.open).not.toHaveBeenCalled();
  });
});
