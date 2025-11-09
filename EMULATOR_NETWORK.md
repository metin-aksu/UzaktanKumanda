# Emülatörde TV Bağlantısı Kurma (İleri Seviye)

## ⚠️ Uyarı
Emülatör NAT arkasında çalıştığı için yerel ağdaki cihazlara doğrudan erişemez. Bu yöntem karmaşıktır ve fiziksel cihaz kullanmak önerilir.

## Yöntem 1: Android Emülatör Network Bridge

### macOS için (Karmaşık):

1. **Host bilgisayarınızın IP'sini öğrenin:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Örnek çıktı: `192.168.1.100` (bilgisayarınızın IP'si)

2. **Emülatör için özel IP:**
   - Emülatörden host bilgisayarınıza: `10.0.2.2`
   - Ancak bu yerel ağdaki diğer cihazlara erişim sağlamaz

3. **Proxy/Tunnel Kurulumu Gerekir:**
   
   Host bilgisayarınızda bir proxy çalıştırıp, emülatörün bu proxy üzerinden TV'ye erişmesini sağlamalısınız.

   ```bash
   # socat kurulumu
   brew install socat
   
   # LG TV için WebSocket proxy (port 3000)
   socat TCP-LISTEN:3000,fork TCP:192.168.1.XXX:3000
   
   # Philips TV için HTTP proxy (port 1925)
   socat TCP-LISTEN:1925,fork TCP:192.168.1.XXX:1925
   ```
   
   (192.168.1.XXX yerine TV'nizin gerçek IP'sini yazın)

4. **Uygulamada IP olarak kullanın:**
   - LG TV için: `10.0.2.2` (host bilgisayar)
   - Philips TV için: `10.0.2.2`

### Sorunlar:
- WebSocket bağlantıları proxy üzerinden düzgün çalışmayabilir
- SSDP keşfi çalışmayacak (manuel IP gerekir)
- Karmaşık ve hata vermeye açık

## Yöntem 2: Emülatör AVD Ayarları

1. **Android Studio → AVD Manager**

2. **Emülatörü durdurun**

3. **AVD'yi düzenleyin → Show Advanced Settings**

4. **Network** bölümünde:
   - "Bridged" modu deneyin (bazı sistemlerde çalışmaz)

### Sorun:
- Bridged mode macOS'ta genelde çalışmaz
- Windows'ta bile sınırlı destek var

## Yöntem 3: Genymotion Emülatör (Alternatif)

Android Studio emülatörü yerine Genymotion kullanabilirsiniz:

1. [Genymotion](https://www.genymotion.com/) indirin
2. Bridged network modunu etkinleştirin
3. Emülatör yerel ağınızda bir IP alacak

### Dezavantaj:
- Ücretsiz sürüm sınırlı
- Ekstra kurulum gerektirir

## 🎯 ÖNERİLEN ÇÖZÜM

### Fiziksel Android Cihaz Kullanın

Bu en basit ve en güvenilir yöntemdir:

```bash
# 1. Telefonu USB ile bağlayın
# 2. USB debugging açın
adb devices

# 3. Uygulamayı çalıştırın
npm run android

# 4. Telefon ve TV aynı WiFi'de olmalı
```

Detaylar için: **FIZIKSEL_CIHAZ.md** dosyasına bakın.

## Test için Alternatif

Gerçek bir TV'niz yoksa ve sadece test etmek istiyorsanız:

### LG WebOS Simulator
- LG WebOS TV SDK'da simulator var
- Geliştirici hesabı gerektirir
- Sınırlı özellikler

### Mock Servis
Geliştirme amaçlı mock bir servis oluşturabilirsiniz ama gerçek TV deneyimi vermez.

---

## 💡 Özet

| Yöntem | Zorluk | Başarı Oranı | Öneri |
|--------|--------|--------------|-------|
| Fiziksel Cihaz | ⭐ Kolay | ✅ %100 | ⭐⭐⭐⭐⭐ |
| Port Forwarding | ⭐⭐⭐⭐ Çok Zor | ⚠️ %30 | ⭐ |
| Genymotion | ⭐⭐⭐ Orta | ⚠️ %60 | ⭐⭐ |
| Bridged Mode | ⭐⭐⭐ Orta | ⚠️ %20 | ⭐ |

**En iyi çözüm:** Fiziksel Android telefonunuzu kullanın! 📱
