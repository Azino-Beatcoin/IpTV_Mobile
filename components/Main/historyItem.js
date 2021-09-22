import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import {IPTV_ADMIN_URL} from '../../api/url';
import {colors} from '../../templates/colors';
import {fSize, percentHeight, percentWidth} from '../../templates/helper';

const HistoryItem = ({filmHistory, navigate}) => {
  const onPressHandler = () =>
    filmHistory.poster
      ? navigate('vplayer', {
          id: filmHistory.id,
          format: 'standart',
        })
      : navigate('historyTracking');

  return (
    <TouchableOpacity onPress={onPressHandler}>
      <View
        style={{
          height: percentHeight(15),
          padding: percentWidth(1),
        }}>
        <View
          style={{
            borderWidth: percentWidth(1),
            borderColor: '#44425F',
            borderRadius: (percentWidth(14) + percentHeight(14)) / 4,
          }}>
          {filmHistory.poster ? (
            <Image
              source={{uri: IPTV_ADMIN_URL + 'posters/' + filmHistory.poster}}
              style={{
                height: (percentHeight(13) + percentWidth(13)) / 2,
                width: (percentWidth(13) + percentHeight(13)) / 2,
                borderRadius: (percentWidth(13) + percentHeight(13)) / 4,
                borderColor: '#12101C',
                borderWidth: percentWidth(1),
                aspectRatio: 1,
              }}
            />
          ) : (
            <View
              style={{
                height: (percentHeight(13) + percentWidth(13)) / 2,
                width: (percentWidth(13) + percentHeight(13)) / 2,
                borderRadius: (percentWidth(13) + percentHeight(13)) / 4,
                borderColor: '#12101C',
                borderWidth: percentWidth(1),
                display:'flex',
                justifyContent:'center',
                flexDirection:'column',
                alignItems:'center'
                
             
              }}>
              <Text
                style={{
                  textAlign:'center',
                  color: colors.secondary,
                  fontSize: fSize(12),
                }}>
                См все
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HistoryItem;
