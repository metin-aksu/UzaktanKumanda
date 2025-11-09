/**
 * Philips TV Control Service
 * Philips televizyonları JointSpace API üzerinden HTTP ile kontrol edilir
 */

import axios from 'axios';

class PhilipsTVService {
  constructor() {
    this.baseUrl = null;
    this.apiVersion = 6; // Philips JointSpace API v6
    this.username = null;
    this.password = null;
  }

  /**
   * TV'ye bağlan
   * @param {string} ipAddress - TV'nin IP adresi
   * @param {string} username - API kullanıcı adı (genellikle boş)
   * @param {string} password - API şifresi (genellikle boş, bazı modellerde gerekli)
   */
  async connect(ipAddress, username = '', password = '') {
    this.baseUrl = `http://${ipAddress}:1925/${this.apiVersion}`;
    this.username = username;
    this.password = password;

    try {
      // TV'nin durumunu kontrol et
      const response = await this.getRequest('/system');
      return response.data;
    } catch (error) {
      // API v6 başarısız olursa v1 dene
      this.apiVersion = 1;
      this.baseUrl = `http://${ipAddress}:1925/${this.apiVersion}`;
      const response = await this.getRequest('/system');
      return response.data;
    }
  }

  /**
   * GET isteği gönder
   */
  async getRequest(endpoint) {
    const config = {};
    if (this.username && this.password) {
      config.auth = {
        username: this.username,
        password: this.password,
      };
    }

    return axios.get(`${this.baseUrl}${endpoint}`, config);
  }

  /**
   * POST isteği gönder
   */
  async postRequest(endpoint, data = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.username && this.password) {
      config.auth = {
        username: this.username,
        password: this.password,
      };
    }

    return axios.post(`${this.baseUrl}${endpoint}`, data, config);
  }

  /**
   * Tuş gönder
   */
  async sendKey(key) {
    return this.postRequest('/input/key', {
      key: key,
    });
  }

  /**
   * Ses seviyesini al
   */
  async getVolume() {
    const response = await this.getRequest('/audio/volume');
    return response.data;
  }

  /**
   * Ses seviyesini ayarla (0-60 arası)
   */
  async setVolume(volume) {
    return this.postRequest('/audio/volume', {
      current: volume,
    });
  }

  /**
   * Sesi aç/kapat
   */
  async setMute(mute) {
    return this.postRequest('/audio/volume', {
      muted: mute,
    });
  }

  /**
   * Mevcut kanalı al
   */
  async getCurrentChannel() {
    const response = await this.getRequest('/activities/tv');
    return response.data.channel;
  }

  /**
   * Kanal listesini al
   */
  async getChannelList() {
    const response = await this.getRequest('/channeldb/tv/channelLists/all');
    return response.data;
  }

  /**
   * Kanal değiştir
   */
  async setChannel(channelId) {
    return this.postRequest('/activities/tv', {
      channel: {
        id: channelId,
      },
      channelList: {
        id: 'allter',
      },
    });
  }

  /**
   * TV'nin mevcut durumunu al
   */
  async getSystemInfo() {
    const response = await this.getRequest('/system');
    return response.data;
  }

  /**
   * TV'yi standby moduna al
   */
  async standby() {
    return this.postRequest('/powerstate', {
      powerstate: 'Standby',
    });
  }

  /**
   * TV'yi aç
   */
  async turnOn() {
    return this.postRequest('/powerstate', {
      powerstate: 'On',
    });
  }

  /**
   * Güç durumunu al
   */
  async getPowerState() {
    const response = await this.getRequest('/powerstate');
    return response.data;
  }

  /**
   * Kaynak değiştir (HDMI, TV, etc.)
   */
  async switchSource(sourceId) {
    return this.postRequest('/sources/current', {
      id: sourceId,
    });
  }

  /**
   * Mevcut kaynağı al
   */
  async getCurrentSource() {
    const response = await this.getRequest('/sources/current');
    return response.data;
  }

  /**
   * Kaynak listesini al
   */
  async getSourceList() {
    const response = await this.getRequest('/sources');
    return response.data;
  }

  /**
   * Uygulamaları listele (Android TV modelleri için)
   */
  async listApps() {
    try {
      const response = await this.getRequest('/applications');
      return response.data.applications || [];
    } catch (error) {
      console.error('Uygulama listesi alınamadı:', error);
      return [];
    }
  }

  /**
   * Uygulama başlat
   */
  async launchApp(appId) {
    return this.postRequest('/activities/launch', {
      intent: {
        component: {
          packageName: appId,
        },
      },
    });
  }

  /**
   * Ambilight ayarlarını al (destekliyorsa)
   */
  async getAmbilightSettings() {
    try {
      const response = await this.getRequest('/ambilight/power');
      return response.data;
    } catch (error) {
      console.error('Ambilight desteklenmiyor');
      return null;
    }
  }

  /**
   * Ambilight aç/kapat
   */
  async setAmbilight(enabled) {
    try {
      return this.postRequest('/ambilight/power', {
        power: enabled ? 'On' : 'Off',
      });
    } catch (error) {
      console.error('Ambilight ayarlanamadı:', error);
      return null;
    }
  }

  /**
   * Bağlantıyı kapat
   */
  disconnect() {
    this.baseUrl = null;
    this.username = null;
    this.password = null;
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  isConnected() {
    return this.baseUrl !== null;
  }
}

// Philips TV tuş kodları
export const PhilipsKeys = {
  // Navigasyon
  UP: 'CursorUp',
  DOWN: 'CursorDown',
  LEFT: 'CursorLeft',
  RIGHT: 'CursorRight',
  OK: 'Confirm',
  BACK: 'Back',
  
  // Medya kontrol
  PLAY: 'Play',
  PAUSE: 'Pause',
  PLAY_PAUSE: 'PlayPause',
  STOP: 'Stop',
  FAST_FORWARD: 'FastForward',
  REWIND: 'Rewind',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  
  // Ses
  VOLUME_UP: 'VolumeUp',
  VOLUME_DOWN: 'VolumeDown',
  MUTE: 'Mute',
  
  // Kanal
  CHANNEL_UP: 'ChannelStepUp',
  CHANNEL_DOWN: 'ChannelStepDown',
  
  // Güç
  POWER: 'Standby',
  
  // Menü
  HOME: 'Home',
  MENU: 'Options',
  INFO: 'Info',
  
  // Renkli tuşlar
  RED: 'RedColour',
  GREEN: 'GreenColour',
  YELLOW: 'YellowColour',
  BLUE: 'BlueColour',
  
  // Sayılar
  DIGIT_0: 'Digit0',
  DIGIT_1: 'Digit1',
  DIGIT_2: 'Digit2',
  DIGIT_3: 'Digit3',
  DIGIT_4: 'Digit4',
  DIGIT_5: 'Digit5',
  DIGIT_6: 'Digit6',
  DIGIT_7: 'Digit7',
  DIGIT_8: 'Digit8',
  DIGIT_9: 'Digit9',
  
  // Özel
  SOURCE: 'Source',
  TELETEXT: 'Teletext',
  SUBTITLE: 'Subtitle',
};

export default PhilipsTVService;
