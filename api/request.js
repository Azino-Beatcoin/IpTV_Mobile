import axios from 'axios';
export const BASE_API_URL = 'http://api.somon.tv/';

export const request_get = async (url) => {
  try {
    const response = await axios.get(BASE_API_URL + url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const request_post = async (url, data = {}, config = {}) => {
  try {
    const response = await axios.post(BASE_API_URL + url, data, config);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    return error
  }
};

export const request_delete = async (url, data = {}, config = {}) => {
  try {
    const response = await axios.delete(BASE_API_URL + url, data, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
