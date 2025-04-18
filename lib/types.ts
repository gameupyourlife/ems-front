export interface EventInfo {
    id: string,
    title: string,
    organization: string,
    date: Date,
    location: string,
    description: string,
    category: string,
    attendees: number,
    capacity: number,
    image: string,
    status: string,
    start: Date,
    end: Date,
    createdAt: Date,
    updatedAt: Date,
    createdBy: string,
    updatedBy: string,
}
export interface Organization {
    id: string;
    numOfMembers: number;
    numOfEvents: number;
    owner: string;
    createdAt: string;
    updatedAt: string;
    updatedBy: string;
    name: string;
    address: string;
    description: string;
    profilePicture: string;
    website: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    profilePicture: string;
}

export interface OrgUser {
    user: User;
    role: string;
    orgId: string;
}

// Condition types
export type ConditionType = "date" | "numOfAttendees" | "status" | "registration";

export interface DateConditionDetails {
    operator: "before" | "after" | "on";
    value: string; // date-time format
}

export interface NumOfAttendeesConditionDetails {
    operator: "greaterThan" | "lessThan" | "equalTo";
    valueType: "absolute" | "percentage";
    value: number;
}

export interface StatusConditionDetails {
    operator: "is" | "isNot";
    value: "active" | "cancelled" | "completed" | "archived" | "draft";
}

export interface RegistrationConditionDetails {
    // Empty object as registration events don't need additional details
}

export type ConditionDetails = 
    | DateConditionDetails 
    | NumOfAttendeesConditionDetails 
    | StatusConditionDetails 
    | RegistrationConditionDetails;

export interface Condition {
    id: string;
    type: ConditionType;
    details: ConditionDetails;
}

// Action types
export type ActionType = "email" | "notification" | "statusChange" | "fileShare" | "imageChange" | "titleChange" | "descriptionChange";

export interface EmailActionDetails {
    subject: string;
    body: string;
    recipients: string[];
}

export interface NotificationActionDetails {
    message: string;
    recipients: string[];
}

export interface StatusChangeActionDetails {
    newStatus: "active" | "cancelled" | "completed" | "archived" | "draft";
}

export interface FileShareActionDetails {
    fileId: string;
    status: "private" | "public";
}

export interface ImageChangeActionDetails {
    newImage: string; // URL format
}

export interface TitleChangeActionDetails {
    newTitle: string;
}

export interface DescriptionChangeActionDetails {
    newDescription: string;
}

export type ActionDetails =
    | EmailActionDetails
    | NotificationActionDetails
    | StatusChangeActionDetails
    | FileShareActionDetails
    | ImageChangeActionDetails
    | TitleChangeActionDetails
    | DescriptionChangeActionDetails;

export interface Action {
    id: string;
    type: ActionType;
    details: ActionDetails;
}

export interface Flow {
    id: string,
    name: string,
    description: string,
    trigger: Condition[],
    actions: Action[],
    createdAt: Date,
    updatedAt: Date,
    updatedBy: string,
    createdBy: string,
    templateId: string,
    eventId: string,
}

export interface EventDetails {
    metadata: EventInfo;
    organization: Organization;
    attendees: User[];
    flows: Flow[];
    files: EmsFile[];
    agenda: AgendaStep[];
    emails: Email[];
}

export interface EmsFile {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    url: string;
}

export interface AgendaStep {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
}

export interface FlowTemplate {
    id: string;
    name: string;
    description: string;
    trigger: Condition[];
    actions: Action[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isUserCreated: boolean; // true if created by the user, false if default template
}
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    description: string;
    isUserCreated: boolean; // true if created by the user, false if default template
}

export interface Email {
    id: string;
    eventId: string;
    subject: string;
    body: string;
    recipients: string[];
    status: "draft" | "sent" | "scheduled" | "failed";
    scheduledFor?: Date;
    sentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    flowId?: string; // If this email was generated by a flow
}