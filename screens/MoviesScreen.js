import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableHighlight,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../templates/colors';
import { globalStyles } from '../templates/globalStyles';
import { request_get } from '../api/request';
import Loader from '../components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import { items } from '../components/helper';
import Banners from '../components/Banners';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import ButtonsNavigation from '../components/General/ButtonsNavigation';
import { useIsFocused } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import FilmCard from '../components/films/FilmCard';
import { useSelector } from 'react-redux';
import Snackbar from 'react-native-snackbar'
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { BASE_API_URL } from '../api/request'

const MoviesScreen = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const formats = [{ id: 'standart' }, { id: 'HD' }, { id: 'FullHD' }, { id: 'UHD' }];
  const [format, setFormat] = useState('standart');
  const [films, setFilms] = useState([]);
  const [loader, setLoader] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    genre: { value: '', label: '' },
    year: '',
  });
  const [vodTypes, setVodTypes] = useState([]);
  const [banners, setBanners] = useState([]);
  const [searchShow, setSearchShow] = useState(false);
  const [type, setType] = useState({
    title: 'Фильм',
    id: 1,
  });
  const [filterCheck, setFilterCheck] = useState(false);
  const [page, setPage] = useState(1);
  const sid = useSelector((state) => state.authReducer.sid);
  const [listLoader, setListLoader] = useState(true);
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

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

  useEffect(() => {
    if (route.params?.vodType) {
      setType({
        id: route.params?.vodType,
        title: route.params?.vodName,
      });
    }
  }, [route.params]);

  const search = () => {
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
          onChangeText={(text) => setFilters({ ...filters, search: text })}
          value={filters.search}
          style={{ color: colors.header_icons_color }}
        />
      </View>
    );
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    DeviceEventEmitter.addListener('goBack', (e) => {
      getVodTypes();
      getFilms();
      getBanners();
      getData();
    });
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => {
              setModalVisible(true);
              setFilterCheck(true);
            }}>
            {!searchShow ? (
              <Icon
                name={'options-outline'}
                size={25}
                color={colors.header_icons_color}
              />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => {
              setFilterCheck(true);
              searchShow ? filter() : null;
              setSearchShow(!searchShow);
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
          search()
        ) : (
          <Text style={{ color: colors.secondary, fontSize: fSize(23) }}>
            {type.title}
          </Text>
        ),
    });
    const getData = async () => {
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
      const response_genre = await request_get(`vod_genres/${sid}`);
      if (!response_genre.success) {
        return navigation.navigate('profile', { auth: false });
      }
      const response_year = await request_get(`vod_years/${sid}`);
      if (!response_year.success) {
        return navigation.navigate('profile', { auth: false });
      }

      setGenres(response_genre.data);
      setYears(response_year.data);
    };

    if (filters.search.length === 0 || !filterCheck) {
      getVodTypes();
      getFilms();
      getBanners();
      getData();
    } else {
      filter();
    }
  }, [searchShow, type, filters, sid]);

  const getVodTypes = async () => {
    const vodTypes = await request_get(`vod_types/${sid}`);
    if (!vodTypes.success) {
      return navigation.navigate('profile', { auth: false });
    }
    setVodTypes(vodTypes.data);
  };

  const getFilms = async () => {
    try {
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
      setPage(1);
      setFilms([]);
      setLoader(true);
      const response = await request_get(`vod_datas/${sid}/1?type=${type.id}`);
      if (!response.success) {
        return navigation.navigate('profile', { auth: false });
      }
      setFilms(response.data);
      setLoader(false);
      setPage(2);
    } catch (error) {
      console.log('[getFilms]:', error);
    }
  };

  const renderFilmCard = ({ item }) => (
    <FilmCard item={item} navigation={navigation} />
  );

  const getBanners = async () => {
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
    setBanners([]);
    const response_banner = await request_get(`banners/${type.id}`);
    setBanners(response_banner.data);
  };

  const filter = async () => {
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
    setPage(1);
    const { search, year, genre } = filters;
    setBanners([]);
    setFilms([]);
    setLoader(true);
    const response = await request_get(
      `vod_datas/${sid}/1?search=${search}&year=${year}&genre=${genre.value}&type=${type.id}`,
    );
    if (!response.success) {
      return navigation.navigate('profile', { auth: false });
    }
    if (vodTypes.length === 0) {
      getVodTypes();
    }
    setFilms(response.data);
    setLoader(false);
    setPage(2);
  };

  const paginate = async () => {
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
    setListLoader(true);
    const { search, year, genre } = filters;
    const response = await request_get(
      `vod_datas/${sid}/${page}?search=${search}&year=${year}&genre=${genre.value}&type=${type.id}`,
    );
    if (!response.success) {
      return navigation.navigate('profile', { auth: false });
    }
    setFilms([...films, ...response.data]);
    setPage(page + 1);
    setListLoader(false);
  };

  return showContent ?
    (
      <View style={globalStyles.container}>
        {loader ? <Loader /> : null}
        <>
          <ButtonsNavigation
            data={vodTypes}
            type={type}
            setType={setType}
            setFilterCheck={setFilterCheck}
            setLoader={setLoader}
            setDataEmpty={setFilms}
          />
          {films.length > 0 ? (
            <ScrollView
              onScroll={({ nativeEvent }) => {
                if (isCloseToBottom(nativeEvent)) {
                  paginate();
                }
              }}>
              <Banners banners={banners} navigate={navigation.navigate} />
              <FlatList
                numColumns={3}
                data={films}
                renderItem={renderFilmCard}
                keyExtractor={(item) => item.id.toString()}
              />
              {listLoader ? (
                <View style={{ height: percentHeight(10) }}>
                  <Loader />
                </View>
              ) : null}
            </ScrollView>
          ) : !loader ? (
            <View
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text
                style={{ color: colors.header_icons_color, fontSize: fSize(20) }}>
                По вашему запросу ничего не найдено!
            </Text>
            </View>
          ) : null}
        </>

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
                      setFilterCheck(false);
                    }}>
                    <Icon
                      name="close-outline"
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
                <View style={styles.filterContainer}>
                  <Text
                    style={{
                      ...styles.filterActive,
                      color: colors.secondary,
                      position: 'absolute',
                      left: percentWidth(5),
                      bottom: 5,
                      elevation: 3,
                    }}>
                    Жанр
                </Text>
                  <DropDownPicker
                    items={items(genres, 'name')}
                    onChangeItem={(item) => {
                      setFilters({
                        ...filters,
                        genre: { value: item.value, label: item.label },
                      });
                    }}
                    containerStyle={{
                      height: percentHeight(5),
                      width: percentWidth(100),
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                      width: percentWidth(26),
                    }}
                    arrowColor={colors.secondary}
                    placeholderStyle={{
                      color: colors.secondary,
                      fontSize: fSize(20),
                    }}
                    selectedLabelStyle={{
                      fontSize: 0
                    }}
                    dropDownMaxHeight={percentHeight(22)}
                    isVisible={false}
                    defaultValue={null}
                    placeholder={null}
                  />
                  <Text
                    style={{
                      ...styles.filterActive,
                      position: 'absolute',
                      left: percentWidth(26),
                    }}>
                    {filters.genre.label}
                  </Text>
                </View>

                <View style={styles.filterContainer}>
                  <Text
                    style={{
                      ...styles.filterActive,
                      color: colors.secondary,
                      position: 'absolute',
                      left: percentWidth(5),
                      bottom: 5,
                      elevation: 3,
                    }}>
                    Год
                </Text>
                  <DropDownPicker
                    items={items(years, 'year')}
                    onChangeItem={(item) =>
                      setFilters({ ...filters, year: item.label })
                    }
                    containerStyle={{
                      height: percentHeight(5),
                      width: percentWidth(100),
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                      width: percentWidth(22),
                    }}
                    arrowColor={colors.secondary}
                    placeholderStyle={{
                      color: colors.secondary,
                      fontSize: fSize(20),
                    }}
                    dropDownMaxHeight={percentHeight(16)}
                    placeholder={''}
                  />
                  <Text
                    style={{
                      ...styles.filterActive,
                      position: 'absolute',
                      left: percentWidth(22),
                    }}>
                    {filters.year}
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
export default MoviesScreen;
const styles = StyleSheet.create({
  active: {
    backgroundColor: colors.dark_red,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  filterActive: {
    color: colors.active_filter,
    fontSize: fSize(18),
  },
});
