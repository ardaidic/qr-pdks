import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import type { PunchRequest, PunchResponse, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: PunchRequest = await request.json();
    const { device_id, challenge, employee_code, action, selfie_data } = body;

    // Gerekli alanları kontrol et
    if (!device_id || !challenge || !employee_code || !action) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Eksik parametreler'
      }, { status: 400 });
    }

    // Cihaz doğrulaması
    const deviceQuery = query(
      collection(db, 'devices'),
      where('id', '==', device_id),
      where('status', '==', 'active')
    );
    const deviceSnapshot = await getDocs(deviceQuery);
    
    if (deviceSnapshot.empty) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Geçersiz cihaz'
      }, { status: 401 });
    }

    // Çalışan doğrulaması
    const employeeQuery = query(
      collection(db, 'employees'),
      where('code', '==', employee_code),
      where('active', '==', true)
    );
    const employeeSnapshot = await getDocs(employeeQuery);
    
    if (employeeSnapshot.empty) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Çalışan bulunamadı'
      }, { status: 404 });
    }

    const employee = employeeSnapshot.docs[0].data();
    // const device = deviceSnapshot.docs[0].data(); // TODO: Device bilgilerini kullan

    // Challenge doğrulaması (basit implementasyon)
    if (!challenge.startsWith('challenge_')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Geçersiz challenge'
      }, { status: 400 });
    }

    // Punch kaydını oluştur
    const punchData = {
      employee_id: employee.id,
      device_id: device_id,
      type: action,
      ts: serverTimestamp(),
      source: 'KIOSK' as const,
      meta: selfie_data ? {
        selfie_url: null, // TODO: Selfie'yi Cloud Storage'a yükle
        confidence: 0.8,
        reason: null
      } : undefined
    };

    await addDoc(collection(db, 'punches'), punchData);

    // Oturum durumunu hesapla
    const today = new Date().toISOString().split('T')[0];
    const sessionQuery = query(
      collection(db, 'sessions'),
      where('employee_id', '==', employee.id),
      where('date', '==', today)
    );
    const sessionSnapshot = await getDocs(sessionQuery);

    let currentStatus: 'IN' | 'OUT' | 'BREAK' = 'OUT';
    let totalMinutes = 0;
    let lateMinutes = 0;

    if (!sessionSnapshot.empty) {
      const session = sessionSnapshot.docs[0].data();
      currentStatus = session.current_status || 'OUT';
      totalMinutes = session.total_minutes || 0;
      lateMinutes = session.late_minutes || 0;
    }

    // Yeni durumu belirle
    switch (action) {
      case 'CHECK_IN':
        currentStatus = 'IN';
        break;
      case 'CHECK_OUT':
        currentStatus = 'OUT';
        break;
      case 'BREAK_START':
        currentStatus = 'BREAK';
        break;
      case 'BREAK_END':
        currentStatus = 'IN';
        break;
    }

    // Gecikme kontrolü
    const isLate = action === 'CHECK_IN' && lateMinutes > 0;

    const response: PunchResponse = {
      status: 'success',
      session_state: {
        current_status: currentStatus,
        total_minutes: totalMinutes,
        late_minutes: lateMinutes
      },
      highlights: {
        is_late: isLate,
        late_minutes: isLate ? lateMinutes : undefined
      },
      message: getSuccessMessage(action, isLate, lateMinutes)
    };

    return NextResponse.json<ApiResponse<PunchResponse>>({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Punch API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 });
  }
}

function getSuccessMessage(action: string, isLate: boolean, lateMinutes?: number): string {
  switch (action) {
    case 'CHECK_IN':
      return isLate ? `Giriş kaydedildi (${lateMinutes} dk geç)` : 'Giriş kaydedildi';
    case 'CHECK_OUT':
      return 'Çıkış kaydedildi';
    case 'BREAK_START':
      return 'Mola başlatıldı';
    case 'BREAK_END':
      return 'Mola sonlandırıldı';
    default:
      return 'İşlem başarılı';
  }
}
