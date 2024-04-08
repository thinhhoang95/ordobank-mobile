import {KeyboardAvoidingView, SafeAreaView, ScrollView, ToastAndroid} from 'react-native';

import {useEffect, useState} from 'react';

import {View, Text, TextField, Button, Modal, TouchableOpacity, Checkbox} from 'react-native-ui-lib';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAppDispatch, useAppSelector} from './hooks';
import Icon from 'react-native-vector-icons/FontAwesome';

interface OverviewTransferScreen {
  navigation: NativeStackNavigationProp<any, any>;
  route: {params: {ibanProp: string | undefined; amountProp: number | undefined; notesProp: string | undefined}} | any;
}

function OverviewTransferScreen({navigation, route}: OverviewTransferScreen) {
  const dispatch = useAppDispatch();
  const account = useAppSelector(state => state.account);
  const [toIban, setToIban] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [offRecord, setOffRecord] = useState<boolean>(false);

  useEffect(() => {
    if (route.params === undefined) {
      return;
    }
    if (route.params.ibanProp) {
      setToIban(route.params.ibanProp);
    }
    if (route.params.amountProp) {
      setAmount(route.params.amountProp.toString());
    }
    if (route.params.notesProp) {
      setNotes(route.params.notesProp);
    }
  }, [route.params]);

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
                  <TouchableOpacity onPress={() => {
                    navigation.navigate('ScanQR');
                  }}>
                    <Icon name="qrcode" size={30} color="#000"></Icon>
                  </TouchableOpacity>
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
                <Checkbox value={offRecord} label="Off-record transaction" onValueChange={value => {setOffRecord(value)}}></Checkbox>
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
                    navigation.navigate('TransferConfirmation', {toIban: toIban.toUpperCase(), mAmount: mAmount, notes: notes.toUpperCase(), offRecord: offRecord});
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
