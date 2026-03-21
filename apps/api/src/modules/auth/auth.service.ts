import { eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { env } from '../../config/env';
import { memoryStore } from '../../config/redis';
import { users } from '../../db/schema';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendOtp } from './otp.provider';
import { OTP_LENGTH, OTP_EXPIRY_SECONDS } from '@tfe/shared';
import bcrypt from 'bcryptjs';

const DEV_OTP = '025301';

function generateOtp(): string {
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'production') {
    return DEV_OTP;
  }
  return Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join('');
}

export async function sendOtpToPhone(phone: string) {
  const otp = generateOtp();
  const hash = await bcrypt.hash(otp, 10);

  await memoryStore.set(`otp:${phone}`, hash, { EX: OTP_EXPIRY_SECONDS });
  await sendOtp(phone, otp);

  return { sent: true };
}

export async function verifyOtpAndLogin(phone: string, otp: string) {
  const storedHash = await memoryStore.get(`otp:${phone}`);
  if (!storedHash) {
    throw new Error('OTP expired or not found');
  }

  const valid = await bcrypt.compare(otp, storedHash);
  if (!valid) {
    throw new Error('Invalid OTP');
  }

  // Delete used OTP
  await memoryStore.del(`otp:${phone}`);

  // Find or create user
  let [user] = await db.select().from(users).where(eq(users.phone, phone));

  if (!user) {
    [user] = await db.insert(users).values({ phone }).returning();
  }

  const tokenPayload = { userId: user.id, role: user.role };
  const token = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      isOnboarded: user.isOnboarded,
    },
  };
}

export async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  // Fetch fresh user data
  const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
  if (!user) throw new Error('User not found');

  const tokenPayload = { userId: user.id, role: user.role };
  return {
    token: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      isOnboarded: user.isOnboarded,
    },
  };
}
