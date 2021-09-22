import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { request_get } from '../api/request';
import FilmCard from '../components/films/FilmCard';
import { colors } from '../templates/colors';
import Snackbar from 'react-native-snackbar'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const NewFilmScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const sid = useSelector((state) => state.authReducer.sid);
  const [films, setFilms] = useState([]);
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Популярное',
    });
  }, []);

  useEffect(() => {
    const getFilms = async () => {
      try {
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
        const { data } = await request_get(`vod_datas/${sid}/1?top=1`);
        setFilms(data);
      } catch (error) {
        console.log('error:', error);
      }
    };
    getFilms();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <FlatList
        numColumns={3}
        data={films}
        renderItem={({ item }) => (
          <FilmCard item={item} navigation={navigation} />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default NewFilmScreen;
