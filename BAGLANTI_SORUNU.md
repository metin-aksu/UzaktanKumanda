# 🚨 Emülatörde TV Bağlantı Sorunu Çözümü

## Sorun Nedir?

Android emülatör **NAT arkasında** çalışır ve yerel ağınızdaki cihazlara (TV'niz gibi) doğrudan erişemez. Bu yüzden TV'nize bağlanamıyorsunuz.

## ✅ Çözümler (Kolay → Zor)

### 🥇 ÇÖZÜM 1: Fiziksel Android Cihaz Kullanın (ÖNERİLEN)

**Bu en kolay ve garantili yöntemdir!**

#### Adımlar:

1. **Android telefonunuzu USB ile bilgisayara bağlayın**

2. **USB Debugging'i açın:**
   - Ayarlar → Telefon Hakkında
   - "Yapı Numarası"na **7 kez** tıklayın
   - Ayarlar → Geliştirici Seçenekleri → **USB Debugging** açın

3. **Cihazın tanındığını kontrol edin:**
   ```bash
   adb devices
   ```
   Çıktıda telefonunuz görünmeli.

4. **Uygulamayı çalıştırın:**
   ```bash
   npm run android
   ```

5. **Telefon ve TV'yi aynı WiFi'ye bağlayın**

6. **Uygulamada tarama yapın veya IP girin**

✅ **Artık TV'nize bağlanabilirsiniz!**

---

### 🥈 ÇÖZÜM 2: iOS Simulator (macOS)

iOS simulator fiziksel ağınızı kullanır:

```bash
npm run ios
```

iOS'ta test edebilir, TV'ye bağlanabilirsiniz.

---

### 🥉 ÇÖZÜM 3: Port Forwarding (İleri Seviye)

Emülatörde test etmek **ZORUNLU** ise bu yöntemi kullanın:

#### LG TV İçin:

1. **Yeni bir terminal açın**

2. **Proxy script'i çalıştırın:**
   ```bash
   ./start-lg-proxy.sh
   ```

3. **TV'nizin IP adresini girin** (örnek: 192.168.1.100)

4. **Emülatörde uygulamayı açın**

5. **Manuel TV ekle:**
   - IP: `10.0.2.2`
   - Tip: LG

#### Philips TV İçin:

1. **Yeni bir terminal açın**

2. **Proxy script'i çalıştırın:**
   ```bash
   ./start-philips-proxy.sh
   ```

3. **TV'nizin IP adresini girin**

4. **Emülatörde uygulamayı açın**

5. **Manuel TV ekle:**
   - IP: `10.0.2.2`
   - Tip: Philips

#### Notlar:
- ⚠️ Proxy çalışırken terminal açık kalmalı
- ⚠️ WebSocket bağlantıları kararsız olabilir
- ⚠️ Otomatik tarama çalışmaz (manuel IP gerekir)

---

## 📊 Karşılaştırma

| Yöntem | Zorluk | Güvenilirlik | Süre |
|--------|--------|--------------|------|
| 🥇 Fiziksel Cihaz | ⭐ Çok Kolay | ✅ %100 | 2 dk |
| 🥈 iOS Simulator | ⭐⭐ Kolay | ✅ %95 | 1 dk |
| 🥉 Port Forwarding | ⭐⭐⭐⭐ Zor | ⚠️ %60 | 10 dk |

## 💡 Önerimiz

**Fiziksel Android telefonunuzu kullanın!** 

Neden?
- ✅ %100 çalışır
- ✅ Gerçek kullanıcı deneyimi
- ✅ Tüm özellikler test edilebilir
- ✅ Kurulum 2 dakika

## 🆘 Hâlâ Sorun mu Var?

### Fiziksel cihazda da bağlanamıyorsanız:

1. **TV ve telefon aynı WiFi'de mi?**
   ```bash
   # Telefonda: Ayarlar → WiFi → Ağ adı
   # TV'de: Ayarlar → Ağ → WiFi bağlantısı
   ```

2. **TV'nin IP'sini doğru mu girdiniz?**
   - LG: Ayarlar → Ağ → WiFi → Gelişmiş → IP Adresi
   - Philips: Ayarlar → Ağ Ayarları → Ağ Bilgileri

3. **TV açık mı?**

4. **Router'da "AP Isolation" kapalı mı?**
   - Router ayarlarına girin
   - Wireless → Advanced → AP Isolation → OFF

5. **Güvenlik duvarı engelliyor mu?**
   - TV'de güvenlik duvarı varsa geçici olarak kapatın

### Test komutu:

```bash
# Telefon USB'de ise:
adb shell ping -c 4 [TV_IP_ADRESI]

# Örnek:
adb shell ping -c 4 192.168.1.100
```

Ping başarılı olursa ağ bağlantısı var demektir.

## 📚 Detaylı Dokümantasyon

- **FIZIKSEL_CIHAZ.md** - Fiziksel cihaz kurulumu
- **EMULATOR_NETWORK.md** - Emülatör ağ ayarları
- **KULLANIM_KILAVUZU.md** - Uygulama kullanımı

---

## 🎯 Hızlı Başlangıç (Fiziksel Cihaz)

```bash
# 1. Telefonu bağla
adb devices

# 2. Uygulamayı çalıştır
npm run android

# 3. Telefon ve TV aynı WiFi'de olmalı

# 4. Uygulamayı aç → Tara → TV'yi seç → Bağlan
```

**Bu kadar! 🎉**
