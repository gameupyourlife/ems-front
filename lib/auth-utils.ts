'use client';

// Function to check credentials against environment variables
export function validateCredentials(email: string, password: string): boolean {
  // For quick auth in dev environment, we'll use hardcoded test credentials
  // In a real app, this would be validated on the server side
  return email === 'test@mail.de' && password === 'Test123!';
}

// Function to set authentication token in cookies (client-side)
export function setAuthCookie() {
  // Set cookie to expire in 24 hours
  document.cookie = `auth-token=authenticated; path=/; max-age=${24 * 60 * 60}`;
}

// Function to clear authentication token from cookies (client-side)
export function clearAuthCookie() {
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
}

// Check if user is authenticated by cookie
export function isAuthenticatedByCookie(): boolean {
  return document.cookie.split(';').some(item => item.trim().startsWith('auth-token='));
}