# react-native-tinyui

Dependency-free, native iOS `Menu` and `Popover` components for React Native's
New Architecture. The public API follows normal React composition patterns;
UIKit presentation details stay behind Fabric components.

The initial component behavior is inspired by
[`@expo/ui`](https://github.com/expo/expo/tree/main/packages/expo-ui), but this
package does not require Expo Modules or any other runtime package.

## Requirements

- React Native with the New Architecture enabled
- iOS 15.1 or newer
- `react` and `react-native` are the only peer dependencies

This package intentionally ships only iOS native code. Android and web are not
supported targets.

## Installation

```sh
npm install react-native-tinyui
cd ios && pod install
```

## Menu

`Menu` renders its trigger in the React Native tree and places a transparent
native `UIButton` over it. Without `onPrimaryAction`, a tap opens the menu. When
`onPrimaryAction` is present, a tap invokes it and a long press opens the menu.

```tsx
import { Menu } from 'react-native-tinyui';

<Menu onPrimaryAction={() => openDocument()}>
  <Menu.Trigger accessibilityLabel="Document actions">
    <View style={styles.button}>
      <Text>Actions</Text>
    </View>
  </Menu.Trigger>

  <Menu.Content>
    <Menu.Item systemImage="square.and.pencil" onSelect={rename}>
      Rename
    </Menu.Item>
    <Menu.Item state="on" systemImage="pin" onSelect={togglePinned}>
      Pinned
    </Menu.Item>
    <Menu.Submenu title="Share" systemImage="square.and.arrow.up">
      <Menu.Item onSelect={copyLink}>Copy link</Menu.Item>
      <Menu.Item onSelect={invitePeople}>Invite people</Menu.Item>
    </Menu.Submenu>
    <Menu.Divider />
    <Menu.Item destructive systemImage="trash" onSelect={remove}>
      Delete
    </Menu.Item>
  </Menu.Content>
</Menu>;
```

Available content primitives are `Menu.Item`, `Menu.Submenu`, `Menu.Section`,
and `Menu.Divider`. SF Symbols are passed with `systemImage`; missing symbols
simply render no image.

## Popover

`Popover` supports standard controlled and uncontrolled React state. Its content
remains a normal interactive React Native view tree hosted by a real
`UIPopoverPresentationController`.

```tsx
import { Popover } from 'react-native-tinyui';

<Popover
  defaultOpen={false}
  attachmentAnchor="bottom"
  arrowEdge="top"
  contentSize={{ width: 320, height: 220 }}
  onOpenChange={(open) => console.log({ open })}>
  <Popover.Trigger style={styles.button}>
    <Text>Show details</Text>
  </Popover.Trigger>

  <Popover.Content style={styles.content}>
    <Text>Any React Native content can be rendered here.</Text>
    <Popover.Close style={styles.doneButton}>
      <Text>Done</Text>
    </Popover.Close>
  </Popover.Content>
</Popover>;
```

Use `open` with `onOpenChange` for a controlled popover, or `defaultOpen` for an
uncontrolled one. `contentSize` defaults to 320 × 240 points and can be updated
while the popover is visible.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
