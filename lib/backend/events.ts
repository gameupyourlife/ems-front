"use client";;
import { EventDetails } from '../types-old';
import { components } from './types';
import { guardUUID } from './utils';



export async function getEvents(orgId: string, token: string) {
    guardUUID(orgId);

    const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events`;
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

export async function getEventDetails(eventId: string, token: string): Promise<EventDetails> {
    guardUUID(eventId);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        
        const basicData : EventDetails = await response.json();
        return basicData;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch event details');
    }
}

async function getEventFlows(eventId: string, token: string): Promise<EventBasicDetailedDto> {
    guardUUID(eventId);
    
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

