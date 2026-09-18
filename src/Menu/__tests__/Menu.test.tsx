import { describe, expect, it } from '@jest/globals';
import { DynamicColorIOS, PlatformColor } from 'react-native';

import { serializeMenuOptions } from '../options';

describe('Menu options', () => {
  it('serializes nested options and stable action ids', () => {
    const config = serializeMenuOptions([
      { id: 'rename', title: 'Rename' },
      { type: 'divider' },
      {
        type: 'submenu',
        title: 'More',
        options: [{ title: 'Delete', destructive: true }],
      },
    ]);

    expect(config).toEqual({
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
  });

  it('rejects duplicate explicit item ids', () => {
    expect(() =>
      serializeMenuOptions([
        { id: 'same', title: 'One' },
        { id: 'same', title: 'Two' },
      ])
    ).toThrow('must be unique');
  });

  it('serializes visual, state, and inline submenu options', () => {
    const config = serializeMenuOptions([
      {
        id: 'selected',
        title: 'Selected',
        subtitle: 'Current choice',
        icon: 'custom-icon',
        iconColor: '#336699',
        titleColor: '#cc3300',
        state: 'on',
        destructive: true,
        disabled: true,
        hidden: true,
        keepOpen: true,
      },
      {
        type: 'submenu',
        title: 'Inline actions',
        systemImage: 'ellipsis',
        displayInline: true,
        destructive: true,
        disabled: true,
        hidden: true,
        options: [{ title: 'Child' }],
      },
    ]);

    expect(config).toEqual({
      items: [
        {
          id: 'selected',
          title: 'Selected',
          subtitle: 'Current choice',
          icon: 'custom-icon',
          iconColor: 0xff336699,
          titleColor: 0xffcc3300,
          state: 'on',
          destructive: true,
          disabled: true,
          hidden: true,
          keepOpen: true,
          type: 'action',
        },
        expect.objectContaining({
          type: 'submenu',
          title: 'Inline actions',
          systemImage: 'ellipsis',
          displayInline: true,
          destructive: true,
          disabled: true,
          hidden: true,
        }),
      ],
    });
  });

  it('preserves semantic and dynamic ColorValues', () => {
    const config = serializeMenuOptions([
      {
        title: 'Adaptive colors',
        titleColor: PlatformColor('label'),
        iconColor: DynamicColorIOS({
          light: '#112233',
          dark: '#ddeeff',
        }),
      },
    ]);
    expect(config.items[0]).toMatchObject({
      titleColor: { semantic: ['label'] },
      iconColor: {
        dynamic: {
          light: 0xff112233,
          dark: 0xffddeeff,
        },
      },
    });
  });
});
