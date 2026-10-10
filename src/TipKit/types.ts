import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export type TipDisplayFrequency =
  'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface TipKitConfiguration {
  /** App-wide interval between new tips. Defaults to `daily`. */
  displayFrequency?: TipDisplayFrequency;
}

export type TipInvalidationReason = 'actionPerformed' | 'tipClosed';

export interface TipInvalidationEvent {
  reason:
    | TipInvalidationReason
    | 'displayCountExceeded'
    | 'displayDurationExceeded'
    | 'unknown';
}

export interface TipGroupProps {
  /** Stable tip IDs in presentation order, independent of the layout tree. */
  tipIds: readonly string[];
  /** Currently only ordered presentation is supported. Defaults to ordered. */
  priority?: 'ordered';
  /** Pause all tips in this group without completing them. Defaults to true. */
  enabled?: boolean;
  /** Treat tapping outside a popover as completion. Defaults to false. */
  invalidateOnOutsideDismiss?: boolean;
  children: ReactNode;
}

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
  /** Called for native invalidation, including persisted invalidation on mount. */
  onInvalidated?: (event: TipInvalidationEvent) => void;
  onError?: (error: TipError) => void;
}

export interface TipPopoverProps extends TipContentProps {
  /** Invalidate on outside dismissal. Inherits from Group; otherwise false. */
  invalidateOnOutsideDismiss?: boolean;
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
