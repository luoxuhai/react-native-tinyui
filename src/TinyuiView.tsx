import type { ColorValue, ViewProps } from 'react-native';

type Props = ViewProps & {
  color?: ColorValue;
};

export function TinyuiView(_props: Props): never {
  throw new Error(
    "'react-native-tinyui' is only supported on native platforms."
  );
}
