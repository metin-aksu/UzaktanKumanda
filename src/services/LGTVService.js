/**
 * LG WebOS TV Control Service
 * LG televizyonları WebSocket üzerinden kontrol edilir
 */

class LGTVService {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.clientKey = null;
    this.commandId = 1;
    this.callbacks = {};
    this.listeners = [];
  }

  /**
   * TV'ye bağlan
   * @param {string} ipAddress - TV'nin IP adresi
   * @param {string} clientKey - Daha önce kaydedilmiş client key (varsa)
   */
  connect(ipAddress, clientKey = null) {
    return new Promise((resolve, reject) => {
      try {
        const url = `ws://${ipAddress}:3000`;
        this.ws = new WebSocket(url);
        this.clientKey = clientKey;

        this.ws.onopen = () => {
          console.log('LG TV WebSocket bağlantısı açıldı');
          this.register()
            .then(() => {
              this.connected = true;
              resolve(this.clientKey);
            })
            .catch(reject);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('LG TV WebSocket hatası:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('LG TV WebSocket bağlantısı kapandı');
          this.connected = false;
          this.notifyListeners('disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * TV'ye kaydol
   */
  register() {
    return new Promise((resolve, reject) => {
      const registerPayload = {
        type: 'register',
        id: this.commandId++,
        payload: {
          forcePairing: false,
          pairingType: 'PROMPT',
          'client-key': this.clientKey,
          manifest: {
            manifestVersion: 1,
            appVersion: '1.0.0',
            signed: {
              created: '20240101',
              appId: 'com.uzaktankumanda.app',
              vendorId: 'com.uzaktankumanda',
              localizedAppNames: {
                '': 'Uzaktan Kumanda',
                'tr-TR': 'Uzaktan Kumanda',
              },
              localizedVendorNames: {
                '': 'Uzaktan Kumanda',
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

      const callbackId = registerPayload.id;
      this.callbacks[callbackId] = (response) => {
        if (response.type === 'registered') {
          this.clientKey = response.payload['client-key'];
          resolve(this.clientKey);
        } else if (response.type === 'error') {
          reject(new Error(response.error));
        }
      };

      this.sendCommand(registerPayload);
    });
  }

  /**
   * Mesaj işleyici
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      if (message.id && this.callbacks[message.id]) {
        this.callbacks[message.id](message);
        delete this.callbacks[message.id];
      }

      this.notifyListeners('message', message);
    } catch (error) {
      console.error('Mesaj işleme hatası:', error);
    }
  }

  /**
   * Komut gönder
   */
  sendCommand(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
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
        if (response.type === 'response') {
          resolve(response.payload);
        } else if (response.type === 'error') {
          reject(new Error(response.error));
        }
      };

      this.sendCommand(command);

      // Timeout
      setTimeout(() => {
        if (this.callbacks[callbackId]) {
          delete this.callbacks[callbackId];
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Tuş bas
   */
  async sendKey(key) {
    return this.request('ssap://com.webos.service.ime/sendEnterKey', {
      key: key,
    });
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
      this.connected = false;
    }
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default LGTVService;
