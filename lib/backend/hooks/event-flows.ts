// TanStack Query hooks

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getAction, getActions, getFlow, getFlows, getTrigger, getTriggers } from '../event-flows';
import { ActionOverviewDto, FlowOverviewDto, TriggerDto, TriggerOverviewDto } from '../types';

export function useEventFlows(
    orgId: string,
    eventId: string,
    token: string,
    options?: Omit<UseQueryOptions<FlowOverviewDto[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useEventFlows', orgId, eventId, token],
        queryFn: () => getFlows(orgId, eventId, token),
        ...options,
    });
}

export function useEventFlow(
    orgId: string,
    eventId: string,
    flowId: string,
    token: string,
    options?: Omit<UseQueryOptions<FlowOverviewDto, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useEventFlow', orgId, eventId, flowId, token],
        queryFn: () => getFlow(orgId, eventId, flowId, token),
        ...options,
    });
}

export function useActions(
    orgId: string,
    eventId: string,
    flowId: string,
    token: string,
    options?: Omit<UseQueryOptions<ActionOverviewDto[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useActions', orgId, eventId, flowId, token],
        queryFn: () => getActions(orgId, eventId, flowId, token),
        ...options,
    });
}

export function useAction(
    orgId: string,
    eventId: string,
    flowId: string,
    actionId: string,
    token: string,
    options?: Omit<UseQueryOptions<ActionOverviewDto, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useAction', orgId, eventId, flowId, actionId, token],
        queryFn: () => getAction(orgId, eventId, flowId, actionId, token),
        ...options,
    });
}

export function useTriggers(
    orgId: string,
    eventId: string,
    flowId: string,
    token: string,
    options?: Omit<UseQueryOptions<TriggerOverviewDto[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useTriggers', orgId, eventId, flowId, token],
        queryFn: () => getTriggers(orgId, eventId, flowId, token),
        ...options,
    });
}

export function useTrigger(
    orgId: string,
    eventId: string,
    flowId: string,
    triggerId: string,
    token: string,
    options?: Omit<UseQueryOptions<TriggerDto, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useTrigger', orgId, eventId, flowId, triggerId, token],
        queryFn: () => getTrigger(orgId, eventId, flowId, triggerId, token),
        ...options,
    });
}

