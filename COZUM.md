# 🎯 Sorun Çözümü - LG TV Bağlantısı

## ✅ Durum Tespiti

Test sonuçları:
- ✅ TV erişilebilir (ping başarılı)
- ✅ Port 3000 açık
- ✅ WebSocket sunucusu çalışıyor
- ✅ Client key alındı: `1b5ebd314217ab72538b999e5ba56d79`
- ✅ Node.js WebSocket bağlantısı başarılı

## ❌ Sorun

React Native uygulamasından bağlantı kurulamıyor.

**Olası sebepler:**
1. React Native WebSocket polyfill eksik
2. iOS/Android network permissions
3. Metro bundler üzerinden WebSocket proxy sorunu

## 🔧 Çözüm Adımları

### 1. WebSocket Polyfill Ekleyin

React Native'de bazı WebSocket özelliklerinde sorun olabilir:

\`\`\`bash
npm install react-native-websocket
\`\`\`

### 2. App.tsx'e Polyfill Ekleyin

Dosya başına şunu ekleyin:
\`\`\`javascript
// WebSocket polyfill
global.WebSocket = global.WebSocket || require('react-native').WebSocket;
\`\`\`

### 3. Test Edin

**iOS Simulator:**
\`\`\`bash
npm run ios
\`\`\`

Manuel ekle:
- IP: \`192.168.50.225\`
- Tip: LG

**Android Emülatör (Proxy ile):**
\`\`\`bash
# Terminal 1: Proxy başlat
./start-lg-proxy.sh

# Terminal 2: Uygulama
npm run android
\`\`\`

Manuel ekle:
- IP: \`10.0.2.2\`
- Tip: LG

### 4. Debug Logları İnceleyin

Metro bundler çıktısında şunları arayın:
\`\`\`
🔌 LG TV'ye bağlanılıyor: ws://...
✅ LG TV WebSocket bağlantısı açıldı
✅ LG TV kaydı tamamlandı
\`\`\`

Hata varsa:
\`\`\`
❌ LG TV WebSocket hatası:
❌ Bağlantı zaman aşımı
\`\`\`

## 💡 Alternatif: Fiziksel Cihaz

En güvenilir yöntem:

\`\`\`bash
# Telefonu USB'ye bağla
adb devices

# Uygulamayı çalıştır
npm run android

# Manuel ekle
# IP: 192.168.50.225
# Tip: LG
\`\`\`

## 🧪 Doğrulama

Test scriptleriyle doğrulayın:

\`\`\`bash
# Bağlantı testi
./test-lg-connection.sh

# WebSocket testi
node test-websocket.js 192.168.50.225
\`\`\`

Her ikisi de başarılıysa sorun React Native tarafında.

## 📝 Client Key

Kaydedin: \`1b5ebd314217ab72538b999e5ba56d79\`

Bu key ile bir sonraki bağlantılarda TV'den tekrar onay istenmez.
