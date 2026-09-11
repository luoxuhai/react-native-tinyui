# react-native-tinyui

Dependency-free, native iOS `Menu`, `Popover` and `LiquidGlassText` components for React Native's
New Architecture. The public API follows normal React composition patterns;
the native UI is implemented with SwiftUI behind Fabric components.

The initial component behavior is inspired by
[`@expo/ui`](https://github.com/expo/expo/tree/main/packages/expo-ui), but this
package does not require Expo Modules or any other runtime package. The
React Native ↔ SwiftUI bridge follows the approach used by
[`react-native-pager-view`](https://github.com/callstack/react-native-pager-view):
a Fabric component view hosts the SwiftUI view through a `UIHostingController`.

## Requirements

- React Native with the New Architecture enabled
- iOS 17 or newer
- `react` and `react-native` are the only peer dependencies

This package intentionally ships only iOS native code. Android and web are not
supported targets.

## Installation

```sh
npm install react-native-tinyui
cd ios && pod install
```

### Optional component selection

To reduce the native code compiled into your app, list only the components you
use in your app's `package.json`:

```json
{
  "react-native-tinyui": {
    "components": ["Menu"]
  }
}
```

Available components:

- `Menu`
- `Popover`
- `LiquidGlassText`

All components are enabled by default. Use an empty `components` array to
compile only the TurboModule core. Run `pod install` again whenever this list
changes. Rendering a component whose native part was not selected throws an
error that names the missing component.

Component-specific JavaScript entry points are also available:

```tsx
import { Menu } from 'react-native-tinyui/menu';
import { Popover } from 'react-native-tinyui/popover';
import { LiquidGlassText } from 'react-native-tinyui/liquid-glass-text';
```

The root `react-native-tinyui` imports remain supported for backwards
compatibility. JavaScript entry points provide cleaner dependency boundaries;
`react-native-tinyui.components` controls which native source files are compiled.

## Menu

`Menu` uses `children` as its trigger and receives its native menu entries
through the `options` prop. Without `onPrimaryAction`, a tap opens the menu.
When `onPrimaryAction` is present, a tap invokes it and a long press opens the
menu.

```tsx
import { Menu } from 'react-native-tinyui';

<Menu
  accessibilityLabel="Document actions"
  title="Document actions"
  onPrimaryAction={() => openDocument()}
  options={[
    {
      title: 'Rename',
      systemImage: 'square.and.pencil',
      onSelect: rename,
    },
    {
      title: 'Pinned',
      state: 'on',
      systemImage: 'pin',
      onSelect: togglePinned,
    },
    {
      type: 'submenu',
      title: 'Share',
      systemImage: 'square.and.arrow.up',
      options: [
        { title: 'Copy link', onSelect: copyLink },
        { title: 'Invite people', onSelect: invitePeople },
      ],
    },
    { type: 'divider' },
    {
      title: 'Delete',
      destructive: true,
      systemImage: 'trash',
      onSelect: remove,
    },
  ]}
>
  <View style={styles.button}>
    <Text>Actions</Text>
  </View>
</Menu>;
```

Actions are the default option type. Use `type: 'submenu'`, `type: 'section'`,
or `type: 'divider'` for structural entries; nested entries use their own
`options` array. SF Symbols are passed with `systemImage`; missing symbols
simply render no image.

Action options support `subtitle`, `state`, `destructive`, `disabled`, `hidden`,
and `keepOpen`. Use `titleColor` to customize the title, or `icon` to load an
image from the containing app's asset catalog; `iconColor` tints either an asset
image or an SF Symbol. These colors accept React Native `ColorValue`s, including
dynamic and semantic iOS colors. Submenus support the same label fields plus
`destructive`, `disabled`, `hidden`, and `displayInline`.

## Popover

`Popover` supports standard controlled and uncontrolled React state. Its content
remains a normal interactive React Native view tree hosted by a real
`UIPopoverPresentationController`.

```tsx
import { Popover, PopoverClose } from 'react-native-tinyui';

<Popover
  defaultOpen={false}
  attachmentAnchor="bottom"
  arrowEdge="top"
  contentSize={{ width: 320, height: 220 }}
  onOpenChange={(open) => console.log({ open })}
  content={({ close }) => (
    <View style={styles.content}>
      <Text>Any React Native content can be rendered here.</Text>
      <PopoverClose close={close} style={styles.doneButton}>
        <Text>Done</Text>
      </PopoverClose>
    </View>
  )}
>
  <View style={styles.button}>
    <Text>Show details</Text>
  </View>
</Popover>;
```

The trigger is `children` — tapping it opens the popover. The popover body is
the `content` prop, which can be a node or a render function receiving
`{ close }` to dismiss the popover from within. `PopoverClose` (also available
as `Popover.Close`) renders a `Pressable` that calls `close` when pressed.

Use `open` with `onOpenChange` for a controlled popover, or `defaultOpen` for an
uncontrolled one. `contentSize` defaults to 320 × 240 points and can be updated
while the popover is visible.

## LiquidGlassText

`LiquidGlassText` renders native glass inside the glyph outlines, based on
[GlassText](https://github.com/ailtonvivaz/GlassText). It supports the reference
library's text, glass, font and alignment APIs through React props.
Background image loading is not part of this component.

Building this component requires **Xcode 26+**. Glass is rendered on **iOS 26+**;
on iOS 17–25 it displays ordinary SwiftUI text using the same font, alignment
and optional tint. The rest of TinyUI continues to support iOS 17+.

```tsx
import { LiquidGlassText } from 'react-native-tinyui';

<LiquidGlassText
  text="Liquid Glass"
  glass={{ effect: 'regular', tint: '#00BBDD' }}
  font={{ size: 48, weight: 'bold', design: 'rounded' }}
/>;

<LiquidGlassText
  text={'Multi-line\nGlass Text\nEffect'}
  glass="clear"
  font="largeTitle"
  fontWeight="heavy"
  fontDesign="serif"
  multilineTextAlignment="center"
/>;
```

| Prop                     | Values                                                                                   | Default       |
| ------------------------ | ---------------------------------------------------------------------------------------- | ------------- |
| `text`                   | String (including text translated in JavaScript)                                         | Required      |
| `glass`                  | `'clear'`, `'regular'`, `'identity'`, or `{ effect?, tint?, interactive? }`              | `'clear'`     |
| `font`                   | A semantic text style, or `{ size, weight?, design?, family? }`                          | `'body'`      |
| `fontWeight`             | `ultraLight`, `thin`, `light`, `regular`, `medium`, `semibold`, `bold`, `heavy`, `black` | Font's weight |
| `fontDesign`             | `default`, `serif`, `monospaced`, `rounded`                                              | Font's design |
| `multilineTextAlignment` | `leading`, `center`, `trailing`                                                          | `leading`     |

Semantic font styles are `largeTitle`, `title`, `title2`, `title3`, `headline`,
`subheadline`, `body`, `callout`, `footnote`, `caption`, and `caption2`. They
follow SwiftUI Dynamic Type. Explicit `size` values use fixed point sizes;
`family` accepts the PostScript name of a font installed in the app.
`fontWeight` and `fontDesign` override the corresponding system font options.
A custom font family determines its own design.

Glass options accept `tint` as a React Native `ColorValue`, including
`PlatformColor` and `DynamicColorIOS`. The object form defaults to the clear
effect, with no tint or interactivity. `identity` applies no glass effect.
The component also accepts standard `ViewProps`, including `style`, `testID`,
accessibility props and a native view ref. The supplied text is used for
the default accessibility label; pass `accessibilityLabel` to override it.

Native content measurements supply the default width and height. Layout styles
can override these dimensions, but do not resize the font or wrap text. As in
GlassText, use explicit `\n` characters for multiple lines. Keep padding on a
surrounding `View`. Color emoji and other glyphs without vector outlines cannot
produce a glass shape.

`text` accepts a string. Applications using JavaScript localization can pass
their translated string directly.

The adapted Core Text outline implementation retains the upstream MIT notice in
[`ios/LiquidGlassText/GlassText-LICENSE`](ios/LiquidGlassText/GlassText-LICENSE).

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
