import React, {useEffect, useState} from 'react';
import {colors} from '../templates/colors';
import Favorite from '../components/Profile/Favorite';
import {View, Button, TouchableOpacity} from 'react-native';
import ButtonsNavigation from '../components/General/ButtonsNavigation';
import Icon from 'react-native-vector-icons/Ionicons';
import FavoritesMusicScreen from './FavoritesMusicScreen';
const FavoriteScreen = ({navigation}) => {
  const vodTypes = [
    {id: 'all', name: 'общие'},
    {id: 'films', name: 'Фильмы'},
    {id: 'channels', name: 'Телеканалы'},
    {id: 'musics', name: 'Музыка'},
  ];
  const [type, setType] = useState({
    title: 'Общие',
    id: 'all',
  });
  const [loader, setLoader] = useState(true);
  const [searchCheck, setSearchCheck] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: null,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            style={{paddingLeft: 10}}
            name="arrow-back-outline"
            size={26}
            color="white"
          />
        </TouchableOpacity>
      ),
    });
  });

  return (
    <View style={{backgroundColor: colors.primary, flex: 1}}>
      <ButtonsNavigation
        data={vodTypes}
        type={type}
        setType={setType}
        setFilterCheck={setSearchCheck}
        setLoader={setLoader}
      />
      {type.id !== 'musics' ? (
        <Favorite
          route={`favorites/${type.id}`}
          navigation={navigation}
          setSearchCheck={setSearchCheck}
          searchCheck={searchCheck}
          setLoader={setLoader}
          loader={loader}
        />
      ) : (
        <FavoritesMusicScreen
          navigation={navigation}
          setSearchCheck={setSearchCheck}
          searchCheck={searchCheck}
          setLoader={setLoader}
          loader={loader}
        />
      )}
    </View>
  );
};
export default FavoriteScreen;
