// TanStack Query hooks

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { deleteAttendee, deleteEvent, getEvents, getEventsByCreator, getEventsById, registerAttendee } from '../events';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { DeleteAttendeeParams, DeleteEvent, EventDetails, EventInfo, RegisterAttendeeParams } from '@/lib/types-old';
import {
    getCompleteEventDetails
} from '../events';

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
    orgId: string,
    eventId: string,
    token: string,
    options?: Omit<UseQueryOptions<EventDetails, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['eventDetails', orgId, eventId, token],
        queryFn: () => getCompleteEventDetails(orgId, eventId, token),
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

export function useRegisterAttendee(
  options?: Omit<UseMutationOptions<any, Error, RegisterAttendeeParams>, "mutationFn">,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orgId, eventId, userId, profilePicture, token }: RegisterAttendeeParams) =>
      registerAttendee(orgId, eventId, userId, profilePicture, token),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["eventsById", variables.orgId, variables.eventId],
      })
    },
    ...options,
  })
}
export function useDeleteAttendee(
  options?: Omit<UseMutationOptions<any, Error, DeleteEvent>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
   mutationFn: ({ orgId, eventId, userId, token }: DeleteAttendeeParams) =>
      deleteAttendee(orgId, eventId, userId, token),
    onSuccess: (_data: any, vars: { orgId: any; eventId: any; }) => {
      queryClient.invalidateQueries({
        queryKey: ['eventsById', vars.orgId, vars.eventId],
      })
    },
    ...options,
  })
}

export function useUpdateEvent(
  options?: Omit<UseMutationOptions<any, Error, DeleteEvent>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orgId, eventId, token }: DeleteEvent) =>
      deleteEvent(orgId, eventId, token),
    onSuccess: (_data: any, vars: { orgId: any; eventId: any; }) => {
      queryClient.invalidateQueries({
        queryKey: ['eventsById', vars.orgId, vars.eventId],
      })
    },
    ...options,
  })
}