import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {View, Text, Button} from 'react-native-ui-lib';
import {RootStackParamList} from './App';
import {StyleSheet, ToastAndroid} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {useEffect, useState, useContext} from 'react';

import { useAppDispatch } from './hooks';
import { setRefreshAnyway } from './AccountReducer';

type Props = NativeStackNavigationProp<
  RootStackParamList,
  'TransferConfirmation'
>; // this is for the navigation prop for the screen typescriptting

interface TransferConfirmation {
  navigation: Props;
  route: {params: {toIban: string; mAmount: number; notes: string; offRecord: boolean}} | any;
}

import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { TokenContext } from './token';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

function TransferConfirmationScreen({navigation, route}: TransferConfirmation) {
  const {token, setToken} = useContext(TokenContext);

  const [loading, setLoading] = useState(true);
  const [recipientName, setRecipientName] = useState<string>('-');
  const [ready, setReady] = useState(false);

  const dispatch = useAppDispatch();

  const queryName = async (iban: string) => {
    try {
      const response = await fetch(
        'https://bank.paymemobile.fr/queryIbanName?token=' +
          token +
          '&iban=' +
          iban,
      );
      const json = await response.json();
      if (json.name != null) {
        setReady(true);
        setRecipientName(json.name);
        setLoading(false);
      } else {
        ToastAndroid.show('Recipient name not found', ToastAndroid.SHORT);
        setReady(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const doTransfer = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://bank.paymemobile.fr/transfer?token=' + token,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body:
            'toIban=' +
            route.params.toIban +
            '&amount=' +
            route.params.mAmount.toFixed(2) +
            '&description=' +
            route.params.notes +
            '&offRecord=' +
            (route.params.offRecord ? '1' : '0'),
        },
      );
      const json = await response.json();
      dispatch(setRefreshAnyway(true));
      ToastAndroid.show('Transfer successful', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error) {
      console.error('Error:', error);
      ToastAndroid.show('Transfer failed', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queryName(route.params.toIban);
  }, []);

  return (
    <View flex>
      <View flex></View>
      <View style={styles.modal}>
        <View row marginT-20 marginB-20>
          <View marginR-20>
            <Icon
              name="angle-left"
              size={30}
              onPress={() => {
                navigation.goBack()}}
              color="#000"
            />
          </View>
          <View flex>
            <Text text40BL>Confirm Request</Text>
          </View>
        </View>

        <View paddingH-20 marginT-30>
          <Text text70BL>Recipient</Text>
          <Text text70>{route.params.toIban}</Text>
        </View>

        <View paddingH-20 marginT-30>
          <ShimmerPlaceholder visible={!loading}>
            <Text text70BL>Recipient Name</Text>
            <Text text70>{recipientName}</Text>
          </ShimmerPlaceholder>
        </View>

        <View paddingH-20 marginT-30>
          <Text text70BL>Amount</Text>
          <Text text70>{route.params.mAmount.toFixed(2)}</Text>
        </View>

        <View paddingH-20 marginT-30>
          <Text text70BL>Notes</Text>
          <Text text70>{route.params.notes}</Text>
        </View>

        <View paddingH-20 marginT-30>
          <Text text70BL>Off Record</Text>
          <Text text70>{route.params.offRecord ? 'Yes' : 'No'}</Text>
        </View>

        {ready && (
          <View paddingH-20 marginT-30>
            <Button
              label="Confirm"
              onPress={() => {
                doTransfer();
              }}></Button>
          </View>
        )}
      </View>
      <View flex></View>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
  },
});

export default TransferConfirmationScreen;
