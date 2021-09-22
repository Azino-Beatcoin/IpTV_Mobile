import React from "react";
import {ActivityIndicator,StyleSheet,View} from "react-native";
import {colors} from '../templates/colors';

const Loader = ({size="large"}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={colors.dark_red}/>
        </View>
    )
}
export default Loader
const styles = StyleSheet.create({
    container:{
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
})
