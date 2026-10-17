import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { assertComponentEnabled } from '../utils';
import type { TipGroupProps } from './types';
import { validateTipId } from './validation';

interface GroupContextValue {
  tipIds: ReadonlySet<string>;
  currentTipId: string | undefined;
  enabled: boolean;
  showsCloseButton: boolean;
  dismissOnOutsidePress: boolean;
  invalidateOnOutsideDismiss: boolean;
  complete: (tipId: string) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

/** Orders tips by ID while native TipKit owns eligibility and persisted history. */
export function Group({
  tipIds,
  priority = 'ordered',
  enabled = true,
  showsCloseButton = true,
  dismissOnOutsidePress = true,
  invalidateOnOutsideDismiss = false,
  children,
}: TipGroupProps) {
  assertComponentEnabled('TipKit');
  if (priority !== 'ordered') {
    throw new Error('[TinyUI] TipKit.Group only supports ordered priority.');
  }
  const ids = new Set<string>();
  for (const tipId of tipIds) {
    validateTipId(tipId);
    if (ids.has(tipId)) {
      throw new Error('[TinyUI] TipKit.Group tipIds must be unique.');
    }
    ids.add(tipId);
  }

  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const complete = useCallback((tipId: string) => {
    setCompleted((previous) =>
      previous.has(tipId) ? previous : new Set([...previous, tipId])
    );
  }, []);
  const value = useMemo(
    () => ({
      tipIds: new Set(tipIds),
      currentTipId: tipIds.find((id) => !completed.has(id)),
      enabled,
      showsCloseButton,
      dismissOnOutsidePress,
      invalidateOnOutsideDismiss,
      complete,
    }),
    [
      tipIds,
      completed,
      enabled,
      showsCloseButton,
      dismissOnOutsidePress,
      invalidateOnOutsideDismiss,
      complete,
    ]
  );

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}

export function useTipGroup(tipId: string) {
  const group = useContext(GroupContext);
  if (group && !group.tipIds.has(tipId)) {
    throw new Error(
      `[TinyUI] TipKit tipId "${tipId}" is missing from its Group's tipIds.`
    );
  }
  return group;
}
