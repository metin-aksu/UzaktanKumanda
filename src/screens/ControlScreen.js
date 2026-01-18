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
  Linking,
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
  const [channelBuffer, setChannelBuffer] = useState('');
  const [channelTimer, setChannelTimer] = useState(null);

  useEffect(() => {
    connectToTV();

    return () => {
      if (tvService) {
        tvService.disconnect();
      }
      if (channelTimer) {
        clearTimeout(channelTimer);
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
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Error',
        `Could not connect to TV. Make sure the TV is on and on the network.`,
        [
          { text: 'Back', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: connectToTV },
        ]
      );
    } finally {
      setConnecting(false);
    }
  };

  const connectLGTV = async () => {
    console.log('🔧 Connecting to LG TV...');
    console.log('📍 IP:', device.ip);

    const service = new LGTVService();

    // Kayıtlı client key'i yükle
    const clientKey = await AsyncStorage.getItem(`lg_client_key_${device.ip}`);
    console.log('🔑 Saved client key:', clientKey ? 'Exists' : 'None');

    try {
      console.log('⏳ Connecting...');
      const newClientKey = await service.connect(device.ip, clientKey);
      console.log('✅ Connection successful!');

      // Yeni client key'i kaydet
      if (newClientKey && newClientKey !== clientKey) {
        console.log('💾 Saving new client key...');
        await AsyncStorage.setItem(`lg_client_key_${device.ip}`, newClientKey);
      }

      // Volume is no longer displayed

      setTvService(service);
    } catch (error) {
      throw error;
    }
  };

  const connectPhilipsTV = async () => {
    const service = new PhilipsTVService();

    try {
      await service.connect(device.ip);

      // Volume is no longer displayed

      setTvService(service);
    } catch (error) {
      throw error;
    }
  };

  const handleChannelNumber = (digit) => {
    // Cancel existing timer
    if (channelTimer) {
      clearTimeout(channelTimer);
    }

    // Add digit to buffer
    const newBuffer = channelBuffer + digit;
    setChannelBuffer(newBuffer);

    // Wait, then switch to channel
    const timer = setTimeout(async () => {
      console.log(`📺 Switching to channel ${newBuffer}...`);
      try {
        await tvService.request('ssap://tv/openChannel', {
          channelNumber: newBuffer
        });
        setChannelBuffer('');
      } catch (error) {
        console.error('Channel change error:', error);
        Alert.alert('Error', `Could not switch to channel ${newBuffer}`);
        setChannelBuffer('');
      }
    }, 1200);

    setChannelTimer(timer);
  };

  const handleKeyPress = async (key) => {
    if (!tvService || !connected) {
      Alert.alert('Error', `Not connected to TV`);
      return;
    }

    // Handle number keys specially
    if (key.startsWith('DIGIT_')) {
      const digit = key.replace('DIGIT_', '');
      handleChannelNumber(digit);
      return;
    }

    try {
      if (device.type === 'lg') {
        await handleLGKey(key);
      } else if (device.type === 'philips') {
        await handlePhilipsKey(key);
      }
    } catch (error) {
      console.error('Command sending error:', error);
      Alert.alert('Error', 'Could not send command: ' + error.message);
    }
  };

  const handleLGKey = async (key) => {
    // Bağlantı kopuksa yeniden bağlan
    if (!tvService || !tvService.ws || tvService.ws.readyState !== 1) {
      console.log('⚠️ Connection lost, reconnecting...');
      Alert.alert('Connection Lost', 'Connection to TV lost. Reconnecting...');
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
      Alert.alert('Turning Off TV', 'TV is turning off...');
      navigation.goBack();
    } else if (keyMap[key]) {
      // Send actual key
      try {
        await tvService.sendKey(keyMap[key]);
        console.log(`✅ Key sent: ${keyMap[key]}`);
      } catch (error) {
        console.error(`❌ Key send failed: ${error.message}`);
        Alert.alert('❌ Error', error.message);
      }
    }

    // Volume is no longer displayed
  };

  const handlePhilipsKey = async (key) => {
    if (key === 'POWER') {
      await tvService.standby();
      Alert.alert('Turning Off TV', 'TV is going to standby mode...');
      navigation.goBack();
    } else if (key === 'AMBILIGHT') {
      try {
        const ambilightStatus = await tvService.getAmbilightSettings();
        if (ambilightStatus) {
          const newState = ambilightStatus.power === 'On' ? false : true;
          await tvService.setAmbilight(newState);
          Alert.alert('Ambilight', newState ? 'On' : 'Off');
        }
      } catch (error) {
        Alert.alert('Error', `Ambilight is not supported on this TV`);
      }
    } else if (PhilipsKeys[key]) {
      await tvService.sendKey(PhilipsKeys[key]);
    }

    // Volume is no longer displayed
  };

  const cancelConnection = () => {
    console.log('❌ Connection cancelled by user');
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
        <Text style={styles.loadingText}>Connecting to TV...</Text>
        <Text style={styles.deviceInfo}>{device.name}</Text>
        <Text style={styles.deviceInfo}>{device.ip}</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={cancelConnection}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>◄ Back</Text>
        </TouchableOpacity>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceIP}>{device.ip}</Text>
          <View style={[styles.statusIndicator,
          connected ? styles.connectedIndicator : styles.disconnectedIndicator]}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <RemoteControl onKeyPress={handleKeyPress} tvType={device.type} />
        <TouchableOpacity onPress={() => Linking.openURL('https://www.metinaksu.com')}>
          <Text style={styles.authorText}>Metin Aksu - metinaksu.com</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#000',
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#4e4b4bff',
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
    color: '#fff',
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
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 80,
  },
  authorText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ControlScreen;
