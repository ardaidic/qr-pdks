# QR PDKS - Personel Devam Kontrol Sistemi

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/ardaidic/qr-pdks)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Bulut tabanlı, Avrupa veri merkezlerinde çalışan, QR kodlu mesai ve mola takip sistemi. Sabit tablet kiosklarından giriş/çıkış; çalışan portalında yalnızca kişinin kendi verileri; yönetici panelinde tüm personel görünümü ve gecikme vurguları.

## 🚀 Özellikler

- **QR Kod ile Giriş/Çıkış**: Güvenli QR kod sistemi ile hızlı kimlik doğrulama
- **Mola Yönetimi**: Mola başlat/bitir işlemleri
- **Gerçek Zamanlı Takip**: Anlık personel durumu ve gecikme bildirimleri
- **Çoklu Rol Sistemi**: Çalışan, Yönetici, Süper Yönetici rolleri
- **Offline Desteği**: İnternet bağlantısı olmadığında kuyruk sistemi
- **GDPR Uyumlu**: Avrupa veri merkezlerinde barındırma
- **Responsive Tasarım**: Tablet ve mobil uyumlu arayüz

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend**: Firebase (Firestore, Functions, Hosting)
- **QR Kod**: html5-qrcode
- **Barındırma**: Firebase Hosting (EU Region)

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Firebase projesi (timetrack-qr)

## 🚀 Hızlı Başlangıç

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd qr-pdks
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Firebase Konfigürasyonu
Detaylı kurulum için [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) dosyasını takip edin.

Kısa özet:
1. Firebase Console'da "TimeTrack QR" projesini seçin
2. Firestore Database, Authentication, Storage ve Functions servislerini etkinleştirin
3. `.env.local` dosyasını Firebase bilgileriyle güncelleyin

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

### 5. Tarayıcıda Açın
```
http://localhost:3000
```

### 6. Firebase Bağlantısını Test Edin
```
http://localhost:3000/test-firebase
```

## 📱 Kullanım

### Kiosk Modu
- QR kod okutma
- Giriş/çıkış işlemleri
- Mola yönetimi
- Gerçek zamanlı durum gösterimi

### Çalışan Portalı
- Kişisel veri görüntüleme
- Geçmiş kayıtlar
- Düzeltme talepleri

### Yönetici Paneli
- Tüm personel görünümü
- Gecikme raporları
- CSV/Excel dışa aktarım

## 🏗️ Proje Yapısı

```
qr-pdks/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── punch/         # Punch işlemleri
│   │   │   └── employees/     # Çalışan bilgileri
│   │   ├── test-firebase/     # Firebase test sayfası
│   │   ├── globals.css        # Global stiller
│   │   ├── layout.tsx         # Ana layout
│   │   └── page.tsx           # Kiosk ana sayfa
│   ├── components/            # React bileşenleri
│   │   ├── ui/               # Temel UI bileşenleri
│   │   ├── Kiosk.tsx         # Kiosk ana bileşeni
│   │   └── QRScanner.tsx     # QR kod okuyucu
│   ├── lib/                  # Yardımcı kütüphaneler
│   │   ├── firebase.ts       # Firebase konfigürasyonu
│   │   └── utils.ts          # Yardımcı fonksiyonlar
│   └── types/                # TypeScript tip tanımları
├── functions/                # Firebase Functions
├── firebase.json            # Firebase konfigürasyonu
├── firestore.rules          # Güvenlik kuralları
├── firestore.indexes.json   # Firestore indeksleri
├── storage.rules            # Storage güvenlik kuralları
├── FIREBASE_SETUP.md        # Firebase kurulum rehberi
└── README.md               # Proje dokümantasyonu
```

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. Feature branch oluşturun
2. Gerekli bileşenleri ve API'leri ekleyin
3. Test edin
4. Pull request oluşturun

### Firebase Kurulumu
Detaylı adımlar için [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) dosyasını inceleyin.

## 📊 Veri Modeli

### Temel Koleksiyonlar
- `employees`: Çalışan bilgileri
- `punches`: Giriş/çıkış kayıtları
- `sessions`: Günlük oturum bilgileri
- `devices`: Kiosk cihazları
- `locations`: Lokasyon bilgileri
- `challenges`: QR doğrulama challenge'ları

## 🔒 Güvenlik

- QR kod HMAC doğrulama
- Cihaz kimlik doğrulama
- Role-based access control (RBAC)
- GDPR uyumlu veri saklama
- Audit logging

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
npx firebase-tools deploy --only hosting
```

### Vercel
```bash
npm run build
vercel --prod
```

## 📈 Performans

- QR okuma: <200ms P95
- API yanıt süresi: <500ms
- Offline kuyruk: 100+ punch
- Eşzamanlı kullanıcı: 1000+

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- Proje Linki: [https://github.com/ardaidic/qr-pdks](https://github.com/ardaidic/qr-pdks)
- Sorunlar: [Issues](https://github.com/ardaidic/qr-pdks/issues)

## 🌐 GitHub Repository

Bu proje GitHub'da barındırılmaktadır:

- **Repository**: [https://github.com/ardaidic/qr-pdks](https://github.com/ardaidic/qr-pdks)
- **Clone URL**: `git clone https://github.com/ardaidic/qr-pdks.git`
- **SSH URL**: `git@github.com:ardaidic/qr-pdks.git`

### GitHub'a Deploy Etme

Projeyi GitHub'a deploy etmek için:

```bash
# Deploy script'ini çalıştırın
./deploy.sh

# Veya manuel olarak:
git add .
git commit -m "feat: QR PDKS MVP"
git push -u origin main
```

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend servisleri
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI bileşenleri
