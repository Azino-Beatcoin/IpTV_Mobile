import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../templates/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import MoviesStack from './MoviesStack';
import TvStack from './TvStack';
import ProfileStack from './ProfileStack';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState, setNavigationVisibility, setSid } from '../redux/actions';
import HomeStack from './HomeStack';
import sidValidation from '../services/sidChecker';
import AsyncStorage from '@react-native-community/async-storage';
import LoginForm from '../components/LoginForm';
import MusicScreen from '../screens/MusicScreen';
import RadioScreen from '../screens/RadioScreen';
import Loader from '../components/Loader';
import { View, StatusBar } from 'react-native';
import RadioStack from './RadioStack';
import MusicStack from './MusicStack';
import { chechToken, haveSid } from '../components/helper'

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const navigationState = useSelector(
    (state) => state.navigationReducer.navigationVisibility,
  );

  const isAuthorizated = useSelector((state) => state.authReducer.isAuth);
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    dispatch(setNavigationVisibility(true));
  }, []);

  useEffect(() => {
    const ff = async () => {
      setLoader(true);
      let result = await chechToken()
      if (result) {
        let sid = await AsyncStorage.getItem('sid')
        dispatch(setAuthState(true))
        dispatch(setSid(sid))
      } else {
        dispatch(setAuthState(false))
        dispatch(setSid(''))
        await AsyncStorage.removeItem('sid')
      }
      setLoader(false)
    }
    ff()
  }, []);

  if (loader) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.primary
        }}>
        <Loader />
      </View>
    );
  }

  if (!isAuthorizated) {
    return <LoginForm />;
  }
  return (
    <NavigationContainer>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Главная') {
              iconName = 'home-outline';
            } else if (route.name === 'Фильмы') {
              iconName = 'videocam-outline';
            } else if (route.name === 'ТВ') {
              iconName = 'tv';
            } else if (route.name === 'Профиль') {
              iconName = 'person-circle-outline';
            } else if (route.name === 'Контакты') {
              iconName = 'call-outline';
            } else if (route.name === 'Радио') {
              iconName = 'radio';
            } else if (route.name === 'Музыка') {
              iconName = 'musical-notes-outline';
            }
            // You can return  component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarVisible: navigationState,
        })}
        tabBarOptions={{
          activeTintColor: colors.dark_red,
          inactiveTintColor: colors.icons,
          style: {
            backgroundColor: colors.nav_bottom_color,
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
            shadowColor: '#5bc4ff',
            shadowOpacity: 0,
            shadowOffset: {
              height: 0,
            },
            shadowRadius: 0,
          },
        }}>
        <Tab.Screen name="Главная" component={HomeStack} />
        <Tab.Screen name="Фильмы" component={MoviesStack} />
        <Tab.Screen name="ТВ" component={TvStack} />
        <Tab.Screen name="Музыка" component={MusicStack} />
        <Tab.Screen name="Радио" component={RadioStack} />
        <Tab.Screen name="Профиль" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
export default MainTabs;
