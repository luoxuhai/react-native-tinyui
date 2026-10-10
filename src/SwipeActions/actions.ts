import { processColor } from 'react-native';

import type { SwipeAction } from './types';

export function serializeSwipeActions(actions: readonly SwipeAction[]) {
  const ids = new Set<string>();

  return actions.map((action, index) => {
    const id = action.id ?? `item.${index}`;
    if (ids.has(id)) {
      throw new Error(`SwipeActions action id "${id}" must be unique.`);
    }
    ids.add(id);

    return {
      id,
      title: action.title,
      systemImage: action.systemImage,
      tintColor:
        action.tintColor === undefined
          ? undefined
          : processColor(action.tintColor),
      destructive: action.destructive ?? false,
    };
  });
}
