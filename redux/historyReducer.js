import {SET_HISTORY} from './constants';

const initialState = {
  historyView: [],
};

const historyReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_HISTORY:
      return {
        ...state,
        historyView: action.payload,
      };
    default:
      return state;
  }
};

export default historyReducer;
