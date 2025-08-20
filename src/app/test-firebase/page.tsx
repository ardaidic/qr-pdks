'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Firestore bağlantısını test et
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setStatus('✅ Firebase bağlantısı başarılı!');
      } catch (err) {
        console.error('Firebase test error:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        setStatus('❌ Firebase bağlantısı başarısız');
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Firebase Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-medium">Durum:</p>
            <p className="text-lg">{status}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="font-medium text-red-800">Hata:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="font-medium text-blue-800">Yapılması Gerekenler:</p>
            <ul className="text-blue-600 text-sm mt-2 space-y-1">
              <li>• Firebase Console&apos;da Firestore Database&apos;i etkinleştirin</li>
              <li>• .env.local dosyasını Firebase bilgileriyle güncelleyin</li>
              <li>• Test verilerini Firestore&apos;a ekleyin</li>
            </ul>
          </div>

          <Link 
            href="/" 
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
