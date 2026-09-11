import { describe, expect, it, jest } from '@jest/globals';

import { PopoverClose } from '../PopoverClose';

describe('Popover close', () => {
  it('invokes the close callback when pressed', () => {
    const close = jest.fn();
    const element = PopoverClose({ close, children: 'Done' });

    expect(element).not.toBeNull();
    // The returned element is a Pressable; simulate its onPress.
    const pressable = element as { props: { onPress: () => void } };
    pressable.props.onPress();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
