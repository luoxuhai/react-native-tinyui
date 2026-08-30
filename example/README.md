# TinyUI iOS example

This React Native app demonstrates the iOS-only `Menu` and `Popover`
components from the local `react-native-tinyui` workspace.

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
