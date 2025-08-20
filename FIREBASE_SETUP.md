# Firebase Kurulum Rehberi

## 1. Firebase Console'a Giriş

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "TimeTrack QR" projesini seçin
3. Proje ID: `timetrack-qr`

## 2. Gerekli Servisleri Etkinleştirin

### Firestore Database
1. Sol menüden "Firestore Database" seçin
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçin (geliştirme için)
4. Bölge olarak "europe-west1" seçin (GDPR uyumu için)

### Authentication
1. Sol menüden "Authentication" seçin
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesinde:
   - Email/Password'ü etkinleştirin
   - Phone'u etkinleştirin (opsiyonel)

### Storage
1. Sol menüden "Storage" seçin
2. "Get started" butonuna tıklayın
3. "Start in test mode" seçin
4. Bölge olarak "europe-west1" seçin

### Functions
1. Sol menüden "Functions" seçin
2. "Get started" butonuna tıklayın
3. Blaze planına geçmeniz gerekebilir (ücretsiz kotaya sahip)

## 3. Environment Dosyasını Güncelleyin

`.env.local` dosyasını Firebase Console'dan aldığınız bilgilerle güncelleyin:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=timetrack-qr.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=timetrack-qr
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=timetrack-qr.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=857583070298
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Application Settings
NEXT_PUBLIC_APP_NAME=QR PDKS
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEFAULT_LOCATION_ID=loc_001
NEXT_PUBLIC_DEFAULT_DEVICE_ID=kiosk_001

# Security Settings
JWT_SECRET=your_jwt_secret_here_change_this_in_production
DEVICE_SECRET=your_device_secret_here_change_this_in_production

# Feature Flags
NEXT_PUBLIC_ENABLE_SELFIE=false
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## 4. Firebase API Key'ini Alın

1. Firebase Console'da "Project settings" (⚙️) seçin
2. "General" sekmesinde aşağı kaydırın
3. "Your apps" bölümünde "Add app" > "Web" seçin
4. App nickname: "QR PDKS Web"
5. "Register app" butonuna tıklayın
6. Config objesini kopyalayın ve `.env.local` dosyasına yapıştırın

## 5. Firestore Güvenlik Kurallarını Deploy Edin

```bash
npx firebase-tools deploy --only firestore:rules
```

## 6. Firebase Functions'ı Deploy Edin

```bash
npx firebase-tools deploy --only functions
```

## 7. Test Verilerini Ekleyin

Firebase Console > Firestore Database'de aşağıdaki koleksiyonları oluşturun:

### employees (Koleksiyon)
```json
{
  "id": "emp_001",
  "code": "EMP001",
  "first_name": "Ahmet",
  "last_name": "Yılmaz",
  "phone": "+905551234567",
  "email": "ahmet@example.com",
  "role": "employee",
  "location_id": "loc_001",
  "active": true,
  "qr_secret_hash": "hash_here",
  "hire_date": "2024-01-01T00:00:00Z"
}
```

### locations (Koleksiyon)
```json
{
  "id": "loc_001",
  "name": "Merkez Ofis",
  "tz": "Europe/Istanbul",
  "address": "İstanbul, Türkiye"
}
```

### devices (Koleksiyon)
```json
{
  "id": "kiosk_001",
  "location_id": "loc_001",
  "name": "Giriş Kiosk 1",
  "platform": "web",
  "registered_at": "2024-01-01T00:00:00Z",
  "last_seen_at": "2024-01-01T00:00:00Z",
  "device_secret_hash": "device_hash_here",
  "status": "active"
}
```

## 8. Projeyi Test Edin

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin ve QR kod okuyucuyu test edin.

## 9. Production Deployment

### Firebase Hosting
```bash
npm run build
npx firebase-tools deploy --only hosting
```

### Vercel (Alternatif)
```bash
npm run build
vercel --prod
```

## Güvenlik Notları

1. `.env.local` dosyasını asla git'e commit etmeyin
2. Production'da güçlü JWT_SECRET ve DEVICE_SECRET kullanın
3. Firestore güvenlik kurallarını production için güncelleyin
4. Firebase Functions'da rate limiting ekleyin

## Sorun Giderme

### Firestore API Hatası
- Firebase Console'da Firestore Database'i etkinleştirin
- Birkaç dakika bekleyin

### Functions Deploy Hatası
- Blaze planına geçin (ücretsiz kota mevcut)
- Node.js 18 kullanın

### Authentication Hatası
- Firebase Console'da Authentication servisini etkinleştirin
- Sign-in method'ları yapılandırın
