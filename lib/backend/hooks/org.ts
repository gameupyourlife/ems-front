import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getMembers } from "../org";
import { OrgUser } from "@/lib/types";

/**
 * TanStack Query hook for fetching organization members
 * @param orgId - The organization ID
 * @param options - Additional query options
 * @returns Query result containing member data
 */
export function useMembers(
    orgId: string,
    token: string,
    options?: Omit<UseQueryOptions<OrgUser[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: ['members', orgId],
        queryFn: () => getMembers(orgId, token),
        ...options,
    });
}
