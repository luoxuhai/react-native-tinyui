import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { ReactElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text, View } from 'react-native';

import { TipKit } from '..';
import NativeTipPopoverView, {
  type NativeTipPopoverProps,
} from '../TipPopoverNativeComponent';
import NativeTipView, {
  type NativeTipViewProps,
} from '../TipViewNativeComponent';
import type { TipGroupProps } from '../types';

jest.mock('../../utils', () => ({ assertComponentEnabled: jest.fn() }));
jest.mock('../TipPopoverNativeComponent', () => 'TinyuiTipPopoverView');
jest.mock('../TipViewNativeComponent', () => 'TinyuiTipView');

const roots: ReactTestRenderer[] = [];

function mount(element: ReactElement) {
  let root!: ReactTestRenderer;
  act(() => {
    root = create(element);
  });
  roots.push(root);
  return root;
}

function invalidated(props: { [propName: string]: any }, tipId = props.tipId) {
  act(() => {
    (props as NativeTipPopoverProps | NativeTipViewProps).onTipInvalidated?.({
      nativeEvent: { tipId, reason: 'tipClosed' },
    } as Parameters<NonNullable<NativeTipPopoverProps['onTipInvalidated']>>[0]);
  });
}

function sequence(props: Partial<Omit<TipGroupProps, 'children'>> = {}) {
  return (
    <TipKit.Group tipIds={['first', 'second']} {...props}>
      {/* Layout order does not determine presentation order. */}
      <View>
        <TipKit.Popover tipId="second" title="Second">
          <Text>Anchor</Text>
        </TipKit.Popover>
      </View>
      <TipKit.View tipId="first" title="First" />
    </TipKit.Group>
  );
}

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  jest.clearAllMocks();
});

describe('TipKit.Group', () => {
  it('orders mixed presentations by tipIds, advancing only after native invalidation', () => {
    const root = mount(sequence());
    const first = () => root.root.findByType(NativeTipView).props;
    const second = () => root.root.findByType(NativeTipPopoverView).props;
    expect(first().enabled).toBe(true);
    expect(second().enabled).toBe(false);
    expect(second().invalidateOnOutsideDismiss).toBe(false);
    invalidated(first(), 'stale-id');
    expect(first().enabled).toBe(true);
    invalidated(first());
    expect(first().enabled).toBe(false);
    expect(second().enabled).toBe(true);
    invalidated(first());
    expect(second().enabled).toBe(true);
    invalidated(second());
    expect(first().enabled).toBe(false);
    expect(second().enabled).toBe(false);
  });

  it('resumes persisted history from native events after the group remounts', () => {
    const root = mount(sequence());
    invalidated(root.root.findByType(NativeTipView).props);
    act(() => root.update(<></>));
    act(() => root.update(sequence()));
    // An already-invalidated tip reports its native status without displaying.
    invalidated(root.root.findByType(NativeTipView).props);
    expect(root.root.findByType(NativeTipPopoverView).props.enabled).toBe(true);
  });

  it('pauses without completing and preserves progress across list reordering', () => {
    const root = mount(sequence({ enabled: false }));
    expect(root.root.findByType(NativeTipView).props.enabled).toBe(false);
    expect(root.root.findByType(NativeTipPopoverView).props.enabled).toBe(
      false
    );
    act(() => root.update(sequence({ enabled: true })));
    invalidated(root.root.findByType(NativeTipView).props);
    act(() => root.update(sequence({ enabled: false })));
    act(() =>
      root.update(sequence({ enabled: true, tipIds: ['second', 'first'] }))
    );
    expect(root.root.findByType(NativeTipPopoverView).props.enabled).toBe(true);
    expect(root.root.findByType(NativeTipView).props.enabled).toBe(false);
  });

  it('inherits outside-dismiss behavior and lets a popover opt out', () => {
    const onInvalidated = jest.fn();
    const root = mount(
      <TipKit.Group tipIds={['one', 'two']} invalidateOnOutsideDismiss>
        <TipKit.Popover tipId="one" title="One" onInvalidated={onInvalidated}>
          <Text>One</Text>
        </TipKit.Popover>
        <TipKit.Popover
          tipId="two"
          title="Two"
          invalidateOnOutsideDismiss={false}
        >
          <Text>Two</Text>
        </TipKit.Popover>
      </TipKit.Group>
    );
    const tips = () => root.root.findAllByType(NativeTipPopoverView);
    expect(tips()[0]!.props.invalidateOnOutsideDismiss).toBe(true);
    expect(tips()[1]!.props.invalidateOnOutsideDismiss).toBe(false);
    invalidated(tips()[0]!.props);
    expect(onInvalidated).toHaveBeenCalledWith({ reason: 'tipClosed' });
    expect(tips()[1]!.props.enabled).toBe(true);
  });

  it('does not skip an explicitly disabled member or enable an unrelated nested group', () => {
    const root = mount(
      <TipKit.Group tipIds={['one', 'two']}>
        <TipKit.View tipId="one" title="One" enabled={false} />
        <TipKit.View tipId="two" title="Two" />
        <TipKit.Group tipIds={['nested']} enabled={false}>
          <TipKit.View tipId="nested" title="Nested" />
        </TipKit.Group>
      </TipKit.Group>
    );
    expect(
      root.root.findAllByType(NativeTipView).map((tip) => tip.props.enabled)
    ).toEqual([false, false, false]);
  });

  it.each([
    ['one', 'one'],
    ['one', ' '],
  ])('rejects invalid IDs: %p', (...tipIds) => {
    expect(() =>
      mount(<TipKit.Group tipIds={tipIds}>{null}</TipKit.Group>)
    ).toThrow(/TinyUI/);
  });

  it('rejects undeclared members', () => {
    expect(() =>
      mount(
        <TipKit.Group tipIds={['one']}>
          <TipKit.View tipId="other" title="Other" />
        </TipKit.Group>
      )
    ).toThrow(/missing/);
  });
});
