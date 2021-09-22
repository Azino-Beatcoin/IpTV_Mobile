import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { request_get } from '../api/request';
import FilmCard from '../components/films/FilmCard';
import { colors } from '../templates/colors';
import Snackbar from 'react-native-snackbar'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const HistoryTrackingScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const sid = useSelector((state) => state.authReducer.sid);
  const [filmsHistory, setFilmsHistory] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Просмотренные',
    });
  }, []);

  useEffect(() => {
    const sidCheck = async () => {
      const access_token = await AsyncStorage.getItem('access_token')
      let sidBodyForm = new FormData()
      sidBodyForm.append('sid', sid)
      let sidResponse = await fetch(`${BASE_API_URL}api/sid/check`, { method: 'POST', body: sidBodyForm, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data', 'Authorization': access_token } })
      if (sidResponse.status == 401) {
        await AsyncStorage.removeItem('sid')
        await AsyncStorage.removeItem('access_token')
        dispatch(setSid(''))
        dispatch(setAuthState(false))
        return
      }
      sidResponse = await sidResponse.json()
      if (!sidResponse.success) {
        dispatch(setSid(''))
        navigate('subscribes')
        Snackbar.show({
          text: 'Активируйте подписку',
          duration: Snackbar.LENGTH_LONG,
        })
      }
    }
    sidCheck()
    request_get(`vod_data_history/${sid}`).then(({ data }) => {
      let arr = []
      for (let i in data) {
        arr.push(data[i])
      }
      setFilmsHistory(arr);
    });
  }, []);

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        flex: 1,
      }}>
      <FlatList
        data={filmsHistory}
        renderItem={({ item }) => (
          <FilmCard item={item} navigation={navigation} />
        )}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default HistoryTrackingScreen;
