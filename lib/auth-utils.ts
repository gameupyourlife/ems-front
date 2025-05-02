'use client';

import { User } from './types';

// Function to check credentials against environment variables
export function validateCredentials(email: string, password: string): boolean {
  // For quick auth in dev environment, we'll use hardcoded test credentials
  // In a real app, this would be validated on the server side
  return email === 'test@mail.de' && password === 'Test123!';
}

/**
 * Set authentication cookies with user information
 * @param user The user object to store in cookies
 * @param token JWT token or other auth token
 */
export function setAuthCookies(user: User, token: string) {
  // Set auth token cookie to expire in 24 hours
  document.cookie = `auth-token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
  
  // Store user ID in a separate cookie for easy server-side access
  document.cookie = `user-id=${user.id}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
  
  // Store user email in a separate cookie
  document.cookie = `user-email=${encodeURIComponent(user.email)}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
  
  // Store serialized user data for client-side access
  // Only include non-sensitive data that's needed for UI
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture
  };
  document.cookie = `user-data=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies() {
  // Remove auth token
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  
  // Remove user ID
  document.cookie = 'user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  
  // Remove user email
  document.cookie = 'user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  
  // Remove user data
  document.cookie = 'user-data=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
}

/**
 * Check if user is authenticated by cookie
 */
export function isAuthenticatedByCookie(): boolean {
  return document.cookie.split(';').some(item => item.trim().startsWith('auth-token='));
}

/**
 * Get user data from cookies
 * @returns User data object or null if not found
 */
export function getUserFromCookie(): Partial<User> | null {
  const cookies = document.cookie.split(';');
  const userDataCookie = cookies.find(cookie => cookie.trim().startsWith('user-data='));
  
  if (userDataCookie) {
    try {
      const userDataStr = decodeURIComponent(userDataCookie.split('=')[1]);
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
    }
  }
  
  return null;
}

/**
 * Get user ID from cookie
 * @returns User ID or null if not found
 */
export function getUserIdFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('user-id='));
  
  if (userIdCookie) {
    return userIdCookie.split('=')[1];
  }
  
  return null;
}

// Function for server-side use with headers
export function parseUserFromCookies(cookieHeader?: string): { userId?: string, userEmail?: string } {
  if (!cookieHeader) return {};
  
  const cookies = cookieHeader.split(';');
  
  const userId = cookies
    .find(cookie => cookie.trim().startsWith('user-id='))
    ?.split('=')[1];
    
  const userEmail = cookies
    .find(cookie => cookie.trim().startsWith('user-email='))
    ?.split('=')[1];
  
  return {
    userId,
    userEmail: userEmail ? decodeURIComponent(userEmail) : undefined
  };
}