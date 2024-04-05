import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView, KeyboardAvoidingView, ToastAndroid} from 'react-native';
import {View, Text, TextField, TouchableOpacity} from 'react-native-ui-lib';
import QRCode from 'react-native-qrcode-svg';
import {useAppDispatch, useAppSelector} from './hooks';
import {useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';

interface MyInfoScreenProps {
  navigation: NativeStackNavigationProp<any, any>;
}

function MyInfoScreen({navigation}: MyInfoScreenProps) {
  const iban = useAppSelector(state => state.account.iban);
  const [amount, setAmount] = useState('');

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
          <View flex>
            <View row marginT-80 marginB-20>
              <View marginR-20></View>
              <View flex>
                <Text text40BL>My Account</Text>
              </View>
            </View>

            <View flex centerV centerH>
              <TouchableOpacity centerH onPress={() => {
                // Copy to clipboard
                Clipboard.setString(iban)
                ToastAndroid.show('IBAN copied to clipboard', ToastAndroid.SHORT);
              }}>
                <QRCode
                  value={'IBAN' + '|' + iban + '|VERTEX_VNVXPA0|' + amount}
                  size={200}
                />
                <Text text60BL marginT-20>
                  {iban}
                </Text>
                <Text text70>Vertex Banking Corporation</Text>
                <Text text70>SWIFT: VNVXPA0</Text>
              </TouchableOpacity>
              <TextField
                text70
                placeholder="Money amount"
                floatingPlaceholder
                value={amount}
                onChangeText={value => setAmount(value)}
                marginT-20
              />
            </View>
            <View></View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

export default MyInfoScreen;
