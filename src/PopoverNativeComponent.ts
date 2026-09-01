import { codegenNativeComponent, type ViewProps } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativePopoverProps extends ViewProps {
  isPresented?: boolean;
  attachmentAnchor?: string;
  arrowEdge?: string;
  onIsPresentedChange?: DirectEventHandler<Readonly<{ isPresented: boolean }>>;
}

export default codegenNativeComponent<NativePopoverProps>('TinyuiPopoverView', {
  excludedPlatforms: ['android'],
});
