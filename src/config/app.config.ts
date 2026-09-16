export const appConfig = {
  name: 'Dealert',
  description: 'Nepal-focused price intelligence and deal alert platform',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  locale: 'ne-NP',
  currency: 'NPR',
  timezone: 'Asia/Kathmandu',
  daraz: {
    affiliateTag: 'dealert-20',
    baseUrl: 'https://www.daraz.com.np',
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 min
    maxRequests: 100,
  },
  rapidapi: {
  key: process.env.RAPIDAPI_KEY!,
  whoisHost: process.env.RAPIDAPI_WHOIS_HOST!,
},
  googleSafeBrowsing: {
    apiKey: process.env.GOOGLE_SAFE_BROWSING_KEY ?? process.env.GOOGLE_SAFE_BROWSING_API_KEY ?? '',
  },
}