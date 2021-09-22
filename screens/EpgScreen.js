import React from 'react';
import {ScrollView, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../templates/colors';
import {fSize} from '../templates/helper';

const EpgScreen = ({programs,setUri}) => {
    const item = (program, index) => {
        console.log(program)
        const {name,start_date,end_date,exists,url} = program
        return (
            <TouchableOpacity style={{
                height: 50,
                paddingHorizontal: 15,
                paddingVertical: 10,
                flexDirection: 'row',
            }}
                  key={index.toString()}
                              onPress={() => setUri(url)}
                  disabled={!exists}
            >
                <View>
                    <Text style={{color: "#423F51",fontSize: fSize(13)}}>{start_date} - {end_date}</Text>
                    <Text style={{color:colors.secondary,fontSize:fSize(15)}}>{name}</Text>
                </View>
                <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                    <Icon name={exists?'play':'alarm-outline'} color={colors.dark_red} size={20}/>
                </View>
            </TouchableOpacity>
        );
    };



    return (
        <ScrollView style={{backgroundColor: colors.primary}}>
            {programs.map((program,index) => item(program,index))}
        </ScrollView>
    );
};
export default EpgScreen;

