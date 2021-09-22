import React from 'react';
import {View, Text, FlatList, Button} from 'react-native';
import {colors} from '../../templates/colors';
import {fSize} from '../../templates/helper';
import HistoryItem from './historyItem';

const HistoryList = ({data, navigate}) => {
  const newData = data.reverse().slice(0, 10);
  newData.push({
    id: new Date().toISOString(),
  });
  return (
    !!data.length && (
      <View>
        <Text style={{fontSize: fSize(18), color: colors.secondary}}>
          Последние просмотренные
        </Text>
        <FlatList
          data={newData}
          renderItem={({item}) => (
            <HistoryItem filmHistory={item} navigate={navigate} />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
        />
      </View>
    )
  );
};

export default HistoryList;
