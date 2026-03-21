import { env } from '../../config/env';

// In development, OTPs are logged to console instead of sent via SMS
// In production, this calls MSG91 API

export async function sendOtp(phone: string, otp: string): Promise<void> {
  if (env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return;
  }

  // MSG91 OTP API
  const response = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authkey': env.MSG91_AUTH_KEY,
    },
    body: JSON.stringify({
      template_id: env.MSG91_TEMPLATE_ID,
      mobile: phone.replace('+', ''),
      otp,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MSG91 OTP send failed: ${body}`);
  }
}
