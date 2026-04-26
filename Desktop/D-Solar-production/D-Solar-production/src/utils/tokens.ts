/**
 * Generates a random confirmation token for email verification
 * @returns The generated token
 */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates an expiration date for a token
 * @param hours Number of hours until token expiration
 * @returns Date object representing the expiration time
 */
export function createTokenExpiration(hours: number = 24): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

/**
 * Checks if a token has expired
 * @param tokenExpiration The token expiration date
 * @returns Boolean indicating if the token has expired
 */
export function isTokenExpired(tokenExpiration: Date): boolean {
  return new Date() > tokenExpiration;
} 