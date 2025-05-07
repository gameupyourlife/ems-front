"use client";

import { mockedEventDetails, mockEvents } from '../data';
import { EventDetails } from '../types';
import { components } from './types';
import { getAuthToken, guardUUID, isMock } from './utils';



export async function getEvents(orgId: string) {
    if(isMock()) return mockEvents;

    // Check if orgId is valid
    guardUUID(orgId);

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




type EventBasicDetailedDto = components['schemas']['EventBasicDetailedDto'];

export async function getEventDetails(eventId: string): Promise<EventDetails> {
    if(isMock()) return mockedEventDetails;

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

