import {KeyboardAvoidingView, SafeAreaView, ScrollView, ToastAndroid} from 'react-native';

import {useState} from 'react';

import {View, Text, TextField, Button, Modal} from 'react-native-ui-lib';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAppDispatch, useAppSelector} from './hooks';
import Icon from 'react-native-vector-icons/FontAwesome';

interface OverviewTransferScreen {
  navigation: NativeStackNavigationProp<any, any>;
}

function OverviewTransferScreen({navigation}: OverviewTransferScreen) {
  const dispatch = useAppDispatch();
  const account = useAppSelector(state => state.account);
  const [toIban, setToIban] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAvoidingView style={{flex: 1}} behavior="padding">

          <ScrollView style={{flex: 1}}>
            <View flex>
              <View row marginT-80 marginB-20>
                <View marginR-20></View>
                <View flex>
                  <Text text40BL>Transfer Money</Text>
                </View>
                <View marginR-20>
                  {/* <Icon name="qrcode" size={30} onPress={() => navigation.goBack()} color="#000"></Icon> */}
                </View>
              </View>

              <View paddingH-20 marginT-30>
                <Text text70BL>From account</Text>
                <Text text70>{account.iban}</Text>
              </View>

              <View paddingH-20 marginT-20>
                <Text text70BL>To account</Text>
                <TextField
                  placeholder="Enter IBAN of recipient here"
                  onChangeText={text => {
                    setToIban(text);
                  }}
                  value={toIban}></TextField>
              </View>

              <View paddingH-20 marginT-20>
                <Text text70BL>Amount</Text>
                <TextField
                  placeholder="Amount in ORD"
                  onChangeText={text => {
                    setAmount(text);
                  }}
                  value={amount}></TextField>
              </View>

              <View paddingH-20 marginT-20>
                <Text text70BL>Notes</Text>
                <TextField
                  placeholder="Notes"
                  onChangeText={text => {
                    setNotes(text);
                  }}
                  value={notes}></TextField>
              </View>

              <View marginT-20 paddingH-20>
                <Button label="Transfer" onPress={() => {
                  if (toIban === '' || amount === '' || notes === '') {
                    ToastAndroid.show('Please fill in all fields', ToastAndroid.SHORT);
                    return;
                  }
                  // try to parse amount
                  try {
                    let mAmount = parseFloat(amount);
                    navigation.navigate('TransferConfirmation', {toIban: toIban.toUpperCase(), mAmount: mAmount, notes: notes.toUpperCase()});
                  } catch (error) {
                    ToastAndroid.show('Invalid amount', ToastAndroid.SHORT);
                    return;
                  }
                }}></Button>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

export default OverviewTransferScreen;
