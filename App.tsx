/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import OverviewScreen from './OverviewScreen';
import TransferScreen from './TransferScreen';
import PaymentScreen from './PaymentScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Overview" component={OverviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;