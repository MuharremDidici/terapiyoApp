import logger from '../config/logger.js';

/**
 * WhatsApp mesajı gönder
 */
export const sendWhatsAppMessage = async (to, template, data) => {
  try {
    // Şablon içeriğini hazırla
    let message = '';
    switch (template) {
      case 'appointment-reminder':
        message = `Sayın ${data.name}, ${data.date} tarihinde ${data.time} saatinde ${data.therapistName} ile randevunuz bulunmaktadır.`;
        break;
      case 'appointment-confirmation':
        message = `Randevunuz onaylanmıştır. ${data.date} tarihinde ${data.time} saatinde ${data.therapistName} ile görüşmeniz bulunmaktadır.`;
        break;
      case 'appointment-cancellation':
        message = `${data.date} tarihinde ${data.time} saatindeki randevunuz iptal edilmiştir.`;
        break;
      case 'verification-code':
        message = `Doğrulama kodunuz: ${data.code}`;
        break;
      case 'password-reset':
        message = `Şifre sıfırlama kodunuz: ${data.code}`;
        break;
      default:
        message = data.message || '';
    }

    // WhatsApp mesajını gönder
    // Not: Bu bir örnek implementasyondur. Gerçek WhatsApp API entegrasyonu için
    // WhatsApp Business API veya başka bir servis kullanılmalıdır.
    logger.info(`WhatsApp message would be sent to ${to}: ${message}`);
    return true;
  } catch (error) {
    logger.error('WhatsApp message sending failed:', error);
    return false;
  }
};

/**
 * Toplu WhatsApp mesajı gönder
 */
export const sendBulkWhatsAppMessage = async (numbers, template, data) => {
  try {
    const results = await Promise.all(
      numbers.map(number => sendWhatsAppMessage(number, template, data))
    );
    return results.every(result => result === true);
  } catch (error) {
    logger.error('Bulk WhatsApp message sending failed:', error);
    return false;
  }
};
