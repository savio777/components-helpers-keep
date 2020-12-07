import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import GeolocationService from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function localization(testarGPS = false) {
  return new Promise(async function (resolve, reject) {
    console.log('teste locate');
    try {
      if (testarGPS) {
        let responseTesteGpsOn = await DeviceInfo.isLocationEnabled();

        console.log('res teste gps', responseTesteGpsOn);

        if (!responseTesteGpsOn) {
          Alert.alert(
            'Localização desligada',
            'Necessitamos que você ative o GPS e tente novamente',
            [
              {
                text: 'Tentar novamente',
                onPress: () => {
                  return resolve(localization());
                },
              },
            ],
          );
        }
      }
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
        Geolocation.getCurrentPosition(
          async (position) => {
            console.log('coordenadas encontradas');
            // salvar no storage
            await AsyncStorage.setItem(
              'geopositionSave',
              JSON.stringify(position),
            );
            resolve(position);
          },
          (error) => {
            console.log('erro gps~> ', error.message);
            return resolve(localization(true));
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      } else if (Platform.OS === 'android') {
        console.log('teste android');

        const grant = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Acesso ao GPS',
            message: 'Precisamos do acesso ao GPS',
            buttonNeutral: 'Depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceitar',
          },
        );

        console.log('grant: ', grant);

        if (grant === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('teste permissão');
          GeolocationService.getCurrentPosition(
            async (position) => {
              console.log('coordenadas encontradas~> ', position);
              // salvar no storage
              await AsyncStorage.setItem(
                'geopositionSave',
                JSON.stringify(position),
              );
              resolve(position);
            },
            (error) => {
              console.log('err gps android', error);
              return resolve(localization(true));
            },
            {enableHighAccuracy: false, timeout: 1000},
          );
        } else {
          return resolve(localization());
        }
      }
    } catch (error) {
      console.log('err gps: ', error);
      Alert.alert('ERRO: ', `${error}`, [
        {text: 'De novo', onPress: () => localization()},
      ]);
    }
  });
}
