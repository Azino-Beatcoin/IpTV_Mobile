import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../templates/colors';
import AsyncStorage from '@react-native-community/async-storage';
import {request_get} from '../../api/request';
import {fSize, percentHeight, percentWidth} from '../../templates/helper';

const FilmSeries = ({data, defaultSeries, format, onChangeSeries, setUri}) => {
  console.log('data:', data);
  console.log('defaultSeries:', defaultSeries);
  const active = (current_id) => {
    if (series.id == current_id) {
      return true;
    }
    return false;
  };
  const [series, setSeries] = useState({
    id: null,
    file_server: null,
  });

  useEffect(() => {
    if (!series.id) {
      setSeries(defaultSeries);
      setUri(defaultSeries.file_server);
    }
  }, []);

  const changeSeries = async (data_id) => {
    const sid = await AsyncStorage.getItem('sid');
    const response = await request_get(
      `get_series_url/${data_id}/${format}?sid=${sid}`,
    );
    setSeries(response.data);
    const file_uri = response.data.file_server;
    setUri(file_uri);
    onChangeSeries();
  };

  //season - сезон
  //index - серия
  //data[season][index] - id
  const seriesList = (data) => {
    const items = [];
    for (let season in data) {
      let newSeason = true;
      for (let index in data[season]) {
        items.push(
          <View key={data[season][index].id}>
            <View>
              {newSeason ? (
                <Text style={styles.season}>Сезон {season}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => changeSeries(data[season][index].id)}
              style={
                active(data[season][index].id)
                  ? {...styles.active, ...styles.listItem}
                  : styles.listItem
              }>
              <Text style={styles.series}>{index} Серия</Text>
              <Text style={styles.duration}>
                {data[season][index].duration}
              </Text>
            </TouchableOpacity>
          </View>,
        );
        newSeason = false;
      }
    }

    return items;
  };

  return <View style={styles.seriesContainer}>{seriesList(data)}</View>;
};
export default FilmSeries;

const styles = StyleSheet.create({
  listItem: {
    height: percentHeight(8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 10,
  },
  active: {
    backgroundColor: colors.dark_red,
  },
  season: {
    fontSize: fSize(20),
    color: colors.secondary,
  },
  series: {
    color: colors.secondary,
    fontSize: fSize(18),
  },
  seriesContainer: {
    marginTop: 10,
  },
  duration: {
    color: colors.dark_text,
    fontSize: fSize(14),
  },
});
