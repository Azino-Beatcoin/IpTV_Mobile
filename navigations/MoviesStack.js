import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {colors} from '../templates/colors';
import MoviesScreen from '../screens/MoviesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VPlayerScreen from '../screens/VPlayerScreen';
const Stack = createStackNavigator();

const MoviesStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="movies"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.secondary,
      }}>
      <Stack.Screen name="movies" component={MoviesScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="vplayer" component={VPlayerScreen} />
    </Stack.Navigator>
  );
};
export default MoviesStack;
