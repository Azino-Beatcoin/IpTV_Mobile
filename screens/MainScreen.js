import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../templates/colors';
import { request_get } from '../api/request';
import { IPTV_ADMIN_URL } from '../api/url';
import FilmCard from '../components/films/FilmCard';
import { useDispatch, useSelector } from 'react-redux';
import HistoryList from '../components/Main/historyList';
import { getHistory } from '../redux/actions';
import Snackbar from 'react-native-snackbar'
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const MainScreen = ({ navigation }) => {
  const [channels, setChannels] = useState([]);
  const [favoriteFilms, setFavoriteFilms] = useState([]);
  const [newFilms, setNewFilms] = useState([]);
  const [cartnoons, setCartnoons] = useState([]);
  const [serials, setSerials] = useState([]);
  const [popularFilms, setPopularFilms] = useState([]);
  const [banners, setBanners] = useState([]);
  const [radios, setRadios] = useState([]);
  const filmsHistory = useSelector((state) => state.historyReducer.historyView);
  const [musics, setMusics] = useState([]);
  const sid = useSelector((state) => state.authReducer.sid);
  console.log('sid:', sid);
  const dispatch = useDispatch();
  const [showContent, setShowContent] = useState(true)
  const [counter, setCounter] = useState(0)


  if (!sid && !counter) {
    setShowContent(false);
    setCounter(1)
  }

  useEffect(() => {
    if (sid) {
      setShowContent(true)
      setCounter(0)
    }
  }, [sid])

  useEffect(() => {
    if (sid) {
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
      request_get(`favorites/all/?sid=${sid}`).then(({ films }) => {
        const favoriteFilmsVoddata = films.map((film) => film.voddata);
        setFavoriteFilms(favoriteFilmsVoddata);
      });
      request_get(`vod_data_top/${sid}`).then(({ data }) => {
        setPopularFilms(data);
      });
      request_get(`vod_data_news/${sid}`).then(({ data }) => {
        setNewFilms(data);
      });
      request_get('channels/banners').then(({ data }) => {
        console.log('banner current ====== ', data);
        const newBanners = data.banners.map((banner) => {
          banner.channelImage = data.channels[banner.channel_id].image;
          banner.group_channel_id = data.channels[banner.channel_id].group_channel_id
          return banner;
        });
        setBanners(newBanners);
      });

      request_get(`api/radios/${sid}`).then(({ data }) => {
        const shuffledRadios = data
          .map((data) => data.radios)
          .flat(1)
          .sort(() => Math.random - 0.5)
          .slice(0, 10);
        setRadios(shuffledRadios);
      });

      request_get(`vod_datas/${sid}/1?type=4`).then(({ data }) => {
        // console.log('cartnoon: ', data);
        setCartnoons(data);
      });
      request_get(`vod_datas/${sid}/1?type=2`).then(({ data }) => {
        // console.log('cartnoon: ', data);
        setSerials(data);
      });

      request_get(`musics_group/${sid}`).then(({ data }) => {
        const musics = data
          .map((music) => music['music_datas'])
          .flat(1)
          .map((music) => ({
            id: music.id,
            musics: music.music_vodfiles,
            album: {
              music_vodfiles: music.music_vodfiles,
              music_data_genres: music.music_data_genres,
            },
            poster: music.poster,
          }));
        setMusics(musics);
      });
      getChannels();
      dispatch(getHistory(sid));
    }
  }, [sid, navigation]);

  useEffect(() => {
    // DeviceEventEmitter.addListener('goBack', (e) => {
    //   getChannels();
    // });

    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Image
            source={require('../img/logo.png')}
            style={{
              width: percentWidth(40),
              resizeMode: 'contain',
            }}
          />
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }}>
          <Icon
            name={'search-outline'}
            size={25}
            color={colors.header_icons_color}
          />
        </TouchableOpacity>
      ),
    });
  }, []);

  const getChannels = async () => {
    // const access_token = await AsyncStorage.getItem('access_token')
    // let sidBodyForm = new FormData()
    // sidBodyForm.append('sid', sid)
    // let sidResponse = await fetch(`${BASE_API_URL}api/sid/check`, { method: 'POST', body: sidBodyForm, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data', 'Authorization': access_token } })
    // if (sidResponse.status == 401) {
    //   await AsyncStorage.removeItem('sid')
    //   await AsyncStorage.removeItem('access_token')
    //   dispatch(setSid(''))
    //   dispatch(setAuthState(false))
    //   return
    // }
    // sidResponse = await sidResponse.json()
    // if (!sidResponse.success) {
    //   dispatch(setSid(''))
    //   navigate('subscribes')
    //   Snackbar.show({
    //     text: 'Активируйте подписку',
    //     duration: Snackbar.LENGTH_LONG,
    //   })
    // }
    const response = await request_get('random/channels?sid=' + sid);
    if (!response.success) {
      dispatch();
      alert('got here')
      return navigation.navigate('profile', { auth: false });
    }
    const newChannels = [
      ...response.data,
      {
        id: 'all',
        image: 'all',
        group_channel_id: 'all',
      },
    ];
    setChannels(newChannels);
  };

  const ChannelsCard = ({ id, image, group_channel_id }) => {
    return id === 'all' ? (
      <TouchableOpacity
        style={styles.imageContainer}
        key={id.toString()}
        onPress={() => navigation.navigate('tv')}>
        <Text
          style={{
            color: '#fff',
          }}>
          См все
        </Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.imageContainer}
        key={id.toString()}
        onPress={() =>
          navigation.navigate('player', {
            id: id,
            group_channel_id: group_channel_id,
          })
        }>
        <Image
          source={{ uri: `${IPTV_ADMIN_URL}images/channel/${image}` }}
          style={{
            width: percentWidth(25),
            height: percentHeight(7),
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const channelSlider = ({ data, title }) => {
    return (
      <View style={{ height: percentHeight(14), marginBottom: 20 }}>
        <Text style={{ fontSize: fSize(18), color: colors.secondary }}>
          {title}
        </Text>
        <FlatList
          horizontal={true}
          data={data}
          renderItem={({ item }) => ChannelsCard(item)}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    );
  };

  const slider = ({
    title,
    data,
    expandAll,
    redirectToMoviePage = false,
    params = null,
  }) => {
    return (
      <View style={{ height: percentHeight(40) }}>
        <Text style={{ fontSize: fSize(18), color: colors.secondary }}>
          {title}
        </Text>
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 0,
          }}
          onPress={() => {
            if (!redirectToMoviePage) {
              navigation.navigate(expandAll, {
                screen: expandAll,
              });
            } else {
              navigation.navigate('movies', {
                vodType: params?.vodType,
                vodName: params?.vodName,
              });
            }
          }}>
          <Text
            style={{
              fontSize: fSize(16),
              color: 'white',
            }}>
            Смотреть все
          </Text>
        </TouchableOpacity>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <FilmCard
              navigation={navigation}
              item={item}
              style={{ marginRight: 8 }}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
        />
      </View>
    );
  };

  return (
    showContent ? (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.primary, paddingHorizontal: 15 }}>
        <HistoryList data={filmsHistory} navigate={navigation.navigate} />
        {banners.length > 0 ? (
          <View style={{ height: percentHeight(33) }}>
            <FlatList
              data={banners}
              horizontal={true}
              keyExtractor={(item) => item.channel_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: percentWidth(85),
                    height: percentHeight(30),
                    margin: 5,
                    position: 'relative',
                  }}
                  onPress={() =>
                    navigation.navigate('player', {
                      id: item.channel_id,
                      group_channel_id: item.group_channel_id,
                    })
                  }>
                  {/* {
                    console.log(item)
                  } */}
                  <Image
                    source={{
                      uri: `${IPTV_ADMIN_URL}images/channel/${item.channelImage}`,
                    }}
                    style={{
                      position: 'absolute',
                      width: 60,
                      height: 60,
                      resizeMode: 'cover',
                      zIndex: 99,
                      top: 10,
                      left: 10,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: percentHeight(1),
                      right: percentWidth(2),
                      fontSize: fSize(12),
                      zIndex: 99,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: colors.secondary,
                      }}>
                      Сейчас в эфире
                      </Text>
                    <Icon
                      style={{ paddingLeft: percentWidth(1) }}
                      name={'radio-button-on-outline'}
                      color={colors.dark_red}
                      size={fSize(15)}
                    />
                  </View>

                  <Text
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      color: colors.secondary,
                      fontSize: fSize(18),
                      zIndex: 99,
                    }}>
                    {item.name}
                  </Text>
                  <Image
                    source={{
                      uri: `https://epg.somon.tv/banners/${item.banner}`,
                    }}
                    style={{
                      resizeMode: 'stretch',
                      width: '100%',
                      height: '100%',
                      borderRadius: percentWidth(1),
                      // height: 'auto',
                    }}
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        ) : null}
        {channels
          ? channelSlider({
            title: 'Телеканалы',
            data: channels,
          })
          : null}
        {favoriteFilms.length > 0
          ? slider({
            data: favoriteFilms,
            title: 'Избранные',
            expandAll: 'favorite',
          })
          : null}
        {newFilms.length > 0
          ? slider({
            data: newFilms,
            title: 'Новинки',
            expandAll: 'newFilms',
          })
          : null}
        {popularFilms.length > 0
          ? slider({
            data: popularFilms,
            title: 'Популярные',
            expandAll: 'popularFilms',
          })
          : null}
        {cartnoons.length > 0
          ? slider({
            data: cartnoons,
            title: 'Мультфильмы',
            expandAll: 'cartnoons',
            redirectToMoviePage: true,
            params: { vodType: 4, vodName: 'Мультфильмы' },
          })
          : null}
        {serials.length > 0
          ? slider({
            data: serials,
            title: 'Сериалы',
            expandAll: 'serials',
            redirectToMoviePage: true,
            params: { vodType: 2, vodName: 'Сериалы' },
          })
          : null}
        {musics.length > 0 ? (
          <View>
            <Text style={{ fontSize: fSize(18), color: colors.secondary }}>
              Новые хиты
              </Text>
            <FlatList
              data={musics}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('albums', {
                      musics: item.musics,
                      poster: item.poster,
                      album: item.album,
                    })
                  }>
                  <Image
                    source={{
                      uri: `${IPTV_ADMIN_URL}/posters/music/${item.poster}`,
                    }}
                    style={{
                      height: percentHeight(14),
                      width: percentWidth(30),
                      borderRadius: percentWidth(1),
                      resizeMode: 'cover',
                      marginRight: 10,
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  />
                </TouchableOpacity>
              )}
              // keyExtractor={(item) => item..toString()}
              horizontal={true}
            />
          </View>
        ) : null}
        {radios.length > 0 ? (
          <View
            style={{
              marginTop: 20,
            }}>
            <Text style={{ fontSize: fSize(18), color: colors.secondary }}>
              Популярные радиостанции
              </Text>
            <FlatList
              data={radios}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('radio', { selectedRadioId: item.id })
                  }>
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      height: percentHeight(9),
                      width: percentWidth(30),
                      borderRadius: percentWidth(1),
                      resizeMode: 'cover',
                      marginRight: 10,
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(radio) => radio.id.toString()}
              horizontal={true}
            />
          </View>
        ) : null}
      </ScrollView>
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
  );
};
export default MainScreen;

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: percentHeight(9),
    width: percentWidth(27),
    backgroundColor: '#272536',
    marginRight: 6,
    borderRadius: 5,
  },
});
