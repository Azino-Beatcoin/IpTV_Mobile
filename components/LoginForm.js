import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import { colors } from '../templates/colors';
import Notify from './Notify';
import { BASE_API_URL, request_post } from '../api/request';
import Loader from './Loader';
import { useDispatch } from 'react-redux';
import * as actions from '../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import { fSize, percentWidth, percentHeight } from '../templates/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import { color } from 'react-native-reanimated';
import Snackbar from 'react-native-snackbar'
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native';
import { FlatList } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { ScrollView } from 'react-native';
import InternationalInput from './InternationalInput';

const LoginForm = ({ auth }) => {
  const dispatch = useDispatch();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);

  const [register, setRegister] = useState(false)
  const [gotOTP, setGotOTP] = useState(false)

  const [registerName, setRegisterName] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [OTP, setOTP] = useState('')
  const [prefix, setPrefix] = useState('+992')

  const [resetPassword, setResetPassword] = useState(false)
  const [gotResetCode, setGotResetCode] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState(false)

  const [resetPhone, setResetPhone] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newResetPassword, setNewResetPassword] = useState('')
  const [newResetConfirmPassword, setNewResetConfirmPassword] = useState('')
  const [resetConfirmKey, setResetConfirmKey] = useState('')

  const login_btn = async () => {
    if (login.length === 0) {
      Notify('Ошибка!', 'Логин не может быть пустым');
      return;
    }
    if (password.length === 0) {
      Notify('Ошибка!', 'Пароль не может быть пустым');
      return;
    }
    console.log(prefix + '' + login);
    setLoader(true);
    const data = new FormData();
    data.append('phone', prefix + '' + login);
    data.append('password', password);
    // data.append('device', 'Android');
    const response = await request_post('api/login', data);
    setLoader(false);
    if (!response.success) {
      Notify('Ошибка!', 'Неверный логин или пароль');
      dispatch(actions.setAuthState(false));
      return;
    }
    console.log('responseeee', response);
    // await AsyncStorage.setItem('sid', response.sid);
    await AsyncStorage.setItem('access_token', 'Bearer ' + response?.data?.access_token)
    // dispatch(actions.setSid(response.sid));
    dispatch(actions.setAuthState(true));
    DeviceEventEmitter.emit('goBack', {});
  };

  const clearRegistrationFields = () => {
    setRegisterName('')
    setRegisterPhone('')
    setRegisterPassword('')
    setRegisterConfirmPassword('')
  }

  const get_OTP = async () => {
    if (!registerName) {
      Notify('Ошибка!', 'Имя не может быть пустым');
      return;
    } else if (!registerPhone) {
      Notify('Ошибка!', 'Номер телефона не может быть пустым');
      return
    } else if (!registerPassword) {
      Notify('Ошибка!', 'Пароль не может быть пустым');
      return;
    } else if (!registerConfirmPassword) {
      Notify('Ошибка!', 'Подтверждение пароля не может быть пустым');
      return;
    } else if (registerPassword.length < 8) {
      Notify('Ошибка!', 'Пароль должен состоять из не менее 8 символов');
      return;
    } else if (registerPassword !== registerConfirmPassword) {
      Notify('Ошибка!', 'Пароли не совпадают');
      return;
    }
    try {
      const bodyForm = new FormData()
      bodyForm.append('phone', prefix + '' + registerPhone)
      console.log(bodyForm);
      setLoader(true)
      const response = await request_post('api/register', bodyForm)
      // const response = await fetch('https://api.somon.tv/api/register', {body: bodyForm, method: 'POST'})
      setLoader(false)
      if (response == 'Error: Request failed with status code 422') {
        Notify('Ошибка!', 'Пользователь с таким номером уже существует');
        return;
      }
      setGotOTP(true)

    } catch (error) {
      console.log(error);
      Notify('Ошибка!', 'Что-то пошло не так, попробуйте снова');
    }
  }

  const verifyRegistration = async () => {
    if (OTP.length != 4) {
      Notify('Ошибка!', 'Код должен состоять из 4 символов');
      return;
    }
    clearRegistrationFields()
    try {
      const bodyForm = new FormData()
      bodyForm.append('code', OTP)
      bodyForm.append('name', registerName)
      bodyForm.append('phone', prefix + '' + registerPhone)
      bodyForm.append('password', registerPassword)
      bodyForm.append('password_confirmation', registerConfirmPassword)
      console.log(bodyForm);
      setLoader(true)
      const response = await request_post('api/auth-verify', bodyForm)
      // const response = await fetch('https://api.somon.tv/api/auth-verify', {body: bodyForm, method: 'POST'})
      setLoader(false)
      if (response == 'Error: Request failed with status code 500') {
        Notify('Ошибка!', 'Неверный код');
        return;
      }

      if (response.success) {
        await AsyncStorage.setItem('access_token', 'Bearer ' + response?.data?.access_token)
        dispatch(actions.setAuthState(true));
        DeviceEventEmitter.emit('goBack', {});
        return
      }

      Notify('Упс...', 'Что-то пошло не так');
      console.log('otp request response = ', response);
    } catch (error) {
      console.log(error);
      Notify('Ошибка!', 'Что-то пошло не так, попробуйте снова');
    }
  }

  const getResetCode = async () => {
    try {
      if (resetPhone.length < 9) {
        Snackbar.show({
          text: 'Номер телефона должен состоять из 9 цифр',
          backgroundColor: '#F44336',
          duration: Snackbar.LENGTH_LONG
        })
        return
      }
      const bodyForm = new FormData()
      bodyForm.append('phone', prefix + '' + resetPhone)
      console.log(resetPhone);
      const response = await fetch(`${BASE_API_URL}api/reset_password`, { method: 'POST', body: bodyForm, headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } })
      const responseJSON = await response.json()
      if (!responseJSON.success && response.status == 203) {
        Snackbar.show({
          text: responseJSON.message,
          backgroundColor: '#F44336',
          duration: Snackbar.LENGTH_LONG
        })
        return
      }
      console.log(responseJSON);
      if (responseJSON.success) {
        Snackbar.show({
          text: responseJSON.message,
          backgroundColor: '#4CAF50',
          duration: Snackbar.LENGTH_LONG
        })
        setGotResetCode(true)
        return
      }
      Snackbar.show({
        text: responseJSON['0']?.phone[0],
        backgroundColor: '#F44336',
        duration: Snackbar.LENGTH_LONG
      })
    } catch (error) {
      console.log('get reset code error == ', error);
    }
  }

  const verifyResetCode = async () => {
    try {
      if (resetCode.length < 4) {
        Snackbar.show({
          text: 'Код должен состоять из 4 цифр',
          backgroundColor: '#F44336',
          duration: Snackbar.LENGTH_LONG
        })
        return
      }
      const bodyForm = new FormData()
      bodyForm.append('phone', prefix + '' + resetPhone)
      bodyForm.append('code', resetCode)
      const response = await fetch(`${BASE_API_URL}api/change_password/code_verification`, { method: 'POST', body: bodyForm, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' } })
      const responseJSON = await response.json()
      console.log(resetPhone);
      console.log(resetCode);
      console.log(responseJSON);
      if (response.ok && responseJSON.success) {
        Snackbar.show({
          text: responseJSON.message,
          backgroundColor: '#4CAF50',
          duration: Snackbar.LENGTH_LONG
        })
        setResetConfirmKey(responseJSON?.key)
        setConfirmPassword(true)
        return
      }
      Snackbar.show({
        text: responseJSON[0]?.phone[0] || responseJSON?.message,
        backgroundColor: '#F44336',
        duration: Snackbar.LENGTH_LONG
      })
    } catch (error) {
      console.log('reset code verification error', error);
    }
  }

  const setNewPassword = async () => {
    try {
      if (newResetPassword.length < 8) {
        Snackbar.show({
          text: 'Пароль должен состоять минимум из 8 символов',
          backgroundColor: '#F44336',
          duration: Snackbar.LENGTH_LONG
        })
        return
      }
      if (newResetPassword != newResetConfirmPassword) {
        Snackbar.show({
          text: 'Введённые пароли не совпадают',
          backgroundColor: '#F44336',
          duration: Snackbar.LENGTH_LONG
        })
        return
      }
      const bodyForm = new FormData();
      bodyForm.append('phone', prefix + '' + resetPhone)
      bodyForm.append('key', resetConfirmKey)
      bodyForm.append('password', newResetPassword)
      bodyForm.append('password_confirmation', newResetConfirmPassword)
      const response = await fetch(`${BASE_API_URL}api/change_password`, { method: 'POST', body: bodyForm, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' } })
      const responseJSON = await response.json()
      if (response.ok && responseJSON.success) {
        Snackbar.show({
          text: 'Вы успешно сменили пароль!',
          backgroundColor: '#4CAF50',
          duration: Snackbar.LENGTH_LONG
        })
        await AsyncStorage.setItem('access_token', 'Bearer ' + responseJSON.data.access_token)
        dispatch(actions.setAuthState(true))
        return
      }
      Snackbar.show({
        text: 'Упс! Что-то пошло не так...',
        backgroundColor: '#F44336',
        duration: Snackbar.LENGTH_LONG
      })
    } catch (error) {
      console.log('set new password error', error);
    }
  }

  return (
    <View style={!register ? styles.container : styles.container2}>
      {loader ? <Loader /> : null}
      <View style={{ height: percentHeight(20), alignItems: 'center' }}>
        <Image style={styles.image} source={require('../img/logo.png')} />
      </View>

      {
        !register ?
          resetPassword ?
            gotResetCode ?
              confirmPassword ?
                (
                  <View style={{ height: percentHeight(50), alignItems: 'center' }}>
                    <Text
                      style={{
                        color: colors.secondary,
                        textAlign: 'center',
                        fontSize: fSize(25),
                        // backgroundColor: 'red',
                        position: 'relative',
                        top: -15
                      }}
                    >
                      Сброс пароля
                  </Text>
                    <TextInput
                      value={newResetPassword}
                      onChangeText={(text) => {
                        setNewResetPassword(text);
                      }}
                      placeholder={'Новый пароль'}
                      style={styles.input}
                      placeholderTextColor={colors.secondary}
                      keyboardType='default'
                    />
                    <TextInput
                      value={newResetConfirmPassword}
                      onChangeText={(text) => {
                        setNewResetConfirmPassword(text);
                      }}
                      placeholder={'Повторите пароль'}
                      style={styles.input}
                      placeholderTextColor={colors.secondary}
                      keyboardType='default'
                    />
                    <View style={styles.button_container}>
                      <TouchableOpacity
                        activeOpacity={0.95}
                        style={styles.button}
                        onPress={setNewPassword}
                      >
                        <Text style={styles.text}>Сменить пароль</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={{
                        // backgroundColor: colors.blue,
                        width: percentWidth(40),
                        height: percentHeight(4),
                        justifyContent: 'center',
                        marginTop: percentHeight(2)
                      }}
                      onPress={() => {
                        setResetPassword(false)
                        setGotResetCode(false)
                        setConfirmPassword(false)
                        setResetPhone(false)
                        setResetCode(false)
                        setNewResetPassword(false)
                        setNewResetConfirmPassword(false)
                        setResetConfirmKey(false)
                      }}
                    >
                      <Text
                        style={{
                          color: colors.dark_text,
                          fonsSize: fSize(15),
                          textAlign: 'center',
                          textDecorationColor: colors.dark_text,
                          textDecorationLine: 'underline',
                        }}
                      >
                        Я вспомнил пароль!
                    </Text>
                    </TouchableOpacity>
                  </View>
                )
                :
                (
                  <View style={{ height: percentHeight(50), alignItems: 'center' }}>
                    <Text
                      style={{
                        color: colors.secondary,
                        textAlign: 'center',
                        fontSize: fSize(25),
                        // backgroundColor: 'red',
                        position: 'relative',
                        top: -15
                      }}
                    >
                      Сброс пароля
                  </Text>
                    <TextInput
                      value={resetCode}
                      onChangeText={(text) => {
                        if (text.length < 5) {
                          setResetCode(text);
                        }
                      }}
                      placeholder={'Введите код'}
                      style={styles.input}
                      placeholderTextColor={colors.secondary}
                      keyboardType="numeric"
                    />
                    <View style={styles.button_container}>
                      <TouchableOpacity
                        activeOpacity={0.95}
                        style={styles.button}
                        onPress={verifyResetCode}
                      >
                        <Text style={styles.text}>Подтвердить код</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={{
                        // backgroundColor: colors.blue,
                        width: percentWidth(40),
                        height: percentHeight(4),
                        justifyContent: 'center',
                        marginTop: percentHeight(2)
                      }}
                      onPress={() => {
                        setResetPassword(false)
                        setGotResetCode(false)
                        setConfirmPassword(false)
                        setResetPhone(false)
                        setResetCode(false)
                        setNewResetPassword(false)
                        setNewResetConfirmPassword(false)
                        setResetConfirmKey(false)
                      }}
                    >
                      <Text
                        style={{
                          color: colors.dark_text,
                          fonsSize: fSize(15),
                          textAlign: 'center',
                          textDecorationColor: colors.dark_text,
                          textDecorationLine: 'underline',
                        }}
                      >
                        Я вспомнил пароль!
                    </Text>
                    </TouchableOpacity>
                  </View>
                )
              :
              (
                <View style={{ height: percentHeight(50), alignItems: 'center' }}>
                  <Text
                    style={{
                      color: colors.secondary,
                      textAlign: 'center',
                      fontSize: fSize(25),
                      // backgroundColor: 'red',
                      position: 'relative',
                      top: -15
                    }}
                  >
                    Сброс пароля
                  </Text>
                  {/* <TextInput
                    value={resetPhone}
                    onChangeText={(text) => {
                      if (text.length < 10) {
                        setResetPhone(text);
                      }
                    }}
                    placeholder={'Номер телефона'}
                    style={styles.input}
                    placeholderTextColor={colors.secondary}
                    keyboardType="numeric"
                  /> */}
                  <InternationalInput
                    inputValue={resetPhone}
                    setInputValue={setResetPhone}
                    setPrefix={setPrefix}
                  />
                  <View style={styles.button_container}>
                    <TouchableOpacity
                      activeOpacity={0.95}
                      style={styles.button}
                      onPress={getResetCode}
                    >
                      <Text style={styles.text}>Отправить код</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{
                      // backgroundColor: colors.blue,
                      width: percentWidth(40),
                      height: percentHeight(4),
                      justifyContent: 'center',
                      marginTop: percentHeight(2)
                    }}
                    onPress={() => {
                      setResetPassword(false)
                      setGotResetCode(false)
                      setConfirmPassword(false)
                      setResetPhone(false)
                      setResetCode(false)
                      setNewResetPassword(false)
                      setNewResetConfirmPassword(false)
                      setResetConfirmKey(false)
                    }}
                  >
                    <Text
                      style={{
                        color: colors.dark_text,
                        fonsSize: fSize(15),
                        textAlign: 'center',
                        textDecorationColor: colors.dark_text,
                        textDecorationLine: 'underline',
                      }}
                    >
                      Я вспомнил пароль!
                  </Text>
                  </TouchableOpacity>
                </View>
              )
            :
            (

              <View style={{ height: percentHeight(50), alignItems: 'center' }}>
                <Text
                  style={{
                    color: colors.secondary,
                    textAlign: 'center',
                    fontSize: fSize(25),
                    // backgroundColor: 'red',
                    position: 'relative',
                    top: -15
                  }}
                >
                  Вход
              </Text>
                <InternationalInput
                  inputValue={login}
                  setInputValue={setLogin}
                  setPrefix={setPrefix}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                  placeholder={'Пароль'}
                  secureTextEntry={true}
                  style={styles.input}
                  placeholderTextColor={colors.secondary}
                  keyboardType='default'
                />
                <View style={styles.button_container}>
                  <TouchableOpacity
                    activeOpacity={0.95}
                    style={styles.button}
                    onPress={login_btn}>
                    <Text style={styles.text}>Войти</Text>
                    <Icon name="log-in-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{
                    // backgroundColor: colors.blue,
                    width: percentWidth(30),
                    height: percentHeight(4),
                    justifyContent: 'center',
                    marginTop: percentHeight(2)
                  }}
                  onPress={() => {
                    setResetPassword(true)
                  }}
                >
                  <Text
                    style={{
                      color: colors.dark_text,
                      fonsSize: fSize(15),
                      textAlign: 'center',
                      textDecorationColor: colors.dark_text,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Забыли пароль?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    marginTop: percentHeight(3),
                    height: percentHeight(5),
                    justifyContent: 'center'
                  }}
                  onPress={() => setRegister(true)}>
                  <Text style={{ color: colors.secondary, fontSize: fSize(17), textAlign: 'center' }}>Зарегистрироваться</Text>
                </TouchableOpacity>
              </View>
            ) : (
            !gotOTP ?
              (

                <View style={{ height: percentHeight(50), width: '100%', alignItems: 'center' }} >
                  <Text
                    style={{
                      color: colors.secondary,
                      textAlign: 'center',
                      fontSize: fSize(25),
                      // backgroundColor: 'red',
                      position: 'relative',
                      top: -15
                    }}
                  >
                    Регистрация
                  </Text>
                  <TextInput
                    value={registerName}
                    onChangeText={(text) => setRegisterName(text)}
                    placeholder={'Имя'}
                    placeholderTextColor={colors.secondary}
                    style={styles.input}
                    keyboardType="default"
                  />
                  {/* <TextInput
                    value={registerPhone}
                    onChangeText={(text) => setRegisterPhone(text)}
                    placeholder={'Номер'}
                    placeholderTextColor={colors.secondary}
                    style={styles.input}
                    keyboardType="numeric"
                  /> */}
                  <InternationalInput
                    inputValue={registerPhone}
                    setInputValue={setRegisterPhone}
                  />
                  <TextInput
                    value={registerPassword}
                    onChangeText={(text) => setRegisterPassword(text)}
                    placeholder={'Пароль'}
                    secureTextEntry={true}
                    style={styles.input}
                    placeholderTextColor={colors.secondary}
                    keyboardType='default'
                  />
                  <TextInput
                    value={registerConfirmPassword}
                    onChangeText={(text) => setRegisterConfirmPassword(text)}
                    placeholder={'Подтвердите пароль'}
                    secureTextEntry={true}
                    style={styles.input}
                    placeholderTextColor={colors.secondary}
                    keyboardType='default'
                  />
                  <View style={styles.button_container}>
                    <TouchableOpacity
                      activeOpacity={0.95}
                      style={styles.button}
                      onPress={get_OTP}
                    >
                      <Text style={styles.text}>Зарегистрироваться</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{
                      marginTop: percentHeight(3),
                      height: percentHeight(5),
                      justifyContent: 'center'
                    }}
                    onPress={() => { setRegister(true); clearRegistrationFields(); setRegister(false); setGotOTP(false) }}>
                    <Text style={{ color: colors.secondary, fontSize: fSize(17), textAlign: 'center' }}>Уже есть аккаунт?</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{ height: percentHeight(20) }}
                >
                  <Text
                    style={{
                      color: colors.secondary,
                      textAlign: 'center',
                      fontSize: fSize(25),
                      // backgroundColor: 'red',
                      position: 'relative',
                      top: -15
                    }}
                  >
                    Регистрация
                  </Text>
                  <TextInput
                    value={OTP}
                    onChangeText={(text) => {
                      if (text.toString().length < 5) {
                        setOTP(text)
                      }
                    }}
                    placeholder={'Введите код'}
                    placeholderTextColor={colors.secondary}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                  <View style={styles.button_container}>
                    <TouchableOpacity
                      activeOpacity={0.95}
                      style={styles.button}
                      onPress={verifyRegistration}
                    >
                      <Text style={styles.text}>Подтвердить</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{
                      marginTop: percentHeight(3),
                      height: percentHeight(5),
                      justifyContent: 'center'
                    }}
                    onPress={() => {
                      setRegister(true)
                      clearRegistrationFields()
                      setRegister(false)
                      setGotOTP(false)
                    }
                    }>
                    <Text style={{ color: colors.secondary, fontSize: fSize(17), textAlign: 'center' }}>Уже есть аккаунт?</Text>
                  </TouchableOpacity>
                </View>
              )
          )
      }
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  container2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.primary,
    paddingTop: percentHeight(10)
  },
  text: {
    color: '#fff',
    fontSize: fSize(17),
    paddingBottom: 6,
  },
  image: {
    width: percentWidth(60),
    height: percentHeight(20),
    resizeMode: 'contain',
  },
  input: {
    width: percentWidth(80),
    height: percentHeight(7),
    padding: 10,
    color: colors.secondary,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#36324A',
    borderRadius: 4,
  },
  button_container: {
    width: percentWidth(80),
    height: percentHeight(6),
    borderRadius: 4,
    borderColor: '#AA0008',
    borderWidth: 2,
    backgroundColor: '#AA0008',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
