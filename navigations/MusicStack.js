import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {colors} from '../templates/colors';
import MusicScreen from '../screens/MusicScreen';
import MusicAlbums from '../screens/MusicAlbums';
import MusicPlayer from '../screens/MusicPlayer';
const Stack = createStackNavigator();

const MusicStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Музыка"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.secondary,
      }}>
      <Stack.Screen name="Музыка" component={MusicScreen} />
      <Stack.Screen name="albums" component={MusicAlbums} />
      <Stack.Screen name="mplayer" component={MusicPlayer} />
    </Stack.Navigator>
  );
};
export default MusicStack;
