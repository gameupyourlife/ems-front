import { useQuery } from '@tanstack/react-query';
import { getMails, getMail, getMailRuns, getMailRun } from '../mails';

/**
 * Hook for fetching all mails for an event
 * @param orgId The organization ID
 * @param eventId The event ID
 * @returns Query object containing mails data, loading state, and error state
 */
export const useMails = (orgId: string, eventId: string, token: string) => {
    return useQuery({
        queryKey: ['mail', 'mails', orgId, eventId, token],
        queryFn: () => getMails(orgId, eventId, token),
        enabled: !!orgId && !!eventId && !!token,
    });
};

/**
 * Hook for fetching a specific mail by ID
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @returns Query object containing mail data, loading state, and error state
 */
export const useMail = (orgId: string, eventId: string, mailId: string, token: string) => {
    return useQuery({
        queryKey: ['mail', orgId, eventId, mailId, token],
        queryFn: () => getMail(orgId, eventId, mailId, token),
        enabled: !!orgId && !!eventId && !!mailId && !!token,
    });
};

/**
 * Hook for fetching all mail runs for a mail
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @returns Query object containing mail runs data, loading state, and error state
 */
export const useMailRuns = (orgId: string, eventId: string, mailId: string, token: string) => {
    return useQuery({
        queryKey: ['mailRuns', orgId, eventId, mailId, token],
        queryFn: () => getMailRuns(orgId, eventId, mailId, token),
        enabled: !!orgId && !!eventId && !!mailId && !!token,
    });
};

/**
 * Hook for fetching a specific mail run by ID
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @param runId The mail run ID
 * @returns Query object containing mail run data, loading state, and error state
 */
export const useMailRun = (orgId: string, eventId: string, mailId: string, runId: string, token: string) => {
    return useQuery({
        queryKey: ['mailRun', orgId, eventId, mailId, runId, token],
        queryFn: () => getMailRun(orgId, eventId, mailId, runId, token),
        enabled: !!orgId && !!eventId && !!mailId && !!runId && !!token,
    });
};