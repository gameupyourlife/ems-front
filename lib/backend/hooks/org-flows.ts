// TanStack Query hooks

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ActionDto, Flow, FlowTemplateResponseDto, TriggerDto } from '../types';
import { getOrgFlowTemplate, getOrgFlowTemplateAction, getOrgFlowTemplateActions, getOrgFlowTemplates, getOrgFlowTemplateTrigger, getOrgFlowTemplateTriggers } from '../org-flows';

export function useOrgFlowTemplates(
    orgId: string,
    token: string,
    options?: Omit<UseQueryOptions<FlowTemplateResponseDto[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useOrgFlowTemplates', orgId, token],
        queryFn: () => getOrgFlowTemplates(orgId, token),
        ...options,
    });
}

export function useOrgFlowTemplate(
    orgId: string,
    flowId: string,
    token: string,
    options?: Omit<UseQueryOptions<Flow, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useOrgFlowTemplate', orgId, flowId, token],
        queryFn: () => getOrgFlowTemplate(orgId, flowId, token),
        ...options,
    });
}

export function useOrgFlowTemplateActions(
    orgId: string,
    flowId: string,
    token: string,
    options?: Omit<UseQueryOptions<ActionDto[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useOrgFlowTemplateActions', orgId, flowId, token],
        queryFn: () => getOrgFlowTemplateActions(orgId, flowId, token),
        ...options,
    });
}

export function useOrgFlowTemplateAction(
    orgId: string,
    flowId: string,
    actionId: string,
    token: string,
    options?: Omit<UseQueryOptions<ActionDto, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useOrgFlowTemplateAction', orgId, flowId, actionId, token],
        queryFn: () => getOrgFlowTemplateAction(orgId, flowId, actionId, token),
        ...options,
    });
}

export function useOrgFlowTemplateTriggers(
    orgId: string,
    flowId: string,
    token: string,
    options?: Omit<UseQueryOptions<TriggerDto[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useOrgFlowTemplateTriggers', orgId, flowId, token],
        queryFn: () => getOrgFlowTemplateTriggers(orgId, flowId, token),
        ...options,
    });
}

export function useOrgFlowTemplateTrigger(
    orgId: string,
    flowId: string,
    triggerId: string,
    token: string,
    options?: Omit<UseQueryOptions<TriggerDto, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['useOrgFlowTemplateTrigger', orgId, flowId, triggerId, token],
        queryFn: () => getOrgFlowTemplateTrigger(orgId, flowId, triggerId, token),
        ...options,
    });
}

