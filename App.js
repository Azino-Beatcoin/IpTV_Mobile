/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';

import MainNavigation from './navigations/main';
import SplashScreen from 'react-native-splash-screen';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import reducers from './redux/reducers';
import {StatusBar} from 'react-native';
import thunk from 'redux-thunk';

const store = createStore(reducers, applyMiddleware(thunk));

const App: () => React$Node = () => {
  useEffect(() => {
    SplashScreen.hide();
  });

  return (
    <Provider store={store}>
      <StatusBar translucent={true} />
      <MainNavigation />
    </Provider>
  );
};

export default App;
