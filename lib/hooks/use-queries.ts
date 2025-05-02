import {
    useQuery,
    useMutation,
    UseQueryOptions,
    UseMutationOptions,
    useQueryClient,
} from '@tanstack/react-query';

import {
    apiEventsGet,
    apiEventsIdGet,
    apiEventsUpcomingGet,
    apiEventsCategoryCategoryGet,
    apiEventsIdAttendeesGet,
    apiEventsOrganizationOrganizationIdGet,
    apiEventsPost,
    apiEventsIdPut,
    apiEventsIdDelete,
    apiFilesIdGet,
    apiFilesUserUserIdGet,
    apiFilesTypeTypeGet,
    apiFilesPost,
    apiFilesIdDelete,
    apiOrganizationsGet,
    apiOrganizationsIdGet,
    apiOrganizationsUserUserIdGet,
    apiOrganizationsPost,
    apiOrganizationsIdPut,
    apiOrganizationsIdDelete,
    apiUsersGet,
    apiUsersIdGet,
    apiUsersByEmailGet,
    apiUsersByOrganizationOrganizationIdGet,
    apiFlowsGet,
    apiFlowsIdGet,
    apiFlowsPost,
    apiFlowsIdPut,
    apiFlowsIdDelete,
    mailSendPost,
} from '@/lib/api';

// Event Queries

/**
 * Hook for fetching all events
 */
export function useEvents(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => apiEventsGet().then(res => res.data),
    ...options,
  });
}

/**
 * Hook for fetching a single event by ID
 */
export function useEvent(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => apiEventsIdGet({ path: { id } }).then(res => res.data),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for fetching upcoming events
 */
export function useUpcomingEvents(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => apiEventsUpcomingGet({}).then(res => res.data),
    ...options,
  });
}

/**
 * Hook for fetching events by category
 */
export function useEventsByCategory(category: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['events', 'category', category],
    queryFn: () => apiEventsCategoryCategoryGet({ path: { category } }).then(res => res.data),
    enabled: !!category,
    ...options,
  });
}

/**
 * Hook for fetching events by organization
 */
export function useOrganizationEvents(organizationId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['events', 'organization', organizationId],
    queryFn: () => apiEventsOrganizationOrganizationIdGet({ path: { organizationId } }).then(res => res.data),
    enabled: !!organizationId,
    ...options,
  });
}

/**
 * Hook for fetching event attendees
 */
export function useEventAttendees(eventId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['events', eventId, 'attendees'],
    queryFn: () => apiEventsIdAttendeesGet({ path: { id: eventId } }).then(res => res.data),
    enabled: !!eventId,
    ...options,
  });
}

/**
 * Hook for creating a new event
 */
export function useCreateEvent(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData) => apiEventsPost({ body: eventData }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    ...options,
  });
}

/**
 * Hook for updating an event
 */
export function useUpdateEvent(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiEventsIdPut({ path: { id }, body: data }).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
    ...options,
  });
}

/**
 * Hook for deleting an event
 */
export function useDeleteEvent(options?: UseMutationOptions<any, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiEventsIdDelete({ path: { id } }).then(res => res.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
    ...options,
  });
}

// File Queries

/**
 * Hook for fetching a single file
 */
export function useFile(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['files', id],
    queryFn: () => apiFilesIdGet({ path: { id } }).then(res => res.data),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for fetching files by user
 */
export function useUserFiles(userId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['files', 'user', userId],
    queryFn: () => apiFilesUserUserIdGet({ path: { userId } }).then(res => res.data),
    enabled: !!userId,
    ...options,
  });
}

/**
 * Hook for fetching files by type
 */
export function useFilesByType(type: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['files', 'type', type],
    queryFn: () => apiFilesTypeTypeGet({ path: { type } }).then(res => res.data),
    enabled: !!type,
    ...options,
  });
}

/**
 * Hook for uploading a file
 */
export function useUploadFile(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fileData) => apiFilesPost({ body: fileData }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    ...options,
  });
}

/**
 * Hook for deleting a file
 */
export function useDeleteFile(options?: UseMutationOptions<any, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiFilesIdDelete({ path: { id } }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    ...options,
  });
}

// Organization Queries

/**
 * Hook for fetching all organizations
 */
export function useOrganizations(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiOrganizationsGet().then(res => res.data),
    ...options,
  });
}

/**
 * Hook for fetching a single organization
 */
export function useOrganization(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => apiOrganizationsIdGet({ path: { id } }).then(res => res.data),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for fetching organizations by user
 */
export function useUserOrganizations(userId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['organizations', 'user', userId],
    queryFn: () => apiOrganizationsUserUserIdGet({ path: { userId } }).then(res => res.data),
    enabled: !!userId,
    ...options,
  });
}

/**
 * Hook for creating an organization
 */
export function useCreateOrganization(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orgData) => apiOrganizationsPost({ body: orgData }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    ...options,
  });
}

/**
 * Hook for updating an organization
 */
export function useUpdateOrganization(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiOrganizationsIdPut({ path: { id }, body: data }).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.id] });
    },
    ...options,
  });
}

/**
 * Hook for deleting an organization
 */
export function useDeleteOrganization(options?: UseMutationOptions<any, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiOrganizationsIdDelete({ path: { id } }).then(res => res.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', id] });
    },
    ...options,
  });
}

// User Queries

/**
 * Hook for fetching all users
 */
export function useUsers(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiUsersGet().then(res => res.data),
    ...options,
  });
}

/**
 * Hook for fetching a single user
 */
export function useUser(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiUsersIdGet({ path: { id } }).then(res => res.data),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for fetching a user by email
 */
export function useUserByEmail(email: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['users', 'email', email],
    queryFn: () => apiUsersByEmailGet({ query: { email } }).then(res => res.data),
    enabled: !!email,
    ...options,
  });
}

/**
 * Hook for fetching users by organization
 */
export function useOrganizationUsers(organizationId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['users', 'organization', organizationId],
    queryFn: () => apiUsersByOrganizationOrganizationIdGet({ path: { organizationId } }).then(res => res.data),
    enabled: !!organizationId,
    ...options,
  });
}

// Flow Queries

/**
 * Hook for fetching all flows
 */
export function useFlows(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['flows'],
    queryFn: () => apiFlowsGet().then(res => res.data),
    ...options,
  });
}

/**
 * Hook for fetching a single flow
 */
export function useFlow(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: ['flows', id],
    queryFn: () => apiFlowsIdGet({ path: { id } }).then(res => res.data),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for creating a flow
 */
export function useCreateFlow(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (flowData) => apiFlowsPost({ body: flowData }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
    ...options,
  });
}

/**
 * Hook for updating a flow
 */
export function useUpdateFlow(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiFlowsIdPut({ path: { id }, body: data }).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      queryClient.invalidateQueries({ queryKey: ['flows', variables.id] });
    },
    ...options,
  });
}

/**
 * Hook for deleting a flow
 */
export function useDeleteFlow(options?: UseMutationOptions<any, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiFlowsIdDelete({ path: { id } }).then(res => res.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      queryClient.invalidateQueries({ queryKey: ['flows', id] });
    },
    ...options,
  });
}

// Email Queries

/**
 * Hook for sending an email
 */
export function useSendEmail(options?: UseMutationOptions<any, Error, any>) {
  return useMutation({
    mutationFn: (emailData) => mailSendPost({ body: emailData }).then(res => res.data),
    ...options,
  });
}