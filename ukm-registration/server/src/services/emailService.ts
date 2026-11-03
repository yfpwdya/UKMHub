import nodemailer from 'nodemailer';
import { pool } from '../db/pool';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendStatusNotificationEmail = async (
  userId: number,
  registrationId: number,
  toEmail: string,
  userName: string,
  status: 'accepted' | 'rejected' | 'pending',
  ukmName?: string,
  referenceNumber?: string,
  note?: string
) => {
  const isAccepted = status === 'accepted';
  const subject = isAccepted
    ? `🎉 Selamat! Kamu Diterima di ${ukmName || 'UKM Pilihanmu'} – UKMHub`
    : status === 'rejected'
    ? `Informasi Hasil Seleksi UKM – UKMHub`
    : `Pembaruan Status Pendaftaran UKM – UKMHub`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 8px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">UKMHub Notification</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Sistem Pendaftaran Unit Kegiatan Mahasiswa</p>
      </div>

      <div style="padding: 24px 0;">
        <p>Halo, <strong>${userName}</strong>!</p>
        
        ${
          isAccepted
            ? `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <h3 style="color: #065f46; margin: 0 0 8px;">Selamat! Pendaftaran Kamu Diterima</h3>
                <p style="margin: 0; color: #047857;">Kamu dinyatakan <strong>LOLOS SELEKSI</strong> dan resmi diterima di <strong>${ukmName}</strong>.</p>
                ${referenceNumber ? `<p style="margin: 8px 0 0; font-size: 12px; color: #065f46;">No. Ref: <code>${referenceNumber}</code></p>` : ''}
              </div>
              <p>Silakan buka dashboard UKMHub untuk memilih jadwal wawancara / *first gathering* yang telah dibuka oleh pengurus UKM.</p>`
            : status === 'rejected'
            ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <h3 style="color: #991b1b; margin: 0 0 8px;">Informasi Hasil Seleksi</h3>
                <p style="margin: 0; color: #b91c1c;">Mohon maaf, kuota UKM pilihanmu telah terpenuhi untuk periode ini.</p>
                ${note ? `<p style="margin: 8px 0 0; font-size: 13px; color: #7f1d1d;"><em>Catatan: ${note}</em></p>` : ''}
              </div>
              <p>Tetap semangat! Kamu masih dapat mendaftar kembali pada periode penerimaan berikutnya.</p>`
            : `<p>Status pendaftaranmu telah diperbarui menjadi: <strong>${status}</strong>.</p>`
        }

        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Buka Dashboard UKMHub
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} UKMHub. Hak cipta dilindungi.
      </div>
    </div>
  `;

  try {
    if (process.env.SMTP_USER) {
      await transporter.sendMail({
        from: `"UKMHub Campus" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[EMAIL SENT] to ${toEmail} for Registration #${registrationId}`);
    } else {
      console.log(`[EMAIL MOCK] to: ${toEmail} | Subject: ${subject}`);
    }

    await pool.query(
      `INSERT INTO email_logs (user_id, registration_id, email_to, subject, status)
       VALUES ($1, $2, $3, $4, 'sent')`,
      [userId, registrationId, toEmail, subject]
    );
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    await pool.query(
      `INSERT INTO email_logs (user_id, registration_id, email_to, subject, status)
       VALUES ($1, $2, $3, $4, 'failed')`,
      [userId, registrationId, toEmail, subject]
    );
  }
};
