import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {colors} from '../templates/colors';
import ContactScreen from '../screens/ContactScreen';

const Stack = createStackNavigator();

const ContactStack  = () => {

    return (
        <Stack.Navigator
            initialRouteName="Контакты"
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,

                },
                headerTintColor: colors.secondary
            }}
        >
            <Stack.Screen name="contacts" component={ContactScreen}/>
        </Stack.Navigator>
    )
}
export default ContactStack
