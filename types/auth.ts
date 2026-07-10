// ============================================
// Auth & User Types
// ============================================

import type { UserRole } from "@/lib/constants";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  role: UserRole;
  phone: string;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthUser extends User {
  profile: UserProfile;
}
