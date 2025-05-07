import { isUUID } from '../utils';

/**
 * Get the auth token in a way that works in both client and server environments
 * @returns The authentication token
 */
export async function getAuthToken(): Promise<string | null> {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }

    // We're in server environment
    try {
        // Dynamically import cookies to avoid breaking client components
        const { cookies } = await import('next/headers');
        try {
            const cookieStore = await cookies();
            return cookieStore.get('auth-token')?.value || null;
        } catch (error) {
            // This happens when called in a client component or middleware
            console.warn('Unable to access cookies, likely not in a server component context');
            return null;
        }
    } catch (error) {
        console.warn('Error importing next/headers:', error);
        return null;
    }
}

/**
 * Check if the app is running in mock mode
 * @returns True if the app is running in mock mode, false otherwise
 */
export function isMock() {
    const mock = process.env.NEXT_PUBLIC_MOCK === "true";
    if (mock) {
        console.warn("Mock mode is enabled. This is not a production environment.");
    }

    return mock; 
}


/**
 * Guard function to ensure a string is a valid UUID
 * @param id UUID to check
 * @throws Error if the string is not a valid UUID
 */
export function guardUUID(id: string) {
    if (!isUUID(id)) {
        throw new Error(`Invalid UUID: ${id}`);
    }
}