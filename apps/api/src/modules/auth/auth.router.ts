import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { registerSchema, verifyOtpSchema, loginSchema, refreshTokenSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register);
authRouter.post('/verify', authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/logout', authController.logout);
