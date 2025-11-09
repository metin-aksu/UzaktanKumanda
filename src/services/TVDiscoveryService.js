/**
 * TV Discovery Service
 * Ağdaki LG ve Philips televizyonları otomatik bulur
 */

import dgram from 'react-native-udp';

class TVDiscoveryService {
  constructor() {
    this.socket = null;
    this.discoveredDevices = [];
    this.listeners = [];
  }

  /**
   * SSDP kullanarak ağdaki cihazları tara
   */
  startDiscovery(duration = 5000) {
    return new Promise((resolve, reject) => {
      this.discoveredDevices = [];

      try {
        this.socket = dgram.createSocket({
          type: 'udp4',
          reuseAddr: true,
        });

        this.socket.bind(0, '0.0.0.0', () => {
          // Multicast grubuna katıl
          this.socket.setBroadcast(true);
          
          // LG TV'ler için SSDP arama
          this.sendSSDPSearch('urn:lge-com:service:webos-second-screen:1');
          
          // Philips TV'ler için SSDP arama
          setTimeout(() => {
            this.sendSSDPSearch('urn:schemas-upnp-org:device:tvdevice:1');
          }, 1000);

          // Genel UPnP cihaz araması
          setTimeout(() => {
            this.sendSSDPSearch('ssdp:all');
          }, 2000);
        });

        this.socket.on('message', (msg, rinfo) => {
          this.handleDiscoveryResponse(msg.toString(), rinfo);
        });

        this.socket.on('error', (err) => {
          console.error('Discovery socket hatası:', err);
        });

        // Belirtilen süre sonra aramayı durdur
        setTimeout(() => {
          this.stopDiscovery();
          resolve(this.discoveredDevices);
        }, duration);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * SSDP M-SEARCH mesajı gönder
   */
  sendSSDPSearch(searchTarget) {
    const message = [
      'M-SEARCH * HTTP/1.1',
      'HOST: 239.255.255.250:1900',
      'MAN: "ssdp:discover"',
      `ST: ${searchTarget}`,
      'MX: 3',
      '',
      '',
    ].join('\r\n');

    const messageBuffer = new Uint8Array(message.split('').map(c => c.charCodeAt(0)));

    this.socket.send(
      messageBuffer,
      0,
      messageBuffer.length,
      1900,
      '239.255.255.250',
      (err) => {
        if (err) {
          console.error('SSDP mesajı gönderilemedi:', err);
        } else {
          console.log(`SSDP araması gönderildi: ${searchTarget}`);
        }
      }
    );
  }

  /**
   * Discovery yanıtını işle
   */
  handleDiscoveryResponse(message, rinfo) {
    try {
      const lines = message.split('\r\n');
      let server = '';
      let location = '';
      let usn = '';

      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith('server:')) {
          server = line.substring(7).trim();
        } else if (lower.startsWith('location:')) {
          location = line.substring(9).trim();
        } else if (lower.startsWith('usn:')) {
          usn = line.substring(4).trim();
        }
      });

      // LG WebOS TV kontrolü
      if (server.includes('WebOS') || usn.includes('lge-com')) {
        this.addDevice({
          name: 'LG TV',
          type: 'lg',
          ip: rinfo.address,
          port: 3000,
          server: server,
          location: location,
          discovered: new Date(),
        });
      }
      // Philips TV kontrolü
      else if (server.includes('Philips') || location.includes(':1925')) {
        this.addDevice({
          name: 'Philips TV',
          type: 'philips',
          ip: rinfo.address,
          port: 1925,
          server: server,
          location: location,
          discovered: new Date(),
        });
      }
    } catch (error) {
      console.error('Discovery yanıtı işlenemedi:', error);
    }
  }

  /**
   * Cihazı listeye ekle (tekrar eklemeden kaçın)
   */
  addDevice(device) {
    const exists = this.discoveredDevices.find(d => d.ip === device.ip);
    if (!exists) {
      this.discoveredDevices.push(device);
      this.notifyListeners('deviceFound', device);
      console.log(`TV bulundu: ${device.name} (${device.ip})`);
    }
  }

  /**
   * Aramayı durdur
   */
  stopDiscovery() {
    if (this.socket) {
      try {
        this.socket.close();
      } catch (error) {
        console.error('Socket kapatma hatası:', error);
      }
      this.socket = null;
    }
  }

  /**
   * Manuel olarak cihaz ekle
   */
  addManualDevice(ip, type) {
    const device = {
      name: type === 'lg' ? 'LG TV' : 'Philips TV',
      type: type,
      ip: ip,
      port: type === 'lg' ? 3000 : 1925,
      manual: true,
      discovered: new Date(),
    };

    this.addDevice(device);
    return device;
  }

  /**
   * IP aralığını tara (alternatif yöntem)
   */
  async scanIPRange(baseIP, start = 1, end = 254) {
    const subnet = baseIP.substring(0, baseIP.lastIndexOf('.'));
    const promises = [];

    for (let i = start; i <= end; i++) {
      const ip = `${subnet}.${i}`;
      
      // LG TV için WebSocket kontrolü
      promises.push(
        this.testLGTV(ip).catch(() => null)
      );
      
      // Philips TV için HTTP kontrolü
      promises.push(
        this.testPhilipsTV(ip).catch(() => null)
      );
    }

    await Promise.allSettled(promises);
    return this.discoveredDevices;
  }

  /**
   * LG TV bağlantısını test et
   */
  testLGTV(ip) {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(`ws://${ip}:3000`);
        
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Timeout'));
        }, 2000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          this.addDevice({
            name: 'LG TV',
            type: 'lg',
            ip: ip,
            port: 3000,
            discovered: new Date(),
          });
          resolve(true);
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Philips TV bağlantısını test et
   */
  async testPhilipsTV(ip) {
    try {
      const axios = require('axios');
      await axios.get(`http://${ip}:1925/6/system`, { timeout: 2000 });
      
      this.addDevice({
        name: 'Philips TV',
        type: 'philips',
        ip: ip,
        port: 1925,
        discovered: new Date(),
      });
      
      return true;
    } catch (error) {
      throw error;
    }
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
   * Bulunan cihazları temizle
   */
  clearDevices() {
    this.discoveredDevices = [];
  }

  /**
   * Bulunan cihazları getir
   */
  getDevices() {
    return this.discoveredDevices;
  }
}

export default TVDiscoveryService;
