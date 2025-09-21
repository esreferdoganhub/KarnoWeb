# Karno Haritası Web Uygulaması

Boolean fonksiyonlarını görselleştirmek ve sadeleştirmek için modern, interaktif bir web uygulaması.

## 🚀 Özellikler

- **Çoklu Değişken Desteği**: 2, 3 ve 4 değişkenli Karno haritaları
- **Çift Giriş Yöntemi**: 
  - Doğruluk tablosu ile interaktif giriş
  - Minterm numaraları ile hızlı giriş
- **Otomatik Optimizasyon**: Karno haritasından optimal grupları bulma
- **Görsel Geri Bildirim**: Renkli grup vurgulama ve animasyonlar
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Modern UI**: Font Awesome iconları ve gradient tasarım

## 🛠️ Teknolojiler

- **HTML5**: Semantic markup ve modern standartlar
- **CSS3**: Grid layout, Flexbox, custom properties
- **Vanilla JavaScript**: ES6+ syntax, OOP yaklaşımı
- **Font Awesome**: Modern iconlar

## 📁 Proje Yapısı

```
KarnoWeb/
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri
├── script.js           # JavaScript logic
├── README.md           # Proje dokümantasyonu
└── .github/
    └── copilot-instructions.md
```

## 🎯 Kullanım

1. **Değişken Sayısını Seçin**: 2, 3 veya 4 değişken arasından seçim yapın
2. **Giriş Yöntemini Belirleyin**:
   - **Doğruluk Tablosu**: Tablodaki çıkış değerlerine tıklayarak 0/1 değiştirin
   - **Minterm Girişi**: Virgülle ayrılmış minterm numaralarını girin
3. **Karno Haritasını İnceleyin**: Değerler otomatik olarak haritaya yansır
4. **Grupları Bulun**: "Grupları Bul" butonuna tıklayarak optimizasyonu başlatın
5. **Çözümü Görün**: Sadeleştirilmiş Boolean fonksiyonunu inceleyin

## 🔧 Geliştirme

### Yerel Geliştirme

1. Projeyi klonlayın veya indirin
2. `index.html` dosyasını web tarayıcısında açın
3. Geliştirme için canlı sunucu kullanmanız önerilir

### Önerilen VS Code Eklentileri

- Live Server: Canlı önizleme için
- Prettier: Kod formatlama
- ESLint: JavaScript lint

## 📖 Algoritma Detayları

### Karno Haritası Düzeni

- **2 Değişken**: 2x2 grid (Gray code sıralaması)
- **3 Değişken**: 2x4 grid (BC değişkenleri üst, A sol)
- **4 Değişken**: 4x4 grid (CD üst, AB sol)

### Grup Bulma Algoritması

1. Tüm 1'lerin mintermlerini topla
2. 8, 4, 2, 1 boyutlarında dikdörtgen grupları ara
3. Gray code komşuluğunu kontrol et
4. Optimal kapsama için greedy algoritma uygula

### Optimizasyon Hedefleri

- Minimum terim sayısı
- Minimum literal sayısı
- Maksimum grup boyutu

## 🎨 Tasarım Özellikleri

- **Renk Paleti**: Modern mavi tonları
- **Typography**: Segoe UI font ailesi
- **Animasyonlar**: Hover efektleri ve geçişler
- **Accessibility**: Semantic HTML ve keyboard navigasyonu

## 🐛 Bilinen Sınırlamalar

- Grup bulma algoritması basitleştirilmiştir
- Don't care ('X') değerleri desteklenmez
- 5+ değişken desteği yoktur

## 🚀 Gelecek Geliştirmeler

- [ ] Don't care değerleri desteği
- [ ] 5 ve 6 değişkenli haritalar
- [ ] Export/Import fonksiyonu
- [ ] Adım adım çözüm gösterimi
- [ ] Dark mode desteği

## 📄 Lisans

Bu proje eğitim amaçlı olarak geliştirilmiştir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

**Geliştirici**: Esref Erdogan  
**Tarih**: Mayıs 2025  
**Versiyon**: 1.0.0
