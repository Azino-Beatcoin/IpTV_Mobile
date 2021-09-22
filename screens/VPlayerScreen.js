import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
  Modal,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  StatusBar,
} from 'react-native';
import { request_get } from '../api/request';
import Notify from '../components/Notify';
import * as actions from '../redux/actions';
import { bindActionCreators } from 'redux';
import { colors } from '../templates/colors';
import Loader from '../components/Loader';
import TvPlayer from '../components/TvPlayer';
import FilmDetails from '../components/films/FilmDeatils';
import FilmSeries from '../components/films/FilmSeries';
import { globalStyles } from '../templates/globalStyles';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import { items } from '../components/helper';
import VPlayer from '../components/Player';
import Snackbar from 'react-native-snackbar'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const VPlayerScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { auth_false } = bindActionCreators(actions, dispatch);
  const [data, setData] = useState([]);
  const [details, setDetails] = useState({});
  const [full, setFull] = useState(false);

  const [loader, setLoader] = useState(true);
  const [uri, setUri] = useState(null);
  const [showSeries, setShowSeries] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [play, setPlay] = useState(false);
  const [defaultSeries, setDefaultSeries] = useState({ id: '', file_Server: '' });
  const formats = [{ id: 'standart' }, { id: 'HD' }, { id: 'FullHD' }, { id: 'UHD' }];
  const [format, setFormat] = useState('standart');

  useEffect(() => {
    DeviceEventEmitter.addListener('goBack', (e) => {
      getData();
    });
    navigation.setOptions({
      headerShown: false,
    });

    getData();
  }, []);

  const getData = async () => {
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
      `get_series_list/${route.params.id}/${route.params.format}?sid=${sid}`,
    );
    if (!response.success) {
      Notify('error', 'Вы не авторизованы');
      dispatch(actions.setAuthState(false));
      dispatch(actions.setSid(''));
      return navigation.navigate('profile', { auth: false });
    }

    setDetails(response.details);
    setLoader(false);

    if (response.details.type == 1 || response.details.type == 4) {
      setUri(response.data);
      setShowSeries(false);
    } else {
      setData(response.data);
      if (response.default) {
        setDefaultSeries(response.default);
      }

      setShowSeries(true);
    }
  };

  return (
    <View style={styles.container}>
      {loader ? (
        <Loader />
      ) : (
        <>
          <View style={full ? styles.videoFull : styles.video}>
            <VPlayer
              uri={uri}
              onFull={setFull}
              navigation={navigation}
              back={navigation.goBack}
              onPlay={setPlay}
              isTv={false}
            />
          </View>
          {!full ? (
            <ScrollView style={{ paddingHorizontal: 10 }}>
              <FilmDetails details={details} />
              {showSeries ? (
                <FilmSeries
                  data={data}
                  format={route.params.format}
                  setUri={setUri}
                  onChangeSeries={setPlay}
                  defaultSeries={defaultSeries}
                />
              ) : null}
            </ScrollView>
          ) : null}
        </>
      )}
      <View>
        <Modal
          style={{ flex: 1 }}
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              style={{
                ...globalStyles.modalView,
                backgroundColor: colors.btn_color,
                borderRadius: 10,
                paddingHorizontal: 0,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 15,
                  marginBottom: 10,
                }}>
                <Text style={{ fontSize: fSize(20), color: colors.secondary }}>
                  Фильтр
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                  }}>
                  <Icon
                    name="options-outline"
                    size={fSize(35)}
                    color={colors.modal_icon}
                  />
                </TouchableOpacity>
              </View>
              <View>
                <Text
                  style={{
                    ...styles.filterActive,
                    color: colors.secondary,
                    position: 'absolute',
                    left: percentWidth(5),
                    bottom: 5,
                    elevation: 3,
                  }}>
                  Формат
                </Text>
                <DropDownPicker
                  items={items(formats, 'id')}
                  onChangeItem={(item) => {
                    setFormat(item.value);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    width: percentWidth(31),
                  }}
                  containerStyle={{
                    height: percentHeight(5),
                    width: percentWidth(100),
                  }}
                  arrowColor={colors.secondary}
                  defaultValue={null}
                  placeholder={''}
                  isVisible={false}
                  placeholderStyle={{
                    color: colors.secondary,
                    fontSize: fSize(20),
                  }}
                  itemStyle={{ width: percentWidth(100) }}
                />
                <Text
                  style={{
                    ...styles.filterActive,
                    position: 'absolute',
                    left: percentWidth(29),
                  }}>
                  {format}
                </Text>
              </View>

              <View style={{ marginTop: 30, paddingHorizontal: 15 }}>
                <TouchableHighlight
                  style={{
                    ...globalStyles.openButton,
                    backgroundColor: colors.dark_red,
                  }}
                  onPress={() => {
                    filter();
                    setModalVisible(!modalVisible);
                  }}>
                  <Text style={globalStyles.textStyle}>Применить</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default VPlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  videoFull: {
    flex: 1,
  },
  video: {
    height: percentHeight(35),
  },
  listItem: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingLeft: 10,
  },
  active: {
    backgroundColor: colors.blue,
  },
});
