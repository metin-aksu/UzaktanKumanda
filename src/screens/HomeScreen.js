/**
 * Home Screen - TV Discovery and List
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import TVList from '../components/TVList';
import TVDiscoveryService from '../services/TVDiscoveryService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualIP, setManualIP] = useState('');
  const [manualType, setManualType] = useState('lg');

  const [discoveryService] = useState(() => new TVDiscoveryService());

  useEffect(() => {
    loadSavedDevices();
    
    return () => {
      discoveryService.stopDiscovery();
    };
  }, [discoveryService]);

  const loadSavedDevices = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedDevices');
      if (saved) {
        setDevices(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Kayıtlı cihazlar yüklenemedi:', error);
    }
  };

  const saveDevices = async (deviceList) => {
    try {
      await AsyncStorage.setItem('savedDevices', JSON.stringify(deviceList));
    } catch (error) {
      console.error('Cihazlar kaydedilemedi:', error);
    }
  };

  const handleDiscovery = async () => {
    setIsScanning(true);
    
    try {
      discoveryService.addListener((event, data) => {
        if (event === 'deviceFound') {
          setDevices(prev => {
            const exists = prev.find(d => d.ip === data.ip);
            if (!exists) {
              const newDevices = [...prev, data];
              saveDevices(newDevices);
              return newDevices;
            }
            return prev;
          });
        }
      });

      await discoveryService.startDiscovery(5000);
      
      if (discoveryService.getDevices().length === 0) {
        Alert.alert(
          'Televizyon Bulunamadı',
          'Ağda televizyon bulunamadı. Manuel olarak eklemek ister misiniz?',
          [
            { text: 'Hayır', style: 'cancel' },
            { text: 'Evet', onPress: () => setShowManualInput(true) },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Hata', 'Tarama sırasında bir hata oluştu: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualAdd = () => {
    if (!manualIP) {
      Alert.alert('Hata', 'Lütfen IP adresi girin');
      return;
    }

    const device = {
      name: manualType === 'lg' ? 'LG TV' : 'Philips TV',
      type: manualType,
      ip: manualIP,
      port: manualType === 'lg' ? 3000 : 1925,
      manual: true,
      discovered: new Date(),
    };

    const newDevices = [...devices, device];
    setDevices(newDevices);
    saveDevices(newDevices);
    
    setShowManualInput(false);
    setManualIP('');
    
    Alert.alert('Başarılı', 'Televizyon eklendi');
  };

  const handleSelectDevice = (device) => {
    navigation.navigate('Control', { device });
  };

  return (
    <View style={styles.container}>
      <TVList
        devices={devices}
        onSelectDevice={handleSelectDevice}
        onDiscovery={handleDiscovery}
        isScanning={isScanning}
      />

      <TouchableOpacity
        style={styles.manualAddButton}
        onPress={() => setShowManualInput(true)}>
        <Text style={styles.manualAddButtonText}>+ Manuel Ekle</Text>
      </TouchableOpacity>

      <Modal
        visible={showManualInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualInput(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manuel TV Ekle</Text>
            
            <Text style={styles.label}>IP Adresi:</Text>
            <TextInput
              style={styles.input}
              value={manualIP}
              onChangeText={setManualIP}
              placeholder="192.168.1.100"
              keyboardType="numeric"
            />

            <Text style={styles.label}>TV Tipi:</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  manualType === 'lg' && styles.typeButtonActive,
                ]}
                onPress={() => setManualType('lg')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    manualType === 'lg' && styles.typeButtonTextActive,
                  ]}>
                  LG
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  manualType === 'philips' && styles.typeButtonActive,
                ]}
                onPress={() => setManualType('philips')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    manualType === 'philips' && styles.typeButtonTextActive,
                  ]}>
                  Philips
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowManualInput(false)}>
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleManualAdd}>
                <Text style={styles.modalButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  manualAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  manualAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  addButton: {
    backgroundColor: '#4caf50',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
