import React, { useEffect, useState } from 'react';
import { globalStyles } from '../templates/globalStyles';
import { View, FlatList } from 'react-native';

import ListItem from '../components/ListItems';
import { request_get } from '../api/request';
import Loader from '../components/Loader';
import Channel from '../components/Channel';
import { BASE_API_URL } from '../api/request'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import Snackbar from 'react-native-snackbar'

const ChannelsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const [channels, setChannels] = useState([]);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: route.params.title,
    });

    async function getData() {
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
      const response = await request_get('get_channels/' + route.params.id);
      console.log('channelScren:', response);
      setChannels(response.data);
      console.log(response.data);
      setLoader(false);
    }

    getData();
  }, []);

  return (
    <View style={globalStyles.container}>
      {loader ? <Loader /> : null}
      <View
        style={{
          paddingHorizontal: 10,
          justifyContent: 'center',
        }}>
        <FlatList
          data={channels}
          renderItem={({ item }) => (
            <Channel
              route={'player'}
              data={item}
              navigation={navigation}
              params={{ id: item.id, title: item.name }}
              images_path={'channel'}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </View>
  );
};
export default ChannelsScreen;
