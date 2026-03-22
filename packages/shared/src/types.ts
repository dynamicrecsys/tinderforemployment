export type UserRole = 'worker' | 'employer';
export type WorkType = 'full_day' | 'half_day' | 'hourly';
export type PreferredWorkType = WorkType | 'any';
export type SwipeDirection = 'like' | 'pass';
export type SwipeTargetType = 'job' | 'worker';
export type MatchStatus = 'active' | 'completed' | 'cancelled';
export type PayPeriod = 'per_hour' | 'per_day' | 'per_month';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  isOnboarded: boolean;
  createdAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  skills: string[];
  categoryIds: string[];
  experienceYears: number;
  preferredWorkType: PreferredWorkType;
  bio: string | null;
  locationLat: number;
  locationLng: number;
  locationText: string;
  isAvailable: boolean;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  businessName: string;
  contactPerson: string;
  photoUrl: string | null;
  businessType: string;
  locationLat: number;
  locationLng: number;
  locationText: string;
}

export interface JobListing {
  id: string;
  employerId: string;
  title: string;
  description: string;
  categoryId: string;
  requiredSkills: string[];
  workType: WorkType;
  payMin: number;
  payMax: number;
  payPeriod: PayPeriod;
  locationLat: number;
  locationLng: number;
  locationText: string;
  maxDistanceKm: number;
  slots: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface JobCard {
  id: string;
  title: string;
  description: string | null;
  employerName: string;
  employerPhoto: string | null;
  workType: WorkType;
  payMin: number;
  payMax: number;
  payPeriod: PayPeriod;
  distanceKm: number;
  categoryName: string;
}

export interface WorkerCard {
  id: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  skills: string[];
  experienceYears: number;
  preferredWorkType: PreferredWorkType;
  distanceKm: number;
  isAvailable: boolean;
}

export interface Match {
  id: string;
  jobId: string;
  workerId: string;
  employerId: string;
  status: MatchStatus;
  matchedAt: string;
  otherParty: {
    name: string;
    photoUrl: string | null;
  };
  job: {
    title: string;
  };
  lastMessage?: {
    body: string;
    createdAt: string;
  };
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SwipeRequest {
  targetType: SwipeTargetType;
  targetId: string;
  contextJobId?: string;
  direction: SwipeDirection;
}

export interface SwipeResponse {
  matched: boolean;
  matchId?: string;
}
