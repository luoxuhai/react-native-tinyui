import { assertComponentEnabled, getNativeTinyui } from '../utils';
import type { TipInvalidationReason, TipKitConfiguration } from './types';
import { validateTipId } from './validation';
import { Popover } from './Popover';

export const TipKit = {
  Popover,
  /** Configure TipKit once before mounting tips. Repeating the same options is safe. */
  async configure({
    displayFrequency = 'daily',
  }: TipKitConfiguration = {}): Promise<void> {
    assertComponentEnabled('TipKit');
    if (
      !['immediate', 'hourly', 'daily', 'weekly', 'monthly'].includes(
        displayFrequency
      )
    ) {
      throw new Error(
        '[TinyUI] TipKit.configure received an invalid displayFrequency.'
      );
    }
    await getNativeTinyui().configureTips(displayFrequency);
  },

  /** Persistently invalidate a tip, including when its view is not mounted. */
  async invalidate(
    tipId: string,
    reason: TipInvalidationReason = 'actionPerformed'
  ): Promise<void> {
    assertComponentEnabled('TipKit');
    validateTipId(tipId);
    if (reason !== 'actionPerformed' && reason !== 'tipClosed') {
      throw new Error('[TinyUI] TipKit.invalidate received an invalid reason.');
    }
    await getNativeTinyui().invalidateTip(tipId, reason);
  },
};

export type {
  TipAction,
  TipDisplayFrequency,
  TipError,
  TipInvalidationReason,
  TipKitConfiguration,
  TipPopoverProps,
  TipStatus,
} from './types';
