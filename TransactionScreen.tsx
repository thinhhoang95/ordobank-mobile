import React, {useEffect} from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  FlatList,
  StatusBar,
  ToastAndroid
} from 'react-native';
import {Button, Colors, Text, TextField, View} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import token from './token';

import moment from 'moment';

import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

interface TransactionScreenProps {
  navigation: NativeStackNavigationProp<any, any>;
}

type Transaction = {
  _id: string | undefined;
  iban: string;
  amount: number;
  date: string;
  description: string;
};

type TransactionAPIResponse = {
  results: Array<Transaction>;
  total: number;
};

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

function TransactionScreen({
  navigation,
}: TransactionScreenProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [from, setFrom] = React.useState<string>(
    moment().add(-1, 'month').format('DD/MM/YYYY'),
  );
  const [to, setTo] = React.useState<string>(moment().format('DD/MM/YYYY'));
  const [searchText, setSearchText] = React.useState<string>('');
  const [transactions, setTransactions] = React.useState<Array<Transaction>>(
    [],
  );
  const [totalTransactions, setTotalTransactions] = React.useState<number>(0);
  const [page, setPage] = React.useState(1);

  const fetchTransactions = async (newQuery: boolean = false) => {
    try {
      setLoading(true);
      let mPage = page;
      if (newQuery) {
        mPage = 1;
      }
      let mFromDate = moment(from, 'DD/MM/YYYY')
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .toISOString();
      let mToDate = moment(to, 'DD/MM/YYYY')
        .set('hour', 23)
        .set('minute', 59)
        .set('second', 59)
        .toISOString();
      const response = await fetch(
        'https://bank.paymemobile.fr/transactionsCustom?token=' +
          token +
          '&fromDate=' +
          mFromDate +
          '&toDate=' +
          mToDate +
          '&searchTerms=' +
          searchText +
          '&page=' +
          mPage,
      );
      const data: TransactionAPIResponse = await response.json();
      if (newQuery) {
        setTransactions(data.results);
      } else {
        setTransactions([...transactions, ...data.results]);
      }
      setTotalTransactions(data.total);
      ToastAndroid.show('There are ' + data.total + ' transactions', ToastAndroid.SHORT)
      if (newQuery) {
        setPage(2);
      } else {
        setPage(page + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderTransactionItem = ({item}: {item: Transaction}) => {
    return (
      <View key={item._id}>
        <View row paddingT-20>
          <View
            style={[
              styles.chip,
              item.amount < 0 ? styles.chipNegative : styles.chipPositive,
            ]}>
            <Text text70BL>{item.amount.toFixed(2)}</Text>
          </View>
        </View>
        <Text text70>{item.description.toUpperCase()}</Text>
        <Text text80 grey30>
          {moment(item.date).fromNow()},{' '}
          {moment(item.date).format('DD/MM/YYYY HH:mm:ss')}
        </Text>
        <View style={styles.divider}></View>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
          <View style={styles.container}>
            <View row marginT-80 marginB-20>
              <View marginR-20>
                <Icon
                  name="angle-left"
                  size={30}
                  onPress={() => navigation.goBack()}
                  color="#000"
                />
              </View>
              <View flex>
                <Text text40BL>Transactions</Text>
              </View>
            </View>

            <View>
              <View row>
                <View flex>
                  <TextField
                    placeholder="From"
                    floatingPlaceholder
                    label="From"
                    onChangeText={text => {
                      setFrom(text);
                    }}
                    value={from}></TextField>
                </View>
                <View flex>
                  <TextField
                    placeholder="To"
                    floatingPlaceholder
                    label="To"
                    onChangeText={text => {
                      setTo(text);
                    }}
                    value={to}></TextField>
                </View>
              </View>
              {/* <View>
                  <Text>{from}</Text>
                  <Text>{to}</Text>
                </View> */}
              <View row>
                <TextField
                  placeholder="Search"
                  floatingPlaceholder
                  label="Search"
                  onChangeText={text => {
                    setSearchText(text);
                  }}
                  value={searchText}
                  flex></TextField>
              </View>
              <Button
                label="Search"
                marginT-20
                onPress={() => fetchTransactions(true)}
              />
            </View>
            <View flex marginT-10 paddingB-30>
              <ShimmerPlaceholder visible={!loading}>
                <FlatList
                  data={transactions}
                  renderItem={renderTransactionItem}
                />
              </ShimmerPlaceholder>
            </View>
            {transactions.length < totalTransactions && (
              <Button
                label="Load more"
                marginT-10
                marginB-10
                backgroundColor="#00000000"
                outlineColor={Colors.red30}
                color={Colors.red30}
                onPress={() => {
                  setPage(page + 1);
                  fetchTransactions(false);
                }}
              />
            )}
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

export default TransactionScreen;
