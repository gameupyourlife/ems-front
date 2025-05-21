"use client";;
import axios from 'axios';
import { EventDetails, EventInfo, RegisterAttendeeParams } from '../types';
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

export async function getEventsByCreator(orgId: string, userId: string, token: string): Promise<EventDetails[]> {
    guardUUID(orgId);
    guardUUID(userId);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/creator/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        const basicData : EventDetails[] = await response.json();
        return basicData;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch event details');
    }
}

export async function getEventsById(orgId: string, eventId: string, token: string): Promise<EventDetails> {
    guardUUID(orgId);
    guardUUID(eventId);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        const data = (await response.json()) as EventDetails;
        return data;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch event details');
    }
}

export async function registerAttendee(
  orgId: string, 
  eventId: string, 
  userId: string, 
  profilePicture: string, 
  token: string
): Promise<any> {
  guardUUID(orgId);
  guardUUID(eventId);
  guardUUID(userId);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/attendees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ userId, profilePicture }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register attendee');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to register attendee');
  }
}

export async function deleteAttendee(
  orgId: string,
  eventId: string,
  userId: string,
  token: string
): Promise<any> {
  guardUUID(orgId);
  guardUUID(eventId);
  guardUUID(userId);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/attendees/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete attendee');
  }

  return res.json();
}

export async function deleteEvent(
  orgId: string,
  eventId: string,
  token: string
): Promise<any> {
  guardUUID(orgId);
  guardUUID(eventId);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete event');
  }

  return res.json();
    
}