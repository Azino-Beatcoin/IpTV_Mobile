import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../templates/colors';
import {fSize, percentHeight} from '../../templates/helper';

const ButtonsNavigation = ({
  data,
  setType,
  setLoader,
  setFilterCheck = null,
  type,
  Default = false,
  setDataEmpty = null,
  onChange = null,
}) => {
  const vodType = (item, index) => {
    return (
      <>
        {Default && index === 0 ? (
          <TouchableOpacity
            style={
              !type.id
                ? {...styles.vodTypes, ...styles.active}
                : styles.vodTypes
            }
            onPress={() => {
              setLoader(true);
              setType({...type, id: '', title: 'Все каналы'});
              filterCheck();
              SetData();
              change();
            }}>
            <Text style={{color: colors.dark_text, fontSize: fSize(16)}}>
              Все каналы
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={
            item.id === type.id
              ? {...styles.vodTypes, ...styles.active}
              : styles.vodTypes
          }
          onPress={() => {
            setType(item.name);
            setLoader(true);
            setType({...type, id: item.id, title: item.name});
            filterCheck();
            change();
          }}>
          <Text style={{color: colors.dark_text, fontSize: fSize(16)}}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const SetData = () => {
    if (setDataEmpty) {
      setDataEmpty([]);
      console.log('empty');
    }
  };

  const filterCheck = () => {
    if (setFilterCheck) {
      setFilterCheck(false);
    }
  };

  const change = () => {
    if (onChange) {
      onChange();
    }
  };
  return (
    <View style={{marginLeft: 10, marginBottom: 5}}>
      <FlatList
        data={data}
        renderItem={({item, index}) => vodType(item, index)}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ButtonsNavigation;
const styles = StyleSheet.create({
  vodTypes: {
    marginHorizontal: 5,
    borderRadius: 18,
    paddingHorizontal: 10,
    backgroundColor: colors.btn_color,
    justifyContent: 'center',
    alignItems: 'center',
    height: percentHeight(5),
  },
  active: {
    backgroundColor: colors.dark_red,
  },
});
