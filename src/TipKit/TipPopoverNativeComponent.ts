import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeTipPopoverProps extends ViewProps {
  tipId: string;
  title: string;
  message?: string;
  systemImage?: string;
  actions?: ReadonlyArray<Readonly<{ id: string; title: string }>>;
  enabled?: boolean;
  maxDisplayCount?: CodegenTypes.Int32;
  ignoresDisplayFrequency?: boolean;
  arrowEdge?: string;
  onTipStatusChange?: DirectEventHandler<
    Readonly<{ tipId: string; status: string; reason: string }>
  >;
  onTipVisibleChange?: DirectEventHandler<
    Readonly<{ tipId: string; visible: boolean }>
  >;
  onTipAction?: DirectEventHandler<
    Readonly<{ tipId: string; id: string; title: string }>
  >;
  onTipError?: DirectEventHandler<
    Readonly<{ tipId: string; code: string; message: string }>
  >;
}

export default codegenNativeComponent<NativeTipPopoverProps>(
  'TinyuiTipPopoverView',
  {
    excludedPlatforms: ['android'],
  }
);
