import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: config.email.auth.user,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
};

export const sendAppointmentConfirmation = async (userEmail, appointmentDetails) => {
  const subject = 'Randevu Onayı';
  const html = `
    <h1>Randevunuz Onaylandı</h1>
    <p>Randevu detayları:</p>
    <ul>
      <li>Tarih: ${appointmentDetails.date}</li>
      <li>Saat: ${appointmentDetails.time}</li>
      <li>Terapist: ${appointmentDetails.therapistName}</li>
    </ul>
    <p>Randevunuza zamanında katılmayı unutmayın.</p>
  `;

  return sendEmail(userEmail, subject, html);
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const subject = 'Şifre Sıfırlama';
  const resetUrl = `${config.cors.origin}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Şifre Sıfırlama İsteği</h1>
    <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
    <a href="${resetUrl}">Şifremi Sıfırla</a>
    <p>Bu bağlantı 1 saat sonra geçerliliğini yitirecektir.</p>
  `;

  return sendEmail(email, subject, html);
};

export const sendVerificationEmail = async (email, verificationToken) => {
  const subject = 'E-posta Doğrulama';
  const verificationUrl = `${config.cors.origin}/verify-email?token=${verificationToken}`;
  const html = `
    <h1>E-posta Adresinizi Doğrulayın</h1>
    <p>E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
    <a href="${verificationUrl}">E-postamı Doğrula</a>
    <p>Bu bağlantı 24 saat sonra geçerliliğini yitirecektir.</p>
  `;

  return sendEmail(email, subject, html);
};
