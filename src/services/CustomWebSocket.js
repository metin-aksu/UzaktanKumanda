/**
 * Custom WebSocket Implementation
 * React Native'in WebSocket'i LG TV ile çalışmadığı için
 * TCP socket üzerinden manuel WebSocket protokolü implementasyonu
 */

/* eslint-disable no-bitwise */

import TcpSocket from 'react-native-tcp-socket';
import { Buffer } from 'buffer';

class CustomWebSocket {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.connected = false;
    this.readyState = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
    
    // Parse URL
    const urlMatch = url.match(/^ws:\/\/([^:]+):(\d+)/);
    if (!urlMatch) {
      throw new Error('Invalid WebSocket URL');
    }
    
    this.host = urlMatch[1];
    this.port = parseInt(urlMatch[2], 10);
    
    // Event handlers
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    
    this._connect();
  }
  
  _connect() {
    console.log('🔌 CustomWebSocket bağlanıyor:', this.host, this.port);
    
    this.socket = TcpSocket.createConnection({
      host: this.host,
      port: this.port,
    }, () => {
      console.log('✅ TCP bağlantısı kuruldu');
      this._performHandshake();
    });
    
    this.socket.on('data', (data) => {
      this._handleData(data);
    });
    
    this.socket.on('error', (error) => {
      console.log('❌ TCP hatası:', error);
      this.readyState = 3;
      if (this.onerror) {
        this.onerror({ error, message: error.message });
      }
    });
    
    this.socket.on('close', () => {
      console.log('🔌 TCP bağlantısı kapandı');
      this.readyState = 3;
      this.connected = false;
      if (this.onclose) {
        this.onclose({ code: 1000, reason: 'Connection closed' });
      }
    });
  }
  
  _performHandshake() {
    // WebSocket handshake key - basit random key (crypto yerine)
    const randomBytes = [];
    for (let i = 0; i < 16; i++) {
      randomBytes.push(Math.floor(Math.random() * 256));
    }
    const key = Buffer.from(randomBytes).toString('base64');
    
    // WebSocket handshake request - Origin header YOK!
    const handshake = [
      `GET / HTTP/1.1`,
      `Host: ${this.host}:${this.port}`,
      `Upgrade: websocket`,
      `Connection: Upgrade`,
      `Sec-WebSocket-Key: ${key}`,
      `Sec-WebSocket-Version: 13`,
      ``,
      ``
    ].join('\r\n');
    
    console.log('📤 Handshake gönderiliyor (Origin header YOK)');
    this.socket.write(handshake);
    this.handshakeComplete = false;
    this.buffer = '';
  }
  
  _handleData(data) {
    const text = data.toString('utf8');
    
    if (!this.handshakeComplete) {
      this.buffer += text;
      
      // Handshake tamamlandı mı?
      if (this.buffer.includes('\r\n\r\n')) {
        console.log('✅ WebSocket handshake tamamlandı');
        this.handshakeComplete = true;
        this.readyState = 1; // OPEN
        this.connected = true;
        
        if (this.onopen) {
          this.onopen();
        }
        
        // Handshake'den sonra kalan veriyi işle
        const parts = this.buffer.split('\r\n\r\n');
        if (parts[1]) {
          this._parseWebSocketFrames(Buffer.from(parts[1], 'utf8'));
        }
        this.buffer = '';
      }
    } else {
      // WebSocket frame'lerini parse et
      this._parseWebSocketFrames(data);
    }
  }
  
  _parseWebSocketFrames(buffer) {
    // Basitleştirilmiş WebSocket frame parser
    let offset = 0;
    
    while (offset < buffer.length) {
      if (buffer.length - offset < 2) break;
      
      const firstByte = buffer[offset];
      const secondByte = buffer[offset + 1];
      
      // const fin = (firstByte & 0x80) !== 0; // Not used in simplified version
      const opcode = firstByte & 0x0F;
      const masked = (secondByte & 0x80) !== 0;
      let payloadLength = secondByte & 0x7F;
      
      offset += 2;
      
      // Extended payload length
      if (payloadLength === 126) {
        if (buffer.length - offset < 2) break;
        payloadLength = buffer.readUInt16BE(offset);
        offset += 2;
      } else if (payloadLength === 127) {
        if (buffer.length - offset < 8) break;
        payloadLength = buffer.readUInt32BE(offset + 4); // Simplified
        offset += 8;
      }
      
      // Masking key (server frames are not masked)
      if (masked) {
        offset += 4;
      }
      
      // Payload
      if (buffer.length - offset < payloadLength) break;
      
      const payload = buffer.slice(offset, offset + payloadLength);
      offset += payloadLength;
      
      // Text frame
      if (opcode === 0x01) {
        const message = payload.toString('utf8');
        console.log('📨 Mesaj alındı:', message.substring(0, 100));
        
        if (this.onmessage) {
          this.onmessage({ data: message });
        }
      }
      // Close frame
      else if (opcode === 0x08) {
        console.log('🔌 Close frame alındı - TV bağlantıyı kapattı');
        this.close();
      }
      // Ping frame - Pong ile cevap ver
      else if (opcode === 0x09) {
        console.log('🏓 Ping alındı, Pong gönderiliyor');
        this._sendPong(payload);
      }
    }
  }
  
  send(data) {
    if (!this.connected) {
      console.log('❌ WebSocket bağlı değil');
      return;
    }
    
    const payload = Buffer.from(data, 'utf8');
    const frame = this._createFrame(payload);
    
    console.log('📤 Mesaj gönderiliyor:', data.substring(0, 100));
    this.socket.write(frame);
  }
  
  _createFrame(payload) {
    const payloadLength = payload.length;
    let frame;
    
    // Text frame, FIN=1, opcode=0x01, masked=1
    const firstByte = 0x81;
    const maskBit = 0x80;
    
    // Generate mask key
    const maskKey = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
      maskKey[i] = Math.floor(Math.random() * 256);
    }
    
    // Create frame
    if (payloadLength < 126) {
      frame = Buffer.alloc(6 + payloadLength);
      frame[0] = firstByte;
      frame[1] = maskBit | payloadLength;
      maskKey.copy(frame, 2);
      
      // Mask payload
      for (let i = 0; i < payloadLength; i++) {
        frame[6 + i] = payload[i] ^ maskKey[i % 4];
      }
    } else if (payloadLength < 65536) {
      frame = Buffer.alloc(8 + payloadLength);
      frame[0] = firstByte;
      frame[1] = maskBit | 126;
      frame.writeUInt16BE(payloadLength, 2);
      maskKey.copy(frame, 4);
      
      // Mask payload
      for (let i = 0; i < payloadLength; i++) {
        frame[8 + i] = payload[i] ^ maskKey[i % 4];
      }
    } else {
      throw new Error('Payload too large');
    }
    
    return frame;
  }
  
  _sendPong(payload) {
    // Pong frame: FIN=1, opcode=0x0A (Pong)
    const firstByte = 0x8A;
    const maskBit = 0x80;
    const payloadLength = payload.length;
    
    // Generate mask key
    const maskKey = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
      maskKey[i] = Math.floor(Math.random() * 256);
    }
    
    let frame;
    if (payloadLength < 126) {
      frame = Buffer.alloc(6 + payloadLength);
      frame[0] = firstByte;
      frame[1] = maskBit | payloadLength;
      maskKey.copy(frame, 2);
      
      // Mask payload
      for (let i = 0; i < payloadLength; i++) {
        frame[6 + i] = payload[i] ^ maskKey[i % 4];
      }
    }
    
    if (this.socket && frame) {
      this.socket.write(frame);
      console.log('🏓 Pong gönderildi');
    }
  }
  
  close() {
    if (this.socket) {
      this.readyState = 2; // CLOSING
      this.socket.destroy();
      this.readyState = 3; // CLOSED
      this.connected = false;
    }
  }
  
  isOpen() {
    return this.readyState === 1;
  }
}

export default CustomWebSocket;
