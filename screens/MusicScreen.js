import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { request_get, request_post } from '../api/request';
import { IPTV_ADMIN_URL } from '../api/url';
import { colors } from '../templates/colors';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../components/Loader';
import { BASE_API_URL } from '../api/request'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import Snackbar from 'react-native-snackbar'

const MusicScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const { sid } = useSelector((state) => state.authReducer);
  const [musicGroups, setMusicGroups] = useState([]);
  const [selectedMusicGroup, setSelectedMusicGroup] = useState({
    id: 0,
    name: 'Все альбомы',
  });
  const [musics, setMusics] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loader, setLoader] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [showContent, setShowContent] = useState(true)
  const [counter, setCounter] = useState(0)

  if (!sid && !counter) {
    setShowContent(false)
    setCounter(1)
  }

  useEffect(() => {
    if(sid) {
      setShowContent(true)
      setCounter(0)
    }
  }, [sid])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => {
              setShowSearch(!showSearch)
              // request_post(
              //   `${IPTV_ADMIN_URL}music_vodfile_search/${sid}?name=${searchText}`,
              // ).then((res) => {
              //   console.log('searchREs:', res);
              // });
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
        showSearch ? (
          <TextInput
            style={{
              fontSize: fSize(16),
              color: colors.secondary,
            }}
            value={searchText}
            placeholder="Введите музыку для поиска"
            placeholderTextColor={colors.dark_blue}
            onChangeText={setSearchText}
          />
        ) : (
          <Text
            style={{
              color: colors.secondary,
              fontSize: fSize(20),
            }}>
            Музыка
          </Text>
        ),
    });
  }, [showSearch, searchText]);
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
    request_get(`musics_group/${sid}`).then(({ data, success }) => {
      if (success) {
        const musicGroups = data.map((musicGroup) => ({
          name: musicGroup.name,
          id: musicGroup.id,
        }));
        musicGroups.unshift({
          id: 0,
          name: 'Все альбомы',
        }),
          setMusicGroups(musicGroups);
        if (selectedMusicGroup.id === 0) {
          const musics = data
            .map((musicGroup) => musicGroup.music_datas)
            .flat(2);
          setMusics(musics);
        } else {
          const musics = data.find(
            (musicGroup) => musicGroup.id === selectedMusicGroup.id,
          )['music_datas'];
          setMusics(musics);
        }
      }
    });
  }, [selectedMusicGroup, sid]);

  const changeNameMusic = (name) => {
    let arr_name = name.split('');
    if (arr_name.length < 10) {
      return name;
    }
    let cutname = arr_name.splice(0, 10).join('');

    return cutname + ' ...';
  };
  const changeNameMusicSearch = (name) => {
    let arr_name = name.split('');
    if (arr_name.length < 40) {
      return name;
    }
    let cutname = arr_name.splice(0, 40).join('');

    return cutname + ' ...';
  };

  if (searchText.length > 0 && !showSearch) {
    const foundedMusic = musics
      .map((music) => music.music_vodfiles)
      .flat(1)
      .filter((music) => music.file_torrent.includes(searchText));

    const searchResult = foundedMusic.map((music) => {
      const album = musics.find((mu) => +mu.id === +music.data_id);
      return {
        ...music,
        poster: album.poster,
        album,
      };
    });
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary,
        }}>
        <ScrollView>
          {searchResult.length === 0 ? (
            <Text
              style={{
                color: colors.secondary,
                fontSize: fSize(16),
              }}>
              По вашему запросу ничего не найдено
            </Text>
          ) : (
            <FlatList
              data={searchResult}
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
                        musics: searchResult,
                        selected: item.id,
                        poster: item.poster,
                        album: item.album,
                      });
                    }}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={{
                        uri: `${IPTV_ADMIN_URL}posters/music/${item.poster}`,
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
                      {changeNameMusicSearch(item.file_torrent)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </ScrollView>
      </View>
    );
  }
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  return showContent ?
    (
    <View
      style={{
        flex: 1,
        backgroundColor: '#191623',
      }}>
      <View
        style={{
          height: percentHeight(6),
        }}>
        <FlatList
          data={musicGroups}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                height: percentHeight(5),
                borderRadius: percentWidth(5),
                backgroundColor:
                  selectedMusicGroup.id === item.id
                    ? colors.dark_red
                    : colors.dark_violet,
                marginHorizontal: 5,
              }}
              onPress={() => {
                setSelectedMusicGroup(item);
              }}>
              <Text
                style={{
                  color: colors.dark_text,
                  fontSize: fSize(16),
                  padding: 10,
                }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View
        style={{
          paddingRight: 10,
          paddingBottom: 30,
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={async ({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              setLoader(true);
              setTimeout(() => {
                setLoader(false);
              }, 1000);
            }
          }}>
          <FlatList
            numColumns={3}
            data={musics}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  marginTop: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    borderTopEndRadius: 5,
                    borderTopStartRadius: 5,
                    overflow: 'hidden',
                  }}
                  onPress={() =>
                    navigation.navigate('albums', {
                      musics: item.music_vodfiles,
                      poster: item.poster,
                      album: item,
                    })
                  }>
                  <Image
                    source={{
                      uri: `${IPTV_ADMIN_URL}posters/music/${item.poster}`,
                    }}
                    style={{
                      height: percentHeight(19),
                      width: percentWidth(30),
                      resizeMode: 'contain',
                    }}
                  />
                  <Text
                    style={{
                      color: colors.secondary,
                      fontSize: fSize(14),
                    }}>
                    {changeNameMusic(item.album)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
        {loader ? (
          <View style={{ height: percentHeight(10) }}>
            <Loader />
          </View>
        ) : null}
      </View>
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

export default MusicScreen;
