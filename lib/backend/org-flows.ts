import {
    FlowTemplateResponseDto,
    ActionDto,
    TriggerDto,
    ActionCreateDto,
    ActionUpdateDto,
    TriggerCreateDto,
    TriggerUpdateDto,
    FlowTemplateCreateDto,
    FlowTemplateUpdateDto,
    Flow,
    Action,
    Trigger,
} from './types';
import { guardUUID } from './utils';

/**
 * Get all flow templates for an organization
 * @param orgId The organization ID
 * @param accessToken Auth token
 * @returns List of flow templates
 */
export async function getOrgFlowTemplates(orgId: string, accessToken: string): Promise<FlowTemplateResponseDto[]> {
    guardUUID(orgId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch flow templates: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Create a new flow template for an organization
 * @param orgId The organization ID
 * @param template The template to create
 * @param accessToken Auth token
 * @returns The created flow template
 */
export async function createOrgFlowTemplate(
    orgId: string,
    template: FlowTemplateCreateDto,
    accessToken: string
): Promise<FlowTemplateResponseDto> {
    guardUUID(orgId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
    });

    if (!response.ok) {
        throw new Error(`Failed to create flow template: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get a specific flow template by ID
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param accessToken Auth token
 * @returns The flow template
 */
export async function getOrgFlowTemplate(
    orgId: string,
    templateId: string,
    accessToken: string
): Promise<Flow> {
    guardUUID(orgId);
    guardUUID(templateId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch flow template: ${response.status} ${response.statusText}`);
    }

    const flowTemplate: FlowTemplateResponseDto = await response.json();

    const flow: Flow = {
        id: flowTemplate.id,
        name: flowTemplate.name || '',
        description: flowTemplate.description || '',

        triggers: await getOrgFlowTemplateTriggers(orgId, flowTemplate.id, accessToken),
        actions: await getOrgFlowTemplateActions(orgId, flowTemplate.id, accessToken),

        isActive: false,
        multipleRuns: false,
        stillPending: false,

        createdAt: flowTemplate.createdAt,
        updatedAt: flowTemplate.updatedAt,
        createdBy: flowTemplate.createdBy,
        updatedBy: flowTemplate.updatedBy,

        isTemplate: true,
        existInDb: true,
    }
    return flow;
}

/**
 * Update a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param template The updated template data
 * @param accessToken Auth token
 * @returns The updated flow template
 */
export async function updateOrgFlowTemplate(
    orgId: string,
    templateId: string,
    template: FlowTemplateUpdateDto,
    accessToken: string
): Promise<FlowTemplateResponseDto> {
    guardUUID(orgId);
    guardUUID(templateId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
    });

    if (!response.ok) {
        throw new Error(`Failed to update flow template: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Delete a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param accessToken Auth token
 */
export async function deleteOrgFlowTemplate(
    orgId: string,
    templateId: string,
    accessToken: string
): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete flow template: ${response.status} ${response.statusText}`);
    }
}

// ACTIONS

/**
 * Get all actions for a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param accessToken Auth token
 * @returns List of actions
 */
export async function getOrgFlowTemplateActions(
    orgId: string,
    templateId: string,
    accessToken: string
): Promise<Action[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/actions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if(response.status === 404) return [];
        throw new Error(`Failed to fetch flow template actions: ${response.status} ${response.statusText}`);
    }

    const DTOs: ActionDto[] = await response.json();
    const actions: Action[] = DTOs.map((action) => ({
        id: action.id,
        name: action.name,
        description: action.summary,
        type: action.type,
        createdAt: action.createdAt,
        summary: action.summary,
        details: action.details,
        existInDb: true,
        flowId: templateId,
        flowTemplateId: templateId,
    }));
    
    return actions || [];
}

/**
 * Create a new action for a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param action The action to create
 * @param accessToken Auth token
 * @returns The created action
 */
