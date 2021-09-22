import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../templates/colors';
import MainScreen from '../screens/MainScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VPlayerScreen from '../screens/VPlayerScreen';
import PlayerScreen from '../screens/PlayerScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import NewFilmsScreen from '../screens/NewFilmsScreen';
import PopularFilmsScreen from '../screens/PopularFilmsScreen';
import HistoryTrackingScreen from '../screens/HistoryTrackingScreen';
import RadioScreen from '../screens/RadioScreen';
import MoviesScreen from '../screens/MoviesScreen';
import ChannelsScreen from '../screens/ChannelsScreen';
import TvStack from './TvStack';
import GroupChannelsScreen from '../screens/GroupChannelsScreen';
import MusicAlbums from '../screens/MusicAlbums';
import MusicPlayer from '../screens/MusicPlayer';
import { haveSid } from '../components/helper';
import SubscribesScreen from '../screens/SubscribesScreen';
import ProductsScreen from '../screens/ProductsScreen';
import Replenish from '../components/Replenish';
const Stack = createStackNavigator();

const HomeStack = ({ navigation }) => {

  // useEffect(() => {
  //   const check = async () => {
  //     try {
  //       const hsid = await haveSid()
  //       if (!hsid) {
  //         navigation.navigate('subscribes')
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  //   check()
  // }, [])

  return (
    <Stack.Navigator
      initialRouteName="Главная"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.secondary,
      }}>
      <Stack.Screen name="Главная" component={MainScreen} />
      <Stack.Screen name="movies" component={MoviesScreen} />
      <Stack.Screen name="tv" component={GroupChannelsScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="vplayer" component={VPlayerScreen} />
      <Stack.Screen name="player" component={PlayerScreen} />
      <Stack.Screen name="favorite" component={FavoriteScreen} />
      <Stack.Screen name="newFilms" component={NewFilmsScreen} />
      <Stack.Screen name="popularFilms" component={PopularFilmsScreen} />
      <Stack.Screen name="historyTracking" component={HistoryTrackingScreen} />
      <Stack.Screen name="radio" component={RadioScreen} />
      <Stack.Screen name="albums" component={MusicAlbums} />
      <Stack.Screen name="mplayer" component={MusicPlayer} />
      <Stack.Screen name='subscribes' component={SubscribesScreen} />
      <Stack.Screen name='products' component={ProductsScreen} />
      <Stack.Screen name='replenish' component={Replenish} />
    </Stack.Navigator>
  );
};
export default HomeStack;
