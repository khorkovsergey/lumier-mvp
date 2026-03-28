import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Serverless-friendly settings
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    dnsTimeout: 10000,
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumierinsight.com'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"Lumier" <${process.env.SMTP_USER || 'info@lumierinsight.com'}>`,
    to,
    subject: 'Восстановление пароля — Lumier',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #1E1A18;">
        <p style="font-size: 24px; font-weight: 300; margin-bottom: 8px; letter-spacing: 0.08em;">Lumier</p>
        <div style="height: 1px; width: 32px; background: #D4954A; margin-bottom: 32px;"></div>

        <p style="font-size: 15px; line-height: 1.7; color: #4A4340; margin-bottom: 24px;">
          Вы запросили восстановление пароля. Нажмите на кнопку ниже, чтобы задать новый пароль:
        </p>

        <a href="${resetUrl}"
          style="display: inline-block; background: #D4954A; color: #fff; text-decoration: none;
                 padding: 14px 32px; border-radius: 14px; font-size: 14px; font-weight: 500;">
          Восстановить пароль
        </a>

        <p style="font-size: 13px; line-height: 1.6; color: #8C8279; margin-top: 32px;">
          Ссылка действительна 1 час. Если вы не запрашивали восстановление, просто проигнорируйте это письмо.
        </p>

        <div style="height: 1px; background: #EDE8E2; margin: 32px 0;"></div>
        <p style="font-size: 11px; color: #B5ADA4;">© Lumier — lumierinsight.com</p>
      </div>
    `,
  })
}
