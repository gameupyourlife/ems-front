export interface OrgMail {
    id: string;
    name: string;
    subject: string;
    description?: string;
    body: string;
    createdAt: string;
    updatedAt?: "";
    createdBy?: "";
    updatedBy?: "";    
    isUserCreated: boolean;
    organizationName?: string;

    existsInDB: boolean;
    isTemplate: true;
}


export interface EventMail {
    id: string;
    name: string;
    subject: string;
    body: string;
    recipients: string[];
    scheduledFor?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    eventId: string;
    
    isUserCreated: boolean;

    existsInDB: boolean;
    isTemplate: false;
}


export type Mail = OrgMail | EventMail; 



// EventFlow Types
export interface FlowCreateDto {
    name: string;
    description?: string | null;
    stillPending?: boolean;
    multipleRuns?: boolean;
    createdBy: string;
}

export interface FlowUpdateDto {
    name: string;
    description?: string | null;
    updatedBy: string;
    stillPending?: boolean;
    multipleRuns?: boolean;
}

export interface FlowOverviewDto {
    id: string;
    name: string;
    description?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
    triggers?: TriggerOverviewDto[] | null;
    actions?: ActionOverviewDto[] | null;
}

export interface Flow {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    stillPending: boolean;
    multipleRuns: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy?: string | null;
    triggers?: Trigger[] | null;
    actions?: Action[] | null;
    isTemplate: boolean;
    existInDb: boolean;
    eventId?: string | null;
}

export interface Trigger {
    id: string;
    type: TriggerType;
    details: any;
    createdAt: string;
    flowId?: string | null;
    flowTemplateId?: string | null;
    name?: string | null;
    description?: string | null;
    existInDb: boolean;
}

export interface Action {
    id: string;
    type: ActionType;
    details: any;
    createdAt: string;
    flowId?: string | null;
    flowTemplateId?: string | null;
    name?: string | null;
    description?: string | null;
    existInDb: boolean;
}

export interface FlowDto {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy?: string | null;
    triggers?: TriggerDto[] | null;
    actions?: ActionDto[] | null;
}

export interface FlowTemplateDto {
    id: string;
    name?: string | null;
    description?: string | null;
    organizationId: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy?: string | null;
    triggers?: TriggerDto[] | null;
    actions?: ActionDto[] | null;
}

export enum ActionType {
    SendEmail,
    ChangeStatus,
    ShareFile,
    ChangeImage,
    ChangeTitle,
    ChangeDescription
}

export interface ActionCreateDto {
    type: ActionType;
    details: string;
    flowId?: string | null;
    flowTemplateId?: string | null;
    name?: string | null;
    summary?: string | null;
}

export interface ActionDto {
    id: string;
    type: ActionType;
    details: any;
    createdAt: string;
    flowId?: string | null;
    flowTemplateId?: string | null;
    name?: string | null;
    summary?: string | null;
}

export interface ActionUpdateDto {
    id: string;
    type: ActionType;
    details: string;
    name?: string | null;
    summary?: string | null;
}

export interface ActionOverviewDto {
    id: string;
    name?: string | null;
    type: ActionType;
    summary?: string | null;
}

export enum TriggerType {
    Date,
    RelativeDate,
    NumOfAttendees,
    Status,
    Registration
}

export interface TriggerCreateDto {
    type: TriggerType;
    details?: string | null;
    flowId?: string | null;
    name?: string | null;
    summary?: string | null;
}

export interface TriggerDto {
    id: string;
    type: TriggerType;
    details: any;
    createdAt: string;
    flowId?: string | null;
    flowTemplateId?: string | null;
    name?: string | null;
    summary?: string | null;
}

export interface TriggerUpdateDto {
    id: string;
    type: TriggerType;
    details?: string | null;
    name?: string | null;
    summary?: string | null;
}

export interface TriggerOverviewDto {
    id: string;
    name?: string | null;
    type: TriggerType;
    summary?: string | null;
}

// FlowTemplate Types
export interface FlowTemplateCreateDto {
    name: string;
    description: string;
    organizationId?: string;
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
    updatedBy?: string | null;
}

export interface FlowTemplateUpdateDto {
    id: string;
    name?: string | null;
    description?: string | null;
    organizationId: string;
    updatedBy?: string | null;
}

export interface FlowTemplateResponseDto {
    id: string;
    name?: string | null;
    description?: string | null;
    organizationId: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy?: string | null;
    triggers?: TriggerOverviewDto[] | null;
    actions?: ActionOverviewDto[] | null;
}




export interface EventCreateDto {
    title: string;
    organizationId: string;
    description?: string | null;
    location?: string | null;
    capacity?: number;
    image?: string | null;
    status?: string;
    start?: string;
    end?: string | null;
    category?: string;
    createdBy: string;
    updatedBy: string;
}

export interface EventUpdateDto {
    id: string;
    title?: string | null;
    description?: string | null;
    location?: string | null;
    capacity?: number;
    status?: string;
    image?: string | null;
    start?: string;
    end?: string | null;
    category?: string;
    updatedBy: string;
}

export interface EventInfoDto {
    id: string;
    title?: string | null;
    organizationId: string;
    location?: string | null;
    description?: string | null;
    category?: string | null;
    attendeeCount: number;
    capacity: number;
    image?: string | null;
    status: string;
    start: string;
    end?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    createdBy: string;
    creatorName?: string | null;
    updatedBy: string;
}

export interface EventOverviewDto {
    id: string;
    title?: string | null;
    category?: string | null;
    start: string;
    location?: string | null;
    image?: string | null;
    attendeeCount: number;
    capacity: number;
    status: string;
    description?: string | null;
}
