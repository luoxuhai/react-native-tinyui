import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export type TipDisplayFrequency =
  'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface TipKitConfiguration {
  /** App-wide interval between new tips. Defaults to `daily`. */
  displayFrequency?: TipDisplayFrequency;
}

export type TipInvalidationReason = 'actionPerformed' | 'tipClosed';

export interface TipAction {
  /** Unique nonempty identity within this tip, returned by `onActionPress`. */
  id: string;
  /** Nonempty button label, already localized by the app. */
  title: string;
}

export interface TipError {
  code: string;
  message: string;
}

export interface TipContentProps extends Omit<ViewProps, 'children'> {
  /** Stable identity used by TipKit to persist this tip's history. */
  tipId: string;
  title: string;
  message?: string;
  systemImage?: string;
  /** Native action buttons, each with its own id and title; TipKit controls their layout. */
  actions?: readonly TipAction[];
  /** Allows presentation when TipKit is also eligible. Defaults to true. */
  enabled?: boolean;
  /** Omit to leave the number of presentations unlimited. */
  maxDisplayCount?: number;
  ignoresDisplayFrequency?: boolean;
  /** Receives the tapped button's id and title; does not automatically invalidate the tip. */
  onActionPress?: (action: TipAction) => void;
  onError?: (error: TipError) => void;
}

export interface TipPopoverProps extends TipContentProps {
  /** Anchor content. Its existing touch handlers are preserved. */
  children: ReactNode;
  /** Preferred arrow edge on the bubble; UIKit may adapt to available space. */
  arrowEdge?: 'top' | 'bottom' | 'leading' | 'trailing' | 'auto';
}

export interface TipViewProps extends TipContentProps {
  /** Inline tips render native content and do not take anchor children. */
  children?: never;
  /** Optional arrow on the inline view. Defaults to no arrow. */
  arrowEdge?: 'top' | 'bottom' | 'leading' | 'trailing' | 'none';
}
