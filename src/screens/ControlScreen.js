/**
 * Control Screen - TV Remote Control
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import RemoteControl from '../components/RemoteControl';
import LGTVService from '../services/LGTVService';
import PhilipsTVService, { PhilipsKeys } from '../services/PhilipsTVService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ControlScreen = ({ route, navigation }) => {
  const { device } = route.params;
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [tvService, setTvService] = useState(null);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    connectToTV();

    return () => {
      if (tvService) {
        tvService.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectToTV = async () => {
    try {
      setConnecting(true);

      if (device.type === 'lg') {
        await connectLGTV();
      } else if (device.type === 'philips') {
        await connectPhilipsTV();
      }

      setConnected(true);
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      Alert.alert(
        'Bağlantı Hatası',
        `TV'ye bağlanılamadı. TV'nin açık ve ağda olduğundan emin olun.`,
        [
          { text: 'Geri', onPress: () => navigation.goBack() },
          { text: 'Tekrar Dene', onPress: connectToTV },
        ]
      );
    } finally {
      setConnecting(false);
    }
  };

  const connectLGTV = async () => {
    console.log('🔧 LG TV bağlantısı başlatılıyor...');
    console.log('📍 IP:', device.ip);
    
    const service = new LGTVService();
    
    // Kayıtlı client key'i yükle
    const clientKey = await AsyncStorage.getItem(`lg_client_key_${device.ip}`);
    console.log('🔑 Kayıtlı client key:', clientKey ? 'Var' : 'Yok');
    
    try {
      console.log('⏳ Bağlantı kuruluyor...');
      const newClientKey = await service.connect(device.ip, clientKey);
      console.log('✅ Bağlantı başarılı!');
      
      // Yeni client key'i kaydet
      if (newClientKey && newClientKey !== clientKey) {
        console.log('💾 Yeni client key kaydediliyor...');
        await AsyncStorage.setItem(`lg_client_key_${device.ip}`, newClientKey);
      }

      // Ses seviyesini al
      try {
        console.log('🔊 Ses seviyesi alınıyor...');
        const volumeData = await service.getVolume();
        if (volumeData && volumeData.volume !== undefined) {
          setVolume(volumeData.volume);
          setMuted(volumeData.muted || false);
        }
      } catch (error) {
        console.error('Ses seviyesi alınamadı:', error);
      }

      setTvService(service);
    } catch (error) {
      throw error;
    }
  };

  const connectPhilipsTV = async () => {
    const service = new PhilipsTVService();
    
    try {
      await service.connect(device.ip);

      // Ses seviyesini al
      try {
        const volumeData = await service.getVolume();
        if (volumeData && volumeData.current !== undefined) {
          setVolume(volumeData.current);
          setMuted(volumeData.muted || false);
        }
      } catch (error) {
        console.error('Ses seviyesi alınamadı:', error);
      }

      setTvService(service);
    } catch (error) {
      throw error;
    }
  };

  const handleKeyPress = async (key) => {
    if (!tvService || !connected) {
      Alert.alert('Hata', `TV'ye bağlı değil`);
      return;
    }

    try {
      if (device.type === 'lg') {
        await handleLGKey(key);
      } else if (device.type === 'philips') {
        await handlePhilipsKey(key);
      }
    } catch (error) {
      console.error('Komut gönderme hatası:', error);
      Alert.alert('Hata', 'Komut gönderilemedi: ' + error.message);
    }
  };

  const handleLGKey = async (key) => {
    // Bağlantı kopuksa yeniden bağlan
    if (!tvService || !tvService.ws || tvService.ws.readyState !== 1) {
      console.log('⚠️ Bağlantı kopuk, yeniden bağlanılıyor...');
      Alert.alert('Bağlantı Koptu', 'TV ile bağlantı kesildi. Yeniden bağlanılıyor...');
      setConnected(false);
      await connectToTV();
      return;
    }

    const keyMap = {
      UP: 'UP',
      DOWN: 'DOWN',
      LEFT: 'LEFT',
      RIGHT: 'RIGHT',
      OK: 'ENTER',
      BACK: 'BACK',
      HOME: 'HOME',
      MENU: 'MENU',
      VOLUME_UP: 'VOLUMEUP',
      VOLUME_DOWN: 'VOLUMEDOWN',
      MUTE: 'MUTE',
      CHANNEL_UP: 'CHANNELUP',
      CHANNEL_DOWN: 'CHANNELDOWN',
      PLAY_PAUSE: 'PLAY',
      PAUSE: 'PAUSE',
      STOP: 'STOP',
      REWIND: 'REWIND',
      FAST_FORWARD: 'FASTFORWARD',
      INFO: 'INFO',
      RED: 'RED',
      GREEN: 'GREEN',
      YELLOW: 'YELLOW',
      BLUE: 'BLUE',
      DIGIT_0: '0',
      DIGIT_1: '1',
      DIGIT_2: '2',
      DIGIT_3: '3',
      DIGIT_4: '4',
      DIGIT_5: '5',
      DIGIT_6: '6',
      DIGIT_7: '7',
      DIGIT_8: '8',
      DIGIT_9: '9',
    };

    if (key === 'POWER') {
      await tvService.turnOff();
      Alert.alert('TV Kapatılıyor', 'TV kapatılıyor...');
      navigation.goBack();
    } else if (keyMap[key]) {
      // Gerçek tuş gönder
      try {
        await tvService.sendKey(keyMap[key]);
        console.log(`✅ Tuş gönderildi: ${keyMap[key]}`);
      } catch (error) {
        console.error(`❌ Tuş gönderilemedi: ${error.message}`);
        Alert.alert('❌ Hata', error.message);
      }
    }

    // Ses tuşları için seviye güncelle
    if (key === 'VOLUME_UP' || key === 'VOLUME_DOWN' || key === 'MUTE') {
      setTimeout(async () => {
        try {
          const volumeData = await tvService.getVolume();
          if (volumeData) {
            setVolume(volumeData.volume || 0);
            setMuted(volumeData.muted || false);
          }
        } catch (error) {
          console.error('Ses seviyesi güncellenemedi:', error);
        }
      }, 300);
    }
  };

  const handlePhilipsKey = async (key) => {
    if (key === 'POWER') {
      await tvService.standby();
      Alert.alert('TV Kapatılıyor', 'TV standby moduna alınıyor...');
      navigation.goBack();
    } else if (key === 'AMBILIGHT') {
      try {
        const ambilightStatus = await tvService.getAmbilightSettings();
        if (ambilightStatus) {
          const newState = ambilightStatus.power === 'On' ? false : true;
          await tvService.setAmbilight(newState);
          Alert.alert('Ambilight', newState ? 'Açıldı' : 'Kapatıldı');
        }
      } catch (error) {
        Alert.alert('Hata', `Ambilight bu TV'de desteklenmiyor`);
      }
    } else if (PhilipsKeys[key]) {
      await tvService.sendKey(PhilipsKeys[key]);
    }

    // Ses tuşları için seviye güncelle
    if (key === 'VOLUME_UP' || key === 'VOLUME_DOWN' || key === 'MUTE') {
      setTimeout(async () => {
        try {
          const volumeData = await tvService.getVolume();
          if (volumeData) {
            setVolume(volumeData.current || 0);
            setMuted(volumeData.muted || false);
          }
        } catch (error) {
          console.error('Ses seviyesi güncellenemedi:', error);
        }
      }, 300);
    }
  };

  const cancelConnection = () => {
    console.log('❌ Bağlantı kullanıcı tarafından iptal edildi');
    if (tvService) {
      tvService.disconnect();
    }
    setConnecting(false);
    navigation.goBack();
  };

  if (connecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>TV\'ye bağlanılıyor...</Text>
        <Text style={styles.deviceInfo}>{device.name}</Text>
        <Text style={styles.deviceInfo}>{device.ip}</Text>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={cancelConnection}>
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>◄ Geri</Text>
        </TouchableOpacity>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceIP}>{device.ip}</Text>
          <View style={[styles.statusIndicator, 
            connected ? styles.connectedIndicator : styles.disconnectedIndicator]}
          />
        </View>
      </View>

      <View style={styles.volumeContainer}>
        <Text style={styles.volumeLabel}>Ses: {muted ? '🔇' : '🔊'}</Text>
        <Text style={styles.volumeValue}>{volume}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <RemoteControl onKeyPress={handleKeyPress} tvType={device.type} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  deviceInfo: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  cancelButton: {
    marginTop: 30,
    backgroundColor: '#f44336',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 18,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  deviceHeader: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceIP: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  connectedIndicator: {
    backgroundColor: '#4caf50',
  },
  disconnectedIndicator: {
    backgroundColor: '#f44336',
  },
  volumeContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  volumeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  volumeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  scrollView: {
    flex: 1,
  },
});

export default ControlScreen;
