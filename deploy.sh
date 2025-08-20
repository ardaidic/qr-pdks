#!/bin/bash

# QR PDKS - GitHub Deployment Script
echo "🚀 QR PDKS - GitHub'a Deploy Ediliyor..."

# Git durumunu kontrol et
echo "📊 Git durumu kontrol ediliyor..."
git status

# Değişiklikleri commit et
echo "💾 Değişiklikler commit ediliyor..."
git add .
git commit -m "feat: QR PDKS - Personel Devam Kontrol Sistemi MVP

- QR kod okuyucu kiosk uygulaması
- Firebase backend entegrasyonu
- Giriş/çıkış ve mola yönetimi
- Modern UI/UX tasarım
- TypeScript ve Next.js 15
- Güvenlik sistemi ve RBAC
- Offline destek
- GDPR uyumlu EU bölgesi"

# GitHub'a push et
echo "📤 GitHub'a push ediliyor..."
git push -u origin main

echo "✅ Deploy tamamlandı!"
echo "🌐 Repository URL: https://github.com/ardaidic/qr-pdks"
echo "📖 README: https://github.com/ardaidic/qr-pdks#readme"
