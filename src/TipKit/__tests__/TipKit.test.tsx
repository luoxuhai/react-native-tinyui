import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { ReactElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';

import { TipKit } from '..';
import NativeTipPopoverView, {
  type NativeTipPopoverProps,
} from '../TipPopoverNativeComponent';
import type { TipPopoverProps } from '../types';
import { validateTip } from '../validation';
import { assertComponentEnabled, getNativeTinyui } from '../../utils';

jest.mock('../../utils', () => ({
  assertComponentEnabled: jest.fn(),
  getNativeTinyui: jest.fn(),
}));
jest.mock('../TipPopoverNativeComponent', () => 'TinyuiTipPopoverView');

const roots: ReactTestRenderer[] = [];
const configure = jest.fn<(frequency: string) => Promise<void>>();
const invalidate = jest.fn<(tipId: string, reason: string) => Promise<void>>();

function render(props: Partial<TipPopoverProps> = {}) {
  let root!: ReactTestRenderer;
  const element = (next: Partial<TipPopoverProps>) => (
    <TipKit.Popover tipId="favorite.v1" title="Favorite" {...next}>
      {next.children ?? <Text>Anchor</Text>}
    </TipKit.Popover>
  );
  act(() => {
    root = create(element(props));
  });
  roots.push(root);
  return {
    root,
    props: () =>
      root.root.findByType(NativeTipPopoverView).props as NativeTipPopoverProps,
    update: (next: Partial<TipPopoverProps>) =>
      act(() => root.update(element(next))),
  };
}

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  jest.resetAllMocks();
});

describe('TipKit.Popover', () => {
  it('keeps the anchor and its touch behavior when disabled without configuring or invalidating TipKit', () => {
    const onPress = jest.fn();
    const anchor = (
      <Pressable onPress={onPress}>
        <Text>Save</Text>
      </Pressable>
    );
    const view = render({
      enabled: false,
      children: anchor,
    });
    expect(view.props().enabled).toBe(false);
    const wrapper = view.props().children as ReactElement<{
      children: ReactElement<{ onPress: () => void }>;
    }>;
    expect(wrapper.props.children).toBe(anchor);
    act(() => wrapper.props.children.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    view.update({ enabled: true });
    expect(view.props().enabled).toBe(true);
    expect(getNativeTinyui).not.toHaveBeenCalled();
    expect(assertComponentEnabled).toHaveBeenCalledWith('TipKit');
  });

  it('separates eligibility from visibility and ignores late events for an old tip', () => {
    const onStatusChange = jest.fn();
    const onVisibleChange = jest.fn();
    const view = render({ onStatusChange, onVisibleChange });
    const status = (tipId: string, value: string, reason = '') => {
      view.props().onTipStatusChange?.({
        nativeEvent: { tipId, status: value, reason },
      } as Parameters<
        NonNullable<NativeTipPopoverProps['onTipStatusChange']>
      >[0]);
    };
    status('favorite.v1', 'available');
    expect(onStatusChange).toHaveBeenLastCalledWith({ status: 'available' });
    expect(onVisibleChange).not.toHaveBeenCalled();
    view.update({ tipId: 'favorite.v2', onStatusChange, onVisibleChange });
    status('favorite.v1', 'invalidated', 'tipClosed');
    view.props().onTipVisibleChange?.({
      nativeEvent: { tipId: 'favorite.v1', visible: false },
    } as Parameters<
      NonNullable<NativeTipPopoverProps['onTipVisibleChange']>
    >[0]);
    expect(onStatusChange).toHaveBeenCalledTimes(1);
    expect(onVisibleChange).not.toHaveBeenCalled();
    status('favorite.v2', 'invalidated', 'actionPerformed');
    expect(onStatusChange).toHaveBeenLastCalledWith({
      status: 'invalidated',
      reason: 'actionPerformed',
    });
  });

  it('forwards action identities without automatically invalidating the tip', () => {
    const onActionPress = jest.fn();
    const view = render({
      actions: [{ id: 'save', title: 'Save' }],
      onActionPress,
    });
    view.props().onTipAction?.({
      nativeEvent: { tipId: 'favorite.v1', id: 'save', title: 'Save' },
    } as Parameters<NonNullable<NativeTipPopoverProps['onTipAction']>>[0]);
    expect(onActionPress).toHaveBeenCalledWith({ id: 'save', title: 'Save' });
    expect(getNativeTinyui).not.toHaveBeenCalled();
  });

  it.each<Partial<TipPopoverProps>>([
    { tipId: ' ' },
    { title: '' },
    { maxDisplayCount: 0 },
    { maxDisplayCount: NaN },
    { maxDisplayCount: 1.5 },
    { maxDisplayCount: 2147483648 },
    {
      actions: [
        { id: 'save', title: 'Save' },
        { id: 'save', title: 'Again' },
      ],
    },
    { actions: [{ id: '', title: 'Save' }] },
  ])('rejects invalid persistent configuration: %p', (props) => {
    expect(() =>
      validateTip({
        children: null,
        tipId: 'favorite.v1',
        title: 'Favorite',
        ...props,
      })
    ).toThrow(/TinyUI/);
  });
});

describe('TipKit', () => {
  function native() {
    jest.mocked(getNativeTinyui).mockReturnValue({
      configureTips: configure,
      invalidateTip: invalidate,
    } as unknown as ReturnType<typeof getNativeTinyui>);
    configure.mockResolvedValue(undefined);
    invalidate.mockResolvedValue(undefined);
  }

  it('uses app-wide configuration and forwards invalidation independently of mounted views', async () => {
    native();
    await TipKit.configure();
    expect(configure).toHaveBeenCalledWith('daily');
    await TipKit.invalidate('unmounted-feature.v1');
    expect(invalidate).toHaveBeenCalledWith(
      'unmounted-feature.v1',
      'actionPerformed'
    );
    await TipKit.invalidate('another.v1', 'tipClosed');
    expect(invalidate).toHaveBeenLastCalledWith('another.v1', 'tipClosed');
  });

  it('propagates native initialization failures so callers can wait before mounting', async () => {
    native();
    configure.mockRejectedValueOnce(new Error('datastore unavailable'));
    await expect(TipKit.configure()).rejects.toThrow('datastore unavailable');
    await TipKit.configure();
    expect(configure).toHaveBeenCalledTimes(2);
  });

  it('does not invoke native methods when the component was not compiled', async () => {
    native();
    jest.mocked(assertComponentEnabled).mockImplementation(() => {
      throw new Error('not installed');
    });
    await expect(TipKit.configure()).rejects.toThrow('not installed');
    expect(configure).not.toHaveBeenCalled();
  });
});
