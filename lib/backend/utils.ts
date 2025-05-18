import { auth } from '../auth';
import { isUUID } from '../utils';

/**
 * Get the auth token in a way that works in both client and server environments
 * @returns The authentication token
 */
export async function getAuthToken(): Promise<string> {
    const session = await auth()
    const token = session?.user?.jwt;
    if (!token) {
        throw new Error("No authentication token found");
    }
    return token; 
}

/**
 * Check if the app is running in mock mode
 * @returns True if the app is running in mock mode, false otherwise
 */
export function isMock() {
    const mock = process.env.NEXT_PUBLIC_MOCK === "true";
    if (mock) {
        // console.warn("Mock mode is enabled. This is not a production environment.");
    }

    return mock;
}


/**
 * Guard function to ensure a string is a valid UUID
 * @param id UUID to check
 * @throws Error if the string is not a valid UUID
 */
export function guardUUID(id: string) {
    if (!isUUID(id) || id === '00000000-0000-0000-0000-000000000000') {
        throw new Error(`Invalid UUID: ${id}`);
    }
}