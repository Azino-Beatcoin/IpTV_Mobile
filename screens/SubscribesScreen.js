import AsyncStorage from '@react-native-community/async-storage'
import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { Text } from 'react-native'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { BASE_API_URL } from '../api/request'
import { colors } from '../templates/colors'
import { fSize, percentHeight, percentWidth } from '../templates/helper'
import Snackbar from 'react-native-snackbar'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthState, setSid } from '../redux/actions'
import Icon from 'react-native-vector-icons/Ionicons'
import { Image } from 'react-native'

const SubscribesScreen = ({ navigation, route }) => {

    const dispatch = useDispatch()
    const sid = useSelector((state) => state.authReducer.sid);
    const [subscribes, setSubscribes] = useState([])
    const [sidIsCorrect, setSidIsCorrect] = useState(false)
    const [activatedSubscription, setActivatedSubscription] = useState(Infinity)
    const [showTempo, setShowTempo] = useState(false)

    useEffect(() => {
        navigation.setOptions({
            title: 'Подписки',
            headerRight: () => (
                <View
                    style={{
                        alignItems: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={{
                            height: percentHeight(4),
                            width: percentWidth(30),
                            justifyContent: 'center',
                            borderRadius: 5
                        }}
                        onPress={() => {
                            navigation.navigate('products')
                        }}
                    >
                        <Text
                            style={{
                                color: colors.dark_text,
                                fontSize: fSize(15),
                                textAlign: 'center',
                                textDecorationColor: colors.dark_text,
                                textDecorationLine: 'underline'
                            }}
                        >
                            Нет подписки?
                </Text>
                    </TouchableOpacity>
                </View>
            )
        });
    }, [])

    useEffect(() => {
        const get_subscriptions = async () => {
            try {
                let access_token = await AsyncStorage.getItem('access_token')
                const response = await fetch(`${BASE_API_URL}api/subscriptions`, { headers: { 'Authorization': access_token, 'Accept': 'application/json' } })
                if (response.status == 401) {
                    await AsyncStorage.removeItem('access_token')
                    await AsyncStorage.removeItem('sid')
                    dispatch(setSid(''))
                    dispatch(setAuthState(false))
                    Snackbar.show({
                        text: 'Сессия истекла. Войдите заново',
                        duration: Snackbar.LENGTH_LONG,
                    })
                    return
                }
                let responseJSON = await response.json()
                if (responseJSON.success) {
                    setSubscribes(responseJSON.data)
                }
                console.log(responseJSON);
            } catch (error) {
                console.log(error);
            }
        }
        get_subscriptions()
    }, [])

    const activateSubscription = async (login, password, index, device = 1) => {
        try {
            const access_token = await AsyncStorage.getItem('access_token')
            const bodyForm = new FormData()
            bodyForm.append('login', login)
            bodyForm.append('password', password)
            bodyForm.append('device', device)
            const response = await fetch(`${BASE_API_URL}api/auth`, { method: 'POST', body: bodyForm, headers: { 'Authorization': access_token, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } })
            if (response.status == 401) {
                await AsyncStorage.removeItem('access_token')
                await AsyncStorage.removeItem('sid')
                dispatch(setSid(''))
                dispatch(setAuthState(false))
                Snackbar.show({
                    text: 'Сессия истекла. Войдите заново',
                    duration: Snackbar.LENGTH_LONG,
                })
                return
            }
            const responseJSON = await response.json()
            if (responseJSON.success) {
                await AsyncStorage.setItem('sid', responseJSON.sid)
                dispatch(setSid(responseJSON.sid))
                Snackbar.show({
                    text: 'Успешно активировано!',
                    backgroundColor: '#4CAF50',
                    duration: Snackbar.LENGTH_LONG
                })
                setActivatedSubscription(index)
                return
            }
            Snackbar.show({
                text: 'Что-то пошло не так',
                backgroundColor: '#F44336',
                duration: Snackbar.LENGTH_LONG
            })
        } catch (error) {
            console.log('subscribe activation error = ', error);
        }
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.primary
            }}
        >
            {/* <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopColor: colors.secondary,
                    borderTopWidth: 1,
                    borderBottomColor: colors.secondary,
                    borderBottomWidth: 1,
                }}
            >
                <View
                    style={{
                        justifyContent: 'center',
                        width: percentWidth(25),
                        height: percentHeight(7)
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            textAlign: 'center'
                        }}
                    >
                        Количество устройств
                    </Text>
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        width: percentWidth(35),
                        height: percentHeight(7)
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            textAlign: 'center'
                        }}
                    >
                        Годен до
                    </Text>
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        width: percentWidth(40),
                        height: percentHeight(7)
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            textAlign: 'center'
                        }}
                    >
                        Действия
                    </Text>
                </View>
            </View> */}
            {/* <FlatList
                data={subscribes}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View
                        style={{
                            flexDirection: 'row',
                            marginVertical: percentHeight(0.5),
                        }}
                    >
                        <View
                            style={{
                                width: percentWidth(25),
                                height: percentHeight(5),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.secondary,
                                    textAlign: 'center'
                                }}
                            >
                                {item.count_equipment}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: percentWidth(35),
                                height: percentHeight(5),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.secondary,
                                    textAlign: 'center'
                                }}
                            >
                                {item.expire_date}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: percentWidth(40),
                                height: percentHeight(5),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    width: percentWidth(25),
                                    height: percentHeight(3.5),
                                    borderRadius: 5,
                                    backgroundColor: colors.dark_red,
                                }}
                                onPress={() => {
                                    if (activatedSubscription != index) {
                                        activateSubscription(item.login, item.password, index)
                                    }
                                }}
                            >
                                {
                                    activatedSubscription == index ?
                                        (
                                            <Text
                                                style={{
                                                    color: colors.secondary,
                                                    textAlign: 'center',
                                                    fontSize: fSize(13)
                                                }}
                                            >
                                                Активирован
                                            </Text>
                                        ) : (
                                            <Text
                                                style={{
                                                    color: colors.secondary,
                                                    textAlign: 'center',
                                                    fontSize: fSize(13)
                                                }}
                                            >
                                                Активировать
                                            </Text>
                                        )
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            /> */}
            <FlatList
                data={subscribes}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{
                    paddingTop: percentHeight(2),
                    marginHorizontal: percentWidth(2)
                }}
                numColumns={2}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={{
                            width: percentWidth(40),
                            height: percentHeight(18),
                            marginHorizontal: percentWidth(4),
                            backgroundColor: colors.dark_blue,
                            marginBottom: percentHeight(3),
                            alignItems: 'center',
                            paddingTop: percentHeight(1.5),
                            borderRadius: 3,
                        }}
                        activeOpacity={0.5}
                        onPress={() => {
                            if (activatedSubscription != index) {
                                activateSubscription(item.login, item.password, index)
                            }
                        }}
                    >
                        <View
                            style={{
                                width: '90%',
                                height: percentHeight(15),
                                backgroundColor: '#141414',
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    alignItems: 'flex-end',
                                    width: '100%',
                                    height: '20%',
                                    paddingRight: percentWidth(2),
                                    paddingTop: percentHeight(1)
                                }}
                            >
                                <Image source={require('../img/logo.png')} style={{ height: '100%', width: '30%' }} resizeMode="center" />
                            </View>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: colors.secondary,
                                    fontSize: fSize(17)
                                }}
                            >
                                {item.expire_date.toString().split(' ')[0]}
                            </Text>
                            <View
                                style={{
                                    width: '100%',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: colors.dark_red,
                                        width: '90%',
                                        height: percentHeight(0.2),
                                        marginTop: percentHeight(0.5)
                                    }}
                                />
                            </View>
                            <Text
                                style={{
                                    color: colors.secondary,
                                    fontSize: fSize(14),
                                    textAlign: 'center'
                                }}
                            >
                                {
                                    `Устройств: ${item.count_equipment}`
                                }
                            </Text>
                            <View
                                style={{
                                    // width: '20%',
                                    width: '100%',
                                    paddingTop: percentHeight(0.5)
                                    // position: 'absolute',
                                    // bottom: percentHeight(0.5),
                                    // right: percentWidth(0)
                                }}
                            >
                                {/* <Icon name="cart-outline" color={colors.dark_red} size={fSize(18)} /> */}
                                <Text
                                    style={{
                                        fontSize: fSize(15),
                                        color: activatedSubscription == index ? '#4CAF50' : colors.dark_red,
                                        textAlign: 'center',
                                    }}
                                >
                                    {
                                        activatedSubscription == index ?
                                        'Активирован'
                                        :
                                        'Активировать'
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

export default SubscribesScreen