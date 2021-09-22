import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {colors} from '../templates/colors';
import GroupChannelsScreen from '../screens/GroupChannelsScreen';
import ChannelsScreen from '../screens/ChannelsScreen';
import PlayerScreen from '../screens/PlayerScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const TvStack  = () => {

    return (
        <Stack.Navigator
            initialRouteName="Группа каналов"
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,

                },
                headerTintColor: colors.secondary
            }}
        >
            <Stack.Screen name="group_channels" component={GroupChannelsScreen}/>
            <Stack.Screen name="channels" component={ChannelsScreen}/>
            <Stack.Screen name="player" component={PlayerScreen}/>
            <Stack.Screen name="profile" component={ProfileScreen}/>
        </Stack.Navigator>
    )
}
export default TvStack
