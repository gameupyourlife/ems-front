import {
    Action,
    ActionCreateDto,
    ActionDto,
    ActionUpdateDto,
    Flow,
    FlowCreateDto,
    FlowOverviewDto,
    FlowUpdateDto,
    Trigger,
    TriggerCreateDto,
    TriggerDto,
    TriggerUpdateDto,
} from './types';
import { guardUUID } from './utils';

// Flow Management
export async function getFlows(orgId: string, eventId: string, token: string): Promise<Flow[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting flows: ${response.statusText}`);
    }


    const flowTemplates: FlowOverviewDto[] = await response.json();

    const flows: Flow[] = await Promise.all(flowTemplates.map(async (flowTemplate) => ({
        id: flowTemplate.id,
        name: flowTemplate.name || '',
        description: flowTemplate.description || '',

        triggers: await getTriggers(orgId, eventId, flowTemplate.id, token),
        actions: await getActions(orgId, eventId, flowTemplate.id, token),

        isActive: false,
        multipleRuns: false,
        stillPending: false,

        // @ts-ignore
        createdAt: flowTemplate.createdAt || '',
        updatedAt: flowTemplate.updatedAt || '',
        // @ts-ignore
        createdBy: flowTemplate.createdBy || '',
        updatedBy: flowTemplate.updatedBy || '',


        isTemplate: true,
        existInDb: true,
    })));
    return flows;
}

export async function createFlow(orgId: string, eventId: string, flowData: FlowCreateDto, token: string): Promise<FlowOverviewDto> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
    });

    if (!response.ok) {
        throw new Error(`Error creating flow: ${response.statusText}`);
    }

    return await response.json();
}

export async function getFlow(orgId: string, eventId: string, flowId: string, token: string): Promise<Flow> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting flow: ${response.statusText}`);
    }

    const flowTemplate: FlowOverviewDto = await response.json();

    const flow: Flow = {
        id: flowTemplate.id,
        name: flowTemplate.name || '',
        description: flowTemplate.description || '',

        triggers: await getTriggers(orgId, eventId, flowTemplate.id, token),
        actions: await getActions(orgId, eventId, flowTemplate.id, token),

        isActive: false,
        multipleRuns: false,
        stillPending: false,

        // @ts-ignore
        createdAt: flowTemplate.createdAt || '',
        updatedAt: flowTemplate.updatedAt || '',
        // @ts-ignore
        createdBy: flowTemplate.createdBy || '',
        updatedBy: flowTemplate.updatedBy || '',


        eventId: eventId,
        isTemplate: false,
        existInDb: true,
    }

    console.log("Flow: ", flow);
    return flow;
}

export async function updateFlow(orgId: string, eventId: string, flowId: string, flowData: FlowUpdateDto, token: string): Promise<FlowOverviewDto> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
    });

    if (!response.ok) {
        throw new Error(`Error updating flow: ${response.statusText}`);
    }

    return await response.json();
}

export async function deleteFlow(orgId: string, eventId: string, flowId: string, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error deleting flow: ${response.statusText}`);
    }
}

// Action Management
export async function getActions(orgId: string, eventId: string, flowId: string, token: string): Promise<Action[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to fetch actions: ${response.status} ${response.statusText}`);
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
        flowId: flowId,
        flowTemplateId: action.flowTemplateId,
    }));

    return actions || [];
}

export async function createAction(
    orgId: string,
    eventId: string,
    flowId: string,
    actionData: ActionCreateDto,
    token: string
): Promise<ActionDto> {
    actionData.details = JSON.stringify(actionData.details);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
    });

    if (!response.ok) {
        throw new Error(`Error creating action: ${response.statusText}`);
    }

    return await response.json();
}

export async function getAction(orgId: string, eventId: string, flowId: string, actionId: string, token: string): Promise<ActionDto> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions/${actionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting action: ${response.statusText}`);
    }

    return await response.json();
}

export async function updateAction(
    orgId: string,
    eventId: string,
    flowId: string,
    actionId: string,
    actionData: ActionUpdateDto,
    token: string
): Promise<ActionDto> {
    guardUUID(actionId);
    guardUUID(flowId);
    guardUUID(eventId);
    guardUUID(orgId);
    
    actionData.details = JSON.stringify(actionData.details);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions/${actionId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
    });

    if (!response.ok) {
        throw new Error(`Error updating action: ${response.statusText}`);
    }

    return await response.json();
}

export async function deleteAction(orgId: string, eventId: string, flowId: string, actionId: string, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions/${actionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error deleting action: ${response.statusText}`);
    }
}

// Trigger Management
export async function getTriggers(orgId: string, eventId: string, flowId: string, token: string): Promise<Trigger[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to fetch triggers: ${response.status} ${response.statusText}`);
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
        flowId: flowId,
        flowTemplateId: trigger.flowTemplateId,
    }));
    return triggers || [];
}

export async function createTrigger(
    orgId: string,
    eventId: string,
    flowId: string,
    triggerData: TriggerCreateDto,
    token: string
): Promise<TriggerDto> {
    triggerData.details = JSON.stringify(triggerData.details);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(triggerData),
    });

    if (!response.ok) {
        throw new Error(`Error creating trigger: ${response.statusText}`);
    }

    return await response.json();
}

export async function getTrigger(orgId: string, eventId: string, flowId: string, triggerId: string, token: string): Promise<TriggerDto> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers/${triggerId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting trigger: ${response.statusText}`);
    }

    return await response.json();
}

export async function updateTrigger(
    orgId: string,
    eventId: string,
    flowId: string,
    triggerId: string,
    triggerData: TriggerUpdateDto,
    token: string
): Promise<TriggerDto> {
    guardUUID(triggerId);
    guardUUID(flowId);
    guardUUID(eventId);
    guardUUID(orgId);

    triggerData.details = JSON.stringify(triggerData.details);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers/${triggerId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(triggerData),
    });

    if (!response.ok) {
        throw new Error(`Error updating trigger: ${response.statusText}`);
    }

    return await response.json();
}

export async function deleteTrigger(orgId: string, eventId: string, flowId: string, triggerId: string, token: string): Promise<void> {
    guardUUID(triggerId);
    guardUUID(flowId);
    guardUUID(eventId);
    guardUUID(orgId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers/${triggerId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error deleting trigger: ${response.statusText}`);
    }
}