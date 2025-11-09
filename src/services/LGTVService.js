/**
 * LG WebOS TV Control Service
 * LG televizyonları WebSocket üzerinden kontrol edilir
 */

import CustomWebSocket from './CustomWebSocket';

class LGTVService {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.clientKey = null;
    this.commandId = 1;
    this.callbacks = {};
    this.listeners = [];
    this.port = 3000; // LG WebOS default port
    this.inputSocket = null; // Input socket için property
    this.host = null; // TV IP adresini saklamak için
  }

  /**
   * TV'ye bağlan
   * @param {string} ip - TV'nin IP adresi
   * @param {string} clientKey - Daha önce kaydedilmiş client key (varsa)
   */
  connect(ip, clientKey) {
    return new Promise((resolve, reject) => {
      console.log('🔌 WebSocket bağlantısı başlatılıyor:', `ws://${ip}:${this.port}`);
      this.host = ip; // Host'u daha sonra input socket için sakla
      
      // Timeout ekleyelim
      const timeout = setTimeout(() => {
        console.log('❌ TIMEOUT: 10 saniye içinde bağlantı kurulamadı');
        if (this.ws) {
          this.ws.close();
        }
        reject(new Error('Bağlantı zaman aşımına uğradı'));
      }, 10000);
      
      // CustomWebSocket kullan - Origin header eklemez!
      this.ws = new CustomWebSocket(`ws://${ip}:${this.port}`);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        console.log('✅ WebSocket bağlantısı açıldı');
        this.register(clientKey)
          .then(newClientKey => {
            console.log('✅ Kayıt başarılı');
            resolve(newClientKey);
          })
          .catch(error => {
            console.log('❌ Kayıt başarısız:', error);
            reject(error);
          });
      };

      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        console.log('❌ WebSocket hatası:', error);
        reject(new Error('WebSocket bağlantı hatası'));
      };

      this.ws.onclose = (event) => {
        clearTimeout(timeout);
        console.log('🔌 Ana WebSocket kapatıldı. Kod:', event.code);
        if (this.inputSocket) {
          this.inputSocket.close();
          this.inputSocket = null;
        }
        this.connected = false;
        if (event.code === 1008) {
          reject(new Error('TV bağlantıyı reddetti (1008).'));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 TV\'den mesaj:', message);
          
          if (message.id && this.callbacks[message.id]) {
            const callback = this.callbacks[message.id];
            // 'registered' mesajı gelene kadar register callback'ini silme
            if (message.id !== 'register_0' || message.type === 'registered') {
               delete this.callbacks[message.id];
            }
            callback(message);
          }
          
          this.listeners.forEach(listener => listener(message));
        } catch (error) {
          console.error('Mesaj parse hatası:', error);
        }
      };
    });
  }

  /**
   * TV'ye kaydol
   */
  register(clientKey) {
    return new Promise((resolve, reject) => {
      this.clientKey = clientKey;
      
      const registerPayload = {
        type: 'register',
        id: 'register_0', // Sabit bir ID kullanalım
        payload: {
          forcePairing: false,
          pairingType: 'PROMPT',
          'client-key': clientKey,
          manifest: {
            manifestVersion: 1,
            appVersion: '1.1',
            signed: {
              created: '20140509',
              appId: 'com.lge.test',
              vendorId: 'com.lge',
              localizedAppNames: {
                '': 'LG Connect Apps',
                'ko-KR': 'LG Connect Apps',
                'zxx-XX': 'LG Connect Apps',
              },
              localizedVendorNames: {
                '': 'LG Electronics',
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
                'READ_TV_CURRENT_TIME',
              ],
              serial: '2f930e4d923a4859a918b8480d3771ca',
            },
            permissions: [
              'LAUNCH',
              'LAUNCH_WEBAPP',
              'APP_TO_APP',
              'CLOSE',
              'TEST_OPEN',
              'TEST_PROTECTED',
              'CONTROL_AUDIO',
              'CONTROL_DISPLAY',
              'CONTROL_INPUT_JOYSTICK',
              'CONTROL_INPUT_MEDIA_RECORDING',
              'CONTROL_INPUT_MEDIA_PLAYBACK',
              'CONTROL_INPUT_TV',
              'CONTROL_POWER',
              'READ_APP_STATUS',
              'READ_CURRENT_CHANNEL',
              'READ_INPUT_DEVICE_LIST',
              'READ_NETWORK_STATE',
              'READ_RUNNING_APPS',
              'READ_TV_CHANNEL_LIST',
              'WRITE_NOTIFICATION_TOAST',
              'READ_POWER_STATE',
              'READ_COUNTRY_INFO',
            ],
            signatures: [
              {
                signatureVersion: 1,
                signature:
                  'eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOspDnBiGRfCJYbT4aFe6TuVPPr/3u2p05mGJ86Y00EZB6hUKKcVjS0HkUXLUW2PExvgB6W5w.eyJhcHBJZCI6ImNvbS5sZ2UudGVzdCIsImNyZWF0ZWQiOiIyMDE0MDUwOSIsImxvY2FsaXplZEFwcE5hbWVzIjp7IiI6IkxHIFJlbW90ZSBQYXJ0bmVyIiwiZW4tVVMiOiJMRyBSZW1vdGUgUGFydG5lciJ9LCJsb2NhbGl6ZWRWZW5kb3JOYW1lcyI6eyIiOiJMRyBFbGVjdHJvbmljcyJ9LCJwZXJtaXNzaW9ucyI6WyJURVNUX1NFQ1VSRSIsIkNPTlRST0xfSU5QVVRfVEVYVCIsIkNPTlRST0xfTU9VU0VfQU5EX0tFWUJPQVJEIiwiUkVBRF9JTlNUQUxMRURfQVBQUyIsIlJFQURfTk9USUZJQ0FUSU9OUyIsIlNFQVJDSCIsIldSSVRFX1NFVFRJTkdTIiwiV1JJVEVfTk9USUZJQ0FUSU9OUyIsIkNPTlRST0xfUE9XRVIiLCJSRUFEX0NVUlJFTlRfQ0hBTk5FTCIsIlJFQURfUlVOTklOR19BUFBTIiwiUkVBRF9VUERBVEVfSU5GTyIsIlVQREFURV9GUk9NX1JFTU9URV9BUFAiXSwic2VyaWFsIjoiMmY5MzBlNGQ5MjNhNDg1OWE5MThiODQ4MGQzNzcxY2EifQ==',
              },
            ],
          },
        },
      };

      const callbackId = registerPayload.id;
      
      this.callbacks[callbackId] = (response) => {
        console.log('📥 Register callback çağrıldı:', response.type);
        
        if (response.type === 'response' && response.payload?.pairingType === 'PROMPT') {
          console.log('📺 TV onay bekliyor...');
          return;
        }
        
        if (response.type === 'registered') {
          this.clientKey = response.payload['client-key'];
          this.connected = true;
          console.log('✅ Kayıt başarılı! Client key:', this.clientKey);
          delete this.callbacks[callbackId];
          resolve(this.clientKey);
        } else if (response.type === 'error') {
          delete this.callbacks[callbackId];
          reject(new Error(response.error));
        }
      };

      this.sendCommand(registerPayload);
    });
  }

  /**
   * Komut gönder
   */
  sendCommand(payload) {
    if (this.ws && this.ws.isOpen()) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.error('❌ WebSocket açık değil, komut gönderilemedi');
    }
  }

  /**
   * Request gönder
   */
  request(uri, payload = {}) {
    return new Promise((resolve, reject) => {
      const command = {
        type: 'request',
        id: this.commandId++,
        uri: uri,
        payload: payload,
      };

      const callbackId = command.id;
      this.callbacks[callbackId] = (response) => {
        if (response.type === 'response' || response.type === 'subscribed') {
          resolve(response.payload);
        } else if (response.type === 'error') {
          reject(new Error(response.error));
        }
      };

      this.sendCommand(command);

      setTimeout(() => {
        if (this.callbacks[callbackId]) {
          delete this.callbacks[callbackId];
          reject(new Error(`Request timeout for URI: ${uri}`));
        }
      }, 10000);
    });
  }

  /**
   * Tuş gönder - Gerekirse Input Socket kullanarak
   */
  async sendKey(key) {
    console.log(`🎮 Tuş gönderiliyor: ${key}`);
    const simpleCommands = ['VOLUMEUP', 'VOLUMEDOWN', 'MUTE', 'PLAY', 'PAUSE', 'STOP', 'REWIND', 'FASTFORWARD', 'CHANNELUP', 'CHANNELDOWN'];
    
    if (simpleCommands.includes(key)) {
      return this.sendSimpleKey(key);
    }

    try {
      if (!this.inputSocket || !this.inputSocket.isOpen()) {
        console.log('🔌 Input socket bağlantısı kuruluyor...');
        const response = await this.request('ssap://com.webos.service.networkinput/getPointerInputSocket');
        
        if (response && response.socketPath) {
          await this.connectInputSocket(response.socketPath);
        } else {
          throw new Error('TV, input socket path döndürmedi.');
        }
      }
      return this.sendButtonViaInputSocket(key);

    } catch (error) {
      console.error('❌ Input socket işlemi başarısız:', error.message);
      return this.request('ssap://system.notifications/createToast', {
        message: `${key} tuşu gönderilemedi: ${error.message}`
      });
    }
  }

  /**
   * Input Socket'e bağlan
   */
  connectInputSocket(socketPath) {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Input socket'e bağlanılıyor: ${socketPath}`);

      if (this.inputSocket) {
        this.inputSocket.close();
      }

      this.inputSocket = new CustomWebSocket(socketPath);

      this.inputSocket.onopen = () => {
        console.log('✅ Input socket bağlantısı AÇILDI!');
        resolve();
      };

      this.inputSocket.onerror = (error) => {
        console.error('❌ Input socket hatası:', error.message);
        this.inputSocket = null;
        reject(new Error('Input socket bağlantı hatası.'));
      };

      this.inputSocket.onclose = (event) => {
        console.log('🔌 Input socket KAPANDI.', event.code, event.reason);
        this.inputSocket = null;
      };

      this.inputSocket.onmessage = (event) => {
        console.log('📨 Input socket mesajı:', event.data);
      };
    });
  }

  /**
   * Input Socket üzerinden tuş komutu gönder
   */
  sendButtonViaInputSocket(key) {
    if (this.inputSocket && this.inputSocket.isOpen()) {
      const message = `type:button\nname:${key}\n\n`;
      console.log(`📤 Input socket'e gönderiliyor: ${key}`);
      this.inputSocket.send(message);
    } else {
      console.error('❌ Input socket hazır değil, tuş gönderilemedi.');
      throw new Error('Input socket bağlantısı kapalı.');
    }
  }

  /**
   * Basit tuş gönderme (Ana soket üzerinden)
   */
  async sendSimpleKey(key) {
    console.log(`⚙️ Ana soket: Basit tuş gönderiliyor: ${key}`);
    
    if (key === 'VOLUMEUP') {
      return this.request('ssap://audio/volumeUp');
    }
    if (key === 'VOLUMEDOWN') {
      return this.request('ssap://audio/volumeDown');
    }
    if (key === 'MUTE') {
      const { muted } = await this.getVolume();
      return this.setMute(!muted);
    }
    if (key === 'CHANNELUP') {
      return this.request('ssap://tv/channelUp');
    }
    if (key === 'CHANNELDOWN') {
      return this.request('ssap://tv/channelDown');
    }
    
    const mediaCommands = {
      'PLAY': 'ssap://media.controls/play',
      'PAUSE': 'ssap://media.controls/pause',
      'STOP': 'ssap://media.controls/stop',
      'REWIND': 'ssap://media.controls/rewind',
      'FASTFORWARD': 'ssap://media.controls/fastForward',
    };
    if (mediaCommands[key]) {
      return this.request(mediaCommands[key]);
    }

    console.warn(`🤔 ${key} için basit komut bulunamadı.`);
  }

  /**
   * Ses seviyesini al
   */
  async getVolume() {
    return this.request('ssap://audio/getVolume');
  }
  
  /**
   * Ses seviyesini ayarla
   */
  async setVolume(volume) {
    return this.request('ssap://audio/setVolume', { volume });
  }

  /**
   * Sesi aç/kapat
   */
  async setMute(mute) {
    return this.request('ssap://audio/setMute', { mute });
  }

  /**
   * Kanal değiştir
   */
  async setChannel(channelNumber) {
    return this.request('ssap://tv/openChannel', { channelNumber });
  }

  /**
   * Mevcut kanalı al
   */
  async getCurrentChannel() {
    return this.request('ssap://tv/getCurrentChannel');
  }

  /**
   * TV'yi kapat
   */
  async turnOff() {
    return this.request('ssap://system/turnOff');
  }

  /**
   * Yüklü uygulamaları listele
   */
  async listApps() {
    return this.request('ssap://com.webos.applicationManager/listApps');
  }

  /**
   * Uygulama başlat
   */
  async launchApp(appId) {
    return this.request('ssap://system.launcher/launch', { id: appId });
  }

  /**
   * Input değiştir
   */
  async switchInput(inputId) {
    return this.request('ssap://tv/switchInput', { inputId });
  }

  /**
   * Event listener ekle
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Event listener kaldır
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Listener'ları bilgilendir
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => callback(event, data));
  }

  /**
   * Bağlantıyı kapat
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.inputSocket) {
      this.inputSocket.close();
      this.inputSocket = null;
    }
    this.connected = false;
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  isConnected() {
    return this.connected && this.ws && this.ws.isOpen();
  }
}

export default LGTVService;
