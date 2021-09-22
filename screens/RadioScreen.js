import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native';
import { Image } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { VLCPlayer } from '@nghinv/react-native-vlc';
import { useDispatch, useSelector } from 'react-redux';
import { request_get } from '../api/request';
import { colors } from '../templates/colors';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import Snackbar from 'react-native-snackbar'
import { setAuthState, setRadioPlayer, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const RadioScreen = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const selectedRadioId = route.params?.selectedRadioId;
  const sid = useSelector((state) => state.authReducer.sid);
  const radioIsPlaying = useSelector((state) => state.playerReducer.radioIsPlaying)
  const [radios, setRadios] = useState([]);
  const [filteredRadios, setFilteredRadios] = useState([]);
  const [radioGroup, setRadioGroup] = useState([]);
  const [selectedRadioGroup, setSelectedRadioGroup] = useState(0);
  const playerRef = useRef(null);
  const [currentPlayingRadio, setCurrentPlayingRadio] = useState({
    url: null,
    name: '',
  });
  // const [play, setPlay] = useState(false);

  const [showContent, setShowContent] = useState(true)
  const [counter, setCounter] = useState(0)

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.secondary,
      headerTitle: 'Радио',
    });
  }, []);

  useEffect(() => {
    if (selectedRadioId) {
      const selectedRadio = radios.find((radio) => radio.id == selectedRadioId);
      if (selectedRadio?.id) {
        getRadioUrl(selectedRadio.id, selectedRadio.name);
      }
    }
  }, [selectedRadioId, radios]);

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
  const getRadioUrl = (id, name) => {
    sidCheck()
    request_get(`api/radio_url/${id}/${sid}`).then(({ data }) => {
      const newUrl = data.replace('https', 'http')
      setCurrentPlayingRadio({
        url: newUrl,
        name,
      });
    });
  };
  useEffect(() => {
    let filteredRadios = radios.filter(
      (radio) => +radio.radio_group_id === +selectedRadioGroup,
    );
    if (selectedRadioGroup === 0) {
      filteredRadios = radios;
    }
    setFilteredRadios(filteredRadios);
  }, [selectedRadioGroup]);

  useEffect(() => {
    sidCheck()
    request_get(`api/radios/${sid}`).then(({ data }) => {
      data.unshift({
        id: 0,
        name: 'Все радиостанции',
      });
      setRadioGroup(data);
      const radios = data
        .map((radioGroup) => radioGroup?.radios)
        .filter(Boolean);
      console.log('data:', data);
      setRadios(radios.flat(1));
      setFilteredRadios(radios.flat(1));
    });
  }, [sid]);

  return showContent ?
    (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary,
        }}>
        <View>
          <FlatList
            data={radioGroup}
            keyExtractor={(item) => item.id.toString()}
            horizontal={true}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={
                    item.id === selectedRadioGroup
                      ? { ...styles.vodTypes, ...styles.active }
                      : { ...styles.vodTypes }
                  }
                  onPress={() => {
                    setSelectedRadioGroup(item.id);
                  }}>
                  <Text style={{ color: colors.dark_text, fontSize: fSize(16) }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View
          style={{
            top: percentHeight(11),
            height: currentPlayingRadio.url
              ? percentHeight(60)
              : percentHeight(70),
            position: 'absolute',
          }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={filteredRadios}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={{
                    margin: 5,
                    flex: 1,
                    flexDirection: 'row',
                  }}
                  onPress={() => {
                    getRadioUrl(item.id, item.name)
                    dispatch(setRadioPlayer(true))
                  }}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      height: percentHeight(11),
                      width: percentWidth(30),
                      borderRadius: percentWidth(1),
                      resizeMode: 'cover',
                    }}
                  />
                  <View
                    style={{
                      marginLeft: percentWidth(5),
                      marginTop: percentHeight(4),
                    }}>
                    <Text
                      style={{
                        color: colors.secondary,
                        fontWeight: 'bold',
                      }}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {currentPlayingRadio.url ? (
          <View
            style={{
              flex: 1,
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              backgroundColor: '#2C293D',
              borderTopLeftRadius: percentWidth(4),
              borderTopRightRadius: percentWidth(4),
              height: percentHeight(10),
            }}>
            <VLCPlayer
              ref={playerRef}
              source={{ uri: currentPlayingRadio.url }}
              paused={!radioIsPlaying}
              resume={radioIsPlaying}
            />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: percentWidth(4),
              }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(setRadioPlayer(!radioIsPlaying))
                  playerRef.current.resume(!radioIsPlaying);
                }}>
                {radioIsPlaying ? (
                  <Icon
                    name="pause-outline"
                    size={percentHeight(4)}
                    color={`#4D4867`}
                  />
                ) : (
                  <Icon
                    name="play-outline"
                    size={percentHeight(4)}
                    color={`#4D4867`}
                  />
                )}
              </TouchableOpacity>

              <Text
                style={{
                  fontWeight: 'bold',
                  color: colors.secondary,
                  fontSize: fSize(17),
                }}>
                {currentPlayingRadio.name}
              </Text>
              <TouchableOpacity
                style={{}}
                onPress={() =>
                  setCurrentPlayingRadio({
                    url: null,
                    name: '',
                  })
                }>
                <Icon
                  name="close-outline"
                  size={percentHeight(4)}
                  color={`#4D4867`}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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

const styles = StyleSheet.create({
  vodTypes: {
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 18,
    paddingHorizontal: 10,
    backgroundColor: colors.btn_color,
    justifyContent: 'center',
    alignItems: 'center',
    height: percentHeight(5),
  },
  active: {
    backgroundColor: colors.dark_red,
  },
});
export default RadioScreen;
