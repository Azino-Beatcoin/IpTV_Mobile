import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../templates/colors';
import {IPTV_ADMIN_URL} from '../../api/url';
import {fSize, percentHeight, percentWidth} from '../../templates/helper';

const FilmCard = ({item, navigation, style}) => {

  const changeNameFilm = (name) => {
   
    let arr_name = name.split("");
    if(arr_name.length < 10){
      return name;
    }
    let cutname=arr_name.splice(0, 10).join('');

    return cutname + ' ...';
    
  }
  const {id, name, poster, year, genres} = item;
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        ...style,
      }}>
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          borderTopEndRadius: 5,
          borderTopStartRadius: 5,
          overflow: 'hidden',
        }}
        onPress={() =>
          navigation.navigate('vplayer', {id: id, format: 'standart'})
        }>
        <View>
          <Image
            source={{uri: IPTV_ADMIN_URL + 'posters/' + poster}}
            style={{
              height: percentHeight(26),
              width: percentWidth(30),
            }}
          />
        </View>
        <View
          style={{
            marginTop: 5,
            width: percentWidth(30),
            maxHeight: percentHeight(4),
            overflow: 'hidden',
          }}>
          <Text style={{color: '#fff', fontSize: fSize(14)}}>{changeNameFilm(name)}</Text>
        </View>
        <View
          style={{
            width: percentWidth(30),
            maxHeight: percentHeight(2),
            overflow: 'hidden',
          }}>
          <Text style={{color: colors.dark_text, fontSize: fSize(12)}}>
            {year} - {genres.length > 0 ? genres[0].name : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default FilmCard;
