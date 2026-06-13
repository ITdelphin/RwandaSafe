import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema, otpRequestSchema, verifyOtpSchema, sendEmailOtpSchema, verifyEmailOtpSchema } from './auth.schema';

export const authRouter = Router();

// Email/password
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);
authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register);
authRouter.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
// OTP (citizen)
authRouter.post('/otp/request', authRateLimiter, validate(otpRequestSchema), authController.requestOtp);
authRouter.post('/otp/verify', authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);
// Keep /login alias for OTP to not break citizen app
authRouter.post('/verify', validate(verifyOtpSchema), authController.verifyOtp);
// Email OTP
authRouter.post('/email-otp/send', authRateLimiter, validate(sendEmailOtpSchema), authController.sendEmailOtp);
authRouter.post('/email-otp/verify', authRateLimiter, validate(verifyEmailOtpSchema), authController.verifyEmailOtp);
// Tokens
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/logout', authController.logout);
