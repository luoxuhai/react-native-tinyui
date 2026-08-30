import { codegenNativeComponent, type ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Float,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface NativePopoverProps extends ViewProps {
  isPresented?: boolean;
  attachmentAnchor?: string;
  arrowEdge?: string;
  contentWidth: Float;
  contentHeight: Float;
  onIsPresentedChange?: DirectEventHandler<Readonly<{ isPresented: boolean }>>;
}

export default codegenNativeComponent<NativePopoverProps>('TinyuiPopoverView', {
  excludedPlatforms: ['android'],
});
