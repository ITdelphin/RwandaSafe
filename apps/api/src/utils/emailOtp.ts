import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { env } from '../config/env';

export function generateEmailOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    throw Object.assign(new Error('SMTP not configured'), { statusCode: 500 });
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export async function sendEmailOtp(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const code = generateEmailOtpCode();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
    },
  });

  console.log(`[EMAIL OTP] ${email}: ${code}`);

  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('SMTP not configured — OTP logged above');
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'Your Rwanda Safe Email Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1B5E82;">Email Verification</h2>
        <p>Hello ${user.name ?? 'User'},</p>
        <p>Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1B5E82;">
          ${code}
        </div>
        <p>This code expires in <strong>${env.OTP_EXPIRES_MINUTES} minutes</strong>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Rwanda Safe Emergency Response Platform</p>
      </div>
    `,
  });
}

export async function verifyEmailOtp(email: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  if (
    !user.emailVerificationCode ||
    !user.emailVerificationExpires ||
    user.emailVerificationExpires < new Date()
  ) {
    return false;
  }

  if (user.emailVerificationCode !== code) {
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,
    },
  });

  return true;
}
