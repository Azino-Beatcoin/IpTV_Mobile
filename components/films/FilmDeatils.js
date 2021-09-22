import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, StatusBar} from 'react-native';
import {fSize, percentHeight, percentWidth} from '../../templates/helper';
import {colors} from '../../templates/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage'
import {request_delete, request_get, request_post} from '../../api/request';
import Favorite from '../General/Favorite';

const FilmDetails = ({details}) => {
    const [favorite,setFavorite] = useState(false)

    useEffect(()=>{        
        check()      
      
    },[])

    const check = async () => {
        const sid = await AsyncStorage.getItem('sid')
        const response = await request_post(`favorite/check/${details.id}?sid=${sid}`)
        if (response.success){
            setFavorite(true)
        }else {
            setFavorite(false)
        }
    }

    const remove = async () => {
        const sid = await AsyncStorage.getItem('sid')
        const response = await request_delete(`favorite/${details.id}?sid=${sid}`)
        if (response.success){
            setFavorite(false)
        }else {
            setFavorite(true)
        }
    }

    const add = async () => {
        const sid = await AsyncStorage.getItem('sid')
        const response = await request_post(`favorite/${details.id}?sid=${sid}`)
        if (response.success){
            setFavorite(true)
        }else {
            setFavorite(false)
        }
    }

    const column = (title,value) => {
        return (
            <View style={styles.column}>
                <View style={styles.columnTitle}>
                    <Text style={styles.columnTextTitle}>
                        {title}:
                    </Text>
                </View>
                <View style={styles.columnValue}>
                    <Text style={styles.columnTextValue}>
                        {value}
                    </Text>
                </View>
            </View>
        );
    };


    return (
        <View>
            <View style={styles.detailsNameContainer}>
                <Text style={styles.detailsName}>
                    {details.name}
                </Text>
                <View style={styles.favorite}>
                   <Favorite
                       Check={`favorite/check/${details.id}`}
                       Add={`favorite/${details.id}`}
                       Remove={`favorite/${details.id}`}
                   />
                </View>
            </View>
            <View style={styles.columnContainer}>
                {column("Год",details.year)}
                {column("Страна",details.country)}
                {column("Режисер",details.director)}
                {column("Жанр",details.genre)}
                {column("В ролях",details.actors)}
                {column("Рейтинг IMDB",details.r_imdb)}
                {column("Рейтинг Kinopoisk",details.r_kinopoisk)}
            </View>
                <Text style={styles.description}>
                    {details.description}
                </Text>

        </View>
    );
};
export default FilmDetails;
const styles = StyleSheet.create({
    detailsNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: percentHeight(10),
    },
    detailsName: {
        fontSize: fSize(22),
        color: colors.secondary,
        width: percentWidth(70),
        maxHeight: percentHeight(8),
        overflow: 'hidden',
    },
    favorite: {
        width: percentWidth(20),
        justifyContent: 'flex-end',
        flexDirection: 'row',
        borderLeftWidth: 1,
        borderLeftColor: '#191726',
    },
    column: {
        flexDirection: 'row',
        marginVertical:3,
    },
    columnTitle: {
        width: percentWidth(35),
    },
    columnValue: {
        width: percentWidth(61),
    },
    columnTextTitle:{
        color:colors.dark_text,
        fontSize: fSize(15)
    },
    columnTextValue:{
        color:colors.secondary,
        fontSize: fSize(15)
    },
    columnContainer:{
        marginTop:5,
    },
    description:{
        marginVertical: 10,
        color:colors.secondary,
        fontSize: fSize(16)
    }
});
