import type * as React from 'react';
import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeMenuProps extends ViewProps {
  menuConfig: CodegenTypes.UnsafeMixed;
  title?: string;
  disabled?: boolean;
  onActionPress?: DirectEventHandler<Readonly<{ id: string; title: string }>>;
}

interface NativeCommands {
  open: (viewRef: React.ComponentRef<HostComponent<NativeMenuProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['open'],
});

export default codegenNativeComponent<NativeMenuProps>('TinyuiMenuView', {
  excludedPlatforms: ['android'],
});
