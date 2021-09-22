import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
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
import { getFavoritesMusic } from '../redux/actions';
import VideoPlayer from 'react-native-video'
import { BASE_API_URL } from '../api/request'
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import Snackbar from 'react-native-snackbar'

const MusicPlayerFavorites = ({ navigation, route }) => {
  const { sid } = useSelector((state) => state.authReducer);
  const { musics, selected, album } = route.params;
  const [poster, setPoster] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState(selected);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [url, setUrl] = useState('');
  const [play, setPlay] = useState(true);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [duration, setDuration] = useState(0);
  const [playerWidth, setPlayerWidth] = useState(0);
  const playerRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [favorite, setFavorite] = useState(true);
  const dispatch = useDispatch();
  const getCurrentTimePercentage = () => {
    if (currentTime > 0 && duration > 0) {
      return parseFloat(currentTime) / parseFloat(duration);
    }
    return 0;
  };
  const onProgress = ({ currentTime }) => {
    setCurrentTime(currentTime);
  };
  const sidCheck = async () => {
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
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Плеер',
    });
  }, []);
  useEffect(() => {
    sidCheck()
    request_get(`music_vodfile_url/${selectedMusicId}/${sid}`).then(
      ({ data, success }) => {
        if (success) {
          const music = musics.find(
            (music) => +music.music.id === +selectedMusicId,
          );
          setPoster(music.poster);
          setSelectedMusic(music.music);
          setUrl(data);
          setPlay(true);
        }
      },
    );
  }, [selectedMusicId]);

  const twodigit = (digit) => (+digit > 9 ? `${digit}` : `0${digit}`);

  const getAudioTimeFormat = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8)

  };

  const getGenres = () => {
    return album.music_data_genres.map((genr) => genr.name).join(',');
  };

  const prevBtn = () => {
    let idx = musics.findIndex((music) => +music.music.id === +selectedMusicId);

    if (idx === 0) {
      setSelectedMusicId(musics[musics.length - 1].music.id);
      setPoster(musics[musics.length - 1].music.poster);
      setSelectedMusic(musics[musics.length - 1].music);
      playerRef.current.seek(0);
    } else if (idx > 0) {
      const music = musics[--idx];
      setSelectedMusicId(music.music.id);
      setPoster(music.poster);
      setSelectedMusic(music.music);
    }
  };

  const nextBtn = () => {
    let idx = musics.findIndex((music) => +music.music.id === selectedMusicId);
    if (idx === musics.length - 1) {
      setSelectedMusicId(musics[0].music.id);
      setSelectedMusic(musics[0].music);
      setPoster(musics[0].music.poster);
      // playerRef.current.seek(0);
    } else if (idx < musics.length - 1) {
      const music = musics[++idx];
      setSelectedMusicId(music.music.id);
      setSelectedMusic(music.music);
      setPoster(music.music.poster);
    }
  };

  const downloadMusic = async (id) => {
    await sidCheck()
    const { data } = await request_get(`music_vodfile_url/${id}/${sid}`);
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
          console.log('res -> ', JSON.stringify(res));
          Alert.alert('Успех', 'Музыка успешно загружена');
        });
    }
  };

  const addToFavorite = () => {
    sidCheck()
    request_post(
      `musics_favorite/${sid}?music_vodfile_id=${selectedMusicId}`,
    ).then((res) => {
      if (res.success) {
        setFavorite(false);
        dispatch(getFavoritesMusic(sid));
        Alert.alert('Успех', 'Успешно удален из избранного');
      }
    });
  };

  return (
    <View
      style={{
        ...globalStyles.container,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Image
        source={{
          uri: `${IPTV_ADMIN_URL}posters/music/${poster}`,
        }}
        style={{
          width: percentWidth(70),
          height: percentHeight(40),
        }}
      />
      <Text
        style={{
          color: colors.secondary,
          fontSize: fSize(16),
          width: percentWidth(70),
        }}>
        {selectedMusic?.file_torrent}
      </Text>
      <Text style={{ color: colors.dark_blue, fontSize: fSize(16) }}>
        {album?.music_vodfiles?.length || musics?.length || 1} Песен
      </Text>
      <Text style={{ color: colors.dark_blue, fontSize: fSize(16) }}>
        Жанры: {getGenres()}
      </Text>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
        }}>
        <TouchableOpacity onPress={addToFavorite}>
          <Icon
            name={'star-outline'}
            size={fSize(28)}
            color={favorite ? colors.dark_red : colors.dark_blue}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={prevBtn}>
          <Icon
            name={'play-back-outline'}
            size={fSize(30)}
            color={colors.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setPlay(!play)}>
          {!play ? (
            <Icon name={'play'} size={fSize(40)} color={colors.secondary} />
          ) : (
            <Icon
              name={'pause-outline'}
              color={colors.secondary}
              size={fSize(40)}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={nextBtn}>
          <Icon
            name={'play-forward-outline'}
            size={fSize(30)}
            color={colors.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => downloadMusic(selectedMusicId)}>
          <Icon
            name={'download-outline'}
            size={fSize(30)}
            color={colors.dark_blue}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: percentHeight(10),
        }}>
        <View
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
          }}>
          <TouchableOpacity
            onLayout={({ nativeEvent }) => {
              const { layout } = nativeEvent;
              setPlayerWidth(layout.width);
            }}
            onPress={({ nativeEvent }) => {
              const { pageX, locationX } = nativeEvent;
              console.log(playerWidth);
              console.log(pageX, locationX);
              const seek = parseFloat(pageX / playerWidth) * duration;
              playerRef.current.seek(seek);
              setPlay(true);
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                borderRadius: 3,
                alignItems: 'center',
                overflow: 'hidden',
              }}>
              <View
                style={{
                  flex: getCurrentTimePercentage() * 100,
                  backgroundColor: colors.dark_red,
                  height: 10,
                }}
              />
              <View
                style={{
                  borderRadius: 15,
                  backgroundColor: colors.dark_red,
                  width: 15,
                  height: 15,
                  zIndex: 999,
                }}></View>
              <View
                style={{
                  flex: (1 - getCurrentTimePercentage()) * 100,
                  height: 10,
                  backgroundColor: '#2C2C2C',
                }}></View>
            </View>
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: percentWidth(90),
            }}>
            <Text
              style={{
                color: colors.secondary,
              }}>
              {getAudioTimeFormat(currentTime)}
            </Text>
            <Text
              style={{
                color: colors.secondary,
              }}>
              {getAudioTimeFormat(duration)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: percentWidth(90),
        }}>
        <TouchableOpacity
          onPress={() => {
            setMuted(!muted);
          }}>
          {!muted ? (
            <Icon
              name={'volume-high-outline'}
              color={colors.dark_blue}
              size={fSize(30)}
            />
          ) : (
            <Icon
              name={'volume-mute-outline'}
              color={colors.dark_blue}
              size={fSize(30)}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setRepeat(!repeat);
          }}>
          <Icon
            name={'repeat-outline'}
            color={repeat ? colors.dark_red : colors.dark_blue}
            size={fSize(30)}
          />
        </TouchableOpacity>
      </View>

      {url ? (
        <VideoPlayer
          muted={muted}
          ref={playerRef}
          onLoad={({ duration }) => setDuration(duration)}
          onProgress={onProgress}
          source={{ uri: url }}
          audioOnly={true}
          paused={!play}
          repeat={repeat}
          onEnd={() => nextBtn()}
        />
      ) : null}
    </View>
  );
};

export default MusicPlayerFavorites;
