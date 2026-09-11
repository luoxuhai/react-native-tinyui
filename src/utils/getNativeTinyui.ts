import NativeTinyui, { type Spec } from '../NativeTinyui';

export type TinyuiComponent = 'Menu' | 'Popover' | 'LiquidGlassText';

let nativeTinyui: Spec | null | undefined;
let enabledComponents: ReadonlySet<string> | undefined;

/**
 * Returns the Tinyui TurboModule instance. The native module is always
 * compiled (Core), so this is safe to call.
 */
export function getNativeTinyui(): Spec {
  nativeTinyui ??= NativeTinyui;
  if (nativeTinyui == null) {
    throw new Error(
      '[TinyUI] The native Tinyui module is not available. ' +
        'Make sure react-native-tinyui is linked and run pod install.'
    );
  }
  return nativeTinyui;
}

/**
 * Throws if the given component was not compiled into the native binary.
 * Use this before rendering a component whose native view is optional.
 */
export function assertComponentEnabled(component: TinyuiComponent): void {
  const tinyui = getNativeTinyui();
  enabledComponents ??= new Set(tinyui.getEnabledComponents());

  if (!enabledComponents.has(component)) {
    throw new Error(
      `[TinyUI] The ${component} component is not installed. ` +
        `Add '${component}' to the 'react-native-tinyui.components' array ` +
        `in package.json and run pod install.`
    );
  }
}
