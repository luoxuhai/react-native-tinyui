import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { TipKit } from '..';
import NativeTipView, {
  type NativeTipViewProps,
} from '../TipViewNativeComponent';
import type { TipViewProps } from '../types';
import { assertComponentEnabled, getNativeTinyui } from '../../utils';

jest.mock('../../utils', () => ({
  assertComponentEnabled: jest.fn(),
  getNativeTinyui: jest.fn(),
}));
jest.mock('../TipPopoverNativeComponent', () => 'TinyuiTipPopoverView');
jest.mock('../TipViewNativeComponent', () => 'TinyuiTipView');

const roots: ReactTestRenderer[] = [];

function render(props: Partial<TipViewProps> = {}) {
  let root!: ReactTestRenderer;
  const element = (next: Partial<TipViewProps>) => (
    <TipKit.View tipId="inline.v1" title="Favorite" {...next} />
  );
  act(() => {
    root = create(element(props));
  });
  roots.push(root);
  return {
    props: () =>
      root.root.findByType(NativeTipView).props as NativeTipViewProps,
    update: (next: Partial<TipViewProps>) =>
      act(() => root.update(element(next))),
  };
}

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  jest.resetAllMocks();
});

describe('TipKit.View', () => {
  it('renders without children or a fixed height and preserves native view props', () => {
    const onLayout = jest.fn();
    const style = { width: 280 };
    const view = render({ style, onLayout, testID: 'inline-tip' });
    expect(view.props()).toEqual(
      expect.objectContaining({
        style,
        onLayout,
        testID: 'inline-tip',
        tipId: 'inline.v1',
        title: 'Favorite',
        arrowEdge: 'none',
        enabled: true,
        showsCloseButton: true,
        maxDisplayCount: 0,
        ignoresDisplayFrequency: false,
        collapsable: false,
      })
    );
    expect(view.props().children).toBeUndefined();
    expect(assertComponentEnabled).toHaveBeenCalledWith('TipKit');
  });

  it('forwards display controls without configuring or invalidating the tip', () => {
    const view = render({ enabled: false, showsCloseButton: false });
    expect(view.props().enabled).toBe(false);
    expect(view.props().showsCloseButton).toBe(false);
    view.update({
      enabled: true,
      arrowEdge: 'bottom',
      maxDisplayCount: 2,
      ignoresDisplayFrequency: true,
    });
    expect(view.props()).toEqual(
      expect.objectContaining({
        enabled: true,
        showsCloseButton: true,
        arrowEdge: 'bottom',
        maxDisplayCount: 2,
        ignoresDisplayFrequency: true,
      })
    );
    expect(getNativeTinyui).not.toHaveBeenCalled();
  });

  it('delivers both action identities and ignores stale actions after changing the tip', () => {
    const actions = [
      { id: 'save', title: 'Save this item' },
      { id: 'not-now', title: 'Not now' },
    ];
    const onActionPress = jest.fn();
    const view = render({ actions, onActionPress, showsCloseButton: false });
    expect(view.props().actions).toEqual(actions);
    const press = (tipId: string, action: (typeof actions)[number]) => {
      view.props().onTipAction?.({
        nativeEvent: { tipId, ...action },
      } as Parameters<NonNullable<NativeTipViewProps['onTipAction']>>[0]);
    };
    for (const action of actions) press('inline.v1', action);
    expect(onActionPress.mock.calls).toEqual(actions.map((action) => [action]));
    view.update({ tipId: 'inline.v2', actions, onActionPress });
    for (const action of actions) press('inline.v1', action);
    expect(onActionPress).toHaveBeenCalledTimes(2);
    for (const action of actions) press('inline.v2', action);
    expect(onActionPress).toHaveBeenCalledTimes(4);
    expect(getNativeTinyui).not.toHaveBeenCalled();
  });

  it('delivers only current-tip errors to the caller', () => {
    const onError = jest.fn();
    const view = render({ onError });
    view.update({ tipId: 'inline.v2', onError });
    const report = (tipId: string) => {
      view.props().onTipError?.({
        nativeEvent: { tipId, code: 'E_TIP', message: 'Failed' },
      } as Parameters<NonNullable<NativeTipViewProps['onTipError']>>[0]);
    };
    report('inline.v1');
    expect(onError).not.toHaveBeenCalled();
    report('inline.v2');
    expect(onError).toHaveBeenCalledWith({ code: 'E_TIP', message: 'Failed' });
  });

  it('validates inline content using the shared tip rules', () => {
    expect(() => render({ title: ' ' })).toThrow(/TipKit.View title/);
    expect(() => render({ actions: [{ id: 'save', title: '' }] })).toThrow(
      /TipKit.View actions/
    );
  });
});
