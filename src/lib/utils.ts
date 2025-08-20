import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tarih formatlama yardımcıları
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Dakika formatlama
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} dk`;
  }
  
  return `${hours}s ${mins} dk`;
}

// QR kod oluşturma
export function generateQRCode(data: string): string {
  // Bu fonksiyon client-side'da QR kod oluşturmak için kullanılacak
  return `emp:${data}:v1`;
}

// Cihaz kimliği oluşturma
export function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Güvenli hash oluşturma (client-side için basit)
export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer'a dönüştür
  }
  return Math.abs(hash).toString(36);
}

// Durum renkleri
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'inactive':
    case 'error':
      return 'text-red-600 bg-red-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'info':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Rol renkleri
export function getRoleColor(role: string): string {
  switch (role) {
    case 'owner':
      return 'text-purple-600 bg-purple-100';
    case 'manager':
      return 'text-blue-600 bg-blue-100';
    case 'employee':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
