import type { TipPopoverProps } from './types';

export function validateTipId(tipId: string): void {
  if (typeof tipId !== 'string' || tipId.trim().length === 0) {
    throw new Error('[TinyUI] TipKit tipId must be a nonempty string.');
  }
}

export function validateTip(props: TipPopoverProps): void {
  validateTipId(props.tipId);
  if (typeof props.title !== 'string' || props.title.trim().length === 0) {
    throw new Error('[TinyUI] TipKit.Popover title must be a nonempty string.');
  }
  if (
    props.maxDisplayCount !== undefined &&
    (!Number.isInteger(props.maxDisplayCount) ||
      props.maxDisplayCount < 1 ||
      props.maxDisplayCount > 2147483647)
  ) {
    throw new Error(
      '[TinyUI] TipKit.Popover maxDisplayCount must be a positive 32-bit integer.'
    );
  }
  const ids = new Set<string>();
  for (const action of props.actions ?? []) {
    if (
      typeof action.id !== 'string' ||
      action.id.trim().length === 0 ||
      typeof action.title !== 'string' ||
      action.title.trim().length === 0 ||
      ids.has(action.id)
    ) {
      throw new Error(
        '[TinyUI] TipKit.Popover actions need unique nonempty ids and nonempty titles.'
      );
    }
    ids.add(action.id);
  }
}
