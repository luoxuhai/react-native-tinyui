import { processColor } from 'react-native';

import type { SFSymbolEffect, SFSymbolProps } from './types';

function finite(name: string, value: number | undefined, minimum: number) {
  if (value !== undefined && (!Number.isFinite(value) || value < minimum)) {
    throw new RangeError(
      `[TinyUI] SFSymbol ${name} must be finite and >= ${minimum}.`
    );
  }
}

function positive(name: string, value: number | undefined) {
  finite(name, value, 0);
  if (value === 0) {
    throw new RangeError(`[TinyUI] SFSymbol ${name} must be greater than 0.`);
  }
}

export function serializeSFSymbol(props: SFSymbolProps, fontScale: number) {
  positive('size', props.size);
  finite('variableValue', props.variableValue, 0);
  if (props.variableValue !== undefined && props.variableValue > 1) {
    throw new RangeError('[TinyUI] SFSymbol variableValue must be <= 1.');
  }
  if (props.maxFontSizeMultiplier !== 0) {
    finite('maxFontSizeMultiplier', props.maxFontSizeMultiplier, 1);
  }
  if (
    props.paletteColors &&
    (props.paletteColors.length < 1 ||
      props.paletteColors.length > 3 ||
      props.paletteColors.some((color) => color === undefined))
  ) {
    throw new RangeError(
      '[TinyUI] SFSymbol paletteColors needs 1 to 3 colors.'
    );
  }

  const effects: readonly SFSymbolEffect[] = props.effect
    ? Array.isArray(props.effect)
      ? props.effect
      : [props.effect as SFSymbolEffect]
    : [];
  const types = new Set<string>();
  for (const effect of effects) {
    if (types.has(effect.type)) {
      throw new Error(
        `[TinyUI] SFSymbol has duplicate ${effect.type} effects.`
      );
    }
    types.add(effect.type);
    positive('effect.options.speed', effect.options?.speed);
    finite('effect.options.repeatDelay', effect.options?.repeatDelay, 0);
    const repeat = effect.options?.repeat;
    if (typeof repeat === 'number') {
      positive('effect.options.repeat', repeat);
      if (!Number.isSafeInteger(repeat)) {
        throw new RangeError(
          '[TinyUI] SFSymbol repeat must be a safe integer.'
        );
      }
    }
    if (
      effect.options?.repeatBehavior === 'continuous' &&
      ((repeat !== undefined && repeat !== 'forever') ||
        effect.options.repeatDelay !== undefined)
    ) {
      throw new Error(
        '[TinyUI] SFSymbol continuous repetition cannot have a count or delay.'
      );
    }
    if (
      effect.type === 'wiggle' &&
      effect.angle !== undefined &&
      !Number.isFinite(effect.angle)
    ) {
      throw new RangeError('[TinyUI] SFSymbol wiggle angle must be finite.');
    }
    if (
      typeof effect.trigger === 'number' &&
      !Number.isFinite(effect.trigger)
    ) {
      throw new RangeError('[TinyUI] SFSymbol effect trigger must be finite.');
    }
  }
  positive('contentTransition.speed', props.contentTransition?.speed);

  return {
    configuration: {
      name: props.name,
      source: props.source ?? 'system',
      size: props.size ?? 17,
      weight: props.weight ?? 'unspecified',
      scale: props.scale ?? 'default',
      fontScale:
        props.allowFontScaling === false
          ? 1
          : Math.min(fontScale, props.maxFontSizeMultiplier || Infinity),
      renderingMode: props.renderingMode ?? 'automatic',
      color: props.color === undefined ? undefined : processColor(props.color),
      paletteColors: props.paletteColors?.map((color) => processColor(color)),
      variableValue: props.variableValue,
      variableValueMode: props.variableValueMode ?? 'automatic',
      colorRenderingMode: props.colorRenderingMode ?? 'automatic',
    },
    effects: effects.map((effect) => ({
      ...effect,
      active: effect.active ?? true,
      animated: effect.animated ?? true,
    })),
    contentTransition: props.contentTransition ?? {},
  };
}
