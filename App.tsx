/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import store from './store';

import OverviewScreen from './OverviewScreen';
import TransferScreen from './TransferScreen';
import PaymentScreen from './PaymentScreen';
import TransactionScreen from './TransactionScreen';
import StatsScreen from './StatsScreen';
import TransferConfirmationScreen from './TransferConfirmationScreen'

import {StatusBar} from 'react-native';
import ScanQRScreen from './ScanQRScreen';

export type RootStackParamList = {
  Overview: undefined;
  Transfer: undefined;
  Payment: undefined;
  Transactions: undefined;
  Stats: undefined;
  TransferConfirmation: undefined;
  ScanQR: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Group>
            <Stack.Screen name="Overview" component={OverviewScreen} />
            <Stack.Screen name="Transactions" component={TransactionScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="ScanQR" component={ScanQRScreen} />
          </Stack.Group>
          <Stack.Group screenOptions={{presentation: 'transparentModal'}}>
            <Stack.Screen name="TransferConfirmation" component={TransferConfirmationScreen} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
