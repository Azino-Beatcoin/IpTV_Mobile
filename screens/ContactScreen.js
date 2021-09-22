import React,{useEffect} from  'react'
import {Text, View, StyleSheet, Image,Linking} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../templates/colors';

const ContactScreen = ({navigation}) => {

    useEffect(()=> {
        navigation.setOptions({
            title: 'Контакты'
        });
    })

    return(
        <View style={styles.container}>
            <View styles={styles.logo}>
                <Image style={styles.image} source={require('../img/logo.png')}/>
            </View>
           <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Свяжитесь с нами удобным способам</Text>
                        <View style={styles.icons}>
                            <Icon
                                style={styles.icon}
                                raised
                                reverse
                                name='logo-vk'
                                color='#0099e5'
                                onPress={() => Linking.openURL('https://vk.com/somon_tv') }/>
                            <Icon
                                style={styles.icon}
                                raised
                                reverse
                                name='logo-facebook'
                                color='#4267b2'
                                onPress={() => Linking.openURL('https://www.facebook.com/somon.tevi')}/>
                            <Icon
                                style={styles.icon}
                                raised
                                reverse
                                name='logo-instagram'
                                color='#ee8208'
                                onPress={() => Linking.openURL('https://instagram.com/somon_tv?igshid=1f4z8aax1gfg7')}/>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Номер</Text>
                        <View style={styles.icon}>
                            <Text style={styles.cardInfo}>909600600</Text>
                        </View>
                    </View>
                </View>
               <View style={styles.card}>
                   <View style={styles.cardHeader}>
                       <Text style={styles.cardTitle}>Электронная почта</Text>
                       <View style={styles.icon}>
                           <Text style={styles.cardInfo}>support@somon.tv</Text>
                       </View>
                   </View>
               </View>
            </View>
        </View>
    )
}

export default ContactScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    content: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 0,
    },
    card:{
        shadowColor: colors.gray,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,

        marginVertical: 5,
        backgroundColor: colors.gray,
        marginHorizontal: 5,
    },
    cardContent: {
        paddingVertical: 12.5,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    cardHeader:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: "center",
        paddingTop: 12.5,
        paddingBottom: 25,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 1,
    },
    cardTitle:{
        color:colors.secondary,
        fontWeight:'bold',
    },
    cardInfo:{
        color:colors.secondary,
        fontSize: 12
    },
    image: {
        width: 170,
        height: 30,
        marginBottom: 20,
        marginTop: 20,
    },
    icons:{
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center'
    },
    icon:{
        marginLeft: 10,
        marginRight: 10,
        fontSize: 25,
    },
    logo:{
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginTop:10,
    }
})
