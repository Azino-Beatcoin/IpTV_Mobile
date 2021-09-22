import React from 'react';
import {
    Text,
    StyleSheet,
    TouchableOpacity,
    Image, View,
} from 'react-native';
import {colors} from '../templates/colors';
import {IPTV_ADMIN_URL} from '../api/url';


const Channel = ({data,navigation,route,params,images_path = "channel"}) => {
    const width =  {width:data.to_end_percent?data.to_end_percent:"0%"}
    return (
        <TouchableOpacity
            onPress={() => navigation.navigate(route,params)}
            key={data.id}
            style={styles.Item}
        >
            <View>
                <Image
                    style={styles.Image}
                    source = {{
                        uri: `${IPTV_ADMIN_URL}images/${images_path}/${data.image}`,
                    }}
                />

            </View>

                <View style={{marginLeft:10}}>
                    <View style={{marginLeft: 10}}>
                        <Text style={styles.ItemText}>{data.name}</Text>
                        <View style={{justifyContent:"center", alignItems: "center"}}>
                            <Text style={{color: "#fff", fontSize:10}}>{data.program_name !== null?data.program_name:"Передача"}</Text>
                        </View>

                    </View>
                    {data.time?
                        <View style={{flexDirection:"row",justifyContent:"center", alignItems:"center"}}>
                            <View style={{
                                backgroundColor:colors.primary,
                                height: 2,
                                width: "55%",
                            }}>
                                <View style={
                                    {
                                        ...width,
                                        borderWidth:1,
                                        borderColor: "red",
                                        position: 'absolute',
                                        elevation: 1,
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0
                                    }
                                }>
                                </View>
                            </View>
                            <View>
                                <Text style={{
                                    justifyContent:"flex-end",
                                    fontSize: 11,
                                    color: "#fff",
                                    marginLeft: 2
                                }}>
                                    {data.time}
                                </Text>
                            </View>

                        </View>
                        :null
                    }
                </View>



        </TouchableOpacity>

    )
}

export default Channel

const styles = StyleSheet.create({
    Item: {
        flex: 1,
        flexDirection: "row",
        padding: 10,
        height: 70,
        backgroundColor: colors.gray,
        borderWidth: 2,
        borderRadius:12,
        borderColor: colors.primary
    },
    ItemText:{
        fontSize: 14,
        color: colors.secondary,
    },
    Image: {
        marginLeft: 10,
        width: 45,
        height: 45,
    }
})
