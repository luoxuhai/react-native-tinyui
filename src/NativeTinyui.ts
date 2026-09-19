import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Returns the names of the native components compiled into the app,
   * based on the `react-native-tinyui.components` array in package.json.
   */
  getEnabledComponents(): ReadonlyArray<string>;
  configureTips(displayFrequency: string): Promise<void>;
  invalidateTip(tipId: string, reason: string): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('Tinyui');
