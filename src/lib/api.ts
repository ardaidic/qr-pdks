// Basit API servisi - Firebase yerine kullanılacak
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://lhiçocalhost:3001';

export interface Employee {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
  avatar?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Punch {
  id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  location: string;
  device_id: string;
  notes?: string;
}

export interface Session {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  break_start?: string;
  break_end?: string;
  total_work_hours?: number;
  total_break_hours?: number;
  status: 'IN' | 'OUT' | 'BREAK';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Employee endpoints
  async getEmployeeByCode(code: string): Promise<ApiResponse<Employee>> {
    const response = await this.request<Employee[]>(`/employees?code=${code}`);
    if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
      return { success: true, data: response.data[0] };
    }
    return { success: false, error: 'Employee not found' };
  }

  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    return this.request<Employee[]>('/employees');
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<ApiResponse<Employee>> {
    return this.request<Employee>('/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...employee,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }),
    });
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return this.request<Employee>(`/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
  }

  // Punch endpoints
  async createPunch(punch: Omit<Punch, 'id'>): Promise<ApiResponse<Punch>> {
    return this.request<Punch>('/punches', {
      method: 'POST',
      body: JSON.stringify({
        ...punch,
        id: Date.now().toString(),
      }),
    });
  }

  async getPunches(employeeId?: string): Promise<ApiResponse<Punch[]>> {
    const endpoint = employeeId ? `/punches?employee_id=${employeeId}` : '/punches';
    return this.request<Punch[]>(endpoint);
  }

  // Session endpoints
  async getSession(employeeId: string, date: string): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions?employee_id=${employeeId}&date=${date}`);
  }

  async updateSession(session: Session): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${session.id}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    });
  }

  async createSession(session: Omit<Session, 'id'>): Promise<ApiResponse<Session>> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        ...session,
        id: Date.now().toString(),
      }),
    });
  }

  // Device endpoints
  async verifyDevice(deviceId: string): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request<{ valid: boolean }>(`/devices/${deviceId}/verify`);
  }

  // Challenge endpoints (for QR verification)
  async generateChallenge(employeeCode: string): Promise<ApiResponse<{ challenge: string; expires_at: string }>> {
    return this.request<{ challenge: string; expires_at: string }>('/challenges', {
      method: 'POST',
      body: JSON.stringify({
        employee_code: employeeCode,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      }),
    });
  }

  async verifyChallenge(challenge: string, employeeCode: string): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request<{ valid: boolean }>('/challenges/verify', {
      method: 'POST',
      body: JSON.stringify({
        challenge,
        employee_code: employeeCode,
      }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
