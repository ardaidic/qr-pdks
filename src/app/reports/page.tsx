'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Filter,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService, type Employee, type Punch } from '@/lib/api';

export default function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [punches, setPunches] = useState<Punch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [employeesRes, punchesRes] = await Promise.all([
        apiService.getEmployees(),
        apiService.getPunches()
      ]);

      if (employeesRes.success) {
        setEmployees(employeesRes.data || []);
      }

      if (punchesRes.success) {
        setPunches(punchesRes.data || []);
      }

    } catch {
      toast({
        title: "Hata",
        description: "Veriler yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş veriler
  const filteredPunches = punches.filter(punch => {
    const punchDate = punch.timestamp.split('T')[0];
    const inDateRange = punchDate >= dateRange.start && punchDate <= dateRange.end;
    const inDepartment = selectedDepartment === 'all' || 
      employees.find(emp => emp.id === punch.employee_id)?.department === selectedDepartment;
    
    return inDateRange && inDepartment;
  });

  // Departmanlar
  const departments = ['all', ...new Set(employees.map(emp => emp.department))];

  // Rapor hesaplamaları
  const reportData = {
    totalPunches: filteredPunches.length,
    checkIns: filteredPunches.filter(p => p.type === 'CHECK_IN').length,
    checkOuts: filteredPunches.filter(p => p.type === 'CHECK_OUT').length,
    breaks: filteredPunches.filter(p => p.type === 'BREAK_START' || p.type === 'BREAK_END').length,
    uniqueEmployees: new Set(filteredPunches.map(p => p.employee_id)).size,
    averageWorkHours: calculateAverageWorkHours(),
    lateArrivals: calculateLateArrivals(),
    earlyDepartures: calculateEarlyDepartures()
  };

  function calculateAverageWorkHours() {
    // Basit hesaplama - gerçek uygulamada daha karmaşık olacak
    const workDays = new Set(filteredPunches.map(p => p.timestamp.split('T')[0])).size;
    return workDays > 0 ? Math.round((filteredPunches.length * 8) / workDays) : 0;
  }

  function calculateLateArrivals() {
    const checkIns = filteredPunches.filter(p => p.type === 'CHECK_IN');
    return checkIns.filter(p => {
      const hour = new Date(p.timestamp).getHours();
      return hour > 9; // 09:00'dan sonra giriş
    }).length;
  }

  function calculateEarlyDepartures() {
    const checkOuts = filteredPunches.filter(p => p.type === 'CHECK_OUT');
    return checkOuts.filter(p => {
      const hour = new Date(p.timestamp).getHours();
      return hour < 17; // 17:00'dan önce çıkış
    }).length;
  }

  // Departman bazlı rapor
  const departmentStats = departments.filter(d => d !== 'all').map(dept => {
    const deptEmployees = employees.filter(emp => emp.department === dept);
    const deptPunches = filteredPunches.filter(punch => 
      deptEmployees.some(emp => emp.id === punch.employee_id)
    );
    
    return {
      department: dept,
      employeeCount: deptEmployees.length,
      punchCount: deptPunches.length,
      checkIns: deptPunches.filter(p => p.type === 'CHECK_IN').length,
      checkOuts: deptPunches.filter(p => p.type === 'CHECK_OUT').length
    };
  });

  const exportReport = () => {
    const csvData = [
      ['Tarih', 'Personel', 'Departman', 'İşlem', 'Saat', 'Lokasyon'],
      ...filteredPunches.map(punch => {
        const employee = employees.find(emp => emp.id === punch.employee_id);
        return [
          punch.timestamp.split('T')[0],
          employee?.name || 'Bilinmeyen',
          employee?.department || 'Bilinmeyen',
          punch.type === 'CHECK_IN' ? 'Giriş' : 
          punch.type === 'CHECK_OUT' ? 'Çıkış' :
          punch.type === 'BREAK_START' ? 'Mola Başlangıcı' : 'Mola Bitişi',
          new Date(punch.timestamp).toLocaleTimeString('tr-TR'),
          punch.location
        ];
      })
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pdks_rapor_${dateRange.start}_${dateRange.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Başarılı",
      description: "Rapor başarıyla indirildi",
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
              <p className="text-gray-600 mt-2">Personel Devam Kontrol Sistemi Raporları</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={loadData}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Yenile
              </Button>
              <Button onClick={exportReport}>
                <Download className="w-4 h-4 mr-2" />
                CSV İndir
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filtreler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Rapor Filtreleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departman
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'Tüm Departmanlar' : dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Genel İstatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalPunches}</div>
              <p className="text-xs text-muted-foreground">
                {dateRange.start} - {dateRange.end}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giriş Sayısı</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{reportData.checkIns}</div>
              <p className="text-xs text-muted-foreground">
                Toplam giriş
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Çıkış Sayısı</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{reportData.checkOuts}</div>
              <p className="text-xs text-muted-foreground">
                Toplam çıkış
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mola İşlemleri</CardTitle>
              <Coffee className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{reportData.breaks}</div>
              <p className="text-xs text-muted-foreground">
                Mola başlangıç/bitiş
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Geç Gelişler ve Erken Çıkışlar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Düzensizlikler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Geç Gelişler</p>
                        <p className="text-sm text-gray-600">09:00&apos;dan sonra giriş</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">{reportData.lateArrivals}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium">Erken Çıkışlar</p>
                        <p className="text-sm text-gray-600">17:00&apos;dan önce çıkış</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{reportData.earlyDepartures}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Departman Bazlı Rapor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Departman Bazlı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {departmentStats.map((stat) => (
                    <div
                      key={stat.department}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{stat.department}</p>
                        <p className="text-xs text-gray-600">{stat.employeeCount} personel</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{stat.punchCount} işlem</p>
                        <p className="text-xs text-gray-600">
                          {stat.checkIns} giriş / {stat.checkOuts} çıkış
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alt Menü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/settings'}>
            <Filter className="w-4 h-4 mr-2" />
            Ayarlar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Users className="w-4 h-4 mr-2" />
            Kiosk Modu
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
