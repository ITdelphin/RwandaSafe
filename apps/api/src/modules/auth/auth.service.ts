import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { Role } from '@prisma/client';
import { createOtp, verifyOtp, sendOtpSms } from '../../utils/otp';

function signAccess(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role, isAnonymous: user.isAnonymous },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
}

function signRefresh(userId: string) {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
}

export const authService = {
  // ── Email/Password auth (for dashboards) ──────────────────────────────

  async loginWithPassword(email: string, password: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user || !user.passwordHash) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    if (!user.isActive) throw Object.assign(new Error('Account is disabled'), { statusCode: 403 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    if (user.role === 'CITIZEN') throw Object.assign(new Error('This portal is for staff only. Please use the Rwanda Safe citizen app.'), { statusCode: 403 });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user.id);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone } };
  },

  async register(data: { email: string; password: string; name: string; phone?: string; agencyType?: string }) {
    const existing = await prisma.user.findFirst({ where: { email: data.email } });
    if (existing) throw Object.assign(new Error('An account with this email already exists'), { statusCode: 409 });

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Determine role from agency type
    const roleMap: Record<string, Role> = {
      POLICE: Role.POLICE_OFFICER,
      HOSPITAL: Role.MEDICAL_RESPONDER,
      FIRE: Role.FIRE_OFFICER,
      RIB: Role.RIB_INVESTIGATOR,
    };
    const role = data.agencyType ? (roleMap[data.agencyType] ?? Role.CITIZEN) : Role.CITIZEN;

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role,
        isVerified: true,
        isActive: true,
      },
    });

    // If agencyType given, link to the first agency of that type
    if (data.agencyType) {
      const agency = await prisma.agency.findFirst({ where: { type: data.agencyType as any } });
      if (agency) {
        await prisma.officer.create({
          data: { userId: user.id, agencyId: agency.id, isOnDuty: false },
        }).catch(() => {}); // ignore if already exists
      }
    }

    // Send welcome email
    await sendEmail(data.email, 'Welcome to Rwanda Safe', `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1B5E82;">Welcome to Rwanda Safe, ${data.name}!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${role.replace(/_/g, ' ')}</p>
        <p>You can now log in to your dashboard.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Rwanda Safe Emergency Response Platform</p>
      </div>
    `);

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user.id);
    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

    await sendEmail(email, 'Reset Your Rwanda Safe Password', `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1B5E82;">Password Reset Request</h2>
        <p>Hello ${user.name ?? 'User'},</p>
        <p>You requested a password reset for your Rwanda Safe account.</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1B5E82; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Rwanda Safe Emergency Response Platform</p>
      </div>
    `);

    console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);
    return { message: 'If that email exists, a reset link has been sent.' };
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpires: null },
    });

    await sendEmail(user.email ?? '', 'Your Rwanda Safe Password Has Been Reset', `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #22C55E;">Password Reset Successful</h2>
        <p>Hello ${user.name ?? 'User'},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you did not make this change, please contact us immediately.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Rwanda Safe Emergency Response Platform</p>
      </div>
    `);

    return { message: 'Password reset successfully. You can now log in.' };
  },

  // ── OTP auth (kept for citizen app) ──────────────────────────────────

  async requestOtp(phone: string, name?: string) {
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone, name, role: Role.CITIZEN } });
    }
    const code = await createOtp(user.id);
    await sendOtpSms(phone, code);
    return { userId: user.id, message: 'OTP sent successfully' };
  },

  async verifyOtpAndLogin(phone: string, code: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    const isValid = await verifyOtp(user.id, code);
    if (!isValid) throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 401 });
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, lastLoginAt: new Date() } });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user.id);
    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
    return { accessToken, refreshToken, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } };
  },

  async refreshAccessToken(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    return { accessToken: signAccess(stored.user) };
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { isRevoked: true } });
  },
};
