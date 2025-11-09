# Android Fiziksel Cihazda Çalıştırma

## USB ile Bağlama

1. **USB Debugging'i Açın:**
   - Ayarlar → Telefon Hakkında
   - "Yapı Numarası"na 7 kez tıklayın (Geliştirici modu aktif olur)
   - Ayarlar → Geliştirici Seçenekleri
   - "USB Debugging"i açın

2. **Telefonu USB ile Bağlayın:**
   ```bash
   # Cihazın tanındığını kontrol edin
   adb devices
   ```

3. **Uygulamayı Çalıştırın:**
   ```bash
   npm run android
   ```

4. **TV ile Aynı WiFi'ye Bağlanın:**
   - Telefon ve TV'nin aynı WiFi ağında olduğundan emin olun
   - Uygulamayı açın ve TV'yi tarayın

## WiFi ile Bağlama (USB Kablosuz)

1. **İlk önce USB ile bağlayın** ve yukarıdaki adımları yapın

2. **WiFi üzerinden debugging açın:**
   ```bash
   # Telefon USB'ye bağlıyken
   adb tcpip 5555
   
   # Telefonun IP adresini öğrenin (Ayarlar → WiFi → Ağ Detayları)
   # Örnek: 192.168.1.50
   
   # USB'yi çıkarın ve WiFi ile bağlanın
   adb connect 192.168.1.50:5555
   
   # Kontrol edin
   adb devices
   ```

3. **Uygulamayı çalıştırın:**
   ```bash
   npm run android
   ```

## Sorun Giderme

**"unauthorized" hatası:**
- Telefonda "USB debugging'e izin ver" popup'ını onaylayın
- "Bu bilgisayara her zaman izin ver"i işaretleyin

**Cihaz görünmüyor:**
```bash
# ADB server'ı yeniden başlatın
adb kill-server
adb start-server
adb devices
```

**Metro bundler bağlanamıyor:**
```bash
# Port forwarding yapın
adb reverse tcp:8081 tcp:8081
```
