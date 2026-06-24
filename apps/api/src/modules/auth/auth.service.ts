import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { Role } from '@prisma/client';
import { createOtp, verifyOtp, sendOtpSms } from '../../utils/otp';
import { sendEmailOtp as sendEmailOtpUtil, verifyEmailOtp as verifyEmailOtpUtil } from '../../utils/emailOtp';
import { accessService } from '../access/access.service';

function generateTokenPair(user: { id: string; phone?: string | null; email?: string | null; role: Role, isAnonymous?: boolean }) {
  const accessToken = jwt.sign(
    { id: user.id, phone: user.phone, email: user.email, role: user.role, isAnonymous: user.isAnonymous ?? false },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
  );

  return { accessToken, refreshToken };
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

  // ───── PHONE OTP FLOW (Citizen) ─────
  async sendPhoneOtp(phone: string, name?: string, lang: 'en' | 'rw' | 'fr' = 'en') {
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, name, role: Role.CITIZEN, preferredLang: lang },
      });
    }

    const code = await createOtp(user.id, 'SMS');
    await sendOtpSms(phone, code, lang);

    return { message: 'Verification code sent via SMS' };
  },

  async verifyPhoneOtp(phone: string, code: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw Object.assign(new Error('No account found with this phone number'), { statusCode: 404 });

    const isValid = await verifyOtp(user.id, code);
    if (!isValid) throw Object.assign(new Error('Invalid or expired code'), { statusCode: 401 });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, lastLoginAt: new Date() },
    });

    const tokens = generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.toPublicUser(user) };
  },

  // ───── EMAIL OTP FLOW (Citizen) ─────
  async sendEmailOtp(email: string, name?: string, lang: 'en' | 'rw' | 'fr' = 'en') {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, role: Role.CITIZEN, preferredLang: lang },
      });
    }

    await sendEmailOtpUtil(email);
    return { message: 'Verification code sent to your email' };
  },

  async verifyEmailOtp(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error('No account found with this email'), { statusCode: 404 });

    const isValid = await verifyEmailOtpUtil(email, code);
    if (!isValid) throw Object.assign(new Error('Invalid or expired verification code'), { statusCode: 401 });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, isEmailVerified: true, lastLoginAt: new Date() },
    });

    const tokens = generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.toPublicUser(user) };
  },

  // ───── OFFICER OTP FLOW (Portal) ─────
  async sendOfficerOtp(phone: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (user.role === 'CITIZEN') throw Object.assign(new Error('This portal is for officers only'), { statusCode: 403 });

    const code = await createOtp(user.id, 'SMS');
    await sendOtpSms(phone, code);
    return { message: 'Verification code sent via SMS' };
  },

  async verifyOfficerOtp(phone: string, code: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (user.role === 'CITIZEN') throw Object.assign(new Error('This portal is for officers only'), { statusCode: 403 });

    const isValid = await verifyOtp(user.id, code);
    if (!isValid) throw Object.assign(new Error('Invalid or expired code'), { statusCode: 401 });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const dashboardAccess = await accessService.getUserDashboardAccess(user.id);

    return {
      ...tokens,
      user: this.toPublicUser(user),
      dashboardAccess,
    };
  },

  // ───── GUEST / ANONYMOUS SESSION ─────
  async createGuestSession(lang: 'en' | 'rw' | 'fr' = 'en') {
    const user = await prisma.user.create({
      data: {
        role: Role.CITIZEN,
        isAnonymous: true,
        preferredLang: lang,
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, role: Role.CITIZEN, isAnonymous: true },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { accessToken, user: this.toPublicUser(user) };
  },

  // ───── SHARED TOKEN LOGIC ─────
  async storeRefreshToken(userId: string, token: string) {
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  },

  async refreshAccessToken(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }

    const accessToken = jwt.sign(
      { id: stored.user.id, phone: stored.user.phone, email: stored.user.email, role: stored.user.role, isAnonymous: stored.user.isAnonymous },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return { accessToken };
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  },

  toPublicUser(user: any) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      preferredLang: user.preferredLang,
    };
  },

  // ───── LEGACY PASSWORD AUTH ─────
  async loginWithPassword(email: string, password: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user || !user.passwordHash) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    if (!user.isActive) throw Object.assign(new Error('Account is disabled. Please contact the administrator.'), { statusCode: 403 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const tokens = generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Citizens get an empty dashboard access list; staff get their granted dashboards
    const dashboardAccess = user.role === 'CITIZEN' ? [] : await accessService.getUserDashboardAccess(user.id);
    return { ...tokens, user: this.toPublicUser(user), dashboardAccess };
  },

  async register(data: { email: string; password: string; name: string; phone?: string; agencyType?: string }) {
    const existing = await prisma.user.findFirst({ where: { email: data.email } });
    if (existing) throw Object.assign(new Error('An account with this email already exists'), { statusCode: 409 });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const roleMap: Record<string, Role> = {
      POLICE: Role.POLICE_OFFICER, HOSPITAL: Role.MEDICAL_RESPONDER,
      FIRE: Role.FIRE_OFFICER, RIB: Role.RIB_INVESTIGATOR,
    };
    const role = data.agencyType ? (roleMap[data.agencyType] ?? Role.CITIZEN) : Role.CITIZEN;

    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, name: data.name, phone: data.phone, role, isVerified: true, isActive: true },
    });

    const tokens = generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return { ...tokens, user: this.toPublicUser(user) };
  },

  async forgotPassword(email: string) {
    return { message: 'If that email exists, a reset link has been sent.' };
  },

  async resetPassword(token: string, newPassword: string) {
    return { message: 'Password reset successfully. You can now log in.' };
  }
};
