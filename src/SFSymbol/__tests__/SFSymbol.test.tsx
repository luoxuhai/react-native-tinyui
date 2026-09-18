import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import {
  DynamicColorIOS,
  PlatformColor,
  processColor,
  StyleSheet,
} from 'react-native';

import { SFSymbol } from '..';
import NativeSFSymbolView, {
  type NativeSFSymbolProps,
} from '../SFSymbolNativeComponent';
import { serializeSFSymbol } from '../options';
import type { SFSymbolEffect, SFSymbolProps } from '../types';
import { assertComponentEnabled } from '../../utils';

jest.mock('../../utils', () => ({ assertComponentEnabled: jest.fn() }));
jest.mock('../SFSymbolNativeComponent', () => 'TinyuiSFSymbolView');

const roots: ReactTestRenderer[] = [];
afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  jest.clearAllMocks();
});

describe('SFSymbol', () => {
  it('keeps playback tokens stable across unrelated renders and clears removed effects', () => {
    let root!: ReactTestRenderer;
    const effect: SFSymbolEffect = { type: 'bounce', trigger: 4 };
    act(() => {
      root = create(<SFSymbol name="heart.fill" effect={effect} />);
    });
    roots.push(root);
    const props = () =>
      root.root.findByType(NativeSFSymbolView).props as NativeSFSymbolProps;
    const initialEffects = props().effects;
    act(() =>
      root.update(
        <SFSymbol name="heart.fill" color="red" effect={{ ...effect }} />
      )
    );
    expect(props().effects).toEqual(initialEffects);
    act(() =>
      root.update(
        <SFSymbol name="heart.fill" effect={{ ...effect, trigger: 5 }} />
      )
    );
    expect(props().effects).not.toEqual(initialEffects);
    act(() => root.update(<SFSymbol name="heart.fill" />));
    expect(props().effects).toEqual([]);
    expect(props().contentTransition).toEqual({});
    expect(assertComponentEnabled).toHaveBeenCalledWith('SFSymbol');
  });

  it('preserves semantic and dynamic colors through the mixed native configuration', () => {
    const semantic = PlatformColor('labelColor');
    const dynamic = DynamicColorIOS({ light: '#000000', dark: '#FFFFFF' });
    const { configuration } = serializeSFSymbol(
      {
        name: 'person.3.fill',
        color: semantic,
        renderingMode: 'palette',
        paletteColors: [dynamic, semantic, '#FF0000'],
      },
      1
    );
    expect(configuration.color).toEqual(processColor(semantic));
    expect(configuration.paletteColors).toEqual([
      processColor(dynamic),
      processColor(semantic),
      processColor('#FF0000'),
    ]);
  });

  it('applies font scaling once and respects explicit scaling limits', () => {
    expect(
      serializeSFSymbol({ name: 'heart', size: 20 }, 2).configuration
    ).toMatchObject({ size: 20, fontScale: 2 });
    expect(
      serializeSFSymbol({ name: 'heart', maxFontSizeMultiplier: 1.5 }, 2)
        .configuration.fontScale
    ).toBe(1.5);
    expect(
      serializeSFSymbol({ name: 'heart', maxFontSizeMultiplier: 0 }, 2)
        .configuration.fontScale
    ).toBe(2);
    expect(
      serializeSFSymbol({ name: 'heart', allowFontScaling: false }, 2)
        .configuration.fontScale
    ).toBe(1);
  });

  it('supports combining distinct native presets without losing their modifiers', () => {
    const effect: SFSymbolEffect[] = [
      { type: 'scale', direction: 'down', scope: 'wholeSymbol', active: false },
      {
        type: 'variableColor',
        iteration: 'cumulative',
        reversing: false,
        inactiveLayers: 'hide',
        options: { repeat: 3, repeatDelay: 0.5, speed: 2 },
      },
      {
        type: 'wiggle',
        angle: -45,
        trigger: 'retry',
        options: { repeatBehavior: 'continuous' },
      },
      {
        type: 'drawOff',
        scope: 'individually',
        reversed: true,
        animated: false,
      },
    ];
    const result = serializeSFSymbol({ name: 'wifi', effect }, 1);
    effect.forEach((item, index) =>
      expect(result.effects[index]).toMatchObject({ ...item })
    );
  });

  it('preserves view accessibility and explicit layout overrides', () => {
    let root!: ReactTestRenderer;
    act(() => {
      root = create(
        <SFSymbol
          name="heart.fill"
          accessible
          accessibilityLabel="Favorite"
          style={{ width: 48, height: 48, alignSelf: 'center' }}
          respectReduceMotion={false}
        />
      );
    });
    roots.push(root);
    const props = root.root.findByType(NativeSFSymbolView)
      .props as NativeSFSymbolProps;
    expect(props).toMatchObject({
      accessible: true,
      accessibilityLabel: 'Favorite',
      accessibilityRole: 'image',
      respectReduceMotion: false,
    });
    expect(StyleSheet.flatten(props.style)).toEqual({
      width: 48,
      height: 48,
      alignSelf: 'center',
    });
  });

  it.each<Partial<SFSymbolProps>>([
    { size: 0 },
    { size: NaN },
    { size: Infinity },
    { variableValue: -0.1 },
    { variableValue: 1.1 },
    { variableValue: NaN },
    { maxFontSizeMultiplier: 0.5 },
    { effect: { type: 'bounce', options: { speed: 0 } } },
    { effect: { type: 'pulse', options: { repeat: 1.5 } } },
    { effect: { type: 'pulse', options: { repeat: 0 } } },
    { effect: { type: 'pulse', options: { repeatDelay: -1 } } },
    {
      effect: {
        type: 'pulse',
        options: { repeatBehavior: 'continuous', repeat: 2 },
      },
    },
    { effect: { type: 'wiggle', angle: NaN } },
    { effect: { type: 'bounce', trigger: Infinity } },
    { effect: [{ type: 'bounce' }, { type: 'bounce' }] },
    { contentTransition: { type: 'replace', speed: -1 } },
  ])('rejects invalid configuration before it reaches Symbols: %p', (props) => {
    expect(() => serializeSFSymbol({ name: 'heart', ...props }, 1)).toThrow(
      /SFSymbol/
    );
  });
});
