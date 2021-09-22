import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { BASE_API_URL, request_get } from '../api/request';
import { colors } from '../templates/colors';
import Loader from './Loader';
import { fSize, percentHeight, percentWidth } from '../templates/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInput } from 'react-native';
import { Linking } from 'react-native';
import Replenish from './Replenish';
import { useDispatch } from 'react-redux';
import { setAuthState, setSid } from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import Snackbar from 'react-native-snackbar'

const InfoUser = ({ navigate, sid }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    name: null,
    phone: null,
    protected_code: null,
    expire_date: null,
    count_equipment: null,
    balance: 0,
  });
  const [loader, setLoader] = useState(true);
  const [replenish, setReplenish] = useState(false)
  const [amount, setAmount] = useState(0.0)
  const [replenishUrl, setReplenishUrl] = useState('')
  const [refreshUserInfo, setRefreshUserInfo] = useState(false)

  const userExit = async () => {
    dispatch(setAuthState(false));
    dispatch(setSid(''))
    await AsyncStorage.removeItem('sid');
    await AsyncStorage.removeItem('access_token')
  };
  
  useEffect(() => {
    async function getData() {
      try {
        const access_token = await AsyncStorage.getItem('access_token')
        // let sidBodyForm = new FormData()
        // sidBodyForm.append('sid', sid)
        // let sidResponse = await fetch(`${BASE_API_URL}api/sid/check`, {method: 'POST', body: sidBodyForm, headers: {'Accept': 'application/json', 'Content-Type': 'multipart/form-data', 'Authorization': access_token}})
        // if(sidResponse.status == 401) {
        //   await AsyncStorage.removeItem('sid')
        //   await AsyncStorage.removeItem('access_token')
        //   dispatch(setSid(''))
        //   dispatch(setAuthState(false))
        //   return
        // }
        // sidResponse = await sidResponse.json()
        // if(!sidResponse.success) {
        //   dispatch(setSid(''))
        //   navigate('subscribes')
        //   Snackbar.show({
        //     text: 'Активируйте подписку',
        //     duration: Snackbar.LENGTH_LONG,
        //   })
        // }
        // let response = await request_get(`api/get_user_info/${sid}`);
        // if(sid) {response = await request_get(`api/get_user_info/${sid}`);
        // } else {
        //   navigate('subscribes')
        // }
        console.log(`${BASE_API_URL}api/get_user_info/${sid}`);
        console.log(access_token);
        let response = await fetch(`${BASE_API_URL}api/get_user_info/${sid ? sid : ''}`, {headers: {'Authorization': access_token, 'Accept': 'application/json'}})
        let responseJSON = await response.json()
        console.log('user info response =  ', response);
        console.log('user info responseJSON =  ', responseJSON);
        // alert('???')
        if (!responseJSON.success) {
          // dispatch(setAuthState(false));
          setLoader(false)
          return;
        }
        const data = responseJSON.data;
        console.log('myData = ', data);
        if(!sid) {
          setUser({
            name: data.name,
            phone: data.phone,
            balance: data.balance_sum,
          });
        } else {
          setUser({
            name: data.name,
            phone: data.phone,
            protected_code: data.protected_code,
            expire_date: data.expire_date,
            count_equipment: data.count_equipment,
            balance: data.balance_sum,
          });
        }
        setLoader(false);
      } catch (e) {
        console.log(e.getMessage());
      }
    }
    getData();
  }, [refreshUserInfo, sid]);

  const itemView = (iconName, text) => {
    return (
      <View style={styles.item}>
        <Icon name={iconName} color={'#39354D'} size={fSize(25)} />
        <Text
          style={{ color: colors.secondary, marginLeft: 5, fontSize: fSize(16) }}>
          {text}
        </Text>
      </View>
    );
  };

  const itemTouch = (iconName, text, route = '', params = {}) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigate(route, params)}>
        <Icon name={iconName} color={'#39354D'} size={fSize(25)} />
        <Text
          style={{ color: colors.secondary, marginLeft: 5, fontSize: fSize(18) }}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  };

  const getReplenishUrl = async () => {
    try {
      const access_token = await AsyncStorage.getItem('access_token')
      const bodyForm = new FormData()
      bodyForm.append('price', amount)
      const response = await fetch(`${BASE_API_URL}api/pay`, { method: 'POST', body: bodyForm, headers: { 'Authorization': access_token, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } })
      const responseJSON = await response.json()
      if (responseJSON.success) {
        await Linking.openURL(responseJSON.url)
        // Linking.openURL(responseJSON.url)
        //   .then(() => {
        //     navigation.goBack();
        //   })
        setAmount(0.0)
        setReplenish(false)
        setRefreshUserInfo(!refreshUserInfo)
      }
      console.log('payment response = ', responseJSON);
    } catch (error) {
      console.log('get replenish url error = ', error);
    }
  }

  return (
    <View style={styles.container}>
      {/* {
        replenish ?
          (
            <Replenish refreshUserInfo={refreshUserInfo} setRefreshUserInfo={setRefreshUserInfo} setReplenish={setReplenish} />
          ) : null
      } */}
      {loader ? (
        <Loader />
      ) : (
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.userInfo}>
              <View style={{ width: percentWidth(20) }}>
                <View style={styles.profileIcon}>
                  <Icon
                    name={'person-outline'}
                    size={fSize(30)}
                    color={'#4B4563'}
                  />
                </View>
              </View>
              <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={{ ...styles.userName, color: '#3A3752', alignItems: 'center' }}>
                  {user.phone}
                </Text>
                {/* <Text style={{ ...styles.userName, color: '#3A3752', alignItems: 'center' }}>
                  {"Баланс:  " + user.balance}
                </Text> */}
              </View>
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#201C30',
                marginTop: 20,
              }}></View>
            {user.expire_date ? itemView('hourglass-outline', 'Годен до:  ' + user.expire_date) : null}
            {user.count_equipment ? itemView(
              'wifi-outline',
              'Количество устройств:  ' + user.count_equipment,
            ) : null}
            <View style={styles.item}>
              <Icon name={'wallet-outline'} color={'#39354D'} size={fSize(25)} />
              <Text
                style={{ color: colors.secondary, marginLeft: 5, fontSize: fSize(16) }}>
                {`Баланс:  ${user.balance}`}
              </Text>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 0
                }}
                onPress={() => {
                  // setReplenish(true)
                  navigate('replenish')
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.dark_red,
                    fontSize: fSize(18)
                  }}
                >
                  Пополнить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ paddingHorizontal: 15 }}>
            {itemTouch('cash-outline', 'Подписки', 'subscribes')}
            {itemTouch('cart-outline', 'Товары', 'products')}
            {sid ? itemTouch('star-outline', 'Избранные', 'favorite') : null}
            {itemTouch('information-circle-outline', 'О нас', 'contacts')}
            {/* <Button color="red" title={'Выход'} onPress={userExit} /> */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.dark_red,
                width: percentWidth(90),
                height: percentHeight(6),
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={userExit}
            >
              <Text
                style={{
                  color: colors.secondary,
                  fontSize: fSize(20),
                  textAlign: 'center'
                }}
              >
                Выход
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default InfoUser;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  card: {
    marginVertical: 5,
    backgroundColor: '#191623',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  cardContent: {
    paddingVertical: 12.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardTitle: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  userName: {
    color: colors.secondary,
    fontSize: fSize(20),
    textAlign: 'left',
    width: percentWidth(50),
    paddingLeft: percentWidth(4)
  },
  profileIcon: {
    height: percentHeight(9),
    width: percentHeight(9),
    backgroundColor: '#2C2A3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  item: {
    height: percentHeight(7),
    flexDirection: 'row',
    alignItems: 'center',
  },
});
