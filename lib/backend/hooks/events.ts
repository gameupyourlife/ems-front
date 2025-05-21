// TanStack Query hooks

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { EventDetails, EventInfo } from '@/lib/types';
import { getEventDetails, getEvents, getEventsByCreator, getEventsById } from '../events';

/**
 * TanStack Query hook for fetching events for an organization
 * @param orgId - The organization ID
 * @param options - Additional query options
 * @returns Query result containing events data
 */
export function useEvents(
    orgId: string,
    token: string,
    options?: Omit<UseQueryOptions<EventInfo[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['events', orgId, token],
        queryFn: () => getEvents(orgId, token),
        ...options,
    });
}


export function useEventDetails(
    eventId: string,
    token: string,
    options?: Omit<UseQueryOptions<EventDetails, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['eventDetails', eventId, token],
        queryFn: () => getEventDetails(eventId, token),
        ...options,
    });
}

export function useEventsByCreator(
    orgId: string,
    userId: string,
    token: string,
    options?: Omit<UseQueryOptions<EventDetails[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['eventsByCreator', orgId, userId, token],
        queryFn: () => getEventsByCreator(orgId, userId, token),
        ...options,
    });
}

export function useEventsById(
    orgId: string,
    eventId: string,
    token: string,
    options?: Omit<UseQueryOptions<EventDetails, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['eventsById', orgId, eventId, token],
        queryFn: () => getEventsById(orgId, eventId, token),
        ...options,
    });
}