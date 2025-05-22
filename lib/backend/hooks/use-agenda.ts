
/**
 * TanStack Query hooks for agenda operations
 */
import { useQuery } from "@tanstack/react-query";
import { getAgendaEntries } from "../agenda";

/**
 * Hook to fetch all agenda entries for an event
 */
export function useAgendaEntries(orgId: string, eventId: string, token: string) {
    return useQuery({
        queryKey: ["agendaEntries", orgId, eventId],
        queryFn: () => getAgendaEntries(orgId, eventId, token),
        enabled: !!orgId && !!eventId && !!token,
    });
}
