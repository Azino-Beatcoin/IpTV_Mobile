import { SET_NAVIGATION_VISIBILITY } from "./constants";

const initialState = {
  navigationVisibility: false,
};

const navigationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NAVIGATION_VISIBILITY:
      return {
        ...state,
        navigationVisibility: action.payload,
      };
    default:
      return state;
  }
};

export default navigationReducer;
