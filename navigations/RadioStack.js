import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import RadioScreen from '../screens/RadioScreen';

const Stack = createStackNavigator();

const RadioStack = (props) => {
  return (
    <Stack.Navigator initialRouteName="radio-list">
      <Stack.Screen name="radio-list" component={RadioScreen} />
    </Stack.Navigator>
  );
};

export default RadioStack;
