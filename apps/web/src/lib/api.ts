/**
 * API base URL.
 * - Development: empty string (Vite proxy handles /api → localhost:8787)
 * - Production: full Worker URL from VITE_API_BASE_URL env variable
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Wrapper around fetch that automatically prepends the API base URL.
 * Usage is identical to native fetch:
 *   apiFetch('/api/records')
 *   apiFetch('/api/records/123', { method: 'DELETE' })
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, init);
}
