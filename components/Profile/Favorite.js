import React, { useEffect, useState } from 'react';
import { request_get } from '../../api/request';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../../templates/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { fSize, percentHeight, percentWidth } from '../../templates/helper';
import { IPTV_ADMIN_URL } from '../../api/url';
import Loader from '../Loader';
import Snackbar from 'react-native-snackbar'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../../api/request'

const Favorite = ({
  route,
  navigation,
  loader,
  setLoader,
  setSearchCheck,
  searchCheck,
}) => {
  const dispatch = useDispatch()
  const [data, setData] = useState({
    channels: [],
    films: [],
  });
  const [searchText, setSearchText] = useState('');
  const [searchShow, setSearchShow] = useState(false);

  useEffect(() => {
    console.log(data);
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
          <Text style={{ color: colors.secondary, fontSize: fSize(20) }}>
            Избранные
          </Text>
        ),
    });

    if (!searchShow && !searchCheck) {
      getData();
    }
  }, [searchShow, searchText, route]);

  const getData = async () => {
    setLoader(true);
    setData([]);
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
      `${route}?sid=${sid}&search=${searchText}`,
    );
    if (!response.success) {
      return navigation.navigate('profile');
    }
    console.log(response);
    setData({ ...data, channels: response.channels, films: response.films });
    setLoader(false);
  };

  const Search = () => {
    getData();
    setSearchText('');
  };

  const searchInput = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setSearchShow(false)}></TouchableOpacity>
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
        style={styles.itemContainer}
        key={item.id}
        onPress={() =>
          navigation.navigate('player', {
            id: item.id,
            group_channel_id: item.group_channel_id,
          })
        }>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${IPTV_ADMIN_URL}images/channel/${item.image}` }}
            resizeMode={'cover'}
            style={{ width: percentWidth(18), height: percentHeight(10) }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: "center",
            width: percentWidth(72),
            marginLeft: 10,
          }}>
          <Text style={{ color: colors.secondary, fontSize: fSize(17) }}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const film = (item) => {
    const changeNameFilm = (name) => {
      let arr_name = name.split('');
      if (arr_name.length < 20) {
        return name;
      }
      let cutname = arr_name.splice(0, 20).join('');
      return cutname + ' ...';
    };
    return (
      <TouchableOpacity
        style={styles.itemContainer2}
        key={item.id}
        onPress={() =>
          navigation.navigate('vplayer', { id: item.id, format: 'standart' })
        }>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Image
            source={{ uri: IPTV_ADMIN_URL + 'posters/' + item.poster }}
            style={{
              height: percentHeight(13),
              width: percentWidth(16),
              borderRadius: 5,
            }}
          />
        </View>
        <View style={{ marginLeft: 20, justifyContent: 'center' }}>
          <Text style={{ color: colors.secondary, fontSize: fSize(20) }}>
            {changeNameFilm(item.name)}
          </Text>
          <Text style={{ color: '#312D44', fontSize: fSize(15) }}>
            {item.genres.length > 0 ? item.genres[0].name : ''}
          </Text>
          <Text style={{ color: '#312D44', fontSize: fSize(15) }}>
            {item.year}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const channels = () => {
    const { channels } = data;
    const item = [];
    for (const key in channels) {
      item.push(channel(channels[key].channel));
    }
    return item;
  };

  const films = () => {
    const { films } = data;
    const item = [];
    for (const key in films) {
      item.push(film(films[key].voddata));
    }
    return item;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      {loader ? <Loader /> : null}
      {!searchShow ? (
        <>
          <View
            style={{
              height: percentHeight(5),
              backgroundColor: '#191623',
              paddingHorizontal: 15,
              justifyContent: 'center',
            }}>
            <Text style={{ color: '#403C57' }}>Недавние</Text>
          </View>
          <View style={{ paddingHorizontal: 15 }}>
            <ScrollView style={{ marginTop: 10, marginBottom: 50 }}>
              {channels()}
              {films()}
            </ScrollView>
          </View>
        </>
      ) : null}
    </View>
  );
};
export default Favorite;

const styles = StyleSheet.create({
  imageContainer: {
    width: percentWidth(18),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2A3C',
  },
  itemContainer: {
    flexDirection: 'row',
    height: percentHeight(10),
    marginVertical: 10,
  },
  imageContainer2: {
    width: percentWidth(17),
    maxHeight: percentHeight(13),
    minHeight: percentHeight(9),
    backgroundColor: '#2C2A3C',
    justifyContent: 'center',
  },
  itemContainer2: {
    flexDirection: 'row',
    marginVertical: 5,
  },
});
