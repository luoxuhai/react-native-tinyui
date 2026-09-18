# TinyUI iOS example

An interactive playground for the local `react-native-tinyui` workspace. Explore
native menus, popovers, steppers, concentric corners, SF Symbols, and glass typography, with
controls that update each preview at runtime.

Built with React Native 0.85 and React Navigation's native stack. This example
supports iOS only.

## Requirements

- macOS with Xcode 26+ and an iOS simulator or device.
- Node.js matching the repository's [`.nvmrc`](../.nvmrc).
- Yarn 4.11.0, as pinned in the root [`package.json`](../package.json).
- Ruby and Bundler for the dependencies in [`Gemfile`](./Gemfile).

The deployment target is iOS 17. Use iOS 26+ to see Liquid Glass; on earlier
versions, `LiquidGlassText` renders ordinary text and `Popover` uses the system
popover appearance. `ConcentricView` uses a fixed minimum radius before iOS 26.
Xcode 26+ is required to build this example because it includes
`LiquidGlassText` and `ConcentricView`.

## Run the app

Start in the repository root, `react-native-tinyui/`.

### 1. Install dependencies

```sh
yarn install
cd example
bundle install
cd ios
bundle exec pod install
cd ../..
```

### 2. Start Metro

From the repository root:

```sh
yarn example start
```

### 3. Launch the iOS app

In a second terminal, also from the repository root:

```sh
yarn example ios
```

The start and iOS scripts both use port **8082**. To select a simulator, pass its
installed name:

```sh
yarn example ios --simulator "iPhone 17 Pro"
```

For Xcode builds, open `example/ios/TinyuiExample.xcworkspace` after installing
pods and select the `TinyuiExample` scheme. Keep Metro running for Debug builds.

## Explore the playground

The home screen links to five component pages. Each page combines a live
preview with controls and feedback so you can explore behavior without editing
code.

### Menu

[`MenuScreen.tsx`](./src/screens/MenuScreen.tsx) presents a sample document with
three menu compositions:

| Composition | What to try                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Actions     | Rename, Share, and Duplicate, with SF Symbols, subtitles, and a semantic icon color.                                    |
| Selection   | Toggle Pinned and Mixed selection, inspect the disabled action, and change whether the menu stays open after selection. |
| Nested      | Open Share with, explore sections and inline groups, and inspect the destructive Delete action.                         |

Use **Disable trigger** to prevent the menu from opening. The state tiles reflect
selection changes; **Last action** displays the latest event and selection count.
Document actions are demonstrations: they do not rename, share, or delete files.

### Popover

[`PopoverScreen.tsx`](./src/screens/PopoverScreen.tsx) demonstrates sizing,
placement, and dismissal:

- Choose **Compact**, **Roomy**, or **Tall**, then use **Resize** inside the open
  popover to change its content dimensions without closing it.
- Try **Auto**, **Above**, **Below**, **Left**, and **Right** placement. iOS may
  adjust the position and size to fit the available screen space.
- Open **Let content lead** and use **Read more** to see automatic height changes.
- Dismiss with an in-content close button or by tapping outside. The event line
  reports opening, dismissal, and resizing.

The main preview uses controlled `open` state; the additional examples are
uncontrolled. Content backgrounds remain transparent to expose the native
popover material.

### Liquid Glass Text

[`LiquidGlassTextScreen.tsx`](./src/screens/LiquidGlassTextScreen.tsx) is a live
typography playground:

- Edit up to **48 characters** across **three lines**. Swipe horizontally in the
  preview when a line runs wide.
- Compare **Clear**, **Regular**, and **Identity** materials, choose a tint, and
  toggle touch interaction.
- Adjust the font design, size, and multiline alignment.
- Preview the text over a bundled landscape image. Use **Reset playground** to
  restore the defaults, including the three lines **Liquid Glass**, **液态玻璃**,
  and **1234567890**.

The [background image](./src/assets/liquid-glass-background.jpg) comes from
[Unsplash](https://images.unsplash.com/photo-1470770841072-f978cf4d019e).

On iOS 26+, Identity removes the glass material, so the letter shapes may become
invisible. On earlier iOS versions, material and interaction controls do not add
a glass effect to the fallback text.

### Stepper

[`StepperScreen.tsx`](./src/screens/StepperScreen.tsx) bridges `UIStepper`:

- Tap or hold **+** and **−** to change the controlled value.
- Switch ranges, including negative values, and choose fractional or whole steps.
- Toggle continuous events, autorepeat, wrapping, and disabled state.
- Turn off **Accept changes** to verify that a controlled value remains fixed.
- Use **Set to minimum** for a programmatic update, or try the uncontrolled example.

### Concentric View

[`ConcentricViewScreen.tsx`](./src/screens/ConcentricViewScreen.tsx) anchors three
nested colored containers near the bottom screen corners, outside the scrolling
controls and bottom safe area:

- Change **Edge inset** to move the preview inward from the sides and bottom.
- Change **Lift from bottom** to move it away from the bottom corners.
- Change **Nested spacing** to adjust the gap between the colored containers.

On iOS 26+, `containerConcentricRadius` resolves each corner independently from
the view and container geometry, without a minimum radius. A corner can become
square when it moves away from a rounded container corner. The example does not
set `borderRadius` or calculate the concentric radii in JavaScript.

Before iOS 26, all three containers use a fixed 24 pt fallback radius; the
controls still change the layout, but the radii do not adapt.

### SF Symbol

[`SFSymbolScreen.tsx`](./src/screens/SFSymbolScreen.tsx) uses UIKit's `UIImageView`
and the native Symbols animation presets:

- Edit a symbol name and compare point sizes, all weights, scales and rendering modes.
- Try semantic colors, a three-color palette, gradients, and variable color/draw progress.
- Select each preset and its layer, direction or iteration modifiers; replay it,
  deactivate it, or change speed, repetition and repeat delay.
- Switch symbol names to compare Automatic, Replace and Magic Replace transitions.
- Check intrinsic sizing and the Reduce Motion behavior.

Wiggle, Rotate, Breathe, Magic Replace and advanced repeat options require iOS 18.
Draw On/Off, variable draw and gradient colors require iOS 26. Older versions
ignore unavailable effects and use the documented fallbacks.

## Working on the example

Metro resolves `react-native-tinyui` directly from the repository's `src/`
through [`metro.config.js`](./metro.config.js). You do not need to build `lib/`
to preview JavaScript or TypeScript changes.

- Edit screens in [`src/screens/`](./src/screens/).
- Shared page layouts, settings, and controls for the playground screens live
  in [`src/components/Playground.tsx`](./src/components/Playground.tsx).
- Navigation is defined in [`src/App.tsx`](./src/App.tsx) and
  [`src/navigation.ts`](./src/navigation.ts).
- JavaScript and TypeScript changes use Fast Refresh. Native changes require
  rebuilding the app.
- All six native components are enabled in [`package.json`](./package.json).
  If you change that selection, reinstall pods and rebuild. Keep the selection
  aligned with the screens rendered by the app.

Run checks from the repository root:

```sh
yarn typecheck
yarn lint
yarn test
```

For the complete component APIs and installation in another app, see the
[library README](../README.md).
