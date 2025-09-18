/**
 * Magic link generation utilities for guest booking access
 */

/**
 * Generates a magic link URL for a booking
 * @param baseUrl - The base URL of the application
 * @param token - The access token for the booking
 * @returns The complete magic link URL
 */
export function generateMagicLink(baseUrl: string, token: string): string {
  return `${baseUrl}/#/guest/booking/${token}`;
}

/**
 * Generates a magic link URL for a booking using the current window location
 * @param token - The access token for the booking
 * @returns The complete magic link URL
 */
export function generateMagicLinkFromCurrentLocation(token: string): string {
  const baseUrl = window.location.origin;
  return generateMagicLink(baseUrl, token);
}

/**
 * Extracts the token from a magic link URL
 * @param url - The magic link URL
 * @returns The token or null if not found
 */
export function extractTokenFromUrl(url: string): string | null {
  const match = url.match(/\/guest\/booking\/([a-zA-Z0-9]{32,})/);
  return match ? match[1] : null;
}

/**
 * Validates if a URL is a valid magic link
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is a valid magic link
 */
export function isValidMagicLink(url: string): boolean {
  const token = extractTokenFromUrl(url);
  return token !== null;
}
