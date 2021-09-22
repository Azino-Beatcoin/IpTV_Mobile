import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, DeviceEventEmitter } from 'react-native';
import { request_get } from '../api/request';
import Notify from '../components/Notify';
import { colors } from '../templates/colors';
import TvPlayer from '../components/TvPlayer';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import EpgTabs from '../navigations/Epg';
import SimilarChannels from '../components/Tv/SimilarChannels';
import { percentHeight } from '../templates/helper';
import { useFocusEffect } from '@react-navigation/native';
import Snackbar from 'react-native-snackbar'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const PlayerScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [uri, setUri] = useState(null);
  const [fullSize, setFullSize] = useState(false);
  const [id, setId] = useState(route.params.id);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setUri(null);
      };
    }, []),
  );

  useEffect(() => {
    dispatch(actions.setMusicPlayer(false))
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    DeviceEventEmitter.addListener('goBack', (e) => {
      getUri();
    });

    async function getUri() {
      const access_token = await AsyncStorage.getItem('access_token')
      const sid = await AsyncStorage.getItem('sid');
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
      const response = await request_get(`get_url/${id}/${sid}`);

      if (!response.success) {
        Notify('error', 'Вы не авторизованы');
        dispatch(actions.setAuthState(false));
        dispatch(actions.setSid(''));
        return navigation.navigate('profile', { auth: false });
      }
      setUri(response.data);
    }

    getUri();
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={fullSize ? styles.videoFull : styles.video}>
        <TvPlayer
          uri={uri}
          navigation={navigation}
          onFull={setFullSize}
          autoShowHeader={false}
          back={navigation.goBack}
          autoPlay={true}
          isTv={true}
        />
      </View>
      {fullSize ? null : (
        <>
          <SimilarChannels
            group_channel_id={route.params.group_channel_id}
            setId={setId}
            id={id}
          />
          <View style={{ flex: 1, backgroundColor: colors.primary }}>
            <EpgTabs channel_id={id} setUri={setUri} />
          </View>
        </>
      )}
    </View>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoFull: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    height: percentHeight(35),
  },
});
