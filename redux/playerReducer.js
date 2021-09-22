import { SET_MUSIC_PLAYS, SET_RADIO_PLAYS } from './constants';

const initialState = {
    musicIsPlaying: false,
    radioIsPlaying: false,
};

const playerReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_MUSIC_PLAYS:
            return {
                musicIsPlaying: action.payload,
                radioIsPlaying: false
            };
        case SET_RADIO_PLAYS:
            return {
                musicIsPlaying: false,
                radioIsPlaying: action.payload
            };
        default:
            return state;
    }
};

export default playerReducer;
