import logger from '../config/logger.js';

/**
 * SMS gönder
 */
export const sendSMS = async (to, template, data) => {
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

    // SMS yerine konsola log
    logger.info('SMS would be sent:', {
      to: to,
      message: message
    });

    return true;
  } catch (error) {
    logger.error('SMS sending failed:', error);
    return false;
  }
};

/**
 * Toplu SMS gönder
 */
export const sendBulkSMS = async (numbers, template, data) => {
  try {
    const results = await Promise.all(
      numbers.map(number => sendSMS(number, template, data))
    );

    return results.every(result => result === true);
  } catch (error) {
    logger.error('Bulk SMS sending failed:', error);
    return false;
  }
};
