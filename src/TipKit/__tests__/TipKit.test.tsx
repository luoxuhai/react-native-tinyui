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
jest.mock('../TipViewNativeComponent', () => 'TinyuiTipView');

const roots: ReactTestRenderer[] = [];
const configure = jest.fn<(frequency: string) => Promise<void>>();
const resetDatastore = jest.fn<() => Promise<void>>();
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
    expect(view.props().showsCloseButton).toBe(true);
    expect(view.props().dismissOnOutsidePress).toBe(true);
    const wrapper = view.props().children as ReactElement<{
      children: ReactElement<{ onPress: () => void }>;
    }>;
    expect(wrapper.props.children).toBe(anchor);
    act(() => wrapper.props.children.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    view.update({
      enabled: true,
      showsCloseButton: false,
      dismissOnOutsidePress: false,
    });
    expect(view.props().enabled).toBe(true);
    expect(view.props().showsCloseButton).toBe(false);
    expect(view.props().dismissOnOutsidePress).toBe(false);
    view.update({ dismissOnOutsidePress: true });
    expect(view.props().showsCloseButton).toBe(true);
    expect(view.props().dismissOnOutsidePress).toBe(true);
    expect(getNativeTinyui).not.toHaveBeenCalled();
    expect(assertComponentEnabled).toHaveBeenCalledWith('TipKit');
  });

  it('forwards two button titles and identifies each click without automatically invalidating the tip', () => {
    const onActionPress = jest.fn();
    const actions = [
      { id: 'save', title: 'Save this item' },
      { id: 'not-now', title: 'Not now' },
    ];
    const view = render({
      actions,
      onActionPress,
      showsCloseButton: false,
    });
    expect(view.props().actions).toEqual(actions);
    for (const action of actions) {
      view.props().onTipAction?.({
        nativeEvent: { tipId: 'favorite.v1', ...action },
      } as Parameters<NonNullable<NativeTipPopoverProps['onTipAction']>>[0]);
    }
    expect(onActionPress.mock.calls).toEqual(actions.map((action) => [action]));
    expect(getNativeTinyui).not.toHaveBeenCalled();
  });

  it('ignores late actions and errors for an old tip', () => {
    const onActionPress = jest.fn();
    const onError = jest.fn();
    const view = render({ onActionPress, onError });
    view.update({ tipId: 'favorite.v2', onActionPress, onError });
    const action = (tipId: string) => {
      view.props().onTipAction?.({
        nativeEvent: { tipId, id: 'save', title: 'Save' },
      } as Parameters<NonNullable<NativeTipPopoverProps['onTipAction']>>[0]);
    };
    const error = (tipId: string) => {
      view.props().onTipError?.({
        nativeEvent: { tipId, code: 'E_TIP', message: 'Failed' },
      } as Parameters<NonNullable<NativeTipPopoverProps['onTipError']>>[0]);
    };
    action('favorite.v1');
    error('favorite.v1');
    expect(onActionPress).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    action('favorite.v2');
    error('favorite.v2');
    expect(onActionPress).toHaveBeenCalledWith({ id: 'save', title: 'Save' });
    expect(onError).toHaveBeenCalledWith({ code: 'E_TIP', message: 'Failed' });
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
    { actions: [{ id: 'save', title: ' ' }] },
  ])('rejects invalid persistent configuration: %p', (props) => {
    expect(() =>
      validateTip({
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
      resetTipsDatastore: resetDatastore,
      invalidateTip: invalidate,
    } as unknown as ReturnType<typeof getNativeTinyui>);
    configure.mockResolvedValue(undefined);
    resetDatastore.mockResolvedValue(undefined);
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

  it('waits for a successful reset before startup configuration', async () => {
    native();
    let finishReset!: () => void;
    resetDatastore.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finishReset = resolve;
      })
    );
    const startup = TipKit.resetDatastore().then(() => TipKit.configure());
    expect(assertComponentEnabled).toHaveBeenCalledWith('TipKit');
    expect(resetDatastore).toHaveBeenCalledTimes(1);
    expect(configure).not.toHaveBeenCalled();
    finishReset();
    await startup;
    expect(configure).toHaveBeenCalledWith('daily');
  });

  it.each(['E_TIPS_ALREADY_CONFIGURED', 'E_TIPS_RESET'])(
    'preserves native reset errors (%s) for callers',
    async (code) => {
      native();
      const error = Object.assign(new Error('Reset failed'), { code });
      resetDatastore.mockRejectedValueOnce(error);
      await expect(TipKit.resetDatastore()).rejects.toBe(error);
      expect(configure).not.toHaveBeenCalled();
    }
  );

  it('does not invoke native methods when the component was not compiled', async () => {
    native();
    jest.mocked(assertComponentEnabled).mockImplementation(() => {
      throw new Error('not installed');
    });
    await expect(TipKit.configure()).rejects.toThrow('not installed');
    await expect(TipKit.resetDatastore()).rejects.toThrow('not installed');
    expect(configure).not.toHaveBeenCalled();
    expect(resetDatastore).not.toHaveBeenCalled();
  });
});
