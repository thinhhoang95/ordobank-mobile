import React, {useEffect} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import {Button, Card, Colors, Text, TextField, View} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import token from './token';
import {PieChart} from 'react-native-chart-kit';

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

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const colorPalette = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6'];

function StatsScreen({navigation}: StatsScreenProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [from, setFrom] = React.useState<string>(
    moment().add(-1, 'month').format('DD/MM/YYYY'),
  );
  const [to, setTo] = React.useState<string>(moment().format('DD/MM/YYYY'));
  const [searchText, setSearchText] = React.useState<string>('');
  const [stats, setStats] = React.useState<Array<Stats>>([]);

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
              <Button label="Search" marginT-20 onPress={() => fetchStats()} />
            </View>
            <View marginT-10>
              <ShimmerPlaceholder visible={!loading}>
                {stats.map((item: Stats) => {
                  return renderStatsItem({item});
                })}
              </ShimmerPlaceholder>
            </View>
            <View marginT-10>
              <PieChart
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
              />
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