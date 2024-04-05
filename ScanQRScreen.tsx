import {
  useCameraPermission,
  useCodeScanner,
  useCameraDevice,
  Camera,
  CameraDevice,
} from 'react-native-vision-camera';
import {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

import {View, Text} from 'react-native-ui-lib';

type Props = NativeStackNavigationProp<
  RootStackParamList,
  'TransferConfirmation'
>; // this is for the navigation prop for the screen typescriptting

interface ScanQRScreenProps {
    navigation: Props;
    route: any;
}

function ScanQRScreen({navigation, route}: ScanQRScreenProps) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
        let code = codes[0].value as string;
        // Split by "|"
        let parts = code.split('|');
        let codeType = parts[0];
        if (codeType === 'IBAN') {
            let iban = parts[1];
            let amount = 0;
            if (parts.length === 4) {
                try {
                amount = parseFloat(parts[3]);
                } catch (e) {
                    console.error('Invalid amount:', parts[3]);
                    amount = 0;
                }
            }
            console.log('Scanned IBAN:', iban);
            navigation.navigate('Overview', {
                screen: 'Transfer',
                params: {
                    ibanProp: iban,
                    amountProp: amount,
                    notesProp: ''
                },
            });
        }
    },
  });

return (
    <View flex>
    {hasPermission && <Camera style={styles.camera}
        device={device as CameraDevice}
        isActive={true}
        codeScanner={codeScanner}>
    </Camera>}
    <View style={styles.overlay}>
        <View style={styles.border}></View>
    </View>

    </View>
);
}

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  overlayText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  border: {
    borderWidth: 2,
    borderColor: 'white',
    width: 200,
    height: 200,
    borderRadius: 10,
  }
});

export default ScanQRScreen;
