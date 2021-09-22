import React, {useEffect, useState} from 'react';
import {request_get} from '../../api/request';
import {View, StyleSheet, FlatList, Image, TouchableOpacity} from 'react-native';
import {percentHeight, percentWidth} from '../../templates/helper';
import Favorite from '../General/Favorite';
import {colors} from '../../templates/colors';
import {IPTV_ADMIN_URL} from '../../api/url';
import Loader from '../Loader';

const SimilarChannels = ({group_channel_id,setId,id}) => {
    const [channels, setChannels] = useState([])
    const [loader, setLoader] = useState(true)

    useEffect(() => {
        getChannels()
    },[])

    const getChannels = async () => {
        // const response = await request_get(`getChannels/${group_channel_id}`)
        const response = await request_get(`get_channels/${group_channel_id}`)
        if (!response.success){
            setLoader(false)
            return false
        }
        setChannels(response.data)
        setLoader(false)
    }
    const channel = (item) => {
        return (
            <TouchableOpacity style={styles.card}
                onPress={() => setId(item.id)}
            >
                <Image
                    style={{height:percentHeight(3), width:percentWidth(9)}}
                    source={{uri: `${IPTV_ADMIN_URL}images/channel/${item.image}`}}
                    resizeMode={'cover'}
                />
            </TouchableOpacity>
        )
    }

    return (

        <View style={loader?styles.container:{...styles.container, ...styles.container_background}}>
            {loader?
                <Loader size={'small'}/>:
                <View style={{ flexDirection:"row"}}>
                    <View style={styles.favorite}>
                        <Favorite
                            Check={`channel/favorite/check/${id}`}
                            Add={`channel/favorite/${id}`}
                            Remove={`channel/favorite/${id}`}
                        />
                    </View>
                    <FlatList
                        data={channels}
                        renderItem={({item}) => channel(item)}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal={true}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            }

        </View>
    )

}
export default SimilarChannels

const styles = StyleSheet.create({
    container:{
        height:percentHeight(9),
        paddingVertical:10,
    },
    container_background:{
        backgroundColor: colors.primary
    },
    favorite:{
        justifyContent:"center",
        alignItems:"center",
        width:percentWidth(15),
        borderRightWidth:1,
        borderRightColor:"#1B1827"
    },
    card:{
        width: percentWidth(15),
        height: percentHeight(5),
        backgroundColor:"#2C2A3C",
        justifyContent: "center",
        alignItems: "center",
        marginLeft:10,
        borderRadius:5
    }
})
