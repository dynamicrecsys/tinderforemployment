export const DEFAULT_RADIUS_KM = 25;
export const MAX_RADIUS_KM = 100;
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 300; // 5 minutes
export const JWT_EXPIRY = '1h';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const FEED_PAGE_SIZE = 10;
export const CHAT_PAGE_SIZE = 50;

export const WORK_TYPE_LABELS: Record<string, { en: string; hi: string }> = {
  full_day: { en: 'Full Day', hi: '\u092A\u0942\u0930\u093E \u0926\u093F\u0928' },
  half_day: { en: 'Half Day', hi: '\u0906\u0927\u093E \u0926\u093F\u0928' },
  hourly: { en: 'Hourly', hi: '\u0918\u0902\u091F\u0947 \u0915\u0947 \u0939\u093F\u0938\u093E\u092C' },
};

export const PAY_PERIOD_LABELS: Record<string, { en: string; hi: string }> = {
  per_hour: { en: '/hr', hi: '/\u0918\u0902\u091F\u093E' },
  per_day: { en: '/day', hi: '/\u0926\u093F\u0928' },
  per_month: { en: '/month', hi: '/\u092E\u0939\u0940\u0928\u093E' },
};

export const SEED_CATEGORIES = [
  { nameEn: 'Construction', nameHi: '\u0928\u093F\u0930\u094D\u092E\u093E\u0923', icon: 'construction' },
  { nameEn: 'Housekeeping', nameHi: '\u0938\u092B\u093E\u0908', icon: 'cleaning' },
  { nameEn: 'Driving', nameHi: '\u0921\u094D\u0930\u093E\u0907\u0935\u093F\u0902\u0917', icon: 'driving' },
  { nameEn: 'Cooking', nameHi: '\u0916\u093E\u0928\u093E \u092C\u0928\u093E\u0928\u093E', icon: 'cooking' },
  { nameEn: 'Delivery', nameHi: '\u0921\u093F\u0932\u0940\u0935\u0930\u0940', icon: 'delivery' },
  { nameEn: 'Security', nameHi: '\u0938\u0941\u0930\u0915\u094D\u0937\u093E', icon: 'security' },
  { nameEn: 'Painting', nameHi: '\u092A\u0947\u0902\u091F\u093F\u0902\u0917', icon: 'painting' },
  { nameEn: 'Plumbing', nameHi: '\u092A\u094D\u0932\u092E\u094D\u092C\u093F\u0902\u0917', icon: 'plumbing' },
  { nameEn: 'Electrical', nameHi: '\u0907\u0932\u0947\u0915\u094D\u091F\u094D\u0930\u093F\u0915\u0932', icon: 'electrical' },
  { nameEn: 'Tailoring', nameHi: '\u0938\u093F\u0932\u093E\u0908', icon: 'tailoring' },
  { nameEn: 'Farming', nameHi: '\u0916\u0947\u0924\u0940', icon: 'farming' },
  { nameEn: 'Factory Work', nameHi: '\u092B\u0948\u0915\u094D\u091F\u094D\u0930\u0940 \u0915\u093E\u092E', icon: 'factory' },
  { nameEn: 'Retail', nameHi: '\u0926\u0941\u0915\u093E\u0928', icon: 'retail' },
  { nameEn: 'Warehouse', nameHi: '\u0917\u094B\u0926\u093E\u092E', icon: 'warehouse' },
  { nameEn: 'Carpentry', nameHi: '\u092C\u0922\u093C\u0908\u0917\u0940\u0930\u0940', icon: 'carpentry' },
  { nameEn: 'Welding', nameHi: '\u0935\u0947\u0932\u094D\u0921\u093F\u0902\u0917', icon: 'welding' },
  { nameEn: 'Gardening', nameHi: '\u092C\u093E\u0917\u0935\u093E\u0928\u0940', icon: 'gardening' },
  { nameEn: 'AC Repair', nameHi: '\u090F\u0938\u0940 \u092E\u0930\u092E\u094D\u092E\u0924', icon: 'ac_repair' },
];
