'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  CheckCircle, 
  XCircle, 
  Loader2,
  QrCode,
  Smartphone,
  Building2,
  Calendar,
  Users,
  Hash,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from './QRScanner';
import { apiService, type Employee, type Punch } from '@/lib/api';

interface KioskProps {
  deviceId?: string;
  location?: string;
}

const Kiosk: React.FC<KioskProps> = ({ 
  deviceId = 'KIOSK001', 
  location = 'Ana Giriş' 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPunch, setLastPunch] = useState<Punch | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const { toast } = useToast();

  // Gerçek zamanlı saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQRScan = async (qrData: string) => {
    setIsScanning(false);
    setIsProcessing(true);

    try {
      // QR kodundan çalışan kodunu çıkar
      const employeeCode = qrData.split(':')[1] || qrData;
      
      // Çalışan bilgilerini getir
      const employeeResponse = await apiService.getEmployeeByCode(employeeCode);
      
      if (!employeeResponse.success || !employeeResponse.data) {
        toast({
          title: "Hata",
          description: "Çalışan bulunamadı veya QR kod geçersiz",
          variant: "destructive",
        });
        return;
      }

      const employee = employeeResponse.data;
      setCurrentEmployee(employee);

      // Punch işlemini gerçekleştir
      const punchType = await determinePunchType(employee.id);
      
      const punchData = {
        employee_id: employee.id,
        employee_code: employee.code,
        employee_name: employee.name,
        type: punchType,
        timestamp: new Date().toISOString(),
        location: location,
        device_id: deviceId,
      };

      const punchResponse = await apiService.createPunch(punchData);
      
      if (punchResponse.success && punchResponse.data) {
        setLastPunch(punchResponse.data);
        
        const successMessage = getSuccessMessage(punchType, employee.name);
        toast({
          title: "Başarılı",
          description: successMessage,
          variant: "success",
        });

        // 3 saniye sonra çalışan bilgisini temizle
        setTimeout(() => {
          setCurrentEmployee(null);
          setLastPunch(null);
        }, 3000);
      } else {
        toast({
          title: "Hata",
          description: "Punch işlemi başarısız",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const determinePunchType = async (employeeId: string): Promise<Punch['type']> => {
    const today = new Date().toISOString().split('T')[0];
    const sessionResponse = await apiService.getSession(employeeId, today);
    
    if (sessionResponse.success && sessionResponse.data) {
      const session = sessionResponse.data;
      
      if (!session.check_in) return 'CHECK_IN';
      if (session.check_in && !session.check_out) {
        if (session.status === 'BREAK') return 'BREAK_END';
        return 'BREAK_START';
      }
      if (session.check_in && session.check_out) return 'CHECK_OUT';
    }
    
    return 'CHECK_IN';
  };

  const getSuccessMessage = (punchType: Punch['type'], employeeName: string): string => {
    switch (punchType) {
      case 'CHECK_IN':
        return `${employeeName} başarıyla giriş yaptı`;
      case 'CHECK_OUT':
        return `${employeeName} başarıyla çıkış yaptı`;
      case 'BREAK_START':
        return `${employeeName} mola başlattı`;
      case 'BREAK_END':
        return `${employeeName} moladan döndü`;
      default:
        return 'İşlem başarılı';
    }
  };

  const getPunchIcon = (punchType: Punch['type']) => {
    switch (punchType) {
      case 'CHECK_IN':
        return <LogIn className="w-6 h-6 text-green-600" />;
      case 'CHECK_OUT':
        return <LogOut className="w-6 h-6 text-red-600" />;
      case 'BREAK_START':
        return <Coffee className="w-6 h-6 text-yellow-600" />;
      case 'BREAK_END':
        return <Coffee className="w-6 h-6 text-blue-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
  };

  const getPunchTypeText = (punchType: Punch['type']) => {
    switch (punchType) {
      case 'CHECK_IN':
        return 'Giriş';
      case 'CHECK_OUT':
        return 'Çıkış';
      case 'BREAK_START':
        return 'Mola Başlangıcı';
      case 'BREAK_END':
        return 'Mola Bitişi';
      default:
        return 'Punch';
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen personel kodunu girin",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      console.log('Aranan kod:', manualCode.trim());
      const response = await apiService.getEmployeeByCode(manualCode.trim());
      console.log('API response:', response);
      
      if (response.success && response.data) {
        const employee = response.data;
        console.log('Bulunan personel:', employee);
        
        const punchType = await determinePunchType(employee.id);
        console.log('Punch türü:', punchType);
        
        const punch = await apiService.createPunch({
          employee_id: employee.id,
          employee_code: employee.code,
          employee_name: employee.name,
          type: punchType,
          timestamp: new Date().toISOString(),
          location: location,
          device_id: deviceId
        });

        console.log('Punch response:', punch);

        if (punch.success) {
          setCurrentEmployee(employee);
          setLastPunch(punch.data!);
          
          toast({
            title: "Başarılı",
            description: getSuccessMessage(punchType, employee.name),
            variant: "success",
          });
        } else {
          toast({
            title: "Hata",
            description: punch.error || "Punch oluşturulamadı",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Hata",
          description: response.error || "Personel bulunamadı",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Manual submit error:', error);
      toast({
        title: "Hata",
        description: "İşlem sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setManualCode('');
      setShowManualInput(false);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setManualCode(prev => prev.slice(0, -1));
    } else if (key === 'enter') {
      handleManualSubmit();
    } else if (manualCode.length < 10) {
      setManualCode(prev => prev + key);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">QR PDKS</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="ml-4"
            >
              <Users className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
          <p className="text-gray-600 text-lg">Personel Devam Kontrol Sistemi</p>
          
          {/* Saat ve Tarih */}
          <div className="mt-4 flex items-center justify-center gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono">
                {currentTime.toLocaleTimeString('tr-TR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-lg">
                {currentTime.toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Panel - QR Scanner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  QR Kod Tarayıcı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isScanning ? (
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 rounded-xl p-8 border-2 border-dashed border-blue-300 shadow-lg">
                      <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Smartphone className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                        QR Kod Tarama
                      </h3>
                      <p className="text-gray-600 mb-6 text-center">
                        QR kodunuzu tarayıcıya yaklaştırın
                      </p>
                      <Button 
                        onClick={() => setIsScanning(true)}
                        variant="kiosk"
                        size="xl"
                        className="w-full"
                      >
                        <QrCode className="w-6 h-6 mr-2" />
                        QR Kod Tara
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QRScanner onScan={handleQRScan} />
                    <Button 
                      onClick={() => setIsScanning(false)}
                      variant="outline"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Taramayı Durdur
                    </Button>
                  </div>
                )}

                {/* İşlem Durumu */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="relative">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                    <span className="text-blue-700 font-medium">İşlem yapılıyor...</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sağ Panel - Manuel Giriş ve Son İşlemler */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Manuel Giriş */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-green-600" />
                  Manuel Giriş
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showManualInput ? (
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-xl p-6 border-2 border-dashed border-green-300 shadow-lg">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Hash className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                        Manuel Giriş
                      </h3>
                      <p className="text-gray-600 mb-4 text-center">
                        Personel kodunuzu girin
                      </p>
                      <Button 
                        onClick={() => setShowManualInput(true)}
                        variant="primary"
                        size="xl"
                        className="w-full"
                      >
                        <Hash className="w-5 h-5 mr-2" />
                        Manuel Giriş
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Kod Girişi */}
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200 shadow-lg">
                        <input
                          type="text"
                          value={manualCode}
                          readOnly
                          className="w-full text-center text-3xl font-mono bg-transparent border-none outline-none text-blue-800"
                          placeholder="Kod girin..."
                        />
                        <div className="text-center mt-2 text-sm text-gray-500">
                          {manualCode.length > 0 ? `${manualCode.length} karakter` : 'Kod bekleniyor...'}
                        </div>
                      </div>
                      
                      {/* Sayısal Tuş Takımı */}
                      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <Button
                            key={num}
                            variant="outline"
                            size="lg"
                            onClick={() => handleKeyPress(num.toString())}
                            className="h-16 text-xl font-mono bg-white hover:bg-gray-50 border-2 hover:border-blue-300 transition-all duration-200"
                          >
                            {num}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleKeyPress('backspace')}
                          className="h-16 text-xl bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-600 transition-all duration-200"
                        >
                          ←
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleKeyPress('0')}
                          className="h-16 text-xl font-mono bg-white hover:bg-gray-50 border-2 hover:border-blue-300 transition-all duration-200"
                        >
                          0
                        </Button>
                        <Button
                          variant="success"
                          size="lg"
                          onClick={() => handleKeyPress('enter')}
                          className="h-16 text-xl font-semibold"
                        >
                          ✓
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setShowManualInput(false);
                        setManualCode('');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Geri Dön
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Cihaz Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  Cihaz Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cihaz ID:</span>
                    <span className="font-mono">{deviceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Konum:</span>
                    <span>{location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className="text-green-600 font-medium">Aktif</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Son İşlem */}
            <AnimatePresence>
              {currentEmployee && lastPunch && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        {getPunchIcon(lastPunch.type)}
                        Son İşlem
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={currentEmployee.avatar} />
                          <AvatarFallback>
                            {currentEmployee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{currentEmployee.name}</h3>
                          <p className="text-gray-600">{currentEmployee.department}</p>
                          <p className="text-sm text-gray-500">{currentEmployee.position}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">İşlem Türü:</span>
                          <span className="font-medium">{getPunchTypeText(lastPunch.type)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Saat:</span>
                          <span className="font-mono">
                            {new Date(lastPunch.timestamp).toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Konum:</span>
                          <span>{lastPunch.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Talimatlar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nasıl Kullanılır?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      1
                    </div>
                    <p>QR kodunuzu cihaza yaklaştırın</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      2
                    </div>
                    <p>Kamera QR kodu otomatik olarak tarayacak</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      3
                    </div>
                    <p>İşlem türü otomatik olarak belirlenecek</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      4
                    </div>
                    <p>Başarılı işlem mesajını bekleyin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Kiosk;
