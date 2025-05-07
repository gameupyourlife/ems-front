// TanStack Query hooks

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { EventDetails, EventInfo } from '@/lib/types';
import { getEventDetails, getEvents } from '../events';

/**
 * TanStack Query hook for fetching events for an organization
 * @param orgId - The organization ID
 * @param options - Additional query options
 * @returns Query result containing events data
 */
export function useEvents(
    orgId: string,
    options?: Omit<UseQueryOptions<EventInfo[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['events', orgId],
        queryFn: () => getEvents(orgId),
        ...options,
    });
}


export function useEventDetails(
    eventId: string,
    options?: Omit<UseQueryOptions<EventDetails, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['eventDetails', eventId],
        queryFn: () => getEventDetails(eventId),
        ...options,
    });
}