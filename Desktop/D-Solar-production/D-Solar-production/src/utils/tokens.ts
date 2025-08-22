import crypto from 'crypto';

/**
 * Generates a random confirmation token for email verification
 * @returns The generated token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
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