'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Building2, 
  Users, 
  Shield, 
  Bell,
  Palette,
  Save,
  RefreshCw,
  QrCode,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    // Çalışma Saatleri
    workStartTime: '09:00',
    workEndTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    
    // Sistem Ayarları
    companyName: 'QR PDKS Şirketi',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    theme: 'light',
    
    // Bildirimler
    enableNotifications: true,
    lateArrivalThreshold: 15, // dakika
    earlyDepartureThreshold: 30, // dakika
    
    // Güvenlik
    sessionTimeout: 30, // dakika
    maxLoginAttempts: 3,
    enableAuditLog: true,
    
    // QR Kod Ayarları
    qrCodeExpiry: 5, // dakika
    qrCodeSize: 256,
    enableQRWatermark: true
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Local storage'dan ayarları yükle
    const savedSettings = localStorage.getItem('pdks-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Local storage'a kaydet
      localStorage.setItem('pdks-settings', JSON.stringify(settings));
      
      // API'ye kaydet (gelecekte)
      // await apiService.updateSettings(settings);
      
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi",
        variant: "success",
      });
    } catch {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      workStartTime: '09:00',
      workEndTime: '18:00',
      breakStartTime: '12:00',
      breakEndTime: '13:00',
      companyName: 'QR PDKS Şirketi',
      timezone: 'Europe/Istanbul',
      language: 'tr',
      theme: 'light',
      enableNotifications: true,
      lateArrivalThreshold: 15,
      earlyDepartureThreshold: 30,
      sessionTimeout: 30,
      maxLoginAttempts: 3,
      enableAuditLog: true,
      qrCodeExpiry: 5,
      qrCodeSize: 256,
      enableQRWatermark: true
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('pdks-settings', JSON.stringify(defaultSettings));
    
    toast({
      title: "Başarılı",
      description: "Ayarlar varsayılan değerlere sıfırlandı",
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
              <p className="text-gray-600 mt-2">Sistem Konfigürasyonu ve Yönetimi</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={resetSettings}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sıfırla
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Kaydediliyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Kaydet
                  </div>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Çalışma Saatleri */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Çalışma Saatleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İş Başlangıcı
                    </label>
                    <input
                      type="time"
                      value={settings.workStartTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, workStartTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İş Bitişi
                    </label>
                    <input
                      type="time"
                      value={settings.workEndTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, workEndTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mola Başlangıcı
                    </label>
                    <input
                      type="time"
                      value={settings.breakStartTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, breakStartTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mola Bitişi
                    </label>
                    <input
                      type="time"
                      value={settings.breakEndTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, breakEndTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Şirket Bilgileri */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Şirket Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket Adı
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saat Dilimi
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                      <option value="Europe/London">Londra (UTC+0)</option>
                      <option value="America/New_York">New York (UTC-5)</option>
                      <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dil
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bildirimler */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Bildirimler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bildirimleri Etkinleştir</p>
                    <p className="text-sm text-gray-600">Geç geliş ve erken çıkış uyarıları</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geç Geliş Eşiği (dk)
                    </label>
                    <input
                      type="number"
                      value={settings.lateArrivalThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, lateArrivalThreshold: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Erken Çıkış Eşiği (dk)
                    </label>
                    <input
                      type="number"
                      value={settings.earlyDepartureThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, earlyDepartureThreshold: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Güvenlik */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Güvenlik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oturum Zaman Aşımı (dk)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maksimum Giriş Denemesi
                    </label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Denetim Günlüğü</p>
                    <p className="text-sm text-gray-600">Tüm işlemleri kaydet</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAuditLog}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableAuditLog: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* QR Kod Ayarları */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Kod Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geçerlilik Süresi (dk)
                    </label>
                    <input
                      type="number"
                      value={settings.qrCodeExpiry}
                      onChange={(e) => setSettings(prev => ({ ...prev, qrCodeExpiry: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      QR Kod Boyutu
                    </label>
                    <select
                      value={settings.qrCodeSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, qrCodeSize: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={128}>128x128</option>
                      <option value={256}>256x256</option>
                      <option value={512}>512x512</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Filigran Ekle</p>
                    <p className="text-sm text-gray-600">QR kodlara şirket logosu ekle</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableQRWatermark}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableQRWatermark: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tema */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Görünüm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tema
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Açık Tema</option>
                    <option value="dark">Koyu Tema</option>
                    <option value="auto">Otomatik</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="w-full h-16 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"></div>
                  <div className="w-full h-16 bg-gray-900 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"></div>
                  <div className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alt Menü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            <Users className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/reports'}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Raporlar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Building2 className="w-4 h-4 mr-2" />
            Kiosk Modu
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
