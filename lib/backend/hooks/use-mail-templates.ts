import { useQuery } from '@tanstack/react-query';
import { getMailTemplate, getMailTemplates } from '../mail-templates';

/**
 * Hook for fetching all mail templates for an organization
 * @param orgId The organization ID
 * @returns Query object containing mail templates data, loading state, and error state
 */
export const useMailTemplates = (orgId: string, token: string) => {
  return useQuery({
    queryKey: ['mailTemplates', orgId, token],
    queryFn: () => getMailTemplates(orgId, token),
    enabled: !!orgId && !!token,
  });
};

/**
 * Hook for fetching a specific mail template by ID
 * @param orgId The organization ID
 * @param templateId The mail template ID
 * @returns Query object containing mail template data, loading state, and error state
 */
export const useMailTemplate = (orgId: string, templateId: string, token: string) => {
  return useQuery({
    queryKey: ['mailTemplate', orgId, templateId, token],
    queryFn: () => getMailTemplate(orgId, templateId, token),
    enabled: !!orgId && !!templateId && !!token,
  });
};