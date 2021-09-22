import React, { useEffect, useState } from 'react';
import { globalStyles } from '../templates/globalStyles';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Image,
  FlatList
} from 'react-native';

import { request_get } from '../api/request';
import Loader from '../components/Loader';
import ButtonsNavigation from '../components/General/ButtonsNavigation';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../templates/colors';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import { IPTV_ADMIN_URL } from '../api/url';
import Favorite from '../components/General/Favorite';
import Snackbar from 'react-native-snackbar'
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const GroupChannelsScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const [groupChannels, setGroupChannels] = useState([]);
  const [loader, setLoader] = useState(true);
  const [type, setType] = useState({
    title: 'Все каналы',
    id: '',
  });
  const [searchShow, setSearchShow] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchCheck, setSearchCheck] = useState(false);
  const [channels, setChannels] = useState([]);

  const [page, setPage] = useState(1);
  const [listloader, setListLoader] = useState(false);
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const [showContent, setShowContent] = useState(true)
  const [counter, setCounter] = useState(0)

  const sid = useSelector((state) => state.authReducer.sid);

  if (!sid && !counter) {
    setShowContent(false)
    setCounter(1)
  }

  useEffect(() => {
    if (sid) {
      setShowContent(true)
      setCounter(0)
    }
  }, [sid])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => {
              searchShow ? Search() : null;
              setSearchShow(!searchShow);
              setSearchCheck(true);
            }}>
            <Icon
              name={'search-outline'}
              size={25}
              color={colors.header_icons_color}
            />
          </TouchableOpacity>
        </View>
      ),
      headerTitle: () =>
        searchShow ? (
          searchInput()
        ) : (
          <Text style={{ color: colors.secondary, fontSize: fSize(23) }}>
            {type.title}
          </Text>
        ),
    });

    if (!searchShow && !searchCheck) {
      getData();
    }
    getChannels();
  }, [searchShow, type, searchText, sid]);

  const getData = async () => {
    const response = await request_get('group_channels');
    setGroupChannels(response.data);
  };

  const getChannels = async () => {
    setChannels([]);
    setLoader(true);
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

    let response;
    if (searchText.length === 0) {
      response = await request_get(
        `getChannels/${type.id}?search=${searchText}&sid=${sid}&page=${page}`,
      );
    } else {
      response = await request_get(
        `getChannels/${type.id}?search=${searchText}&sid=${sid}`,
      );
      setPage(1);
    }

    if (!response.success) {
      return;
    }
    setChannels(response.data);
    setLoader(false);
  };

  const paginate = async () => {
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
    const response = await request_get(
      `getChannels/${type.id}?search=${searchText}&sid=${sid}&page=${page}`,
    );
    if (!response.success) {
      return;
    }
    setChannels(() => {
      return [...channels, ...response.data];
    });
  };

  const Search = () => {
    getChannels();
    setSearchText('');
  };

  const searchInput = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => setSearchShow(false)}>
          <Icon
            name={'arrow-back-outline'}
            size={25}
            color={colors.header_icons_color}
          />
        </TouchableOpacity>

        <TextInput
          placeholder={'Поиск'}
          placeholderTextColor={colors.header_icons_color}
          autoFocus={true}
          onChangeText={(text) => setSearchText(text)}
          value={searchText}
          style={{ color: colors.header_icons_color }}
        />
      </View>
    );
  };

  const channel = (item) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={{
          flexDirection: 'row',
          height: percentHeight(10),
          marginVertical: 10,
        }}
        onPress={() =>
          navigation.navigate('player', {
            id: item.id,
            group_channel_id: item.group_channel_id,
          })
        }>
        <View
          style={{
            width: percentWidth(18),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#2C2A3C',
          }}>
          <Image
            style={{ width: percentWidth(18), height: percentHeight(10) }}
            source={{ uri: `${IPTV_ADMIN_URL}images/channel/${item.image}` }}
            resizeMode={'cover'}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: percentWidth(72),
            marginLeft: 10,
          }}>
          <View>
            <Text style={{ color: colors.secondary, fontSize: fSize(17) }}>
              {item.name}
            </Text>
            <Text
              style={{
                color: colors.secondary,
                fontSize: fSize(12),
              }}>
              {item.program_name}
            </Text>
            <Text
              style={{
                color: colors.secondary,
                fontSize: fSize(12),
              }}>
              {item.program_time}
            </Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Favorite
              autoCheck={false}
              exists={
                item.favorite
                  ? item.favorite.channel_id
                    ? true
                    : false
                  : false
              }
              Add={`channel/favorite/${item.id}`}
              Remove={`channel/favorite/${item.id}`}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return showContent ?
    (
      <View style={{ ...globalStyles.container, paddingLeft: 10 }}>
        {loader ? <Loader /> : null}
        <>
          <ButtonsNavigation
            data={groupChannels}
            setLoader={setLoader}
            setType={setType}
            type={type}
            Default={true}
            setFilterCheck={setSearchCheck}
            onChange={() => setPage(1)}
          />

          <View
            style={{
              paddingRight: 10,
              paddingBottom: 30,
              marginBottom: listloader ? percentHeight(10) : 0,
            }}>
            <ScrollView
              onScroll={async ({ nativeEvent }) => {
                if (isCloseToBottom(nativeEvent)) {
                  setPage(page + 1);
                  setListLoader(true);
                  await paginate();
                  setListLoader(false);
                }
              }}>
              <FlatList
                data={channels}
                renderItem={({ item }) => channel(item)}
                keyExtractor={(item) => item.id}
              />
            </ScrollView>
          </View>
          {listloader && (
            <View
              style={{
                flex: 1,
                position: 'absolute',
                bottom: percentHeight(3),
                justifyContent: 'center',
                left: 0,
                right: 0,
              }}>
              <Loader />
            </View>
          )}
        </>
      </View>
    ) : (
      <View
        style={{
          backgroundColor: colors.primary,
          flex: 1,
          justifyContent: 'center'
        }}
      >
        <Text
          style={{
            color: colors.secondary,
            fontSize: fSize(20),
            textAlign: 'center'
          }}
        >
          У вас не активирована ни одна подписка
        </Text>
        <TouchableOpacity
          style={{
            marginTop: percentHeight(4)
          }}
          onPress={() => {
            navigation.navigate('subscribes')
          }}
        >
          <Text
            style={{
              color: colors.dark_red,
              fontSize: fSize(18),
              textDecorationLine: 'underline',
              textAlign: 'center'
            }}
          >
            Активировать
          </Text>
        </TouchableOpacity>
      </View>
    )
};
export default GroupChannelsScreen;
