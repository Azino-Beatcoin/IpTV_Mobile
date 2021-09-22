import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {request_get} from '../api/request';
import {colors} from '../templates/colors';
import {fSize, percentHeight, percentWidth} from '../templates/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../components/Loader';
import {IPTV_ADMIN_URL} from '../api/url';
import {getFavoritesMusic, setSearchText} from '../redux/actions';

const FavoritesMusicScreen = ({
  route,
  navigation,
  loader,
  setLoader,
  setSearchCheck,
  searchCheck,
}) => {
  const {musics, searchText} = useSelector((state) => state.favoritesReducer);

  const [searchShow, setSearchShow] = useState(false);
  const {sid} = useSelector((state) => state.authReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{marginRight: 10}}
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
          <Text style={{color: colors.secondary, fontSize: fSize(20)}}>
            Избранные
          </Text>
        ),
    });

    if (!searchShow) {
      dispatch(getFavoritesMusic(sid, searchText));
      setLoader(false);
    }
  }, [searchShow, searchText, route]);

  // const getData = async () => {
  //   setLoader(true);
  //   const response = await request_get(`musics_favorite/${sid}`);
  //   const vodfiles = response.data
  //     .map((music) => ({
  //       id: music.id,
  //       music: music.music_vodfiles,
  //       poster: music.poster,
  //       genr: music.genr,
  //     }))
  //     .filter((item) => item.music.file_torrent.includes(searchText));
  //   setMusics(vodfiles);

  //   if (!response.success) {
  //     return navigation.navigate('profile');
  //   }
  //   setLoader(false);
  // };

  const Search = () => {
    setSearchShow(false);
    // dispatch(setSearchText(''));
  };

  const searchInput = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => setSearchShow(false)}></TouchableOpacity>

        <TextInput
          placeholder={'Поиск'}
          placeholderTextColor={colors.header_icons_color}
          autoFocus={true}
          onChangeText={(text) => dispatch(setSearchText(text))}
          value={searchText}
          style={{color: colors.header_icons_color}}
        />
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.primary}}>
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
            <Text style={{color: '#403C57'}}>Недавние</Text>
          </View>

          <View style={{paddingHorizontal: 15}}>
            <ScrollView style={{marginTop: 10}}>
              <FlatList
                data={musics}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
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
                          musics: musics,
                          selected: item.music.id,
                          poster: item.poster,
                          album: {
                            music_data_genres: [
                              {
                                name: item.genr,
                              },
                            ],
                            music_vodfiles: [item],
                          },
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
                        }}
                      />
                      <Text
                        style={{
                          color: colors.secondary,
                          fontSize: fSize(14),
                          marginLeft: 10,
                        }}>
                        {item.music.file_torrent}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </ScrollView>
          </View>
        </>
      ) : null}
    </View>
  );
};
export default FavoritesMusicScreen;

const styles = StyleSheet.create({
  imageContainer: {
    width: percentWidth(17),
    maxHeight: percentHeight(13),
    minHeight: percentHeight(9),
    backgroundColor: '#2C2A3C',
    justifyContent: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
});
