import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { requireAuth } from '../../middleware/auth';
import {
    sendPhoneOtpSchema, verifyPhoneOtpSchema,
    sendEmailOtpSchema, verifyEmailOtpSchema,
    refreshTokenSchema, guestSessionSchema, officerPhoneOtpSchema
} from './auth.schema';

export const authRouter = Router();

authRouter.use(authRateLimiter); // 5 requests/min on all auth routes

// Phone OTP (Citizen)
authRouter.post('/phone/send', validate(sendPhoneOtpSchema), authController.sendPhoneOtp);
authRouter.post('/phone/verify', validate(verifyPhoneOtpSchema), authController.verifyPhoneOtp);

// Email OTP (Citizen)
authRouter.post('/email/send', validate(sendEmailOtpSchema), authController.sendEmailOtp);
authRouter.post('/email/verify', validate(verifyEmailOtpSchema), authController.verifyEmailOtp);

// Guest session (no OTP needed)
authRouter.post('/guest', validate(guestSessionSchema), authController.createGuestSession);

// Shared
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.getMe); // requires auth middleware

// Officer OTP (Portal)
authRouter.post('/officer/send', validate(officerPhoneOtpSchema), authController.sendOfficerOtp);
authRouter.post('/officer/verify', validate(verifyPhoneOtpSchema), authController.verifyOfficerOtp);

// Keep existing routes for backward compatibility if needed, but the unified portal uses officer OTP
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);
