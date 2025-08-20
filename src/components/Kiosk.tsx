'use client';

import React, { useState, useEffect } from 'react';
import { QRScanner } from './QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  User, 
  LogIn, 
  LogOut, 
  Coffee, 
  CheckCircle, 
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { formatTime, formatMinutes } from '@/lib/utils';
import type { PunchType, PunchResponse } from '@/types';

interface KioskProps {
  deviceId: string;
  locationName: string;
  deviceName: string;
}

interface CurrentEmployee {
  id: string;
  name: string;
  code: string;
  currentStatus: 'IN' | 'OUT' | 'BREAK';
  lastPunch?: Date;
  totalMinutes?: number;
}

export function Kiosk({ deviceId, locationName, deviceName }: KioskProps) {
  const [currentEmployee, setCurrentEmployee] = useState<CurrentEmployee | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Online/offline durumu kontrolü
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  // QR kod okunduğunda
  const handleQRScan = async (qrData: string) => {
    setIsProcessing(true);
    setMessage(null);

    try {
      // QR verisini parse et
      const match = qrData.match(/^emp:([^:]+):v1$/);
      if (!match) {
        throw new Error('Geçersiz QR kod formatı');
      }

      const employeeCode = match[1];
      
      // Çalışan bilgilerini al
      const employee = await getEmployeeByCode(employeeCode);
      if (!employee) {
        throw new Error('Çalışan bulunamadı');
      }

      // Mevcut durumu kontrol et ve uygun punch türünü belirle
      const punchType = await determinePunchType(employee.id);
      
      // Punch işlemini gerçekleştir
      const response = await performPunch({
        device_id: deviceId,
        challenge: generateChallenge(),
        employee_code: employeeCode,
        action: punchType
      });

      if (response.status === 'success') {
        setCurrentEmployee({
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          code: employee.code,
          currentStatus: response.session_state?.current_status || 'OUT',
          lastPunch: new Date(),
          totalMinutes: response.session_state?.total_minutes
        });

        setMessage({
          type: 'success',
          text: getSuccessMessage(punchType, response.highlights)
        });

        // Başarı sesi çal
        playSuccessSound();
      } else {
        throw new Error(response.message || 'Punch işlemi başarısız');
      }

    } catch (error) {
      console.error('Punch error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
      
      // Hata sesi çal
      playErrorSound();
    } finally {
      setIsProcessing(false);
      
      // Mesajı 3 saniye sonra temizle
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Yardımcı fonksiyonlar
  const getEmployeeByCode = async (code: string) => {
    try {
      const response = await fetch(`/api/employees/${code}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Çalışan bulunamadı');
      }

      return result.data;
    } catch (error) {
      console.error('Employee API error:', error);
      throw error;
    }
  };

  const determinePunchType = async (_employeeId: string): Promise<PunchType> => {
    // TODO: Mevcut oturum durumunu kontrol et
    return 'CHECK_IN';
  };

  const performPunch = async (request: Record<string, unknown>): Promise<PunchResponse> => {
    try {
      const response = await fetch('/api/punch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Punch işlemi başarısız');
      }

      return result.data;
    } catch (error) {
      console.error('Punch API error:', error);
      throw error;
    }
  };

  const generateChallenge = () => {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getSuccessMessage = (punchType: PunchType, highlights?: Record<string, unknown>) => {
    switch (punchType) {
      case 'CHECK_IN':
        return highlights?.is_late 
          ? `Giriş kaydedildi (${highlights.late_minutes} dk geç)`
          : 'Giriş kaydedildi';
      case 'CHECK_OUT':
        return 'Çıkış kaydedildi';
      case 'BREAK_START':
        return 'Mola başlatıldı';
      case 'BREAK_END':
        return 'Mola sonlandırıldı';
      default:
        return 'İşlem başarılı';
    }
  };

  const playSuccessSound = () => {
    // TODO: Başarı sesi çal
    console.log('Success sound');
  };

  const playErrorSound = () => {
    // TODO: Hata sesi çal
    console.log('Error sound');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">QR PDKS Kiosk</h1>
          <p className="text-gray-400">{locationName} - {deviceName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm">
              {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Son senkron: {formatTime(lastSync)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              QR Kod Okut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QRScanner 
              onScan={handleQRScan}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Mevcut Durum
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentEmployee ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">{currentEmployee.name}</div>
                  <div className="text-gray-400">{currentEmployee.code}</div>
                </div>
                
                <div className="flex justify-center">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    currentEmployee.currentStatus === 'IN' 
                      ? 'bg-green-600 text-white' 
                      : currentEmployee.currentStatus === 'BREAK'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {currentEmployee.currentStatus === 'IN' && <LogIn className="w-4 h-4 inline mr-2" />}
                    {currentEmployee.currentStatus === 'BREAK' && <Coffee className="w-4 h-4 inline mr-2" />}
                    {currentEmployee.currentStatus === 'OUT' && <LogOut className="w-4 h-4 inline mr-2" />}
                    {currentEmployee.currentStatus === 'IN' ? 'İçeride' : 
                     currentEmployee.currentStatus === 'BREAK' ? 'Molada' : 'Dışarıda'}
                  </div>
                </div>

                {currentEmployee.lastPunch && (
                  <div className="text-center text-sm text-gray-400">
                    Son işlem: {formatTime(currentEmployee.lastPunch)}
                  </div>
                )}

                {currentEmployee.totalMinutes !== undefined && (
                  <div className="text-center text-sm text-gray-400">
                    Bugünkü toplam: {formatMinutes(currentEmployee.totalMinutes)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Henüz QR kod okutulmadı
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">İşlem yapılıyor...</p>
          </div>
        </div>
      )}
    </div>
  );
}
