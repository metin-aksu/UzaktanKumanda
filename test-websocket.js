#!/usr/bin/env node

/**
 * LG TV WebSocket Test
 * TV'nin WebSocket sunucusunu test eder
 */

const WebSocket = require('ws');

const TV_IP = process.argv[2] || '192.168.50.225';
const WS_URL = `ws://${TV_IP}:3000`;

console.log('🧪 LG TV WebSocket Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Bağlantı: ${WS_URL}`);
console.log('');

const ws = new WebSocket(WS_URL);

const timeout = setTimeout(() => {
  console.log('❌ Zaman aşımı (10 saniye)');
  console.log('💡 TV\'nin WebSocket sunucusu yanıt vermiyor');
  ws.close();
  process.exit(1);
}, 10000);

ws.on('open', () => {
  clearTimeout(timeout);
  console.log('✅ WebSocket bağlantısı AÇILDI!');
  console.log('');
  console.log('📤 Register mesajı gönderiliyor...');
  
  const registerMessage = {
    type: 'register',
    id: 1,
    payload: {
      forcePairing: false,
      pairingType: 'PROMPT',
      manifest: {
        manifestVersion: 1,
        appVersion: '1.0.0',
        signed: {
          created: '20240101',
          appId: 'com.test.app',
          vendorId: 'com.test',
          localizedAppNames: {
            '': 'Test App',
          },
          localizedVendorNames: {
            '': 'Test',
          },
          permissions: [
            'TEST_SECURE',
            'CONTROL_INPUT_TEXT',
            'CONTROL_MOUSE_and_KEYBOARD',
            'READ_INSTALLED_APPS',
            'READ_LGE_SDX',
            'READ_NOTIFICATIONS',
            'SEARCH',
            'WRITE_SETTINGS',
            'WRITE_NOTIFICATION_ALERT',
            'CONTROL_POWER',
            'READ_CURRENT_CHANNEL',
            'READ_RUNNING_APPS',
            'READ_UPDATE_INFO',
            'UPDATE_FROM_REMOTE_APP',
            'READ_LGE_TV_INPUT_EVENTS',
            'READ_TV_CURRENT_TIME',
          ],
          signatures: [
            {
              signatureVersion: 1,
              signature: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
            },
          ],
        },
      },
    },
  };
  
  ws.send(JSON.stringify(registerMessage));
});

ws.on('message', (data) => {
  console.log('📨 Mesaj alındı:');
  try {
    const message = JSON.parse(data.toString());
    console.log(JSON.stringify(message, null, 2));
    
    if (message.type === 'registered') {
      console.log('');
      console.log('✅ TV\'ye KAYIT BAŞARILI!');
      console.log('🔑 Client Key:', message.payload['client-key']);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 LG TV WebSocket çalışıyor!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 2000);
    } else if (message.type === 'response' && message.payload && message.payload.pairingType === 'PROMPT') {
      console.log('');
      console.log('📺 TV ekranında ONAY bekliyor!');
      console.log('💡 TV kumandası ile "İzin Ver" seçeneğine basın');
    }
  } catch (error) {
    console.log('Raw:', data.toString());
  }
});

ws.on('error', (error) => {
  clearTimeout(timeout);
  console.log('❌ WebSocket HATASI:');
  console.error(error.message);
  console.log('');
  console.log('💡 Olası sebepler:');
  console.log('   • TV\'nin WebSocket sunucusu kapalı');
  console.log('   • Yanlış port (3000 yerine başka port)');
  console.log('   • Güvenlik duvarı engelliyor');
  process.exit(1);
});

ws.on('close', (code, reason) => {
  clearTimeout(timeout);
  console.log('');
  console.log('🔌 WebSocket bağlantısı KAPANDI');
  console.log(`📝 Kod: ${code}, Sebep: ${reason || 'Belirtilmedi'}`);
});
