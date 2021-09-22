import React, {useEffect, useState} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import EpgScreen from '../screens/EpgScreen';
import {colors} from '../templates/colors';
import AsyncStorage from '@react-native-community/async-storage';
import {request_get} from '../api/request';
import {View, Text, ActivityIndicator} from 'react-native';
import {fSize, percentWidth} from '../templates/helper';
const Tab = createMaterialTopTabNavigator();
function EpgTabs({channel_id, setUri}) {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
  const [epgFound, setEpgFound] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoad(true);
      const sid = await AsyncStorage.getItem('sid');
      const response = await request_get(
        `get_epg/${channel_id}?sid=${sid}&reverse=true`,
      );
      if (!response.success) {
        setLoad(false);
        return;
      }
      setData(response.data);
      setEpgFound(true);
      setLoad(false);
    };
    getData();
  }, [channel_id]);

  const epgView = () => {
    let epg = [];
    for (let key in data) {
      if (key == 'active') {
        continue;
      }
      epg.push(
        <Tab.Screen name={key} key={key}>
          {(props) => (
            <EpgScreen {...props} programs={data[key]} setUri={setUri} />
          )}
        </Tab.Screen>,
      );
    }
    return epg;
  };

  const loader = (show = false) => {
    return show ? (
      <ActivityIndicator
        color={colors.dark_red}
        size={'large'}
        style={{position: 'absolute', top: 0, right: 0, left: 0, bottom: 0}}
      />
    ) : null;
  };
  return (
    <>
      {epgFound ? (
        <Tab.Navigator
          tabBarOptions={{
            labelStyle: {fontSize: fSize(14), color: '#fff'},
            style: {backgroundColor: colors.primary},
            tabStyle: {height: 35, width: percentWidth(25)},
            activeTintColor: colors.dark_red,
            indicatorStyle: {backgroundColor: colors.dark_red},
            scrollEnabled: true,
            iconStyle: {width: percentWidth(5)},
          }}
          initialRouteName={data.active}>
          {epgView()}
        </Tab.Navigator>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {loader(load)}
          {data.length === 0 && !load ? (
            <Text
              style={{
                color: colors.gray,
                fontSize: fSize(18),
              }}>
              По данному каналу архивация отсутсвует
            </Text>
          ) : null}
        </View>
      )}
    </>
  );
}
export default EpgTabs;
