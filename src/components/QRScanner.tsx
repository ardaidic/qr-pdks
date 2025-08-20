'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, className }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Kamera izni kontrolü
    const checkPermission = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } catch (_error) {
        setHasPermission(false);
      }
    };

    checkPermission();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    // Önce scanning durumunu true yap ki DOM elementleri render edilsin
    setIsScanning(true);
    
    // DOM elementinin render edilmesini bekle
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      // DOM elementinin var olup olmadığını kontrol et
      const qrReaderElement = document.getElementById('qr-reader');
      if (!qrReaderElement) {
        console.error('QR reader element not found');
        setIsScanning(false);
        return;
      }

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // QR kod başarıyla okundu
          onScan(decodedText);
          stopScanner();
        },
        (error) => {
          // Hata durumunda sadece log, kullanıcıya gösterme
          console.log('QR Scan error:', error);
        }
      );
    }, 100); // 100ms bekle
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (hasPermission === false) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <CameraOff className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Kamera İzni Gerekli</h3>
        <p className="text-gray-500 text-center mb-4">
          QR kod okumak için kamera iznine ihtiyacımız var. Lütfen tarayıcı ayarlarından kamera iznini verin.
        </p>
        <Button onClick={() => window.location.reload()}>
          Sayfayı Yenile
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {!isScanning ? (
        <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg">
          <QrCode className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">QR Kod Okuyucu</h3>
          <p className="text-gray-500 text-center mb-4">
            QR kodunuzu okutmak için tarayıcıyı başlatın
          </p>
          <Button onClick={startScanner} className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Tarayıcıyı Başlat
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">QR Kod Tarayıcı</h3>
            <Button variant="outline" size="sm" onClick={stopScanner}>
              Durdur
            </Button>
          </div>
          <div id="qr-reader" className="w-full"></div>
        </div>
      )}
    </div>
  );
}
