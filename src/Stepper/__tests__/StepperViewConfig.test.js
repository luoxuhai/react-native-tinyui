import { expect, it } from '@jest/globals';
import { transformFileSync } from '@babel/core';
import { join } from 'path';
import { runInNewContext } from 'vm';
// These internals reproduce Fabric's event registration; no public API exposes it.
/* eslint-disable @react-native/no-deep-imports */
import { createViewConfig } from 'react-native/Libraries/NativeComponent/ViewConfig';
import * as ViewConfigRegistry from 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry';
/* eslint-enable @react-native/no-deep-imports */

it('registers the generated Stepper events alongside the iOS base view events', () => {
  // Exercise the same Codegen + base-view merge used by Fabric. Mocking the
  // host component alone misses direct/bubbling event-name collisions.
  const result = transformFileSync(
    join(__dirname, '../StepperNativeComponent.ts'),
    {
      configFile: false,
      babelrc: false,
      presets: ['module:@react-native/babel-preset'],
    }
  );
  const generated = {};
  runInNewContext(result.code, { exports: generated, require });
  const config = createViewConfig(generated.__INTERNAL_VIEW_CONFIG);

  ViewConfigRegistry.register('StepperEventRegistrationTest', () => config);
  expect(() =>
    ViewConfigRegistry.get('StepperEventRegistrationTest')
  ).not.toThrow();
  expect(config.bubblingEventTypes.topChange.phasedRegistrationNames).toEqual({
    bubbled: 'onChange',
    captured: 'onChangeCapture',
  });
  expect(config.directEventTypes.topChange).toBeUndefined();
});
