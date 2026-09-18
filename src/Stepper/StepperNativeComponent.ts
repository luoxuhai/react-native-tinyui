import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

type StepperChangeEvent = Readonly<{
  value: CodegenTypes.Double;
  eventCount: CodegenTypes.Int32;
}>;

export interface NativeStepperProps extends ViewProps {
  value?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
  minimumValue?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
  maximumValue?: CodegenTypes.WithDefault<CodegenTypes.Double, 100>;
  stepValue?: CodegenTypes.WithDefault<CodegenTypes.Double, 1>;
  isContinuous?: CodegenTypes.WithDefault<boolean, true>;
  autorepeat?: CodegenTypes.WithDefault<boolean, true>;
  wraps?: CodegenTypes.WithDefault<boolean, false>;
  disabled?: CodegenTypes.WithDefault<boolean, false>;
  controlled?: CodegenTypes.WithDefault<boolean, false>;
  mostRecentEventCount?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>;
  // Match the bubbling topChange event inherited from React Native's base view.
  onChange?: CodegenTypes.BubblingEventHandler<StepperChangeEvent>;
}

export default codegenNativeComponent<NativeStepperProps>('TinyuiStepperView', {
  excludedPlatforms: ['android'],
});
