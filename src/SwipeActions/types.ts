import type { ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native';

export type SwipeActionsEdge = 'leading' | 'trailing';

export interface SwipeAction {
  /** Stable identifier. Defaults to `item.<index>` when omitted. */
  id?: string;
  /** Button title and accessible action name. */
  title: string;
  /** SF Symbol name. */
  systemImage?: string;
  /** Native action background color, including semantic and dynamic colors. */
  tintColor?: ColorValue;
  /** Uses the system destructive appearance. Does not remove the React row. */
  destructive?: boolean;
}

export type SwipeActionPressEvent = Readonly<{
  nativeEvent: Readonly<{ id: string; title: string }>;
}>;

export interface SwipeActionsProps extends Omit<ViewProps, 'children'> {
  /** The React Native row content. */
  children: ReactNode;
  /** Styles the moving row, including its background, corners and padding. */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Actions ordered from the selected edge inward. */
  actions: readonly SwipeAction[];
  /** Logical edge; respects layout direction. Defaults to `trailing`. */
  edge?: SwipeActionsEdge;
  /** A full swipe performs the first action. Defaults to `true`. */
  allowsFullSwipe?: boolean;
  /** Disables swipe actions without disabling the row's children. */
  disabled?: boolean;
  onActionPress?: (event: SwipeActionPressEvent) => void;
}
