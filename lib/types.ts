import { EmptyObject } from "react-hook-form";

export interface EventInfo {
    id: string,
    title: string,
    organization: string,
    location: string,
    description: string,
    category: string,
    attendeeCount: number,
    capacity: number,
    image: string,
    status: number,
    start: Date,
    end: Date,
    createdAt: Date,
    updatedAt: Date,
    createdBy: string,
    updatedBy: string,
    creatorName: string,
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
    jwt?: string;
}

export interface OrgUser {
    user: User;
    role: string;
    orgId: string;
}

// Condition types
export type ConditionType = "date" | "numOfAttendees" | "status" | "registration";

export interface DateConditionDetails {
    operator: "lessThan" | "greaterThan" | "equal";
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


export type ConditionDetails = 
    | DateConditionDetails 
    | NumOfAttendeesConditionDetails 
    | StatusConditionDetails 
    | EmptyObject;

export interface Condition {
    id: string;
    type: ConditionType;
    details: ConditionDetails;
}

export interface TypeSafeCondition<T extends ConditionType> {
    id: string;
    type: T;
    details: T extends "date" ? DateConditionDetails :
             T extends "numOfAttendees" ? NumOfAttendeesConditionDetails :
             T extends "status" ? StatusConditionDetails :
             T extends "registration" ? never : never;
}


export interface InheritanceCondition {
    id: string;
    type: ConditionType;
    details: ConditionDetails;
}

export interface InheritanceDateCondition extends InheritanceCondition {
    type: "date";
    details: DateConditionDetails;
}

export interface InheritanceNumOfAttendeesCondition extends InheritanceCondition {
    type: "numOfAttendees";
    details: NumOfAttendeesConditionDetails;
}
export interface InheritanceStatusCondition extends InheritanceCondition {
    type: "status";
    details: StatusConditionDetails;
}
export interface InheritanceRegistrationCondition extends InheritanceCondition {
    type: "registration";
    details: never;
}


const dateCondition : TypeSafeCondition<"date"> = {
    id: "1",
    type: "date",
    details: {
        operator: "lessThan",
        // @ts-ignore
        value: 7,
        valueType: "days",
        valueRelativeTo: "event.date",
        valueRelativeOperator: "before",
        // @ts-ignore
        valueRelativeDateOperator: "before"
      }
};


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
    start: Date;
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
export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
}

export enum EventStatus {
  SCHEDULED  = "SCHEDULED",
  ONGOING    = "ONGOING",
  COMPLETED  = "COMPLETED",
  CANCELLED  = "CANCELLED",
  POSTPONED  = "POSTPONED",
  DELAYED    = "DELAYED",
  ARCHIVED   = "ARCHIVED",
}

export interface RegisterAttendeeParams {
  orgId: string
  eventId: string
  userId: string
  profilePicture: string
  token: string
}
export interface DeleteAttendeeParams {
  orgId: string
  eventId: string
  userId: string
  token: string
}

export interface DeleteEvent{
    orgId: string
    eventId: string
    token: string
}