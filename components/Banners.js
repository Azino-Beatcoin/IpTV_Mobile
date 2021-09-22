import React from 'react';
import { View, FlatList, Dimensions, TouchableWithoutFeedback } from 'react-native';
import {IPTV_ADMIN_URL} from '../api/url';
import { Divider, Card, Image, Text } from 'react-native-elements';
import {fSize, percentHeight, percentWidth} from '../templates/helper';
const { width } = Dimensions.get('window');

const Banners = ({ banners, search = '', navigate }) => {
    const bannerCard = img => {
        const child = <View style={{marginHorizontal:5}}>
            <Image
                style={{ width: percentWidth(90), height: percentHeight(25)  }}
                source={{ uri: `${IPTV_ADMIN_URL}banners/${img.banner}` }}
                resizeMode={'cover'}
            />
            <View style={{
                position: 'absolute',
                top: 10,
                left: 10,
                bottom: 0,
                right: 0,
            }}>
                <Text style={{ color: "#FFF", fontSize: fSize(18), fontWeight: 'bold' }}>{img.name}</Text>
            </View>
        </View>

        return (
            img.id ?
                <TouchableWithoutFeedback
                    onPress={() => navigate('vplayer',{"id":img.id, "format": "standart"})}>{child}
                </TouchableWithoutFeedback> : child
        )
    };

    return (
        search == "" && banners.length > 0 &&
        <View style={{marginVertical:10}}>
            <FlatList
                data={banners}
                renderItem={({item}) => bannerCard(item)}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    )
};

export default Banners;
