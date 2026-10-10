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
  invalidateOnOutsideDismiss?: boolean;
  maxDisplayCount?: CodegenTypes.Int32;
  ignoresDisplayFrequency?: boolean;
  arrowEdge?: string;
  onTipAction?: DirectEventHandler<
    Readonly<{ tipId: string; id: string; title: string }>
  >;
  onTipError?: DirectEventHandler<
    Readonly<{ tipId: string; code: string; message: string }>
  >;
  onTipInvalidated?: DirectEventHandler<
    Readonly<{
      tipId: string;
      reason: string;
    }>
  >;
}

export default codegenNativeComponent<NativeTipPopoverProps>(
  'TinyuiTipPopoverView',
  {
    excludedPlatforms: ['android'],
  }
);
