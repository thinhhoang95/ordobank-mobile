import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Button, Card, Text, TextField, View} from 'react-native-ui-lib';
import {
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any, any>;
}

function LoginScreen({navigation}: LoginScreenProps) {
  const [iban, setIban] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [splash, setSplash] = React.useState(true);

  // Check if the token is already stored in the local storage
  React.useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        console.log('Token found');
        navigation.replace('Overview');
      } else {
        console.log('Token not found');
        setSplash(false);
      }
    };
    checkToken();
  }, []);

  const login = async () => {
    try {
      const response = await fetch('https://bank.paymemobile.fr/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'name=' + iban + '&password=' + password,
      });

      console.log(response);

      if (response.status === 200) {
        const data = await response.text();
        // Save the token in the local storage using AsyncStorage
        AsyncStorage.setItem('token', data);
        Alert.alert('Success', 'You are now logged in');
        navigation.navigate('Overview');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
      console.log(error);
    }
  };

  if (splash) {
    return (
      <View flex centerH centerV>
        <Text text70BL>Verifying device...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
          <View flex centerH centerV style={{flexDirection: 'row'}}>
            <View flex margin-20>
              <Card padding-20>
                <Text text70BL marginB-20>
                  Welcome to Ordobank
                </Text>
                <TextField
                  placeholder="Name"
                  floatingPlaceholder
                  label="Name"
                  validate={['required']}
                  onChangeText={(value: string) => setIban(value)}
                />
                <TextField
                  placeholder="Password"
                  floatingPlaceholder
                  label="Password"
                  secureTextEntry
                  validate={['required']}
                  onChangeText={(value: string) => setPassword(value)}
                />
                <Button
                  label="Login"
                  marginT-20
                  onPress={() => login()}
                />
              </Card>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
});

export default LoginScreen;
