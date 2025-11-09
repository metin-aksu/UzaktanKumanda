# Uzaktan Kumanda - Kullanım Kılavuzu

## 📱 Uygulamayı Çalıştırma

### Android

1. **Android Studio'yu açın ve bir emülatör başlatın** veya fiziksel cihazınızı USB ile bağlayın
2. USB Debugging açık olduğundan emin olun
3. Terminal'de şu komutu çalıştırın:

```bash
npm run android
```

veya

```bash
npx react-native run-android
```

### iOS (Sadece macOS)

1. **Xcode'u açın**
2. iOS Simulator'ü başlatın veya fiziksel iPhone'unuzu bağlayın
3. Terminal'de şu komutu çalıştırın:

```bash
npm run ios
```

## 🔍 TV'leri Bulma ve Bağlanma

### Otomatik Keşif

1. Uygulamayı açın
2. Ana ekranda **"🔍 Tara"** butonuna basın
3. Uygulama ağdaki TV'leri otomatik olarak bulacaktır (5 saniye sürer)
4. Bulunan TV'ler listede görünecektir

### Manuel Ekleme

Eğer TV'niz otomatik bulunamazsa:

1. **"+ Manuel Ekle"** butonuna basın
2. TV'nizin **IP adresini** girin
3. TV tipini seçin (**LG** veya **Philips**)
4. **"Ekle"** butonuna basın

#### TV IP Adresini Nasıl Bulabilirim?

**LG TV:**
1. TV'de **Ayarlar** menüsüne gidin
2. **Ağ** → **WiFi Bağlantısı** → **Gelişmiş**
3. **IP Adresi** bilgisini not alın

**Philips TV:**
1. **Home** tuşuna basın
2. **Ayarlar** → **Ağ Ayarları** → **Ağ**
3. **Görüntüle Ağ Ayarları** → IP adresini görün

## 🎮 TV'yi Kontrol Etme

### İlk Bağlantı (LG TV)

1. TV'yi listeden seçin
2. **TV ekranında bir onay mesajı çıkacaktır**
3. TV kumandası ile **"İzin Ver"** veya **"Always Allow"** seçeneğine basın
4. Bağlantı kurulacak ve client key kaydedilecek
5. Bir sonraki bağlantılarda tekrar izin istenmeyecek

### İlk Bağlantı (Philips TV)

1. TV'yi listeden seçin
2. Doğrudan bağlanacaktır
3. Eğer bağlanamazsa:
   - TV'nin JointSpace API'si aktif mi kontrol edin
   - Bazı modellerde API şifresi gerekebilir

## 🕹️ Kumanda Tuşları

### Temel Navigasyon
- **▲ ▼ ◄ ►** - Yukarı, Aşağı, Sol, Sağ
- **OK** - Seçimi onayla
- **◄ Geri** - Bir önceki ekrana dön
- **⌂ Home** - Ana ekran
- **☰ Menu** - Menü

### Ses Kontrolü
- **VOL+** - Ses arttır
- **VOL-** - Ses azalt
- **🔇** - Sesi kapat/aç
- Ses seviyesi ekranın üstünde gösterilir

### Kanal Kontrolü
- **CH+** - Sonraki kanal
- **CH-** - Önceki kanal
- **INFO** - Kanal bilgisi

### Medya Kontrol
- **⏯** - Oynat/Duraklat
- **⏪** - Geri sar
- **⏩** - İleri sar
- **⏮** - Önceki
- **⏭** - Sonraki

### Sayı Tuşları
- **0-9** - Kanal numarası gir
- **◄ / ►** - (Alt satır) Dash ve Enter

### Renkli Tuşlar
- **● Kırmızı**
- **● Yeşil**
- **● Sarı**
- **● Mavi**

Bu tuşlar uygulamaya özel menülerde kullanılır.

### Özel Tuşlar (Philips)
- **SOURCE** - Kaynak değiştir (HDMI, TV, vs.)
- **💡 AMBILIGHT** - Ambilight aç/kapat

### Güç
- **⏻ POWER** - TV'yi kapat (standby)

