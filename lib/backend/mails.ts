import { EventMail } from "./types";
import { guardUUID } from "./utils";

export enum MailRunStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4,
}


export interface MailDto {
    id: string;
    name: string;
    subject: string;
    body: string;
    description?: string;
    recipients?: string[];
    scheduledFor?: string;
    isUserCreated: boolean;
    sendToAllParticipants: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface CreateMailDto {
    name: string;
    subject: string;
    description?: string;
    body: string;
    recipients?: string[];
    scheduledFor?: string;
    isUserCreated: boolean;
    sendToAllParticipants: boolean;
}

export type UpdateMailDto = CreateMailDto 

export interface MailRun {
    mailRunId: string;
    mailId: string;
    status: MailRunStatus;
    timestamp: string;
    logs?: string[];
}

export interface CreateMailRunDto {
    mailId: string;
    status: MailRunStatus;
    logs?: string[];
}

/**
 * Fetches all mails for an event
 * @param orgId The organization ID
 * @param eventId The event ID
 * @returns A promise that resolves to an array of mails
 */
export async function getMails(orgId: string, eventId: string, token: string): Promise<EventMail[]> {
    guardUUID(orgId);
    guardUUID(eventId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/emails`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to fetch mails: ${response.statusText}`);
    }


    const DTOs: MailDto[] = await response.json();

    const mails: EventMail[] = DTOs.map((dto) => {
        const mail: EventMail = {
            name: dto.name || "Unbenannt",
            subject: dto.subject || "",
            body: dto.body || "",
            recipients: dto.recipients || [],
            scheduledFor: dto.scheduledFor || "",
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
            createdBy: dto.createdBy || "",
            updatedBy: dto.updatedBy || "",
            description: dto.description || "",
            sendToAllParticipants: dto.sendToAllParticipants || false,

            existsInDB: true,
            id: dto.id || "",
            isTemplate: false,
            isUserCreated: true,
        }
        return mail;
    });

    return mails;
}

/**
 * Fetches a specific mail by ID
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @returns A promise that resolves to the mail
 */
export async function getMail(orgId: string, eventId: string, mailId: string, token: string): Promise<EventMail> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(mailId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/mails/${mailId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch mail: ${response.statusText}`);
    }

    const dto: MailDto = await response.json();
    const mail: EventMail = {
        name: dto.name || "Unbenannt",
        subject: dto.subject || "",
        body: dto.body || "",
        recipients: dto.recipients || [],
        scheduledFor: dto.scheduledFor || "",
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        createdBy: dto.createdBy || "",
        updatedBy: dto.updatedBy || "",
        description: dto.description || "",
        sendToAllParticipants: dto.sendToAllParticipants || false,

        existsInDB: true,
        id: dto.id || "",
        isTemplate: false,
        isUserCreated: true,
    }

    return mail;
}

/**
 * Creates a new mail
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mail The mail data
 * @returns A promise that resolves to the created mail
 */
export async function createMail(orgId: string, eventId: string, mail: CreateMailDto, token: string): Promise<MailDto> {
    guardUUID(orgId);
    guardUUID(eventId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/emails`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(mail),
    });

    if (!response.ok) {
        throw new Error(`Failed to create mail: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Updates an existing mail
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @param mail The updated mail data
 * @returns A promise that resolves to the updated mail
 */
export async function updateMail(
    orgId: string,
    eventId: string,
    mailId: string,
    mail: UpdateMailDto,
    token: string
): Promise<MailDto> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(mailId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/mails/${mailId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(mail),
    });

    if (!response.ok) {
        throw new Error(`Failed to update mail: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Deletes a mail
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @returns A promise that resolves when the mail is deleted
 */
export async function deleteMail(orgId: string, eventId: string, mailId: string, token: string): Promise<void> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(mailId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/mails/${mailId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete mail: ${response.statusText}`);
    }
}

/**
 * Fetches all mail runs for a mail
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @returns A promise that resolves to an array of mail runs
 */
export async function getMailRuns(orgId: string, eventId: string, mailId: string, token: string): Promise<MailRun[]> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(mailId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/mails/${mailId}/runs`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch mail runs: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Creates a new mail run
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @param mailRun The mail run data
 * @returns A promise that resolves to the created mail run
 */
export async function createMailRun(
    orgId: string,
    eventId: string,
    mailId: string,
    mailRun: CreateMailRunDto,
    token: string
): Promise<MailRun> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(mailId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/mails/${mailId}/runs`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(mailRun),
    });

    if (!response.ok) {
        throw new Error(`Failed to create mail run: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetches a specific mail run by ID
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @param runId The mail run ID
 * @returns A promise that resolves to the mail run
 */
export async function getMailRun(
    orgId: string,
    eventId: string,
    mailId: string,
    runId: string,
    token: string
): Promise<MailRun> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(mailId);
    guardUUID(runId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/mails/${mailId}/runs/${runId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch mail run: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Deletes a mail run
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param mailId The mail ID
 * @param runId The mail run ID
 * @returns A promise that resolves when the mail run is deleted
 */
export async function deleteMailRun(
    orgId: string,
    eventId: string,
    mailId: string,
    runId: string,
    token: string
): Promise<void> {
    guardUUID(orgId);
    guardUUID(eventId);
    guardUUID(mailId);
    guardUUID(runId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/events/${eventId}/mails/${mailId}/runs/${runId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete mail run: ${response.statusText}`);
    }
}