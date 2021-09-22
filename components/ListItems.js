import React from 'react';
import {
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import {colors} from '../templates/colors';
import {IPTV_ADMIN_URL} from '../api/url';


const ListItem = ({data,navigation,route,params,images_path}) => {
    return (
         <TouchableOpacity
            onPress={() => navigation.navigate(route,params)}
            key={data.id}
            style={styles.Item}
            >
             <Image
                 style={styles.Image}
                 source = {{
                     uri: `${IPTV_ADMIN_URL}images/${images_path}/${data.image}`,
                 }}
             />
            <Text style={styles.ItemText}>{data.name}</Text>
        </TouchableOpacity>

    )
}

export default ListItem

const styles = StyleSheet.create({
    Item: {
        flex: 1,
        flexDirection: "row",
        padding: 10,
        height: 50,
        backgroundColor: colors.gray,
        borderWidth: 2,
        borderRadius:15,
        borderColor: colors.primary
    },
    ItemText:{
        marginLeft: 10,
        fontSize: 18,
        color: colors.secondary,
    },
    Image: {
        marginLeft: 10,
        width: 25,
        height: 25,
    }
})
