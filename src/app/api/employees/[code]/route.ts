import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Employee, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Çalışan kodu gerekli'
      }, { status: 400 });
    }

    // Çalışan bilgilerini al
    const employeeQuery = query(
      collection(db, 'employees'),
      where('code', '==', code),
      where('active', '==', true)
    );
    const employeeSnapshot = await getDocs(employeeQuery);
    
    if (employeeSnapshot.empty) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Çalışan bulunamadı'
      }, { status: 404 });
    }

    const employeeData = employeeSnapshot.docs[0].data();
    const employee: Employee = {
      id: employeeSnapshot.docs[0].id,
      code: employeeData.code,
      first_name: employeeData.first_name,
      last_name: employeeData.last_name,
      phone: employeeData.phone,
      email: employeeData.email,
      role: employeeData.role,
      location_id: employeeData.location_id,
      active: employeeData.active,
      qr_secret_hash: employeeData.qr_secret_hash,
      avatar_url: employeeData.avatar_url,
      hire_date: employeeData.hire_date?.toDate() || new Date()
    };

    return NextResponse.json<ApiResponse<Employee>>({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('Employee API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 });
  }
}
