import React from 'react';
import DropDownPicker from "react-native-dropdown-picker";
import {items} from './helper';
import {fSize, percentHeight, percentWidth} from '../templates/helper';
import {colors} from '../templates/colors';
import {StyleSheet, Text, View} from 'react-native';

const DropDown = ({label,data}) =>{

    return(
        <View style={styles.filterContainer}>
            <DropDownPicker
                items={items(data.items, 'year')}
                onChangeItem={item => setFilters({...filters, 'year': item.label})}
                containerStyle={{height: percentHeight(5), width:percentWidth(100)}}
                style={{backgroundColor:'transparent', borderWidth:0,width:percentWidth(28)}}
                arrowColor={colors.secondary}
                placeholderStyle={{color:colors.secondary, fontSize: fSize(20)}}
                placeholder="Жанр"
                selectedLabelStyle={{color:"#000"}}
            />
            <Text style={{...styles.filterActive, position:'absolute', left:percentWidth(26)}}>Label</Text>
        </View>
    )
}
export default DropDown
const styles = StyleSheet.create({
    filterContainer:{
        flexDirection:'row',
        alignItems: "center",
        marginBottom: 5,
    },
    filterActive:{
        color:colors.active_filter,
        fontSize:fSize(18)
    }
});
