// Temel kullanıcı rolleri
export type UserRole = 'employee' | 'manager' | 'owner';

// Çalışan bilgileri
export interface Employee {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  location_id: string;
  active: boolean;
  qr_secret_hash: string;
  avatar_url?: string;
  hire_date: Date;
}

// Lokasyon bilgileri
export interface Location {
  id: string;
  name: string;
  tz: string;
  address: string;
}

// Cihaz bilgileri
export interface Device {
  id: string;
  location_id: string;
  name: string;
  platform: string;
  registered_at: Date;
  last_seen_at: Date;
  device_secret_hash: string;
  status: 'active' | 'inactive' | 'maintenance';
}

// Vardiya bilgileri
export interface Shift {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD formatında
  start: string; // HH:MM formatında
  end: string; // HH:MM formatında
  break_policy_id?: string;
  location_id: string;
  notes?: string;
}

// Punch türleri
export type PunchType = 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';
export type PunchSource = 'KIOSK' | 'ADMIN';

// Punch kayıtları
export interface Punch {
  id: string;
  employee_id: string;
  device_id: string;
  type: PunchType;
  ts: Date;
  meta?: {
    selfie_url?: string;
    confidence?: number;
    reason?: string;
  };
  source: PunchSource;
}

// Oturum bilgileri (türetilmiş)
export interface Session {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  in_ts?: Date;
  out_ts?: Date;
  total_minutes: number;
  late_minutes: number;
  early_leave_minutes: number;
  location_id: string;
}

// Mola bilgileri
export interface Break {
  id: string;
  employee_id: string;
  session_id: string;
  start_ts: Date;
  end_ts?: Date;
  total_minutes: number;
}

// Onay türleri
export type ApprovalType = 'ADJUSTMENT';
export type ApprovalStatus = 'OPEN' | 'APPROVED' | 'REJECTED';

// Onay talepleri
export interface Approval {
  id: string;
  employee_id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  requested_by: string;
  approved_by?: string;
  payload: Record<string, unknown>;
  created_at: Date;
}

// Politika ayarları
export interface Policy {
  id: string;
  location_id: string;
  grace_in_minutes: number;
  auto_checkout_after_hours: number;
  rounding: 'NONE' | '5' | '10' | '15';
  selfie_required: 'ALWAYS' | 'RANDOM' | 'NEVER';
  random_selfie_ratio: number; // 0-100 arası
  max_shift_hours: number;
  auto_break_rule: {
    threshold_h: number;
    minutes: number;
  };
  late_threshold_minutes: number;
}

// Rapor bilgileri
export interface Report {
  id: string;
  range: {
    from: Date;
    to: Date;
  };
  location_id?: string;
  url: string;
  created_by: string;
  created_at: Date;
}

// Kullanıcı oturum bilgileri
export interface User {
  id: string;
  auth_uid: string;
  employee_id?: string;
  roles: UserRole[];
  last_login_at: Date;
}

// QR doğrulama için challenge
export interface QRChallenge {
  challenge: string;
  expires_at: Date;
  device_id: string;
}

// Punch doğrulama isteği
export interface PunchRequest {
  device_id: string;
  challenge: string;
  employee_code: string;
  action: PunchType;
  selfie_data?: string; // base64 encoded image
}

// Punch yanıtı
export interface PunchResponse {
  status: 'success' | 'error';
  session_state?: {
    current_status: 'IN' | 'OUT' | 'BREAK';
    total_minutes?: number;
    late_minutes?: number;
  };
  highlights?: {
    is_late?: boolean;
    late_minutes?: number;
    is_early_leave?: boolean;
    early_leave_minutes?: number;
  };
  message?: string;
}

// API yanıt formatı
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
