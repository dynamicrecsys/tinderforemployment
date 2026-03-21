import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendOtpToPhone, verifyOtpAndLogin, refreshTokens } from './auth.service';

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+91\d{10}$/, 'Must be a valid Indian phone number with +91 prefix'),
});

const verifyOtpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6),
});

export async function sendOtpController(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    const result = await sendOtpToPhone(phone);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtpController(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const result = await verifyOtpAndLogin(phone, otp);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ token: result.token, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }

    const result = await refreshTokens(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token: result.token, user: result.user });
  } catch (err) {
    next(err);
  }
}
