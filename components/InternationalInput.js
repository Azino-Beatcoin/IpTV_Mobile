import React, { useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Modal } from 'react-native'
import { Text } from 'react-native'
import { FlatList } from 'react-native'
import { TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../templates/colors'
import { fSize, percentHeight, percentWidth } from '../templates/helper'
import internationalCodes, { internationalCodesArray } from '../templates/phoneCodes'

const InternationalInput = ({ inputValue = '', setInputValue = () => null, setPrefix = () => null }) => {
    const [currentCountry, setCurrentCountry] = useState('TJ')
    const [showModal, setShowModal] = useState(false)
    const [inputDialCode, setInputDialCode] = useState(internationalCodes[currentCountry].dialCode)
    const [searchValue, setSearchValue] = useState('')
    // const [inputValue, setInputValue] = useState('')
    const [countries, setCountries] = useState([])

    useEffect(() => {
        const tmp = []
        for (let i of internationalCodesArray) {
            if (i.dialCode.toLowerCase().includes(searchValue.toLowerCase())) {
                tmp.push(i)
            }
        }
        if (!tmp.length) {
            for (let i of internationalCodesArray) {
                if (i.name.toLowerCase().includes(searchValue.toLowerCase())) {
                    tmp.push(i)
                }
            }
        }
        setCountries(tmp)
    }, [searchValue])

    const onClose = () => {
        setSearchValue('')
        setShowModal(false)
    }

    return showModal ?
        (
            <Modal
                style={{
                    // position: 'absolute',
                    // height: '100%',
                    // width: '100%',
                    // top: 0,
                    // left: 0,
                    // backgroundColor: colors.secondary
                }}
            >
                <View
                    style={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: colors.dark_blue,
                        paddingTop: percentHeight(10)
                    }}
                >
                    <View
                        style={{
                            position: 'absolute',
                            height: percentHeight(10),
                            width: '100%',
                            backgroundColor: colors.primary,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            flexDirection: 'row'
                        }}
                    >
                        <TextInput
                            value={searchValue}
                            onChangeText={(text) => {
                                setSearchValue(text)
                            }}
                            placeholder="Поиск..."
                            placeholderTextColor={colors.dark_text}
                            style={{
                                width: percentWidth(90),
                                height: percentHeight(7),
                                padding: 10,
                                color: colors.secondary,
                                marginBottom: 10,
                                borderWidth: 2,
                                borderColor: '#36324A',
                                borderRadius: 4,
                            }}
                        />
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: percentWidth(8),
                                top: percentHeight(2.5)
                            }}
                            onPress={onClose}
                        >
                            <Icon
                                name="close-circle-outline"
                                color={colors.secondary}
                                size={fSize(30)}
                            />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={countries}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item, index }) => {
                            return (
                                <View
                                    style={{
                                        borderBottomColor: colors.secondary,
                                        borderBottomWidth: 1,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: "row",
                                            alignItems: 'center',
                                            paddingVertical: percentHeight(1),
                                            paddingHorizontal: percentWidth(4)
                                        }}
                                        onPress={() => {
                                            setCurrentCountry(item.isoCode);
                                            setInputDialCode(item.dialCode);
                                            setInputValue('');
                                            setPrefix(item.dialCode);
                                            onClose()
                                        }}
                                    >
                                        <Image
                                            source={{
                                                uri: `${item.flag}`
                                            }}
                                            style={{
                                                height: percentHeight(7),
                                                width: percentWidth(10)
                                            }}
                                        />
                                        <Text
                                            style={{
                                                marginLeft: percentWidth(4),
                                                color: colors.secondary,
                                                fontSize: fSize(17)
                                            }}
                                        >
                                            {item.name}
                                        </Text>
                                        <Text
                                            style={{
                                                color: colors.secondary,
                                                position: 'absolute',
                                                right: percentWidth(4),
                                                fontSize: fSize(17)
                                            }}
                                        >
                                            {item.dialCode}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }}
                    />
                </View>
            </Modal>
        )
        :
        (
            <View
                style={{
                    flexDirection: 'row',
                    marginBottom: 10
                }}
                >
                <View
                    style={{
                        borderWidth: 2,
                        borderColor: '#36324A',
                        borderRadius: 4,
                        flexDirection: 'row',
                        width: percentWidth(80),
                        alignItems: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={{
                            width: percentWidth(15),
                            height: percentHeight(7),
                            flexDirection: 'row',
                            justifyContent: "center",
                            alignItems: 'center'
                        }}
                        onPress={() => setShowModal(true)}
                    >
                        <Image source={{ uri: `${internationalCodes[currentCountry].flag.trim()}` }} style={{ height: '100%', width: '75%', resizeMode: 'contain' }} />
                        <Icon name="caret-down-outline" color={colors.secondary} />
                    </TouchableOpacity>
                    <View
                        style={{
                            borderLeftColor: colors.dark_blue,
                            borderLeftWidth: 1,
                            height: '70%',
                        }}
                    />
                    <TextInput
                        style={{
                            width: percentWidth(65),
                            height: percentHeight(7),
                            padding: 10,
                            color: colors.secondary,
                            // marginBottom: 10,
                            // borderWidth: 2,
                            // borderColor: '#36324A',
                            // borderRadius: 4,
                        }}
                        keyboardType="numeric"
                        placeholder={`(${inputDialCode}) ${internationalCodes[currentCountry].mask}`}
                        placeholderTextColor={colors.secondary}
                        value={`${inputDialCode} ${inputValue}`}
                        onChangeText={(text) => {
                            let maskLength = 0;
                            for (let i of internationalCodes[currentCountry].mask) {
                                if (i >= '0' && i <= '9') {
                                    maskLength++;
                                }
                            }
                            if (text.length <= maskLength + inputDialCode.length + 1) {
                                let txt = text.toString().substring(inputDialCode.length, text.length).trim();
                                let txtNew = ""
                                for (let i of txt) {
                                    if (i != ' ') {
                                        txtNew += i
                                    }
                                }
                                setInputValue(txtNew)
                            }
                        }}
                    />
                </View>
            </View>
        )
}

export default InternationalInput