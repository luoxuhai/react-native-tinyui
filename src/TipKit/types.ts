import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export type TipDisplayFrequency =
  'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface TipKitConfiguration {
  /** App-wide interval between new tips. Defaults to `daily`. */
  displayFrequency?: TipDisplayFrequency;
}

export type TipInvalidationReason = 'actionPerformed' | 'tipClosed';

export type TipStatus =
  | { status: 'pending' | 'available' }
  | {
      status: 'invalidated';
      reason:
        | TipInvalidationReason
        | 'displayCountExceeded'
        | 'displayDurationExceeded'
        | 'unknown';
    };

export interface TipAction {
  id: string;
  title: string;
}

export interface TipError {
  code: string;
  message: string;
}

export interface TipPopoverProps extends Omit<ViewProps, 'children'> {
  /** Anchor content. Its existing touch handlers are preserved. */
  children: ReactNode;
  /** Stable identity used by TipKit to persist this tip's history. */
  tipId: string;
  title: string;
  message?: string;
  systemImage?: string;
  actions?: readonly TipAction[];
  /** Allows presentation when TipKit is also eligible. Defaults to true. */
  enabled?: boolean;
  /** Omit to leave the number of presentations unlimited. */
  maxDisplayCount?: number;
  ignoresDisplayFrequency?: boolean;
  /** Preferred arrow edge on the bubble; UIKit may adapt to available space. */
  arrowEdge?: 'top' | 'bottom' | 'leading' | 'trailing' | 'auto';
  /** TipKit eligibility, independent of whether the bubble is on screen. */
  onStatusChange?: (status: TipStatus) => void;
  onVisibleChange?: (visible: boolean) => void;
  /** Actions do not automatically invalidate the tip. */
  onActionPress?: (action: TipAction) => void;
  onError?: (error: TipError) => void;
}
