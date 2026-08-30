import { describe, expect, it, jest } from '@jest/globals';

import {
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuSubmenu,
  MenuTrigger,
  parseMenu,
} from '../MenuPrimitives';
import {
  PopoverContent,
  PopoverTrigger,
  parsePopover,
} from '../PopoverPrimitives';

describe('Menu composition', () => {
  it('serializes nested declarative items and keeps callbacks in JavaScript', () => {
    const onSelect = jest.fn();
    const parsed = parseMenu([
      <MenuTrigger key="trigger">Actions</MenuTrigger>,
      <MenuContent key="content">
        <MenuItem id="rename" onSelect={onSelect}>
          Rename
        </MenuItem>
        <MenuDivider />
        <MenuSubmenu title="More">
          <MenuItem destructive>Delete</MenuItem>
        </MenuSubmenu>
      </MenuContent>,
    ]);

    expect(JSON.parse(parsed.config)).toEqual({
      items: [
        expect.objectContaining({
          id: 'rename',
          title: 'Rename',
          type: 'action',
        }),
        { type: 'separator' },
        expect.objectContaining({
          title: 'More',
          type: 'submenu',
        }),
      ],
    });

    parsed.callbacks.get('rename')?.();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate explicit item ids', () => {
    expect(() =>
      parseMenu([
        <MenuTrigger key="trigger">Actions</MenuTrigger>,
        <MenuContent key="content">
          <MenuItem id="same">One</MenuItem>
          <MenuItem id="same">Two</MenuItem>
        </MenuContent>,
      ])
    ).toThrow('must be unique');
  });
});

describe('Popover composition', () => {
  it('extracts exactly one trigger and content declaration', () => {
    const parsed = parsePopover([
      <PopoverTrigger key="trigger">Open</PopoverTrigger>,
      <PopoverContent key="content">Details</PopoverContent>,
    ]);

    expect(parsed.trigger.children).toBe('Open');
    expect(parsed.content.children).toBe('Details');
  });
});
