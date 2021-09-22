import {combineReducers} from 'redux';
import authReducer from './authReducer';
import navigationReducer from './navigationReducer';
import historyReducer from './historyReducer';
import favoritesReducer from './favoritesReducer';
import playerReducer from './playerReducer';

export default combineReducers({
  authReducer,
  navigationReducer,
  historyReducer,
  favoritesReducer,
  playerReducer
});
