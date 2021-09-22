import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  Modal,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { request_get, request_post } from '../api/request';
import { IPTV_ADMIN_URL } from '../api/url';
import { colors } from '../templates/colors';
import { globalStyles } from '../templates/globalStyles';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob';
import { ScrollView } from 'react-native-gesture-handler';
import Loader from '../components/Loader';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { getFavoritesMusic } from '../redux/actions';
import Snackbar from 'react-native-snackbar'
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const MusicAlbums = ({ navigation, route }) => {
  const { sid } = useSelector((state) => state.authReducer);
  const { musics, poster, album } = route.params;
  console.log('albums:', album);
  const [musicId, setMusicId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [listloader, setlistloader] = useState(false);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Альбомы',
    });
  }, [navigation, route]);

  const changeNameMusic = (name) => {
    let arr_name = name.split('');
    if (arr_name.length < 30) {
      return name;
    }
    let cutname = arr_name.splice(0, 30).join('');

    return cutname + ' ...';
  };

  if (!musics.length) {
    return (
      <View
        style={{
          ...globalStyles.container,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{ fontSize: fSize(16), color: colors.secondary }}>
          В данном альбоме нет музыки
        </Text>
      </View>
    );
  }

  const downloadMusic = async () => {
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
    const { data } = await request_get(`music_vodfile_url/${musicId}/${sid}`);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'App needs access to your storage to download Photos',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // Once user grant the permission start downloading
      const date = new Date();
      const { config, fs } = RNFetchBlob;
      let PictureDir = fs.dirs.MusicDir;
      let options = {
        fileCache: true,
        addAndroidDownloads: {
          // Related to the Android only
          useDownloadManager: true,
          notification: true,
          path:
            PictureDir +
            '/music_' +
            Math.floor(date.getTime() + date.getSeconds() / 2) +
            '.mp3',
          description: 'Music',
        },
      };
      config(options)
        .fetch('GET', data)
        .then((res) => {
          // Showing alert after successful downloading
          Alert.alert('Успех', 'Успешно скачан');
        });
    }
  };

  const addToFavorite = () => {
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
    request_post(`musics_favorite/${sid}?music_vodfile_id=${musicId}`).then(
      (res) => {
        if (res.success) {
          dispatch(getFavoritesMusic(sid));
          Alert.alert('Успех', 'Успешно добавлен в избранное');
        }
      },
    );
  };
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  return (
    <View
      style={{
        ...globalStyles.container,
        paddingRight: 10,
        paddingBottom: 30,
        // marginBottom: listloader ? percentHeight(10) : 0,
      }}>
      <ScrollView
        onScroll={async ({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            setlistloader(true);
            setTimeout(() => {
              setlistloader(false);
            }, 1000);
          }
        }}>
        <FlatList
          data={musics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                flex: 1,
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                position: 'relative',
                marginTop: 10,

                zIndex: 99,
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('mplayer', {
                    musics,
                    selected: item.id,
                    poster,
                    album,
                  });
                }}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image
                  source={{
                    uri: `${IPTV_ADMIN_URL}posters/music/${poster}`,
                  }}
                  style={{
                    height: percentHeight(10),
                    width: percentWidth(22),
                    resizeMode: 'cover',
                    borderRadius: 10,
                  }}
                />
                <Text
                  style={{
                    color: colors.secondary,
                    fontSize: fSize(14),
                    marginLeft: 10,
                  }}>
                  {changeNameMusic(item.file_torrent)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: percentWidth(5),
                }}
                onPress={() => {
                  setMusicId(item.id);
                  setModalVisible(true);
                }}>
                <MaterialIcon
                  name={'more-vert'}
                  size={fSize(30)}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
      {listloader ? (
        <View style={{ backgroundColor: colors.primary }}>
          <Loader />
        </View>
      ) : null}
      <Modal
        style={{ flex: 1 }}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: percentHeight(20),
          }}
          onPress={() => setModalVisible(false)}
        />

        <View
          style={{
            position: 'absolute',
            flex: 1,
            alignItems: 'center',
            // justifyContent: 'flex-start',
            top: percentHeight(80),
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.dark_blue,
          }}>
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              position: 'absolute',
            }}
            onPress={() => setModalVisible(false)}>
            <Icon
              name={'close-outline'}
              size={fSize(35)}
              color={colors.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={addToFavorite}
            style={{
              marginTop: percentHeight(3),
            }}>
            <Text
              style={{
                color: colors.secondary,
                fontSize: fSize(16),
              }}>
              Добавить в избранное
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: percentHeight(3),
            }}
            onPress={downloadMusic}>
            <Text
              style={{
                color: colors.secondary,
                fontSize: fSize(16),
                margin: 10,
              }}>
              Скачать
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default MusicAlbums;
