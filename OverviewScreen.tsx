import React from 'react';
import {StatusBar} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/AntDesign';

import OverviewHomeScreen from './OverviewHomeScreen';
import TransferScreen from './TransferScreen';
import PaymentScreen from './PaymentScreen';

function OverviewScreen() {
  const Tab = createBottomTabNavigator();

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName: string = '';

            if (route.name === 'Home') {
              // iconName = focused ? 'home' : 'ios-information-circle-outline';
              iconName = 'home';
            } else if (route.name === 'Transfer') {
              // iconName = focused ? 'list' : 'ios-list-outline';
              iconName = 'arrowsalt';
            } else if (route.name === 'Payment') {
              // iconName = focused ? 'list' : 'ios-list-outline';
              iconName = 'creditcard';
            } 

            // You can return any component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}>
        <Tab.Screen name="Home" component={OverviewHomeScreen} />
        {/* <Tab.Screen name="Transfer" component={TransferScreen} />
        <Tab.Screen name="Payment" component={PaymentScreen} /> */}
      </Tab.Navigator>
    </>
  );
}

export default OverviewScreen;