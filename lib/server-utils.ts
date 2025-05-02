'use server';

import { cookies } from 'next/headers';
import { mockOrgUsers } from './data';
import { User, OrgUser } from './types';
import { parseUserFromCookies } from './auth-utils';

/**
 * Get the authenticated user in server components
 * @returns User object if authenticated, null otherwise
 */
export async function getServerUser(): Promise<User | null> {
  // Get cookies from the request
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  
  // Check for auth token
  const authToken = (await cookieStore).get('auth-token')?.value;
  if (!authToken) return null;
  
  // Parse user info from cookies
  const { userId } = parseUserFromCookies(cookieHeader);
  
  if (!userId) return null;
  
  // In a real app, you'd fetch user data from your database or API
  // For now, we'll use mock data to simulate the server response
  const matchingOrgUser = mockOrgUsers.find(
    orgUser => orgUser.user.id === userId
  );
  
  return matchingOrgUser?.user || null;
}

/**
 * Get organization user details for the current user
 * @param orgId The organization ID
 * @returns The organization user object if found, null otherwise
 */
export async function getServerOrgUser(orgId: string): Promise<OrgUser | null> {
  const user = await getServerUser();
  if (!user) return null;
  
  // In a real app, you'd fetch this from your database or API
  const orgUser = mockOrgUsers.find(
    ou => ou.user.id === user.id && ou.orgId === orgId
  );
  
  return orgUser || null;
}

/**
 * Check if the current user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getServerUser()) !== null;
}

/**
 * Check if the current user is an admin of the specified organization
 * @param orgId The organization ID
 * @returns true if user is an admin, false otherwise
 */
export async function isOrgAdmin(orgId: string): Promise<boolean> {
  const orgUser = await getServerOrgUser(orgId);
  return orgUser?.role === 'Admin';
}