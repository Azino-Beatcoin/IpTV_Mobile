import AsyncStorage from '@react-native-community/async-storage'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Image, FlatList } from 'react-native'
import { TextInput } from 'react-native'
import { Text } from 'react-native'
import { Linking, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { BASE_API_URL } from '../api/request'
import { colors } from '../templates/colors'
import { fSize, percentHeight, percentWidth } from '../templates/helper'
import Snackbar from 'react-native-snackbar'
import { useDispatch } from 'react-redux'
import { setSid, setAuthState } from '../redux/actions'
import { WebView } from 'react-native-webview'
import { Modal } from 'react-native'
import { ScrollView } from 'react-native'

const Replenish = ({ setReplenish = () => null, refreshUserInfo = null, setRefreshUserInfo = () => null, navigation }) => {

    const [amount, setAmount] = useState(0.0)
    const [htmlCode, setHtmlCode] = useState('')
    const [paymentSystem, setPaymentSystem] = useState([
        { 'name': 'Корти милли', 'iconUrl': 1 },
        { 'name': 'Корти милли(DC)', 'iconUrl': 2 },
        { 'name': 'Visa', 'iconUrl': 3 },
        { 'name': 'Master Card', 'iconUrl': 4 },
        { 'name': 'МИР', 'iconUrl': 5 },
        { 'name': 'Сбер', 'iconUrl': 6 },
    ])
    const [activeCard, setActiveCard] = useState('')
    const dispatch = useDispatch()

    useEffect(() => {
        navigation.setOptions({
            title: 'Пополнение баланса'
        })
    }, [])

    const correctHtml = (html) => {
        const acquireUrl = 'https://acquire.dc.tj:440/pay/';
        let newHtml = '';
        for (let i = 0; i < html.length; i++) {
            if (html[i] == 'h') {
                if (html.substring(i, i + 5) == 'href=') {
                    if (html.substring(i + 6, i + 10) != 'http') {
                        newHtml += html.substring(i, i + 6);
                        newHtml += acquireUrl;
                        i += 5;
                        continue;
                    }
                }
            } else if (html[i] == 's') {
                if (html.substring(i, i + 4) == 'src=') {
                    if (html.substring(i + 5, i + 9) != 'http') {
                        newHtml += html.substring(i, i + 5);
                        newHtml += acquireUrl;
                        i += 4;
                        continue;
                    }
                }
            } else if (html[i] == 'a') {
                if (html.substring(i, i + 7) == 'action=') {
                    if (html.substring(i + 8, i + 12) != 'http') {
                        newHtml += html.substring(i, i + 8);
                        newHtml += acquireUrl;
                        i += 7;
                        continue;
                    }
                }
            } else if (html[i] == '>') {
                if (html.substring(i - 4, i + 1) == '</li>') {
                    newHtml += html[i];
                    newHtml += '<li class="nav-item"><a style=" margin-right: 15px;width: 166px; background-color: #ffffff;" class="nav-link" data-toggle="tab" href="#VisaMir"><img style="width: 38px;" src="https://acquire.dc.tj:440/pay/img/ico/viza.png">Карты РФ</a></li>'
                    newHtml += '<li class="nav-item"><a style=" margin-right: 15px;width: 166px; background-color: #ffffff;" class="nav-link" data-toggle="tab" href="#DCWallet"><img style="width: 38px;" src="https://acquire.dc.tj:440/pay/img/ico/dc.png">DC Wallet</a></li>'
                    continue;
                }
            } else if (html[i] == 'V') {
                if (html.substring(i, i + 7) == 'VisaMir') {
                    for (let j = i; j < html.length; j++) {
                        if (html.substring(j, j + 6) == 'active') {
                            newHtml += html.substring(i, j);
                            i = j + 5;
                            continue;
                        }
                    }
                }
            } else if (html[i] == '<') {
                if (html.substring(i, i + 16) == '<a class="but_c"') {
                    for (let j = i + 16; j < html.length; j++) {
                        if (html.substring(j, j + 4) == '</a>') {
                            i = j + 4;
                            break
                        }
                    }
                }
            }

            // else if (html[i] == '<') {
            //     if(html.substring(i, i + 7) == '</body>') {
            //         if(activeCard == 3) {
            //             newHtml += '<script> document.getElementById(\'VisaMir\').style.display = \'none\' </script>'
            //             newHtml += '<script> document.getElementById(\'vmid\').style.display = \'none\' </script>'
            //         } else {
            //             newHtml += '<script> document.getElementById(\'vmid\').style.display = \'none\' </script>'
            //             newHtml += '<script> document.getElementById(\'dcid\').style.display = \'none\' </script>'
            //             newHtml += '<script> document.getElementById(\'kortiMilli\').style.display = \'none\' </script>'
            //             newHtml += '<script> document.getElementById(\'DCWallet\').style.display = \'none\' </script>'
            //         }
            //         newHtml += html[i]
            //         continue
            //     }
            // }

            // else if (html[i] == 'D') {
            //     if (html.substring(i, i + 8) == 'DCWallet') {
            //         newHtml += html.substring(i, i + 17);
            //         newHtml += 'active ';
            //         i += 16;
            //         continue;
            //     }
            // }
            newHtml += html[i];
        }
        return newHtml;
    }

    const script = `
    <script> document.getElementById('DCWallet').style.display = 'none' </script>
    `

    const getReplenishUrl = async () => {
        try {
            if (!amount.length) {
                Snackbar.show({
                    text: 'Введите сумму правильно',
                    backgroundColor: '#F44336',
                    duration: Snackbar.LENGTH_LONG
                })
                return
            }
            const access_token = await AsyncStorage.getItem('access_token')
            const bodyForm = new FormData()
            bodyForm.append('price', amount)
            const response = await fetch(`${BASE_API_URL}api/pay`, { method: 'POST', body: bodyForm, headers: { 'Authorization': access_token, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } })
            if (response.status == 401) {
                await AsyncStorage.removeItem('access_token')
                await AsyncStorage.removeItem('sid')
                dispatch(setSid(''))
                dispatch(setAuthState(false))
                return
            }
            const responseJSON = await response.json()
            if (responseJSON.success) {
                await Linking.openURL(responseJSON.url)
                setAmount(0.0)
                setReplenish(false)
                setRefreshUserInfo(!refreshUserInfo)
            }
            console.log('payment response = ', responseJSON);
        } catch (error) {
            console.log('get replenish url error = ', error);
        }
    }

    const getReplenishUrlVisa = async () => {
        try {
            if (!amount.length) {
                Snackbar.show({
                    text: 'Введите сумму правильно',
                    backgroundColor: '#F44336',
                    duration: Snackbar.LENGTH_LONG
                })
                return
            }
            const access_token = await AsyncStorage.getItem('access_token')
            const bodyForm = new FormData();
            bodyForm.append('price', amount)
            const response = await fetch(`${BASE_API_URL}api/pay/visa`, { method: 'POST', body: bodyForm, headers: { 'Authorization': access_token, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } })
            if (response.status == 401) {
                await AsyncStorage.removeItem('access_token')
                await AsyncStorage.removeItem('sid')
                dispatch(setSid(''))
                dispatch(setAuthState(false))
                return
            }
            const responseJSON = await response.json()
            console.log(responseJSON);
            let url = ''
            let payBody = ''
            for (let i of responseJSON.formUrl) {
                if (i != '\\' && i != '\n') {
                    url += i
                }
            }
            for (let i of responseJSON.inputData) {
                if (i != '\\' && i != '\n') {
                    payBody += i
                }
            }
            console.log(url);
            console.log(payBody);
            const fb = new FormData()
            fb.append('Request', payBody)
            const response2 = await fetch(`${url}`, { method: 'POST', body: fb })
            const blob = await response2.text()
            console.log('response 2 _+@_)$+(#$(#)*%) ', blob);
            console.log(correctHtml(blob));
            setHtmlCode(correctHtml(blob));
        } catch (error) {
            console.log('get replenish url visa error = ', error);
        }
    }

    return (
        <View
            style={{
                backgroundColor: colors.primary,
                // height: '100%',
                // width: '100%',
                flex: 1,
                zIndex: 1000,
                // justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: percentWidth(4)
            }}
        >
            {
                htmlCode.length ?
                    (
                        <Modal>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    // backgroundColor: 'red',
                                    top: percentHeight(2),
                                    right: percentWidth(2),
                                    height: percentHeight(5),
                                    width: percentHeight(5),
                                    zIndex: 1000
                                }}
                                onPress={() => {
                                    setHtmlCode('')
                                }}
                            >
                                <Icon name="close-circle-outline" color="black" size={fSize(30)} />
                            </TouchableOpacity>
                            <WebView source={{ html: htmlCode }} containerStyle={{ position: 'absolute', height: '100%', width: '100%', zIndex: 100 }} />
                        </Modal>
                    ) : null
            }

            {/* <View
                    style={{
                        height: percentHeight(8),
                        width: '100%',
                        paddingTop: percentHeight(2),
                        // borderBottomWidth: 1,
                        // borderBottomColor: colors.dark_text
                    }}
                >
                    <Image
                        style={{
                            height: percentHeight(8),
                            width: percentWidth(10),
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                        source={{uri: 'https://somon.tv/img/corti_milli.png'}}
                        resizeMode="center"
                    />
                    <Text
                        style={{
                            color: colors.secondary,
                            textAlign: 'left',
                            fontSize: fSize(17)
                        }}
                    >
                        Введите сумму для пополнения баланса
                  </Text>
                </View> */}
            <View
                style={{
                    width: '100%',
                    // alignItems: 'center',
                    paddingTop: percentHeight(2),
                    paddingBottom: percentHeight(4),
                    borderBottomColor: colors.dark_blue,
                    borderBottomWidth: 1
                }}
            >
                <View
                    style={{
                        width: '100%'
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            fontSize: fSize(16),
                            // textAlign: 'center'
                        }}
                    >
                        Введите сумму для пополнения баланса
                    </Text>
                </View>
                <View>
                    <TextInput
                        value={amount}
                        onChangeText={(text) => {
                            if ((text[text.length - 1] >= 0 && text[text.length - 1] <= 9 && text[text.length - 1] != ' ') || !text.length) {
                                setAmount(text)
                            }
                        }}
                        placeholder={'Сумма'}
                        placeholderTextColor={colors.dark_text}
                        style={{
                            width: '100%',
                            height: percentHeight(7),
                            padding: 10,
                            color: colors.secondary,
                            marginTop: percentHeight(2),
                            borderWidth: 2,
                            borderColor: colors.dark_text,
                            borderRadius: 4,
                        }}
                        caretHidden={true}
                        keyboardType='numeric'
                    />
                    {
                        amount ?
                            (
                                <View
                                    style={{
                                        position: 'absolute',
                                        marginTop: percentHeight(2),
                                        height: percentHeight(7),
                                        justifyContent: 'center',
                                        marginLeft: 25 + amount.length * fSize(9)
                                    }}
                                >
                                    <View
                                        style={{
                                            paddingLeft: percentWidth(2),
                                            borderLeftColor: colors.dark_text,
                                            borderLeftWidth: 1,
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.dark_text
                                            }}
                                        >
                                            сомони
                                        </Text>
                                    </View>
                                </View>
                            ) : null
                    }
                </View>
            </View>
            <View
                style={{
                    width: '100%',
                    paddingTop: percentHeight(4)
                }}
            >
                <Text
                    style={{
                        color: colors.secondary,
                        fontSize: fSize(17)
                    }}
                >
                    Выберите способ пополнения
                    </Text>
                <ScrollView
                    style={{
                        paddingTop: percentHeight(2),
                        width: '100%',
                        height: percentHeight(45),
                    }}
                >
                    <FlatList
                        data={paymentSystem}
                        keyExtractor={(_, index) => index.toString()}
                        contentContainerStyle={{
                            paddingBottom: percentHeight(2)
                        }}
                        renderItem={({ item, index }) => {
                            let url;
                            switch (item.iconUrl) {
                                case 1:
                                    url = require('../img/corti_milli.png')
                                    break
                                case 2:
                                    url = require('../img/dc.png')
                                    break
                                case 3:
                                    url = require('../img/visa.png')
                                    break
                                case 4:
                                    url = require('../img/200px-Mastercard_2019_logo.svg.png')
                                    break
                                case 5:
                                    url = require('../img/mir.png')
                                    break
                                case 6:
                                    url = require('../img/icon_sber-01-340x340.png.webp')
                                    break
                            }
                            return (
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: activeCard == index ? colors.dark_blue : colors.primary,
                                    width: '100%',
                                    paddingVertical: percentHeight(2),
                                    borderRadius: 4,
                                }}
                                activeOpacity={1}
                                onPress={() => {
                                    setActiveCard(index)
                                }}
                            >
                                <Image
                                    style={{
                                        height: percentHeight(5),
                                        width: percentWidth(10),
                                        marginHorizontal: percentWidth(2)
                                    }}
                                    // source={{ uri: item.iconUrl }}
                                    source={url}
                                    resizeMode="center"
                                />
                                <Text
                                    style={{
                                        color: colors.secondary,
                                        fontSize: fSize(17)
                                    }}
                                >
                                    {item.name}
                                </Text>
                                <Icon
                                    name={activeCard == index ? 'radio-button-on-outline' : 'ellipse-outline'}
                                    color={activeCard == index ? 'red' : colors.dark_text}
                                    size={fSize(23)}
                                    style={{
                                        position: 'absolute',
                                        right: percentWidth(5)
                                    }}
                                />
                            </TouchableOpacity>
                        )}}
                    />
                </ScrollView>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '100%',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: percentHeight(2),
                    paddingTop: percentHeight(2)
                }}
            >
                <TouchableOpacity
                    style={{
                        height: percentHeight(6),
                        width: '100%',
                        backgroundColor: colors.dark_red,
                        borderRadius: 5,
                        justifyContent: 'center',
                        marginHorizontal: percentWidth(3)
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                        activeCard ? getReplenishUrlVisa() : getReplenishUrl()
                    }}
                >
                    <Text
                        style={{
                            color: colors.secondary,
                            fontSize: fSize(15),
                            textAlign: 'center'
                        }}
                    >
                        Пополнить
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Replenish