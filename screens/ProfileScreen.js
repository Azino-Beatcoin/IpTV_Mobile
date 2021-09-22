import React, {useEffect, useState} from 'react';
import {globalStyles} from '../templates/globalStyles';
import {View} from 'react-native';
import InfoUser from '../components/InfoUser';
import {request_post} from '../api/request';
import Loader from '../components/Loader';
import {useSelector} from 'react-redux';
import sidChecker from '../services/sidChecker';
import { haveSid } from '../components/helper';

const ProfileScreen = ({navigation, route}) => {
  const [auth, setAuth] = useState(false);
  const [loader, setLoader] = useState(true);
  const sid = useSelector((state) => state.authReducer.sid);
  useEffect(() => {
    navigation.setOptions({
      title: 'Профиль',
    });
  }, []);

  // const check = async () => {
  //   let hsid = await haveSid()
  //   // alert(sid)
  //   if (!hsid) {
  //     navigation.navigate('subscribes');
  //   }
  // }
  // check()
  // // useEffect(() => {
  // //   // alert('this screen mounted')
  // // }, [])

  return (
    <View style={globalStyles.container}>
      {loader ? <Loader /> : null}
      <InfoUser sid={sid} navigate={navigation.navigate} />
    </View>
  );
};

export default ProfileScreen;
