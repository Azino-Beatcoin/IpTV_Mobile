import {SET_AUTH_STATE, SET_SID} from './constants';

const initialState = {
  isAuth: false,
  sid: '',
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_AUTH_STATE:
      return {
        ...state,
        isAuth: action.payload,
      };
    case SET_SID:
      return {
        ...state,
        sid: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