## ⚙️ Sorun Giderme

### TV Bulunamıyor

**Kontrol Listesi:**
- [ ] TV ve telefon aynı WiFi ağında mı?
- [ ] TV açık mı?
- [ ] Router'da "AP Isolation" veya "Client Isolation" kapalı mı?
- [ ] Güvenlik duvarı TV bağlantılarını engelliyor mu?

**Çözümler:**
1. TV ve telefonu yeniden başlatın
2. Router'ı yeniden başlatın
3. Manuel olarak IP adresi ekleyin
4. Farklı bir WiFi ağı deneyin

### LG TV'ye Bağlanamıyor

**Olası Sebepler:**
- TV'nin WebOS versiyonu çok eski (2014 öncesi)
- Port 3000 kapalı veya engellenmiş
- TV'de onay vermediğiniz

**Çözümler:**
1. TV'de onay mesajını kontrol edin
2. Uygulamayı kapat-aç yapın
3. TV'yi yeniden başlatın
4. Uygulamayı kaldırıp yeniden yükleyin
5. TV yazılımını güncelleyin

### Philips TV'ye Bağlanamıyor

**Olası Sebepler:**
- JointSpace API aktif değil
- Port 1925 kapalı
- API şifresi gerekiyor

**Çözümler:**
1. TV ayarlarından JointSpace/API erişimini açın
2. TV'yi yeniden başlatın
3. Eğer API şifresi isteniyorsa, manuel olarak ayarlayın
4. TV yazılımını güncelleyin

### Bazı Tuşlar Çalışmıyor

**Nedeni:**
- Her TV modeli tüm komutları desteklemez
- Bazı tuşlar sadece belirli modlarda çalışır

**Çözüm:**
- TV'nizin desteklediği özellikleri kullanın
- Alternatif tuş kombinasyonları deneyin

### Bağlantı Kopuyor

**Nedenleri:**
- WiFi sinyali zayıf
- TV uyku moduna geçiyor
- Ağ trafiği yoğun

**Çözümler:**
1. WiFi router'ına yaklaşın
2. TV'nin uyku ayarlarını kontrol edin
3. Ağ trafiğini azaltın
4. 5GHz WiFi kullanın (daha kararlı)

### Uygulama Çöküyor

1. Uygulamayı tamamen kapatıp tekrar açın
2. Telefonu yeniden başlatın
3. Uygulamayı kaldırıp yeniden yükleyin
4. Android: Cache temizleyin
5. iOS: Uygulamayı Force Quit yapın

## 🔐 Güvenlik ve Gizlilik

- **Veri Saklama**: Sadece TV IP adresleri ve LG client key'leri saklanır
- **Şifreleme**: LAN içi bağlantılar şifrelenmemiştir (normal kullanım için güvenli)
- **İzinler**: 
  - İnternet erişimi (TV'lere bağlanmak için)
  - Ağ durumu (WiFi kontrolü için)
  - Multicast (TV keşfi için)

## 💡 İpuçları

1. **Hızlı Bağlantı**: TV'leri manuel ekleyerek daha hızlı bağlanabilirsiniz
2. **Çoklu TV**: Birden fazla TV ekleyebilir ve aralarında geçiş yapabilirsiniz
3. **Client Key**: LG TV client key'i silinirse tekrar izin vermeniz gerekir
4. **Ağ**: 5GHz WiFi daha hızlı ve kararlıdır
5. **Mesafe**: Router'a yakın olmak bağlantı kalitesini artırır

## 📞 Destek

Sorun yaşıyorsanız:

1. Bu kılavuzu baştan sona okuyun
2. GitHub'da issue açın
3. Şunları belirtin:
   - TV markası ve modeli
   - Telefon modeli ve işletim sistemi
   - Hata mesajı (varsa)
   - Ne yapmaya çalıştığınız

## 🆕 Güncellemeler

Uygulamayı düzenli olarak güncel tutun:
- Hata düzeltmeleri
- Yeni özellikler
- Performans iyileştirmeleri
- Yeni TV modeli desteği

---

**İyi Kullanımlar! 🎉**
