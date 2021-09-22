import {SET_FAVORITES_MUSIC, SET_LOADER, SET_SEACTH_TEXT} from './constants';

const initialState = {
  musics: [],
  selectedMusic: null,
  loading: false,
  searchText: '',
};

const favoritesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FAVORITES_MUSIC:
      return {
        ...state,
        musics: action.payload,
      };
    case SET_LOADER:
      return {
        ...state,
        loading: action.payload,
      };
    case SET_SEACTH_TEXT:
      return {
        ...state,
        searchText: action.payload,
      };
    default:
      return state;
  }
};

export default favoritesReducer;
