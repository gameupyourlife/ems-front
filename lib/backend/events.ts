"use client";

import { components } from './types';

/**
 * Get the auth token in a way that works in both client and server environments
 * @returns The authentication token
 */
async function getAuthToken(): Promise<string | null> {
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

export async function getEvents(orgId: string) {
    // Check if the orgId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orgId)) throw new Error('Invalid orgId format');

    const token = await getAuthToken();

    const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}/events/organization/${orgId}`;
    console.log('Fetching events from URL:', fetchUrl); // Debugging line

    return fetch(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    })
        .then((res) => res.json())
        .then((data) => data)

}

export async function getMembers(orgId: string) {
    const token = await getAuthToken();

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/members`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    })
        .then((res) => res.json())
        .then((data) => data)
        .catch((err) => {
            console.error(err);
            throw new Error('Failed to fetch members');
        });
}


type EventBasicDetailedDto = components['schemas']['EventBasicDetailedDto'];

export async function getEventDetails(eventId: string): Promise<EventBasicDetailedDto> {
    const token = await getAuthToken();

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        
        const basicData : EventBasicDetailedDto = await response.json();
        return basicData;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch event details');
    }
}

async function getEventFlows(eventId: string): Promise<EventBasicDetailedDto> {
    const token = await getAuthToken();

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        
        const basicData : EventBasicDetailedDto = await response.json();
        return basicData;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch event details');
    }
}

