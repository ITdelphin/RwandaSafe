import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function createOtp(userId: string): Promise<string> {
  await prisma.otpCode.updateMany({
    where: { userId, isUsed: false },
    data: { isUsed: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { userId, code, expiresAt },
  });

  return code;
}

export async function verifyOtp(userId: string, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) return false;
  if (otp.attempts >= env.OTP_MAX_ATTEMPTS) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { isUsed: true },
  });

  return true;
}

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
    return;
  }

  if (!env.AT_API_KEY || !env.AT_USERNAME) {
    console.warn("Africa's Talking credentials not configured, skipping SMS");
    return;
  }

  const AfricasTalking = require('africastalking');
  const at = AfricasTalking({ apiKey: env.AT_API_KEY, username: env.AT_USERNAME });
  await at.SMS.send({
    to: [phone],
    message: `Your Rwanda Safe verification code is: ${code}. Valid for ${env.OTP_EXPIRES_MINUTES} minutes. Do not share this code.`,
    from: env.AT_SENDER_ID,
  });
}
