import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeMenuProps extends ViewProps {
  menuConfig: CodegenTypes.UnsafeMixed;
  title?: string;
  disabled?: boolean;
  hasPrimaryAction?: boolean;
  onItemPress?: DirectEventHandler<Readonly<{ id: string }>>;
  onPrimaryAction?: DirectEventHandler<null>;
}

export default codegenNativeComponent<NativeMenuProps>('TinyuiMenuView', {
  excludedPlatforms: ['android'],
});
