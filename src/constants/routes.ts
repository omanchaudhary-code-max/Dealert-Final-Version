export const ROUTES = {
  // Public
  HOME: '/',
  DEALS: '/deals',
  FAKE_PAGE_DETECTOR: '/fake-page-detector',
  PRICE_INDEX: '/price-index',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',

  // Dashboard
  DASHBOARD: '/dashboard',
  WISHLIST: '/dashboard/wishlist',
  ALERTS: '/dashboard/alerts',
  NOTIFICATIONS: '/dashboard/notifications',
  PROFILE: '/dashboard/profile',

  // Admin
  ADMIN: '/admin',
  ADMIN_LOGS: '/admin/crawler-logs',
  ADMIN_ERRORS: '/admin/errors',
  ADMIN_AFFILIATE: '/admin/affiliate',

  // API
  API: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY_EMAIL: '/api/auth/verify-email',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      GOOGLE: '/api/auth/google',
    },
    PRODUCTS: '/api/products',
    ALERTS: '/api/alerts',
    WISHLIST: '/api/wishlist',
    NOTIFICATIONS: '/api/notifications',
    FAKE_PAGE: '/api/fake-page/check',
  },
} as const