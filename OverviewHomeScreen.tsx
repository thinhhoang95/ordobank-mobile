import React, {useState, useEffect} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from 'react-native';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import {View, Text, Card, TextField, Button, Colors, Chip, Checkbox} from 'react-native-ui-lib';

import {Picker} from '@react-native-picker/picker';

import moment from 'moment';
import { useAppSelector, useAppDispatch } from './hooks'
import { setIban, setRefreshAnyway } from './AccountReducer'

import { useIsFocused } from '@react-navigation/native';

import { TokenContext } from './token';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

type AccountSummary = {
  account: {
    iban: string;
    balance: number;
    name: string;
    openingDate: string;
  };
  currentWeek: {
    _id: string | undefined;
    deposit: number;
    withdrawal: number;
  };
  currentMonth: {
    _id: string | undefined;
    deposit: number;
    withdrawal: number;
  };
  lastMonth: {
    _id: string | undefined;
    deposit: number;
    withdrawal: number;
  };
  transactions: Array<AccountSummaryTransaction>;
};

interface AccountSummaryTransaction {
  _id: string;
  iban: string;
  amount: number;
  description: string;
  date: string;
}

interface OverviewScreenProps {
  navigation: NativeStackNavigationProp<any, any>;
}

function OverviewScreen({ navigation }: OverviewScreenProps) {
  const { token, setToken } = React.useContext(TokenContext);

  const isFocused = useIsFocused();

  // Redux selectors and dispatch
  const iban = useAppSelector(state => state.account.iban)
  const refreshAnyway = useAppSelector(state => state.account.refreshAnyway)
  
  const dispatch = useAppDispatch()

  const [transactions, setTransactions] = useState<
    Array<AccountSummaryTransaction>
  >([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const [weeklyDeposits, setWeeklyDeposits] = useState(0);
  const [weeklyWithdrawals, setWeeklyWithdrawals] = useState(0);
  const [weeklyNet, setWeeklyNet] = useState(0);

  const [monthlyDeposits, setMonthlyDeposits] = useState(0);
  const [monthlyWithdrawals, setMonthlyWithdrawals] = useState(0);
  const [monthlyNet, setMonthlyNet] = useState(0);

  const [lastMonthDeposits, setLastMonthDeposits] = useState(0);
  const [lastMonthWithdrawals, setLastMonthWithdrawals] = useState(0);
  const [lastMonthNet, setLastMonthNet] = useState(0);

  const [amountSpending, setAmountSpending] = useState<string>('');
  const [noteSpending, setNoteSpending] = useState('');
  const [tagSpending, setTagSpending] = useState<string>('others');
  const [paying, setPaying] = useState<boolean>(false);

  const [offRecord, setOffRecord] = useState<boolean>(false);

  const getSummaryFromServer = async () => {
    try {
      setLoading(true);
      // fetch summary
      const response = await fetch(
        'https://bank.paymemobile.fr/accountsummary?token=' + token,
        {
          method: 'GET',
        },
      );

      const data: AccountSummary = await response.json();
      dispatch(setIban(data.account.iban))

      setWeeklyDeposits(data.currentWeek.deposit);
      setWeeklyWithdrawals(data.currentWeek.withdrawal);
      setWeeklyNet(data.currentWeek.deposit + data.currentWeek.withdrawal);

      setMonthlyDeposits(data.currentMonth.deposit);
      setMonthlyWithdrawals(data.currentMonth.withdrawal);
      setMonthlyNet(data.currentMonth.deposit + data.currentMonth.withdrawal);

      setLastMonthDeposits(data.lastMonth.deposit);
      setLastMonthWithdrawals(data.lastMonth.withdrawal);
      setLastMonthNet(data.lastMonth.deposit + data.lastMonth.withdrawal);
      setBalance(data.account.balance);
      setTransactions(data.transactions);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const payLibre = async () => {
    // Check if amount is a number
    if (isNaN(parseFloat(amountSpending)) || parseFloat(amountSpending) <= 0) {
      ToastAndroid.show('Amount must be a number greater than 0', ToastAndroid.SHORT);
      return;
    }

    // Check if note is empty
    if (noteSpending.trim() === '') {
      ToastAndroid.show('Note cannot be empty', ToastAndroid.SHORT);
      return;
    }

    setPaying(true);

    let mNotes = noteSpending;
    if (tagSpending !== 'others') {
      mNotes = '**' + tagSpending + '** ' + noteSpending;
    }
    // convert amountSpending to string
    let mAmount = parseFloat(amountSpending).toFixed(4);
    try {
      console.log('offRecord = ' + offRecord)
      const response = await fetch(
        'https://bank.paymemobile.fr/transfer?token=' + token,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body:
            'toIban=VN480630512753392800&amount=' +
            mAmount +
            '&description=' +
            mNotes +
            '&token=' +
            token + 
            '&offRecord=' + (offRecord ? '1' : '0'),
        },
      );

      if (response.status === 200) {
        ToastAndroid.show('Payment successful', ToastAndroid.SHORT);
        setAmountSpending('');
        setNoteSpending('');
        setTagSpending('others');
        await getSummaryFromServer();
      } else {
        ToastAndroid.show('Payment failed', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error(error);
      ToastAndroid.show('Payment failed', ToastAndroid.SHORT);
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    if (isFocused && refreshAnyway)
    {
      getSummaryFromServer();
      dispatch(setRefreshAnyway(false))
    }
  }, [isFocused]);

  useEffect(() => {
    getSummaryFromServer();
  }, [token]) // first run

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
          <ScrollView style={{flex: 1}}>
            <View flex>
              <View row style={styles.bgOverlay}>
                <View flex></View>
                <Text text60BL white marginT-50>
                  Ordobank
                </Text>
                <View flex marginT-50 right paddingR-20>
                  <Icon
                    name="refresh"
                    size={20}
                    onPress={getSummaryFromServer}
                  />
                </View>
              </View>
              <View row>
                <Card
                  flex-1
                  margin-10
                  padding-20
                  bg-white
                  style={{marginTop: -60}}
                  enableShadow>
                  <View centerH>
                    <Text text70BL blue10>
                      {iban}
                    </Text>
                    <ShimmerPlaceholder visible={!loading}>
                      <Text text20BL blue10>
                        {balance.toFixed(2)}
                      </Text>
                    </ShimmerPlaceholder>
                  </View>
                  <View row marginT-10>
                    <View flex>
                      <Text>Weekly</Text>
                    </View>
                    <View flex>
                      <Text>+{weeklyDeposits.toFixed(2)}</Text>
                    </View>
                    <View flex center>
                      <Text>{weeklyWithdrawals.toFixed(2)}</Text>
                    </View>
                    <View flex right>
                      <Text>{weeklyNet.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View row marginT-10>
                    <View flex>
                      <Text>This month</Text>
                    </View>
                    <View flex>
                      <Text>+{monthlyDeposits.toFixed(2)}</Text>
                    </View>
                    <View flex center>
                      <Text>{monthlyWithdrawals.toFixed(2)}</Text>
                    </View>
                    <View flex right>
                      <Text>{monthlyNet.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View row marginT-10>
                    <View flex>
                      <Text>Last month</Text>
                    </View>
                    <View flex>
                      <Text>+{lastMonthDeposits.toFixed(2)}</Text>
                    </View>
                    <View flex center>
                      <Text>{lastMonthWithdrawals.toFixed(2)}</Text>
                    </View>
                    <View flex right>
                      <Text>{lastMonthNet.toFixed(2)}</Text>
                    </View>
                  </View>
                </Card>
              </View>

              <View row>
                <Text text70BL grey30 marginL-20 marginT-10>
                  PAY LIBRE
                </Text>
              </View>
              <View row>
                <Card
                  flex-1
                  margin-10
                  paddingT-10
                  paddingL-20
                  paddingR-20
                  paddingB-20
                  bg-white
                  enableShadow>
                  <TextField
                    placeholder={'Amount'}
                    floatingPlaceholder
                    label={'Amount'}
                    enableErrors
                    validate={['required', 'number']}
                    onChangeText={(value: string) => setAmountSpending(value)}
                    value={amountSpending}
                  />
                  <TextField
                    placeholder={'Note'}
                    floatingPlaceholder
                    label={'Note'}
                    enableErrors
                    validate={['required']}
                    onChangeText={(value: string) => setNoteSpending(value)}
                    value={noteSpending}
                  />
                  {/* <Picker
                    placeholder="Select a tag"
                    floatingPlaceholder
                    value={tagSpending}
                    onChange={(value: PickerValue) =>
                      setTagSpending(value as string)
                    }>
                    <Picker.Item value="food" label="Food" />
                    <Picker.Item value="transport" label="Transport" />
                  </Picker> */}
                  <View
                    style={{
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: '#bcbcbc',
                      margin: 0,
                    }}>
                    <Picker
                      selectedValue={tagSpending}
                      onValueChange={(value: string) => setTagSpending(value)}
                      mode="dropdown"
                      placeholder="Select a tag"
                      style={{flex: 1, color: '#2b2b2b'}}>
                      <Picker.Item key="food" value="food" label="Food" />
                      <Picker.Item
                        key="transport"
                        value="transport"
                        label="Transport"
                      />
                      <Picker.Item key="bills" value="bills" label="Bills" />
                      <Picker.Item
                        key="entertainment"
                        value="entertainment"
                        label="Entertainment"
                      />
                      <Picker.Item
                        key="shopping"
                        value="shopping"
                        label="Shopping"
                      />
                      <Picker.Item key="health" value="health" label="Health" />
                      <Picker.Item key="leisure" value="leisure" label="Leisure" />
                      <Picker.Item key="savings" value="savings" label="Savings" />
                      <Picker.Item key="others" value="others" label="Others" />
                    </Picker>
                  </View>

                  <View marginT-10>
                    <Checkbox value={offRecord} onValueChange={(v) => setOffRecord(v)} label="Off-record transaction" />
                  </View>

                  {!paying && (
                    <Button
                      marginT-10
                      label={'Pay Libre'}
                      size={Button.sizes.medium}
                      onPress={() => payLibre()}
                      backgroundColor={Colors.red30}
                    />
                  )}
                  {paying && <ActivityIndicator size={'large'} />}
                </Card>
              </View>

              <View row>
                <Text text70BL grey30 marginL-20 marginT-10>
                  PAST TRANSACTIONS
                </Text>
              </View>
              <View row>
                <Card
                  flex-1
                  margin-10
                  paddingT-10
                  paddingL-20
                  paddingR-20
                  paddingB-20
                  bg-white
                  enableShadow>
                  <ShimmerPlaceholder visible={!loading}>
                    {transactions.map(transaction => (
                      <View key={transaction._id} style={styles.listItem}>
                        <View>

                          <View row>
                            <View style={[styles.chip, transaction.amount < 0 ? styles.chipNegative : styles.chipPositive]}>
                              <Text text70BL>
                                {transaction.amount.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                          <Text text70>
                            {transaction.description.toUpperCase()}
                          </Text>
                          <Text text80 grey30>
                            {moment(transaction.date).fromNow()}, {moment(transaction.date).format('DD/MM/YYYY HH:mm:ss')}
                          </Text>
                          <View style={styles.divider}></View>
                        </View>
                      </View>
                    ))}
                  </ShimmerPlaceholder>
                  <View row>
                    <View flex marginR-2>
                      <Button label={'All Trans'} marginT-10 onPress={() => {
                      navigation.navigate('Transactions');
                    }}></Button>
                    </View>
                    <View flex marginL-2>
                      <Button label={'Statistics'} marginT-10 onPress={() => {
                      navigation.navigate('Stats');
                    }}></Button>
                    </View>
                  </View>
                  
                </Card>
              </View>

              <View row center marginT-30 marginB-30>
                <Text text70>By Glass Workspace</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  bgOverlay: {
    backgroundColor: Colors.blue1,
    height: 220,
  },
  divider: {
    marginTop: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: 0.5,
  },
  listItem: {
    marginTop: 5,
    marginBottom: 5,
  },
  chip: {
    padding: 5,
    borderRadius: 25,
    marginBottom: 5,
  },
  chipNegative: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  chipPositive: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
});

export default OverviewScreen;
