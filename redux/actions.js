import {request_get} from '../api/request';
import {
  SET_AUTH_STATE,
  SET_HISTORY,
  SET_NAVIGATION_VISIBILITY,
  SET_SID,
  SET_FAVORITES_MUSIC,
  SELECT_MUSIC,
  SET_LOADER,
  SET_SEACTH_TEXT,
  SET_RADIO_PLAYS,
  SET_MUSIC_PLAYS,
} from './constants';

export const setRadioPlayer = (state) => ({
  type: SET_RADIO_PLAYS,
  payload: state
})

export const setMusicPlayer = (state) => ({
  type: SET_MUSIC_PLAYS,
  payload: state
})

export const setAuthState = (state) => ({
  type: SET_AUTH_STATE,
  payload: state,
});

export const setSid = (sid) => ({
  type: SET_SID,
  payload: sid,
});

export const setNavigationVisibility = (val) => ({
  type: SET_NAVIGATION_VISIBILITY,
  payload: val,
});

export const setHistory = (history) => ({
  type: SET_HISTORY,
  payload: history,
});

export const selectMusic = (music) => ({
  type: SELECT_MUSIC,
  payload: music,
});

export const setLoader = (loading) => ({
  type: SET_LOADER,
  payload: loading,
});

export const setSearchText = (text) => ({
  type: SET_SEACTH_TEXT,
  payload: text,
});

export const setFavoritesMusic = (musics) => ({
  type: SET_FAVORITES_MUSIC,
  payload: musics,
});

export const getHistory = (sid) => {
  return (dispatch) => {
    request_get(`vod_data_history/${sid}`).then(({data}) => {
      const newData =  Object.keys(data).map(keyItem => data[keyItem])
      console.log("H:", newData)

      dispatch(setHistory(newData));
    });
  };
};

export const getFavoritesMusic = (sid, searchText = '') => {
  return (dispatch) => {
    dispatch(setLoader(true));
    request_get(`musics_favorite/${sid}`)
      .then(({data, success}) => {
        if (success) {
          const vodfiles = data
            .map((music) => ({
              id: music.id,
              music: music.music_vodfiles,
              poster: music.poster,
              genr: music.genr,
            }))
            .filter((item) => item.music.file_torrent.includes(searchText));
          dispatch(setFavoritesMusic(vodfiles));
        } else {
          dispatch(setFavoritesMusic([]));
        }
      })
      .finally(() => dispatch(setLoader(false)));
  };
};
