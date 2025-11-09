# 🎯 HIZLI BAŞLANGIÇ - LG TV Bağlantısı

## ✅ TV Bilgileri
- **IP Adresi:** 192.168.50.225
- **Port:** 3000
- **Client Key:** 1b5ebd314217ab72538b999e5ba56d79
- **Durum:** ✅ Çalışıyor ve test edildi

## 📱 Platform Seçenekleri

### 1️⃣ iOS Simulator (ÖNERİLEN - Hemen çalışır)

\`\`\`bash
# Yeni terminal
npm run ios
\`\`\`

Uygulama açılınca:
1. "Manuel Ekle" butonuna bas
2. IP: **192.168.50.225**
3. Tip: **LG**
4. "Ekle" → TV'yi seç
5. Bağlan! ✅

### 2️⃣ Android Emülatör (Proxy gerekli)

**Terminal 1: Proxy Başlat**
\`\`\`bash
./start-lg-proxy.sh
# Enter tuşuna bas (varsayılan IP: 192.168.50.225)
# Proxy çalışmaya başlayacak
\`\`\`

**Terminal 2: Uygulama**
\`\`\`bash
npm run android
\`\`\`

Uygulama açılınca:
1. "Manuel Ekle" butonuna bas
2. IP: **10.0.2.2** (önemli - emülatör host'a böyle erişir)
3. Tip: **LG**
4. "Ekle" → TV'yi seç
5. Bağlan! ✅

### 3️⃣ Fiziksel Android Cihaz (EN KOLAY)

\`\`\`bash
# USB bağla
adb devices

# Çalıştır
npm run android
\`\`\`

Uygulama açılınca:
1. "Manuel Ekle" veya "Tara"
2. IP: **192.168.50.225** (otomatik bulacak)
3. Tip: **LG**
4. "Ekle" → TV'yi seç
5. Bağlan! ✅

## 🔍 Debug - Logları İzle

Metro bundler terminalinde şunları göreceksiniz:

**Başarılı bağlantı:**
\`\`\`
🚀 Uygulama başlatılıyor...
🔌 LG TV'ye bağlanılıyor: ws://192.168.50.225:3000
✅ LG TV WebSocket bağlantısı açıldı
📨 LG TV mesajı: {"type":"response"...}
✅ LG TV kaydı tamamlandı
🔑 Client key: 1b5ebd314217ab72538b999e5ba56d79
\`\`\`

**Bağlantı hatası:**
\`\`\`
❌ LG TV WebSocket hatası:
❌ Bağlantı zaman aşımı
\`\`\`

## ⚠️ Sorun Giderme

### iOS Simulator'da bağlanamıyor:
\`\`\`bash
# 1. Simulator'ı kapat
# 2. Metro'yu yeniden başlat
lsof -ti:8081 | xargs kill -9
npm start -- --reset-cache

# 3. iOS'u tekrar çalıştır
npm run ios
\`\`\`

### Android Emülatör'de bağlanamıyor:
1. **Proxy çalışıyor mu?** (Terminal 1'de çıktı görüyor musunuz?)
2. **IP doğru mu?** 10.0.2.2 (emülatör için) veya 192.168.50.174 (host IP)
3. **Emülatör internete erişebiliyor mu?** Tarayıcıda google.com deneyin

### Fiziksel cihazda bağlanamıyor:
1. **Aynı WiFi'de mi?** Telefon ve TV aynı ağda olmalı
2. **IP doğru mu?** 192.168.50.225
3. **TV açık mı?**

## 🧪 Test Komutları

\`\`\`bash
# Bağlantı testi
./test-lg-connection.sh

# WebSocket testi
node test-websocket.js 192.168.50.225

# Her ikisi de başarılıysa, sorun React Native tarafında
\`\`\`

## 💡 Pro İpuçları

1. **İlk bağlantı:** TV ekranında "İzin Ver" onayı isteyecek
2. **Client Key:** Otomatik kaydedilir, tekrar onay gerekmez
3. **iOS Simulator:** En hızlı test yöntemi
4. **Fiziksel Cihaz:** En güvenilir yöntem
5. **Proxy:** Sadece emülatör için gerekli

## 🎉 Başarılı Olunca

TV'ye bağlandığınızda:
- ✅ Ses kontrolü çalışır
- ✅ Kanal değiştirme çalışır  
- ✅ Tüm kumanda tuşları çalışır
- ✅ Gerçek zamanlı ses seviyesi gösterilir

---

**Hemen deneyin:** \`npm run ios\` 🚀
