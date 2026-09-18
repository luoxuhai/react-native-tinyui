import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './navigation';
import { ComponentListScreen } from './screens/ComponentListScreen';
import { ConcentricViewScreen } from './screens/ConcentricViewScreen';
import { LiquidGlassTextScreen } from './screens/LiquidGlassTextScreen';
import { MenuScreen } from './screens/MenuScreen';
import { PopoverScreen } from './screens/PopoverScreen';
import { StepperScreen } from './screens/StepperScreen';
import { SFSymbolScreen } from './screens/SFSymbolScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerBackButtonDisplayMode: 'minimal',
            headerTransparent: true,
          }}
        >
          <Stack.Screen
            component={ComponentListScreen}
            name="Components"
            options={{ title: 'TinyUI' }}
          />
          <Stack.Screen component={MenuScreen} name="Menu" />
          <Stack.Screen component={PopoverScreen} name="Popover" />
          <Stack.Screen component={StepperScreen} name="Stepper" />
          <Stack.Screen
            component={SFSymbolScreen}
            name="SFSymbol"
            options={{ title: 'SF Symbol' }}
          />
          <Stack.Screen
            component={ConcentricViewScreen}
            name="ConcentricView"
            options={{ title: 'Concentric View' }}
          />
          <Stack.Screen
            component={LiquidGlassTextScreen}
            name="LiquidGlassText"
            options={{ title: 'Liquid Glass Text' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
