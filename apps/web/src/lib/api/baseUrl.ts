/**
 * Centralized API base URL helper.
 * 
 * Priority:
 * 1. NEXT_PUBLIC_API_URL (explicit env var)
 * 2. Dev fallback: http://localhost:3001 (only in non-production)
 * 3. Empty string (same-origin, for production behind reverse proxy)
 */
export function getApiBaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (envUrl) return envUrl;

  // Dev fallback: default API runs on 3001. Avoid calling the Next server origin.
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3001';

  // Production: assume same-origin (e.g. behind a reverse proxy)
  return '';
}






