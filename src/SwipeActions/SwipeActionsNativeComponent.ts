import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeSwipeActionsProps extends ViewProps {
  actionsConfig: CodegenTypes.UnsafeMixed;
  edge?: CodegenTypes.WithDefault<'leading' | 'trailing', 'trailing'>;
  allowsFullSwipe?: CodegenTypes.WithDefault<boolean, true>;
  disabled?: boolean;
  onActionPress?: DirectEventHandler<Readonly<{ id: string; title: string }>>;
}

export default codegenNativeComponent<NativeSwipeActionsProps>(
  'TinyuiSwipeActionsView',
  { excludedPlatforms: ['android'] }
);
