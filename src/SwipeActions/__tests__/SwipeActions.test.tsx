import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { DynamicColorIOS, PlatformColor, Text } from 'react-native';

import { SwipeActions } from '..';
import { serializeSwipeActions } from '../actions';
import NativeSwipeActionsView from '../SwipeActionsNativeComponent';
import { assertComponentEnabled } from '../../utils';

jest.mock('../../utils', () => ({ assertComponentEnabled: jest.fn() }));
jest.mock('../SwipeActionsNativeComponent', () => 'TinyuiSwipeActionsView');

let root: ReactTestRenderer;

afterEach(() => {
  if (root) {
    act(() => root.unmount());
  }
  jest.clearAllMocks();
});

describe('SwipeActions', () => {
  it('preserves action order and rejects ambiguous action identifiers', () => {
    expect(
      serializeSwipeActions([
        { id: 'archive', title: 'Archive' },
        { title: 'Delete', destructive: true },
      ]).map(({ id }) => id)
    ).toEqual(['archive', 'item.1']);
    expect(() =>
      serializeSwipeActions([
        { id: 'item.1', title: 'Archive' },
        { title: 'Delete' },
      ])
    ).toThrow('must be unique');
  });

  it('passes semantic and dynamic colors through the native color boundary', () => {
    expect(
      serializeSwipeActions([
        { title: 'Archive', tintColor: PlatformColor('systemBlueColor') },
        {
          title: 'Flag',
          tintColor: DynamicColorIOS({ light: '#112233', dark: '#ddeeff' }),
        },
      ])
    ).toMatchObject([
      { tintColor: { semantic: ['systemBlueColor'] } },
      {
        tintColor: {
          dynamic: { light: 0xff112233, dark: 0xffddeeff },
        },
      },
    ]);
  });

  it('updates native behavior without remounting the React row', () => {
    const onActionPress = jest.fn();
    const actions = [{ id: 'delete', title: 'Delete', destructive: true }];
    const child = <Text>Message</Text>;
    act(() => {
      root = create(
        <SwipeActions actions={actions} onActionPress={onActionPress}>
          {child}
        </SwipeActions>
      );
    });
    expect(assertComponentEnabled).toHaveBeenCalledWith('SwipeActions');
    const native = root.root.findByType(NativeSwipeActionsView);
    const content = root.root.findByType(Text);
    expect(native.props).toMatchObject({
      edge: 'trailing',
      allowsFullSwipe: true,
      disabled: false,
    });

    act(() => {
      root.update(
        <SwipeActions
          actions={actions}
          edge="leading"
          allowsFullSwipe={false}
          disabled
          onActionPress={onActionPress}
        >
          {child}
        </SwipeActions>
      );
    });
    expect(native.props).toMatchObject({
      edge: 'leading',
      allowsFullSwipe: false,
      disabled: true,
    });
    expect(root.root.findByType(Text)).toBe(content);
    const event = { nativeEvent: { id: 'delete', title: 'Delete' } };
    native.props.onActionPress(event);
    expect(onActionPress).toHaveBeenCalledWith(event);
  });
});
