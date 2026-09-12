# TinyUI iOS example

This React Native app demonstrates the iOS-only `Menu`, `Popover`, and
`LiquidGlassText` components from the local `react-native-tinyui` workspace.

## Menu API examples

[`src/MenuExamples.tsx`](./src/MenuExamples.tsx) is a runnable catalogue of
the complete public `Menu` API. It contains four examples:

- A complete options menu with every menu element and option field.
- A focused `onSelect` example that displays and checks the selected action.
- A primary-action menu: tap invokes `onPrimaryAction`, while long press opens
  its menu.
- A disabled menu trigger.

### Menu props

| Prop              | Example usage                                                                 |
| ----------------- | ----------------------------------------------------------------------------- |
| `children`        | A React Native `View` styled as the menu trigger.                             |
| `options`         | `allOptions`, containing actions, submenus, sections, and dividers.           |
| `title`           | `title="Complete Menu API"` adds a native menu header.                        |
| `disabled`        | The disabled-trigger example prevents presentation.                           |
| `onPrimaryAction` | The primary-action example handles tap and reserves long press for the menu.  |
| `ViewProps`       | `style`, `testID`, and `accessibilityLabel` demonstrate inherited view props. |

### Action options

Actions use `type: 'action'`, or omit `type` because action is the default.

| Field                     | Example usage                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`                      | `rename-document` and `mixed-state` provide stable selection IDs. IDs must be unique within one menu.                        |
| `title`, `subtitle`       | The Rename action displays a title and secondary label.                                                                      |
| `systemImage`             | Uses SF Symbol names such as `square.and.pencil`.                                                                            |
| `icon`                    | `AppIcon` demonstrates loading from the containing app's asset catalogue; when found it takes precedence over `systemImage`. |
| `iconColor`, `titleColor` | Demonstrates hex, `PlatformColor`, and `DynamicColorIOS` color values.                                                       |
| `state`                   | The focused callback example marks the selected option `on`; Pinned and Mixed demonstrate the other state transitions.       |
| `destructive`             | Delete now renders as a destructive action.                                                                                  |
| `disabled`                | Unavailable action remains visible but cannot be selected.                                                                   |
| `hidden`                  | Hidden action is present in the configuration but is not rendered.                                                           |
| `keepOpen`                | Mixed selection asks iOS 16+ to keep the menu open after selection.                                                          |
| `onSelect`                | The focused callback example updates both the displayed result and each option's controlled `state`.                         |

### Structural options

| Type or field           | Example usage                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `submenu`               | Share contains nested child actions.                                                                                               |
| Submenu label fields    | Share demonstrates `title`, `subtitle`, `systemImage`, `iconColor`, and `titleColor`; the nested asset action demonstrates `icon`. |
| Submenu `displayInline` | Inline tools displays its children in the parent menu.                                                                             |
| Submenu `destructive`   | Danger zone passes destructive styling to its children.                                                                            |
| Submenu `disabled`      | Disabled submenu cannot be opened.                                                                                                 |
| Submenu `hidden`        | Hidden submenu is omitted from the rendered menu.                                                                                  |
| Submenu `options`       | Every submenu owns a nested options array.                                                                                         |
| `section`               | Actions and states / Submenus and assets group related entries under headers. Omit `title` for an unlabelled section.              |
| `divider`               | Separators appear between the main option groups.                                                                                  |

## Run the example

Install workspace dependencies from the repository root:

```sh
yarn install
```

Install the iOS pods:

```sh
cd example
bundle install
bundle exec pod install
```

Start Metro from the repository root:

```sh
yarn example start
```

Then run the iOS app in another terminal:

```sh
yarn example ios
```

Native changes require rebuilding the app. JavaScript and TypeScript changes
are applied through Fast Refresh.
