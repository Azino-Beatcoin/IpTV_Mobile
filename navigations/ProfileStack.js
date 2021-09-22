import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../templates/colors';
import ProfileScreen from '../screens/ProfileScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import PlayerScreen from '../screens/PlayerScreen';
import VPlayerScreen from '../screens/VPlayerScreen';
import ContactScreen from '../screens/ContactScreen';
import HistoryTrackingScreen from '../screens/HistoryTrackingScreen';
import MusicPlayer from '../screens/MusicPlayer';
import MusicPlayerFavorites from '../screens/MusicPlayerFavorites';
import SubscribesScreen from '../screens/SubscribesScreen';
import ProductsScreen from '../screens/ProductsScreen';
import Replenish from '../components/Replenish';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="profile"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.secondary,
      }}>
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="favorite" component={FavoriteScreen} />
      <Stack.Screen name="historyTracking" component={HistoryTrackingScreen} />
      <Stack.Screen name="player" component={PlayerScreen} />
      <Stack.Screen name="vplayer" component={VPlayerScreen} />
      <Stack.Screen name="contacts" component={ContactScreen} />
      <Stack.Screen name="mplayer" component={MusicPlayerFavorites} />
      <Stack.Screen name='subscribes' component={SubscribesScreen} />
      <Stack.Screen name='products' component={ProductsScreen} />
      <Stack.Screen name='replenish' component={Replenish} />
    </Stack.Navigator>
  );
};
export default ProfileStack;
