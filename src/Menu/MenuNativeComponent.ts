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
  onActionPress?: DirectEventHandler<Readonly<{ id: string; title: string }>>;
}

export default codegenNativeComponent<NativeMenuProps>('TinyuiMenuView', {
  excludedPlatforms: ['android'],
});
