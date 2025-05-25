import { useQuery, UseQueryOptions, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { deleteMember, getMembers, getOrg, updateMemberRole } from "../org";
import { OrgUser } from "@/lib/types-old";

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

export function useUpdateMemberRole(
  orgId: string,
  token: string,
  options?: Omit<UseMutationOptions<OrgUser, Error, { userId: string; newRole: number }>, 'mutationKey' | 'mutationFn'>
) {
  const qc = useQueryClient();

  return useMutation<OrgUser, Error, { userId: string; newRole: number }>({
    mutationKey: ['updateMemberRole', orgId],
    mutationFn: ({ userId, newRole }) => updateMemberRole(orgId, userId, newRole, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', orgId] }),
    ...options,
  });
}

export function useDeleteMember(
  userId: string,
  token: string,
  options?: Omit<
    UseMutationOptions<void, Error, { userId: string }>,
    'mutationKey' | 'mutationFn'
  >
) {
  const qc = useQueryClient();

return useMutation<void, Error, { userId: string }>({
  mutationKey: ['deleteMember', userId],
  mutationFn: ({ userId }) => deleteMember(userId, token),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  ...options
});
}