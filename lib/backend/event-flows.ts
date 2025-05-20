import {
    ActionCreateDto,
    ActionDto,
    ActionOverviewDto,
    ActionUpdateDto,
    FlowCreateDto,
    FlowOverviewDto,
    FlowUpdateDto,
    TriggerCreateDto,
    TriggerDto,
    TriggerOverviewDto,
    TriggerUpdateDto,
} from './types';

// Flow Management
export async function getFlows(orgId: string, eventId: string, token: string): Promise<FlowOverviewDto[]> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting flows: ${response.statusText}`);
    }

    return await response.json();
}

export async function createFlow(orgId: string, eventId: string, flowData: FlowCreateDto, token: string): Promise<FlowOverviewDto> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows`, {
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

export async function getFlow(orgId: string, eventId: string, flowId: string, token: string): Promise<FlowOverviewDto> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting flow: ${response.statusText}`);
    }

    return await response.json();
}

export async function updateFlow(orgId: string, eventId: string, flowId: string, flowData: FlowUpdateDto, token: string): Promise<FlowOverviewDto> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}`, {
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
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}`, {
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
export async function getActions(orgId: string, eventId: string, flowId: string, token: string): Promise<ActionOverviewDto[]> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting actions: ${response.statusText}`);
    }

    return await response.json();
}

export async function createAction(
    orgId: string,
    eventId: string,
    flowId: string,
    actionData: ActionCreateDto,
    token: string
): Promise<ActionDto> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions`, {
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
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions/${actionId}`, {
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
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions/${actionId}`, {
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
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/actions/${actionId}`, {
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
export async function getTriggers(orgId: string, eventId: string, flowId: string, token: string): Promise<TriggerOverviewDto[]> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error getting triggers: ${response.statusText}`);
    }

    return await response.json();
}

export async function createTrigger(
    orgId: string,
    eventId: string,
    flowId: string,
    triggerData: TriggerCreateDto,
    token: string
): Promise<TriggerDto> {
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers`, {
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
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers/${triggerId}`, {
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
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers/${triggerId}`, {
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
    const response = await fetch(`/api/orgs/${orgId}/events/${eventId}/flows/${flowId}/triggers/${triggerId}`, {
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