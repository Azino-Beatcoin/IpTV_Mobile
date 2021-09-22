import React, { useState } from "react";
import {
    Alert,
    Modal, ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight, TouchableOpacity,
    View,
} from 'react-native';
import {colors} from '../templates/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const FilmInfo = ({details}) => {

    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.TouchableOpacityStyle}
                onPress={() => setModalVisible(!modalVisible)}
            >
                <Icon
                    name='information-circle-outline'
                    size={50}
                    style={styles.floatingButtonStyle}
                    color={colors.secondary}
                />
            </TouchableOpacity>
            <Modal
                style={{flex: 1}}
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                }}
            >
                <View style={{flex: 1}}>
                    <View style={styles.modalView}>
                        <ScrollView>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Название:</Text>
                                <Text style={styles.modalText}>{details.name}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Год:</Text>
                                <Text style={styles.modalText}>{details.year}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Страна:</Text>
                                <Text style={styles.modalText}>{details.country}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Режисер:</Text>
                                <Text style={styles.modalText}>{details.director}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Жанр:</Text>
                                <Text style={styles.modalText}>{details.genre}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>В ролях:</Text>
                                <Text style={styles.modalText}>{details.actors}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Продолжительность:</Text>
                                <Text style={styles.modalText}>{details.duration}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Рейтинг IMDB:</Text>
                                <Text style={styles.modalText}>{details.r_imdb}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <Text style={styles.modalText}>Рейтинг Kinopoisk:</Text>
                                <Text style={styles.modalText}>{details.r_kinopoisk}</Text>
                            </View>
                            <View>
                                <Text style={{fontWeight: "bold"}}>Описание:</Text>
                                <Text style={styles.modalText}>{details.description}</Text>
                            </View>

                        <TouchableHighlight
                            style={{ ...styles.openButton, backgroundColor: colors.blue }}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Text style={styles.textStyle}>Назад</Text>
                        </TouchableHighlight>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        marginRight: 5,
        fontSize: 12,
        flex:1,
    },
    TouchableOpacityStyle: {
        //Here is the trick
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
    },
    floatingButtonStyle: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
        // backgroundColor:'black'
    },
});

export default FilmInfo;
