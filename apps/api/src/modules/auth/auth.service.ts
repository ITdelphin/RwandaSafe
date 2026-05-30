import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { createOtp, verifyOtp, sendOtpSms } from '../../utils/otp';
import { Role } from '@prisma/client';

export const authService = {
  async requestOtp(phone: string, name?: string) {
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, name, role: Role.CITIZEN },
      });
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

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, lastLoginAt: new Date() },
    });

    const accessToken = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, isAnonymous: user.isAnonymous },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
    };
  },

  async refreshAccessToken(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    const accessToken = jwt.sign(
      { id: stored.user.id, phone: stored.user.phone, role: stored.user.role, isAnonymous: stored.user.isAnonymous },
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
};
