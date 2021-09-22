import AsyncStorage from "@react-native-community/async-storage";

export const items = (data, key, selected = '') => {
    const arr = [];
    data.map(function (item){
        if (item.id === selected){
            arr.push({label: item[key], value: item.id})
        }else {
            arr.push({label: item[key], value: item.id})
        }

    })
    return arr;
}

export const header = (navigation = null,show) => {
    if (navigation === null){
       return  false
    }
    navigation.setOptions({
        headerShown: show,
    })
}

export const chechToken = async () => {
    return !!(await AsyncStorage.getItem('access_token'))
}

export const haveSid = async () => {
    return !!(await AsyncStorage.getItem('sid'))
}