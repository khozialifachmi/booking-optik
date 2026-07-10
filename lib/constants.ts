// ============================================
// EyeCheck — App Constants
// ============================================

export const APP_NAME = "EyeCheck" as const;
export const APP_DESCRIPTION =
  "Sistem booking pemeriksaan mata online dengan antri FCFS" as const;

// Service types
export const SERVICE_TYPES = {
  pemeriksaan_mata: "Pemeriksaan Mata",
  pembuatan_kacamata: "Pembuatan Kacamata",
  kontrol_kacamata: "Kontrol Kacamata",
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;

// Booking statuses
export const BOOKING_STATUS = {
  waiting: "Menunggu",
  serving: "Sedang Dilayani",
  completed: "Selesai",
  cancelled: "Dibatalkan",
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUS;

// Status colors for badges
export const STATUS_VARIANT: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  waiting: "outline",
  serving: "default",
  completed: "secondary",
  cancelled: "destructive",
} as const;

// User roles
export const ROLES = {
  customer: "customer",
  admin: "admin",
} as const;

export type UserRole = keyof typeof ROLES;

// Navigation items per role
export const CUSTOMER_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Daftar Pemeriksaan", href: "/booking/new", icon: "CalendarPlus" },
  { label: "Riwayat Pemeriksaan", href: "/booking", icon: "ClipboardList" },
] as const;

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Semua Booking", href: "/admin/bookings", icon: "ClipboardList" },
  { label: "Perhitungan FCFS", href: "/admin/fcfs", icon: "Calculator" },
  { label: "Data Pelanggan", href: "/admin/customers", icon: "Users" },
  { label: "Keuangan", href: "/admin/cashflow", icon: "Wallet" },
  { label: "Daftar Akun", href: "/admin/accounts", icon: "UserCheck" },
  { label: "Pengaturan", href: "/admin/settings", icon: "Settings" },
] as const;

// Queue defaults
export const DEFAULT_AVG_SERVICE_DURATION = 20; // minutes
export const DEFAULT_OPEN_TIME = "08:00";
export const DEFAULT_CLOSE_TIME = "17:00";
export const DEFAULT_MAX_BOOKINGS = 100;
