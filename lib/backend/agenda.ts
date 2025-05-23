import { guardUUID } from "./utils";

export interface AgendaEntry {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
}

export interface AgendaEntryDto {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    eventId: string;
}

export interface AgendaEntryCreateDto {
    title: string;
    description?: string;
    start: string;
    end: string;
}

export interface AgendaEntryUpdateDto {
    title?: string;
    description?: string;
    start?: string;
    end?: string;
}

/**
 * Fetches all agenda entries for an event
 * @param orgId The organization ID
 * @param eventId The event ID
 * @returns A promise that resolves to an array of agenda entries
 */
export async function getAgendaEntries(orgId: string, eventId: string, token: string): Promise<AgendaEntry[]> {
    guardUUID(orgId);
    guardUUID(eventId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/agenda`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to fetch agenda entries: ${response.statusText}`);
    }

    const DTOs = await response.json();
    const entries: AgendaEntry[] = DTOs.map((dto: any) => {
        const entry : AgendaEntry= {
            id: dto.id,
            title: dto.title,
            description: dto.description,
            start: new Date(dto.start),
            end: new Date(dto.end),
        }
    });
    
    return entries;
}

/**
 * Creates a new agenda entry
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param agendaEntry The agenda entry data
 * @returns A promise that resolves to the created agenda entry
 */
export async function createAgendaEntry(
    orgId: string,
    eventId: string,
    agendaEntry: AgendaEntryCreateDto,
    token: string
): Promise<AgendaEntryDto> {
    guardUUID(orgId);
    guardUUID(eventId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/agenda`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(agendaEntry),
    });

    if (!response.ok) {
        throw new Error(`Failed to create agenda entry: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Updates an existing agenda entry
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param agendaId The agenda entry ID
 * @param agendaEntry The updated agenda entry data
 * @returns A promise that resolves to the updated agenda entry
 */
export async function updateAgendaEntry(
    orgId: string,
    eventId: string,
    agendaId: string,
    agendaEntry: AgendaEntryUpdateDto,
    token: string
): Promise<AgendaEntryDto> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(agendaId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/agenda/${agendaId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(agendaEntry),
    });

    if (!response.ok) {
        throw new Error(`Failed to update agenda entry: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Deletes an agenda entry
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param agendaId The agenda entry ID
 * @returns A promise that resolves when the agenda entry is deleted
 */
export async function deleteAgendaEntry(
    orgId: string,
    eventId: string,
    agendaId: string,
    token: string
): Promise<void> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(agendaId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/agenda/${agendaId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete agenda entry: ${response.statusText}`);
    }
}
