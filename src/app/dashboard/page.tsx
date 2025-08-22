'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter,
  Download,
  Calendar,
  Building2,
  UserPlus,
  BarChart3,
  Settings,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiService, type Employee, type Punch } from '@/lib/api';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import QRGenerator from '@/components/QRGenerator';

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [punches, setPunches] = useState<Punch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  // Verileri yükle
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

  // İstatistikler
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    todayPunches: punches.filter(p => 
      p.timestamp.startsWith(selectedDate)
    ).length,
    totalWorkHours: calculateTotalWorkHours()
  };

  function calculateTotalWorkHours() {
    // Basit hesaplama - gerçek uygulamada daha karmaşık olacak
    return Math.round(punches.length * 8);
  }

  // Filtrelenmiş çalışanlar
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Bugünkü punch'lar
  const todayPunches = punches.filter(p => 
    p.timestamp.startsWith(selectedDate)
  );

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
              <h1 className="text-3xl font-bold text-gray-900">QR PDKS Dashboard</h1>
              <p className="text-gray-600 mt-2">Personel Devam Kontrol Sistemi Yönetim Paneli</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={loadData} className="hover:bg-blue-50 hover:border-blue-300">
                <Clock className="w-4 h-4 mr-2" />
                Yenile
              </Button>
              <Button variant="primary" onClick={() => setShowQRModal(true)} className="shadow-lg">
                <QrCode className="w-4 h-4 mr-2" />
                QR Oluştur
              </Button>
              <Button variant="success" onClick={() => setShowAddModal(true)} className="shadow-lg">
                <UserPlus className="w-4 h-4 mr-2" />
                Yeni Personel
              </Button>
            </div>
          </div>
        </motion.div>

        {/* İstatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeEmployees} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugünkü Giriş</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayPunches}</div>
              <p className="text-xs text-muted-foreground">
                {selectedDate} tarihi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Çalışma</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkHours}h</div>
              <p className="text-xs text-muted-foreground">
                Bu ay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departmanlar</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(employees.map(emp => emp.department)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Farklı departman
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personel Listesi */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personel Listesi
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Personel ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Yükleniyor...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                         {filteredEmployees.map((employee) => (
                       <div
                         key={employee.id}
                         className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:scale-[1.02]"
                         onClick={() => {
                           setSelectedEmployee(employee);
                           setShowEditModal(true);
                         }}
                       >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{employee.name}</h4>
                          <p className="text-xs text-gray-500">{employee.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-gray-600">{employee.code}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            employee.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bugünkü Girişler */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Bugünkü Girişler
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Yükleniyor...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {todayPunches.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Bugün henüz giriş yapılmamış</p>
                      </div>
                    ) : (
                      todayPunches.map((punch) => (
                        <div
                          key={punch.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {punch.employee_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{punch.employee_name}</h4>
                            <p className="text-xs text-gray-500">{punch.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono text-gray-600">
                              {new Date(punch.timestamp).toLocaleTimeString('tr-TR')}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              punch.type === 'CHECK_IN' ? 'bg-green-100 text-green-800' :
                              punch.type === 'CHECK_OUT' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {punch.type === 'CHECK_IN' ? 'Giriş' :
                               punch.type === 'CHECK_OUT' ? 'Çıkış' :
                               punch.type === 'BREAK_START' ? 'Mola Başlangıcı' : 'Mola Bitişi'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alt Menü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Button variant="outline" onClick={() => window.location.href = '/reports'}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Raporlar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/settings'}>
            <Settings className="w-4 h-4 mr-2" />
            Ayarlar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Building2 className="w-4 h-4 mr-2" />
            Kiosk Modu
          </Button>
        </motion.div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={loadData}
        employee={selectedEmployee}
      />

      {/* QR Generator Modal */}
      <QRGenerator
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}
