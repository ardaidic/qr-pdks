# QR PDKS - Personel Devam Kontrol Sistemi

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/ardaidic/qr-pdks)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer-Motion-0055FF?style=flat-square&logo=framer)](https://www.framer.com/motion/)

Modern, QR kod tabanlı personel devam kontrol sistemi. Güzel ve kullanıcı dostu arayüz ile tablet kiosklarından giriş/çıkış; çalışan portalında yalnızca kişinin kendi verileri; yönetici panelinde tüm personel görünümü ve gecikme vurguları.

## 🚀 Özellikler

- **QR Kod ile Giriş/Çıkış**: Güvenli QR kod sistemi ile hızlı kimlik doğrulama
- **Mola Yönetimi**: Mola başlat/bitir işlemleri
- **Gerçek Zamanlı Takip**: Anlık personel durumu ve gecikme bildirimleri
- **Çoklu Rol Sistemi**: Çalışan, Yönetici, Süper Yönetici rolleri
- **Offline Desteği**: İnternet bağlantısı olmadığında kuyruk sistemi
- **Modern UI/UX**: Framer Motion animasyonları ve modern tasarım
- **Responsive Tasarım**: Tablet ve mobil uyumlu arayüz
- **Toast Bildirimleri**: Kullanıcı dostu bildirim sistemi

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Framer Motion, Lucide Icons
- **Backend**: JSON Server (basit API)
- **QR Kod**: html5-qrcode
- **Barındırma**: Vercel/Netlify (statik hosting)

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn

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

### 3. Geliştirme Sunucusunu Başlatın
```bash
# Hem API hem de Next.js sunucusunu başlatır
npm run dev:full

# Veya ayrı ayrı:
npm run api    # JSON Server (port 3001)
npm run dev    # Next.js (port 3000)
```

### 4. Tarayıcıda Açın
```
http://localhost:3000
```

### 5. API Test Edin
```
http://localhost:3001/employees
```

## 📱 Kullanım

### Kiosk Modu
- QR kod okutma
- Giriş/çıkış işlemleri
- Mola yönetimi
- Gerçek zamanlı durum gösterimi
- Modern animasyonlar

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
│   │   ├── globals.css        # Global stiller
│   │   ├── layout.tsx         # Ana layout
│   │   └── page.tsx           # Kiosk ana sayfa
│   ├── components/            # React bileşenleri
│   │   ├── ui/               # Temel UI bileşenleri
│   │   │   ├── button.tsx    # Modern button bileşeni
│   │   │   ├── card.tsx      # Card bileşeni
│   │   │   ├── avatar.tsx    # Avatar bileşeni
│   │   │   ├── toast.tsx     # Toast bileşeni
│   │   │   └── toaster.tsx   # Toaster bileşeni
│   │   ├── Kiosk.tsx         # Kiosk ana bileşeni
│   │   └── QRScanner.tsx     # QR kod okuyucu
│   ├── hooks/                # Custom hooks
│   │   └── use-toast.ts      # Toast hook'u
│   ├── lib/                  # Yardımcı kütüphaneler
│   │   ├── api.ts           # API servisi
│   │   └── utils.ts         # Yardımcı fonksiyonlar
│   └── types/               # TypeScript tip tanımları
├── db.json                  # JSON Server veri dosyası
├── package.json             # Proje bağımlılıkları
└── README.md               # Proje dokümantasyonu
```

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. Feature branch oluşturun
2. Gerekli bileşenleri ve API'leri ekleyin
3. Test edin
4. Pull request oluşturun

### API Endpoints
- `GET /employees` - Tüm çalışanları listele
- `GET /employees?code=EMP001` - Çalışan koduna göre ara
- `POST /punches` - Yeni punch oluştur
- `GET /punches` - Punch'ları listele
- `GET /sessions` - Oturumları listele
- `POST /sessions` - Yeni oturum oluştur

## 📊 Veri Modeli

### Temel Koleksiyonlar
- `employees`: Çalışan bilgileri
- `punches`: Giriş/çıkış kayıtları
- `sessions`: Günlük oturum bilgileri
- `devices`: Kiosk cihazları
- `challenges`: QR doğrulama challenge'ları

## 🔒 Güvenlik

- QR kod doğrulama
- Cihaz kimlik doğrulama
- Role-based access control (RBAC)
- Audit logging

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

### JSON Server (Production)
```bash
# JSON Server'ı production'da çalıştırmak için:
npm install -g json-server
json-server --watch db.json --port 3001 --host 0.0.0.0
```

## 📈 Performans

- QR okuma: <200ms P95
- API yanıt süresi: <500ms
- Offline kuyruk: 100+ punch
- Eşzamanlı kullanıcı: 1000+

## 🎨 UI/UX Özellikleri

- **Modern Tasarım**: Gradient arka planlar ve modern renk paleti
- **Animasyonlar**: Framer Motion ile smooth animasyonlar
- **Responsive**: Tüm cihazlarda mükemmel görünüm
- **Toast Bildirimleri**: Kullanıcı dostu bildirim sistemi
- **Loading States**: İşlem durumu göstergeleri
- **Error Handling**: Hata durumları için güzel UI
- **Accessibility**: Erişilebilirlik standartlarına uygun

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
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI bileşenleri
- [Framer Motion](https://www.framer.com/motion/) - Animasyon kütüphanesi
- [Lucide Icons](https://lucide.dev/) - İkon kütüphanesi
