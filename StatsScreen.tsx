import React, {useEffect} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  ToastAndroid
} from 'react-native';
import {Button, Text, TextField, View} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import token from './token';
import {PieChart} from 'react-native-chart-kit';
import {LineChart} from 'react-native-chart-kit';

import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

interface StatsScreenProps {
  navigation: NativeStackNavigationProp<any, any>;
}

type Stats = {
  category: string;
  deposits: number;
  withdrawals: number;
};

type ChartData = {
  name: string;
  net: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

type AmountByDayChartData = {
  dayOfMonth: number;
  amount: number;
};

type AmountByDayAPIResponse = {
  _id: string;
  netAmount: number;
};

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const colorPalette = [
  '#00FDF0',
  '#2EAFC3',
  '#3C66FE',
  '#791BBF',
  '#511ABE',
  '#4F01FB',
  '#0B0A6E',
  '#B18C8B',
  '#ECD942',
  '#F0325A',
  '#21D253',
  '#59F381',
  '#426C39',
  '#36FBA2',
  '#06BF58',
  '#FA6BEF',
  '#970219',
  '#92EFB1',
  '#57FB3F',
  '#253A32',
];

function StatsScreen({navigation}: StatsScreenProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [from, setFrom] = React.useState<string>(
    moment().add(-1, 'month').format('DD/MM/YYYY'),
  );
  const [to, setTo] = React.useState<string>(moment().format('DD/MM/YYYY'));
  const [searchText, setSearchText] = React.useState<string>('');
  const [stats, setStats] = React.useState<Array<Stats>>([]);
  const [amtByDay, setAmtByDay] = React.useState<Array<AmountByDayChartData>>(
    [],
  );

  const [chartData, setChartData] = React.useState<Array<ChartData>>([]);

  const randomColor = (title: string) => {
    // Based on the title, we generate a random color
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    let index = Math.abs(hash % colorPalette.length);
    return colorPalette[index];
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
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
        'https://bank.paymemobile.fr/transactionsCustomStats?token=' +
          token +
          '&fromDate=' +
          mFromDate +
          '&toDate=' +
          mToDate +
          '&searchTerms=' +
          searchText,
      );
      const data = await response.json();
      // For each key in the data object, we create a new Stat object
      let statsArray: Array<Stats> = [];
      for (const key in data) {
        statsArray.push({
          category: key,
          deposits: data[key].deposits,
          withdrawals: data[key].withdrawals,
        });
      }
      setStats(statsArray);

      // For plotting the pie chart
      let chartDataArray: Array<ChartData> = [];
      for (const key in data) {
        chartDataArray.push({
          name: key,
          net: data[key].withdrawals,
          color: randomColor(key),
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        });
      }
      setChartData(chartDataArray);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmountByDay = async () => {
    try {
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
      // If the duration between mFromDate and mToDate is more than 1 month, we don't fetch the data
      if (moment(mToDate).diff(moment(mFromDate), 'months') > 1) {
        ToastAndroid.show(
          'Please select a duration less than 1 month',
          ToastAndroid.SHORT,
        );
        return;
      }
      const response = await fetch(
        'https://bank.paymemobile.fr/transactionsByDay?token=' +
          token +
          '&fromDate=' +
          mFromDate +
          '&toDate=' +
          mToDate +
          '&searchTerms=' +
          searchText,
      );
      const data: Array<AmountByDayAPIResponse> = await response.json();

      // Create an array of AmountByDayChartData, from mFromDate to mToDate
      let amtByDayArray: Array<AmountByDayChartData> = [];
      const startDate = moment(mFromDate).startOf('day');
      const endDate = moment(mToDate).startOf('day');
      while (startDate.isSameOrBefore(endDate)) {
        let amount = 0;
        // if data has an object with _id = startDate.format('YYYY-MM-DD')
        if (
          data.find((item: any) => item._id === startDate.format('YYYY-MM-DD'))
        ) {
          amount =
            data.find(
              (item: any) => item._id === startDate.format('YYYY-MM-DD'),
            )?.netAmount ?? 0;
        }
        amtByDayArray.push({
          dayOfMonth: startDate.date(),
          amount: amount,
        });
        startDate.add(1, 'day');
      }

      setAmtByDay(amtByDayArray);
      // console.log(amtByDayArray);
    } catch (error) {
      console.error(error);
    }
  };

  const renderStatsItem = ({item}: {item: Stats}) => {
    return (
      <View key={item.category} paddingT-10>
        <Text text70BL>{item.category.toUpperCase()}</Text>
        <Text text80 green30>
          Deposits: {item.deposits.toFixed(2)}
        </Text>
        <Text text80 red30>
          Withdrawals: {item.withdrawals.toFixed(2)}
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
          <ScrollView style={{flex: 1}}>
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
                  <Text text40BL>Statistics</Text>
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
                  onPress={() => {
                    fetchStats();
                    fetchAmountByDay();
                  }}
                />
              </View>

              <View marginT-10>
                <ShimmerPlaceholder visible={!loading}>
                  {stats.map((item: Stats) => {
                    return renderStatsItem({item});
                  })}
                </ShimmerPlaceholder>
              </View>

              <View marginT-10>
                {!loading && <PieChart
                  data={chartData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#1cc910',
                    backgroundGradientFrom: '#eff3ff',
                    backgroundGradientTo: '#efefef',
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor={'net'}
                  backgroundColor={'transparent'}
                  paddingLeft={'15'}
                  center={[10, 10]}
                  absolute // For the absolute number, not percentage
                />}
              </View>

              <View marginT-20 paddingB-20>
                {(amtByDay.length > 0 && !loading) && <LineChart
                  data={{
                    labels: amtByDay.map(data => data.dayOfMonth.toString()),
                    datasets: [
                      {
                        data: amtByDay.map(data => data.amount),
                      },
                    ],
                  }}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientToOpacity: 0,
                    decimalPlaces: 0,
                    color: (opacity = 0.5) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  formatXLabel={(xValue) => {
                    if (parseInt(xValue) % 2 === 0) {
                      return xValue;
                    } else {
                      return '';
                    }
                  }}
                  
                />}
              </View>
            </View>
          </ScrollView>
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

export default StatsScreen;
