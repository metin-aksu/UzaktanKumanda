/**
 * WebSocket Test Component
 * iOS Simulator'da WebSocket bağlantısını test eder
 */

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomWebSocket from '../services/CustomWebSocket';

const WebSocketTest = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [ws, setWs] = useState(null);
  const [port, setPort] = useState('3000');

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testConnection = (testPort) => {
    const selectedPort = testPort || port;
    addLog('🧪 Test başlatılıyor...');
    addLog(`📍 IP: 192.168.50.225:${selectedPort}`);
    
    try {
      addLog(`🔧 CustomWebSocket kullanılıyor (Origin header YOK)`);
      // CustomWebSocket kullan - Origin header eklemez!
      const websocket = new CustomWebSocket(`ws://192.168.50.225:${selectedPort}`);
      
      const timeout = setTimeout(() => {
        addLog('❌ TIMEOUT - 10 saniye içinde bağlantı kurulamadı');
        websocket.close();
      }, 10000);

      websocket.onopen = () => {
        clearTimeout(timeout);
        addLog('✅ WebSocket AÇILDI!');
        addLog('📤 Register mesajı gönderiliyor...');
        
        const registerMsg = {
          type: 'register',
          id: 'register_0',
          payload: {
            forcePairing: false,
            pairingType: 'PROMPT',
            manifest: {
              manifestVersion: 1,
              appVersion: '1.1.1128',
              signed: {
                created: '20140509',
                appId: 'com.lge.test',
                vendorId: 'com.lge',
                localizedAppNames: {
                  '': 'LG Remote App',
                  'ko-KR': 'ЛГ Ремоте Апп',
                  'zxx-XX': 'ЛГ Ремоте Апп'
                },
                localizedVendorNames: {
                  '': 'LG Electronics'
                },
                permissions: [
                  'TEST_SECURE',
                  'CONTROL_INPUT_TEXT',
                  'CONTROL_MOUSE_AND_KEYBOARD',
                  'READ_INSTALLED_APPS',
                  'READ_LGE_SDX',
                  'READ_NOTIFICATIONS',
                  'SEARCH',
                  'WRITE_SETTINGS',
                  'WRITE_NOTIFICATIONS',
                  'CONTROL_POWER',
                  'READ_CURRENT_CHANNEL',
                  'READ_RUNNING_APPS',
                  'READ_UPDATE_INFO',
                  'UPDATE_FROM_REMOTE_APP',
                  'READ_LGE_TV_INPUT_EVENTS',
                  'READ_TV_CURRENT_TIME'
                ],
                signatures: [{
                  signatureVersion: 1,
                  signature: 'eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOspDnBiGRfCJYbT4aFe6TuVPPr/3u2p05mGJ86Y00EZB6hUKKcVjS0HkUXLUW2PExvgB6W5w.eyJhcHBJZCI6ImNvbS5sZ2UudGVzdCIsImNyZWF0ZWQiOiIyMDE0MDUwOSIsImxvY2FsaXplZEFwcE5hbWVzIjp7IiI6IkxHIFJlbW90ZSBQYXJ0bmVyIiwiYS1BUiI6IsKnwqzCoMKnwr3CqcK3wrfCp8K9wqfCrcKfIiwidHItVFIiOiJMRyBSZW1vdGUgUGFydG5lciJ9LCJsb2NhbGl6ZWRWZW5kb3JOYW1lcyI6eyIiOiJMRyBFbGVjdHJvbmljcyJ9LCJtYW5pZmVzdFZlcnNpb24iOjEsInBlcm1pc3Npb25zIjpbIlRFU1RfU0VDVVJFIiwiQ09OVFJPTF9JTlBVVF9URVhUIiwiQ09OVFJPTF9NT1VTRV9BTkRfS0VZQk9BUkQiLCJSRUFEX0lOU1RBTExFRF9BUFBTIiwiUkVBRF9MR0VfU0RYIiwiUkVBRF9OT1RJRklDQVRJT05TIiwiU0VBUkNIIiwiV1JJVEVfU0VUVElOR1MiLCJXUklURV9OT1RJRklDQVRJT05TIiwiQ09OVFJPTF9QT1dFUiIsIlJFQURfQ1VSUkVOVF9DSEFOTkVMIiwiUkVBRF9SVU5OSU5HX0FQUFMiLCJSRUFEX1VQREFURV9JTkZPIiwiVVBEQVRFX0ZST01fUkVNT1RFX0FQUCIsIlJFQURfTEdFX1RWX0lOUFVUX0VWRU5UUyIsIlJFQURfVFZfQ1VSUkVOVF9USU1FIl0sInNlcmlhbCI6IjJmOTMwZTRkLTk3MWYtYTk3ZC1hYTVhLWMyZDliMDNkM2M0YSIsInZlbmRvcklkIjoiY29tLmxnZSJ9'
                }]
              }
            }
          }
        };
        
        websocket.send(JSON.stringify(registerMsg));
      };

      websocket.onmessage = (event) => {
        addLog('📨 Mesaj alındı: ' + event.data.substring(0, 100));
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'registered') {
            addLog('✅ BAŞARILI! Client key: ' + msg.payload['client-key']);
          }
        } catch (e) {
          addLog('⚠️ JSON parse hatası');
        }
      };

      websocket.onerror = (error) => {
        clearTimeout(timeout);
        addLog('❌ HATA: ' + JSON.stringify(error));
      };

      websocket.onclose = (event) => {
        clearTimeout(timeout);
        addLog('🔌 Kapatıldı - Kod: ' + event.code);
        addLog('📄 Reason: ' + (event.reason || 'Yok'));
        addLog('🔍 wasClean: ' + event.wasClean);
        addLog('📊 Full event: ' + JSON.stringify(event, null, 2));
      };

      setWs(websocket);
    } catch (error) {
      addLog('❌ Exception: ' + error.message);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setWs(null);
      addLog('🔌 Bağlantı kapatıldı');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>◄ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>WebSocket Test</Text>
      </View>
      
      <View style={styles.portButtons}>
        <Text style={styles.portLabel}>Port Seç:</Text>
        <TouchableOpacity 
          style={[styles.portButton, port === '3000' && styles.portButtonActive]}
          onPress={() => { setPort('3000'); testConnection('3000'); }}>
          <Text style={styles.portButtonText}>3000</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.portButton, port === '3001' && styles.portButtonActive]}
          onPress={() => { setPort('3001'); testConnection('3001'); }}>
          <Text style={styles.portButtonText}>3001</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.portButton, port === '36866' && styles.portButtonActive]}
          onPress={() => { setPort('36866'); testConnection('36866'); }}>
          <Text style={styles.portButtonText}>36866</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttons}>
        <Button title="🔌 Kapat" onPress={disconnect} />
        <Button title="🗑️ Temizle" onPress={clearLogs} />
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 50,
  },
  portButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  portLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  portButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  portButtonActive: {
    backgroundColor: '#2196f3',
  },
  portButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
  },
  logText: {
    color: '#00ff00',
    fontFamily: 'Courier',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default WebSocketTest;
