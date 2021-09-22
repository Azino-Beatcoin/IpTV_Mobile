import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {fSize} from '../../templates/helper';
import {colors} from '../../templates/colors';
import AsyncStorage from '@react-native-community/async-storage';
import {request_delete, request_post} from '../../api/request';

const Favorite = ({Check,Remove,Add, autoCheck = true,exists = false}) => {

    const [favorite,setFavorite] = useState(autoCheck?false:exists)

    useEffect(()=>{
        if (autoCheck){
            check()
        }

    },[Check])

    const check = async () => {
        const sid = await AsyncStorage.getItem('sid')
        const response = await request_post(`${Check}?sid=${sid}`)
        if (response.success){
            setFavorite(true)
        }else {
            setFavorite(false)
        }
    }

    const remove = async () => {
        const sid = await AsyncStorage.getItem('sid')
        const response = await request_delete(`${Remove}?sid=${sid}`)
        if (response.success){
            setFavorite(false)
        }else {
            setFavorite(true)
        }
    }

    const add = async () => {
        const sid = await AsyncStorage.getItem('sid')
        const response = await request_post(`${Add}?sid=${sid}`)
        if (response.success){
            setFavorite(true)
        }else {
            setFavorite(false)
        }
    }

    return (
        <>
            {favorite ?
                <TouchableOpacity
                    onPress={() => remove()}
                >
                    <Icon name={'star'} size={fSize(25)} color={colors.dark_red}/>
                </TouchableOpacity>
                :
                <TouchableOpacity
                    onPress={() => add()}
                >
                    <Icon name={'star-outline'} size={fSize(25)} color={'#262235'}/>
                </TouchableOpacity>

            }
        </>
    );
};
export default Favorite
