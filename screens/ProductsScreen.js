import AsyncStorage from '@react-native-community/async-storage'
import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Text } from 'react-native'
import { View } from 'react-native'
import { BASE_API_URL } from '../api/request'
import { colors } from '../templates/colors'
import { fSize, percentHeight, percentWidth } from '../templates/helper'
import Snackbar from 'react-native-snackbar'
import Replenish from '../components/Replenish'
import { Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

const ProductsScreen = ({ navigation, route }) => {

    const fff = 'Пробная'

    const [products, setProducts] = useState([])
    const [replenish, setReplenish] = useState(false)
    const [refreshProducts, setRefreshProducts] = useState(false)

    useEffect(() => {
        navigation.setOptions({
            title: 'Товары',
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
                            navigation.navigate('replenish')
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
                            Пополнить счёт
                </Text>
                    </TouchableOpacity>
                </View>
            )
        });
    }, [])

    useEffect(() => {
        const get_products = async () => {
            try {
                const access_token = await AsyncStorage.getItem('access_token')
                const tempo = await fetch(`${BASE_API_URL}api/subscription_count`, { method: 'POST', headers: { 'Authorization': access_token, 'Accept': 'application/json' } })
                if (tempo.status == 401) {
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
                const tempoJSON = await tempo.json()
                console.log('tempoJSON = ', tempoJSON);
                setProducts([])
                if (tempoJSON.success && !tempoJSON.subscriber_count) {
                    const tempoSubscribe = {
                        'name': '1 месяц',
                        'price': fff,
                    }
                    setProducts([tempoSubscribe])
                }
                let response = await fetch(`${BASE_API_URL}products`, { headers: { 'Authorization': access_token, 'Accept': 'application/json' } })
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
                    responseJSON.data.unshift()
                    setProducts((arr) => [...arr, ...responseJSON.data])
                    console.log(responseJSON.data[0].product_type);
                }
                console.log('responseeee = ', responseJSON);
            } catch (error) {
                console.log('error = ', error);
            }
        }
        get_products()
    }, [refreshProducts])

    const buyProduct = async (productID) => {
        try {
            const access_token = await AsyncStorage.getItem('access_token')
            const bodyForm = new FormData()
            bodyForm.append('product_id', productID)
            const response = await fetch(`${BASE_API_URL}api/orders`, { method: 'POST', body: bodyForm, headers: { 'Authorization': access_token, 'Content-Type': 'multipart/form-data' } })
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
            if (!responseJSON.success) {
                Snackbar.show({
                    text: responseJSON.message,
                    duration: Snackbar.LENGTH_LONG,
                    backgroundColor: '#F44336'
                })
                return;
            }
            Snackbar.show({
                text: responseJSON.message,
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: '#4CAF50'
            })
            console.log(bodyForm);
            console.log('buy order = ', responseJSON);
        } catch (error) {
            console.log('buy error = ', error);
        }
    }

    const activateTemporarySubscription = async () => {
        try {
            const access_token = await AsyncStorage.getItem('access_token')
            const response = await fetch(`${BASE_API_URL}api/temporary_subscription`, { method: "POST", headers: { 'Authorization': access_token, 'Accept': 'application/json' } })
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
            console.log('temporary subscribe activation responseJSON = ', responseJSON);
            if (responseJSON.success) {
                // await AsyncStorage.setItem('sid', responseJSON.sid)
                Snackbar.show({
                    text: 'Успешно активировано!',
                    backgroundColor: '#4CAF50',
                    duration: Snackbar.LENGTH_LONG
                })
                setRefreshProducts(!refreshProducts)
                return
            }
            Snackbar.show({
                text: 'Что-то пошло не так',
                backgroundColor: '#F44336',
                duration: Snackbar.LENGTH_LONG
            })
        } catch (error) {
            console.log('temporary subscribe error = ', error);
        }
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.primary,
            }}
        >
            {
                console.log('productsssss = ', products)
            }
            {/* {
                replenish ?
                    (
                        <Replenish setReplenish={setReplenish} />
                    ) : null
            } */}
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
                        width: percentWidth(25),
                        height: percentHeight(7),
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            textAlign: 'center'
                        }}
                    >
                        Название
                    </Text>
                </View>
                <View
                    style={{
                        width: percentWidth(25),
                        height: percentHeight(7),
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            textAlign: 'center'
                        }}
                    >
                        Тип
                    </Text>
                </View>
                <View
                    style={{
                        width: percentWidth(25),
                        height: percentHeight(7),
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            textAlign: 'center'
                        }}
                    >
                        Цена
                    </Text>
                </View>
                <View
                    style={{
                        width: percentWidth(25),
                        height: percentHeight(7),
                        justifyContent: 'center',
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
                data={products}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: percentHeight(0.5)
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
                                {item.name}
                            </Text>
                        </View>
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
                                {item.product_type.name}
                            </Text>
                        </View>
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
                                {item.price}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: percentWidth(25),
                                height: percentHeight(5),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.dark_red,
                                    width: percentWidth(20),
                                    height: percentHeight(3.5),
                                    borderRadius: 5,
                                    justifyContent: 'center'
                                }}
                                onPress={() => {
                                    buyProduct(item.id)
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.secondary,
                                        textAlign: 'center'
                                    }}
                                >
                                    Купить
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            /> */}
            <FlatList
                data={products}
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
                            if (item.price == fff) {
                                activateTemporarySubscription()
                                return
                            }
                            buyProduct(item.id)
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
                                    fontSize: fSize(19)
                                }}
                            >
                                {item.name}
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
                                    fontSize: fSize(15),
                                    textAlign: 'center'
                                }}
                            >
                                {
                                item.price == fff ? fff : `${Number(item.price).toFixed(0)} сомони`
                                } 
                            </Text>
                            <View
                                style={{
                                    width: '20%',
                                    position: 'absolute',
                                    bottom: percentHeight(0.5),
                                    right: percentWidth(0)
                                }}
                            >
                                <Icon name="cart-outline" color={colors.dark_red} size={fSize(18)} />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

export default ProductsScreen