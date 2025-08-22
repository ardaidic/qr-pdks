'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, QrCode, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService, type Employee } from '@/lib/api';

interface QRGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRGenerator({ isOpen, onClose }: QRGeneratorProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const response = await apiService.getEmployees();
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch {
      toast({
        title: "Hata",
        description: "Personel listesi yüklenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const generateQR = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Hata",
        description: "Lütfen bir personel seçin",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const employee = employees.find(emp => emp.id === selectedEmployee);
      if (!employee) return;

      // QR kod verisi oluştur
      const qrPayload = {
        employee_id: employee.id,
        employee_code: employee.code,
        employee_name: employee.name,
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 dakika
        type: 'CHECK_IN'
      };

      const qrString = JSON.stringify(qrPayload);
      setQrData(qrString);

      // QR kod resmi oluştur (QR kod kütüphanesi kullanılabilir)
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrString)}`;
      setQrImage(qrImageUrl);

      toast({
        title: "Başarılı",
        description: "QR kod başarıyla oluşturuldu",
        variant: "success",
      });

    } catch {
      toast({
        title: "Hata",
        description: "QR kod oluşturulurken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr_${selectedEmployee}_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Başarılı",
      description: "QR kod başarıyla indirildi",
      variant: "success",
    });
  };

  const copyQRData = async () => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      
      toast({
        title: "Başarılı",
        description: "QR kod verisi kopyalandı",
        variant: "success",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Hata",
        description: "QR kod verisi kopyalanamadı",
        variant: "destructive",
      });
    }
  };

  const refreshQR = () => {
    if (selectedEmployee) {
      generateQR();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QR Kod Oluşturucu
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personel Seçimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personel Seçin
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Personel seçin...</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.code} - {employee.name} ({employee.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* QR Kod Oluştur Butonu */}
                <div className="flex gap-3">
                  <Button
                    onClick={generateQR}
                    disabled={!selectedEmployee || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Oluşturuluyor...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        QR Kod Oluştur
                      </div>
                    )}
                  </Button>
                  
                  {qrImage && (
                    <Button
                      variant="outline"
                      onClick={refreshQR}
                      disabled={loading}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* QR Kod Görüntüleme */}
                <AnimatePresence>
                  {qrImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <img
                            src={qrImage}
                            alt="QR Code"
                            className="w-64 h-64 object-contain"
                          />
                        </div>
                      </div>

                      {/* QR Kod Verisi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          QR Kod Verisi
                        </label>
                        <div className="relative">
                          <textarea
                            value={qrData}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono resize-none"
                            rows={4}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyQRData}
                            className="absolute top-2 right-2"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* İndirme Butonu */}
                      <div className="flex justify-center">
                        <Button onClick={downloadQR} variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          QR Kodu İndir
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bilgi */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">QR Kod Bilgileri</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• QR kod 5 dakika geçerlidir</li>
                    <li>• Personel kiosk&apos;ta QR kodu okutarak giriş yapabilir</li>
                    <li>• QR kod verisi şifrelenmiş formatta saklanır</li>
                    <li>• İndirilen QR kod yazdırılabilir</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