export async function createOrgFlowTemplateAction(
    orgId: string,
    templateId: string,
    action: ActionCreateDto,
    accessToken: string
): Promise<ActionDto> {
    action.details = JSON.stringify(action.details);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/actions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
    });

    if (!response.ok) {
        throw new Error(`Failed to create action: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get a specific action from a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param actionId The action ID
 * @param accessToken Auth token
 * @returns The action
 */
export async function getOrgFlowTemplateAction(
    orgId: string,
    templateId: string,
    actionId: string,
    accessToken: string
): Promise<ActionDto> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/actions/${actionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch action: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Update an action in a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param actionId The action ID
 * @param action The updated action data
 * @param accessToken Auth token
 * @returns The updated action
 */
export async function updateOrgFlowTemplateAction(
    orgId: string,
    templateId: string,
    actionId: string,
    action: ActionUpdateDto,
    accessToken: string
): Promise<ActionDto> {
    
    action.details = JSON.stringify(action.details);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/actions/${actionId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
    });

    if (!response.ok) {
        console.error(await response.json());
        throw new Error(`Failed to update action: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Delete an action from a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param actionId The action ID
 * @param accessToken Auth token
 */
export async function deleteOrgFlowTemplateAction(
    orgId: string,
    templateId: string,
    actionId: string,
    accessToken: string
): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/actions/${actionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete action: ${response.status} ${response.statusText}`);
    }
}

// TRIGGERS

/**
 * Get all triggers for a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param accessToken Auth token
 * @returns List of triggers
 */
export async function getOrgFlowTemplateTriggers(
    orgId: string,
    templateId: string,
    accessToken: string
): Promise<Trigger[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/triggers`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if(response.status === 404) return [];
        throw new Error(`Failed to fetch flow template triggers: ${response.status} ${response.statusText}`);
    }

    const dto: TriggerDto[] = await response.json();

    const triggers: Trigger[] = dto.map((trigger) => ({
        id: trigger.id,
        name: trigger.name,
        description: trigger.summary,
        type: trigger.type,
        createdAt: trigger.createdAt,
        summary: trigger.summary,
        details: trigger.details,
        existInDb: true,
        flowId: templateId,
        flowTemplateId: templateId,
    }));
    return triggers || [];
}

/**
 * Create a new trigger for a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param trigger The trigger to create
 * @param accessToken Auth token
 * @returns The created trigger
 */
export async function createOrgFlowTemplateTrigger(
    orgId: string,
    templateId: string,
    trigger: TriggerCreateDto,
    accessToken: string
): Promise<TriggerDto> {
    trigger.details = JSON.stringify(trigger.details);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/triggers`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(trigger),
    });

    if (!response.ok) {
        throw new Error(`Failed to create trigger: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get a specific trigger from a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param triggerId The trigger ID
 * @param accessToken Auth token
 * @returns The trigger
 */
export async function getOrgFlowTemplateTrigger(
    orgId: string,
    templateId: string,
    triggerId: string,
    accessToken: string
): Promise<TriggerDto> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/triggers/${triggerId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch trigger: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Update a trigger in a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param triggerId The trigger ID
 * @param trigger The updated trigger data
 * @param accessToken Auth token
 * @returns The updated trigger
 */
export async function updateOrgFlowTemplateTrigger(
    orgId: string,
    templateId: string,
    triggerId: string,
    trigger: TriggerUpdateDto,
    accessToken: string
): Promise<TriggerDto> {
    trigger.details = JSON.stringify(trigger.details);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/triggers/${triggerId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(trigger),
    });

    if (!response.ok) {
        throw new Error(`Failed to update trigger: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Delete a trigger from a flow template
 * @param orgId The organization ID
 * @param templateId The template ID
 * @param triggerId The trigger ID
 * @param accessToken Auth token
 */
export async function deleteOrgFlowTemplateTrigger(
    orgId: string,
    templateId: string,
    triggerId: string,
    accessToken: string
): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/flowTemplates/${templateId}/triggers/${triggerId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete trigger: ${response.status} ${response.statusText}`);
    }
}