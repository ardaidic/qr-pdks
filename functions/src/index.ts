import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Firebase Admin SDK'yı başlat
admin.initializeApp();

const db = admin.firestore();

// QR Challenge oluşturma
export const generateChallenge = functions.https.onCall(async (data, context) => {
  try {
    const { device_id } = data;
    
    if (!device_id) {
      throw new functions.https.HttpsError('invalid-argument', 'Device ID gerekli');
    }

    // Cihaz doğrulaması
    const deviceDoc = await db.collection('devices').doc(device_id).get();
    if (!deviceDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Geçersiz cihaz');
    }

    const device = deviceDoc.data();
    if (device?.status !== 'active') {
      throw new functions.https.HttpsError('permission-denied', 'Cihaz aktif değil');
    }

    // Challenge oluştur
    const challenge = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 20 * 1000); // 20 saniye geçerli

    // Challenge'ı kaydet
    await db.collection('challenges').doc(challenge).set({
      device_id,
      expires_at: expiresAt,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      challenge,
      expires_at: expiresAt
    };

  } catch (error) {
    console.error('Generate challenge error:', error);
    throw new functions.https.HttpsError('internal', 'Challenge oluşturulamadı');
  }
});

// Punch doğrulama ve kaydetme
export const verifyAndPunch = functions.https.onCall(async (data, context) => {
  try {
    const { device_id, challenge, employee_code, action, selfie_data } = data;

    // Gerekli alanları kontrol et
    if (!device_id || !challenge || !employee_code || !action) {
      throw new functions.https.HttpsError('invalid-argument', 'Eksik parametreler');
    }

    // Challenge doğrulaması
    const challengeDoc = await db.collection('challenges').doc(challenge).get();
    if (!challengeDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Geçersiz challenge');
    }

    const challengeData = challengeDoc.data();
    if (challengeData?.device_id !== device_id) {
      throw new functions.https.HttpsError('permission-denied', 'Challenge cihaz uyumsuzluğu');
    }

    if (challengeData?.expires_at.toDate() < new Date()) {
      throw new functions.https.HttpsError('permission-denied', 'Challenge süresi dolmuş');
    }

    // Çalışan doğrulaması
    const employeeQuery = await db.collection('employees')
      .where('code', '==', employee_code)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (employeeQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Çalışan bulunamadı');
    }

    const employee = employeeQuery.docs[0];
    const employeeData = employee.data();

    // Cihaz doğrulaması
    const deviceDoc = await db.collection('devices').doc(device_id).get();
    if (!deviceDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Geçersiz cihaz');
    }

    const deviceData = deviceDoc.data();
    if (deviceData?.status !== 'active') {
      throw new functions.https.HttpsError('permission-denied', 'Cihaz aktif değil');
    }

    // Selfie işleme (opsiyonel)
    let selfieUrl = null;
    if (selfie_data) {
      // TODO: Selfie'yi Cloud Storage'a yükle
      // selfieUrl = await uploadSelfie(selfie_data, employee.id);
    }

    // Punch kaydını oluştur
    const punchData = {
      employee_id: employee.id,
      device_id,
      type: action,
      ts: admin.firestore.FieldValue.serverTimestamp(),
      source: 'KIOSK',
      meta: selfie_data ? {
        selfie_url: selfieUrl,
        confidence: 0.8,
        reason: null
      } : undefined
    };

    const punchRef = await db.collection('punches').add(punchData);

    // Challenge'ı sil
    await db.collection('challenges').doc(challenge).delete();

    // Oturum durumunu güncelle
    const today = new Date().toISOString().split('T')[0];
    await updateSession(employee.id, action, today);

    return {
      success: true,
      punch_id: punchRef.id,
      message: getSuccessMessage(action)
    };

  } catch (error) {
    console.error('Verify and punch error:', error);
    throw new functions.https.HttpsError('internal', 'Punch işlemi başarısız');
  }
});

// Günlük özet oluşturma (Scheduler)
export const dailyAggregate = functions.pubsub.schedule('0 1 * * *').onRun(async (context) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // Dünün tüm punch'larını al
    const punchesQuery = await db.collection('punches')
      .where('ts', '>=', yesterday)
      .where('ts', '<', new Date())
      .get();

    const punches = punchesQuery.docs.map(doc => doc.data());

    // Çalışan bazında grupla
    const employeePunches = new Map();
    punches.forEach(punch => {
      if (!employeePunches.has(punch.employee_id)) {
        employeePunches.set(punch.employee_id, []);
      }
      employeePunches.get(punch.employee_id).push(punch);
    });

    // Her çalışan için oturum hesapla
    for (const [employeeId, employeePunchList] of employeePunches) {
      await calculateSession(employeeId, employeePunchList, dateStr);
    }

    console.log(`Daily aggregate completed for ${dateStr}`);
    return null;

  } catch (error) {
    console.error('Daily aggregate error:', error);
    return null;
  }
});

// Yardımcı fonksiyonlar
async function updateSession(employeeId: string, action: string, date: string) {
  const sessionRef = db.collection('sessions').doc(`${employeeId}_${date}`);
  const sessionDoc = await sessionRef.get();

  let sessionData = sessionDoc.exists ? sessionDoc.data() || {
    employee_id: employeeId,
    date,
    total_minutes: 0,
    late_minutes: 0,
    early_leave_minutes: 0
  } : {
    employee_id: employeeId,
    date,
    total_minutes: 0,
    late_minutes: 0,
    early_leave_minutes: 0
  };

  // Durumu güncelle
  switch (action) {
    case 'CHECK_IN':
      sessionData.in_ts = admin.firestore.FieldValue.serverTimestamp();
      sessionData.current_status = 'IN';
      break;
    case 'CHECK_OUT':
      sessionData.out_ts = admin.firestore.FieldValue.serverTimestamp();
      sessionData.current_status = 'OUT';
      break;
    case 'BREAK_START':
      sessionData.current_status = 'BREAK';
      break;
    case 'BREAK_END':
      sessionData.current_status = 'IN';
      break;
  }

  await sessionRef.set(sessionData, { merge: true });
}

async function calculateSession(employeeId: string, punches: any[], date: string) {
  // Oturum hesaplama mantığı
  // TODO: Detaylı hesaplama implementasyonu
}

function getSuccessMessage(action: string): string {
  switch (action) {
    case 'CHECK_IN':
      return 'Giriş kaydedildi';
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
