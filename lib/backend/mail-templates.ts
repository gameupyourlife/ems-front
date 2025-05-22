import { OrgMail } from "./types";
import { guardUUID } from "./utils";

export interface MailTemplate {
    id: string;
    name: string;
    subject: string;
    description?: string;
    body: string;
    createdAt?: string;
    isUserCreated: boolean;
    organizationName?: string;
}

export interface CreateMailTemplateDto {
    name: string;
    subject: string;
    body: string;
    description?: string;
    recipients: string[];
}

export interface UpdateMailTemplateDto {
    name?: string;
    subject?: string;
    body?: string;
    description?: string;
    recipients?: string[];
}

/**
 * Fetches all mail templates for an organization
 * @param orgId The organization ID
 * @returns A promise that resolves to an array of mail templates
 */
export async function getMailTemplates(orgId: string, token: string): Promise<OrgMail[]> {
    guardUUID(orgId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/mail-templates`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error(`Failed to fetch mail templates: ${response.statusText}`);
    }


    const DTOs: MailTemplate[] = await response.json();

    const mails: OrgMail[] = DTOs.map((dto) => {
        const mail: OrgMail = {
            name: dto.name || "Unbenannt",
            subject: dto.subject || "",
            body: dto.body || "",
            createdAt: dto.createdAt || "",
            description: dto.description || "",
            organizationName: dto.organizationName || "",

            existsInDB: true,
            id: dto.id || "",
            isTemplate: true,
            isUserCreated: dto.isUserCreated,
        }
        return mail;
    });

    return mails;
}

/**
 * Fetches a specific mail template by ID
 * @param orgId The organization ID
 * @param templateId The mail template ID
 * @returns A promise that resolves to the mail template
 */
export async function getMailTemplate(orgId: string, templateId: string, token: string): Promise<OrgMail> {
    guardUUID(templateId);
    guardUUID(orgId);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/mail-templates/${templateId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch mail template: ${response.statusText}`);
    }

    const dto: MailTemplate = await response.json();

    const mail: OrgMail = {
        name: dto.name || "Unbenannt",
        subject: dto.subject || "",
        body: dto.body || "",
        createdAt: dto.createdAt || "",
        description: dto.description || "",
        organizationName: dto.organizationName || "",

        existsInDB: true,
        id: dto.id || "",
        isTemplate: true,
        isUserCreated: dto.isUserCreated,
    }
    return mail;
}

/**
 * Creates a new mail template
 * @param orgId The organization ID
 * @param template The mail template data
 * @returns A promise that resolves to the created mail template
 */
export async function createMailTemplate(orgId: string, template: CreateMailTemplateDto, token: string): Promise<MailTemplate> {
    guardUUID(orgId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/mail-templates`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
    });

    if (!response.ok) {
        throw new Error(`Failed to create mail template: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Updates an existing mail template
 * @param orgId The organization ID
 * @param templateId The mail template ID
 * @param template The updated mail template data
 * @returns A promise that resolves to the updated mail template
 */
export async function updateMailTemplate(
    orgId: string,
    templateId: string,
    template: UpdateMailTemplateDto,
    token: string
): Promise<MailTemplate> {
    guardUUID(orgId);
    guardUUID(templateId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/mail-templates/${templateId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
    });

    if (!response.ok) {
        throw new Error(`Failed to update mail template: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Deletes a mail template
 * @param orgId The organization ID
 * @param templateId The mail template ID
 * @returns A promise that resolves when the template is deleted
 */
export async function deleteMailTemplate(orgId: string, templateId: string, token: string): Promise<void> {
    guardUUID(orgId);
    guardUUID(templateId);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org/${orgId}/mail-templates/${templateId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete mail template: ${response.statusText}`);
    }
}