import React from 'react'
import {Alert} from 'react-native'

const Notify = (status,message) => {
    Alert.alert(
        status,
        message,
        [
            {
                text: 'Cancel', onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            },
        ],
        {cancelable: true},
    );
}
export default Notify
