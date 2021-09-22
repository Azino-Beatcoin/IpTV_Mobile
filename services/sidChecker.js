import {request_post} from '../api/request';

const sidValidation = async (sid) => {
  try {
    const fd = new FormData();
    fd.append('sid', sid);
    const res = await request_post('sid/check', fd);
    if (res.success) {
      return {success: true, sid};
    }
    return {success: false};
  } catch (error) {
    console.log('sidCHeckError:', error);
    return {success: false};
  }
};

export default sidValidation;
