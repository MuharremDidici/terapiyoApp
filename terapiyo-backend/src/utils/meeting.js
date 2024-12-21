// Görüntülü görüşme için gerekli yardımcı fonksiyonlar
export const generateMeetingLink = () => {
  // Benzersiz bir toplantı ID'si oluştur
  const meetingId = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  
  // Toplantı bağlantısını oluştur
  return `${process.env.MEETING_URL || 'https://meet.terapiyo.com'}/${meetingId}`;
};

export const validateMeetingTime = (appointmentDate) => {
  const now = new Date();
  const appointmentTime = new Date(appointmentDate);
  
  // Randevu zamanının geçerli olup olmadığını kontrol et
  if (appointmentTime <= now) {
    throw new Error('Randevu zamanı geçmiş bir tarih olamaz');
  }
  
  // Randevu zamanının çalışma saatleri içinde olup olmadığını kontrol et
  const hours = appointmentTime.getHours();
  if (hours < 9 || hours >= 18) {
    throw new Error('Randevular sadece 09:00 - 18:00 saatleri arasında olabilir');
  }
  
  return true;
};

export const calculateMeetingDuration = (appointmentType) => {
  // Randevu tipine göre görüşme süresini belirle
  const durations = {
    'initial': 30, // İlk görüşme: 30 dakika
    'regular': 50, // Normal seans: 50 dakika
    'followup': 20, // Takip görüşmesi: 20 dakika
    'emergency': 40 // Acil görüşme: 40 dakika
  };
  
  return durations[appointmentType] || 50; // Varsayılan süre: 50 dakika
};

export const generateMeetingPassword = () => {
  // Güvenli bir toplantı şifresi oluştur
  return Math.random().toString(36).slice(-8);
};
