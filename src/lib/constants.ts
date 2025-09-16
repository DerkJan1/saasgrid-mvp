export const APP_NAME = 'SaaSGrid'
export const APP_DESCRIPTION = 'SaaS metrics tracking for VC portfolio companies'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  ANALYTICS: '/analytics',
  AUTH_CALLBACK: '/auth/callback',
} as const

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB for enterprise datasets
export const ALLOWED_FILE_TYPES = ['.xlsx', '.xls', '.csv']

// Enterprise scaling constants
export const PERFORMANCE_THRESHOLDS = {
  LARGE_DATASET_WARNING: 100000, // 100K records
  STREAMING_RECOMMENDED: 1000000, // 1M records
  MAX_CUSTOMERS: 50000, // 50K customers
  MAX_MONTHS: 360, // 30 years of data
} as const

export const DATE_FORMAT = 'yyyy-MM-dd'
export const DISPLAY_DATE_FORMAT = 'MMM yyyy'

export const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#6366f1',
} as const
