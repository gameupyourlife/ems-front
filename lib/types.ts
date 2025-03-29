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

export interface Flow {
    "id": string,
    "name": string,
    "description": string,
    "trigger":
    {
        "id": string,
        "type": "date" | "numOfAttendees" | "status" | "registration",
        "details": any
    }[],
    "actions":
    {
        "id": string,
        "type": "email" | "notification" | "statusChange" | "fileShare" | "imageChange" | "titleChange"| "descriptionChange"        ,
        "details": any
    }[],
    "createdAt": Date,
    "updatedAt": Date,
    "updatedBy": string,
    "createdBy": string,
}


// Condition:
// type: object
// properties:
//     id:
//         type: string
//         readOnly: true
//     type:
//         type: string
//         enum: [date, numOfAttendees, status, registration]
//     details:
//         type: object
//         oneOf:
//             - $ref: '#/components/schemas/DateConditionDetails'
//             - $ref: '#/components/schemas/NumOfAttendeesConditionDetails'
//             - $ref: '#/components/schemas/StatusConditionDetails'
//             - $ref: '#/components/schemas/RegistrationConditionDetails'
// DateConditionDetails:
// type: object
// properties:
//     operator:
//         type: string
//         enum: [before, after, on]
//     value:
//         type: string
//         format: date-time
// required:
//     - operator
//     - value
// NumOfAttendeesConditionDetails:
// type: object
// properties:
//     operator:
//         type: string
//         enum: [greaterThan, lessThan, equalTo]
//     valueType:
//         type: string
//         enum: [absolute, percentage]
//     value:
//         type: integer
// required:
//     - operator
//     - valueType
//     - value
// StatusConditionDetails:
// type: object
// properties:
//     operator:
//         type: string
//         enum: [is, isNot]
//     value:
//         type: string
//         enum: [active, cancelled, completed, archived, draft]
// required:
//     - operator
//     - value
// RegistrationConditionDetails:
// type: object
// description: Empty object as registration events don't need additional details
// required:
//     - type
// Action:
// type: object
// properties:
//     id:
//         type: string
//         readOnly: true
//     type:
//         type: string
//         enum: [email, notification, statusChange, fileShare, imageChange, titleChange, descriptionChange]
//     details:
//         type: object
//         oneOf:
//             - $ref: '#/components/schemas/EmailActionDetails'
//             - $ref: '#/components/schemas/NotificationActionDetails'
//             - $ref: '#/components/schemas/StatusChangeActionDetails'
//             - $ref: '#/components/schemas/FileShareActionDetails'
//             - $ref: '#/components/schemas/ImageChangeActionDetails'
//             - $ref: '#/components/schemas/TitleChangeActionDetails'
//             - $ref: '#/components/schemas/DescriptionChangeActionDetails'
// required:
//     - type
//     - details
// EmailActionDetails:
// type: object
// properties:
//     subject:
//         type: string
//     body:
//         type: string
//     recipients:
//         type: array
//         items:
//             type: string
// required:
//     - subject
//     - body
//     - recipients
// NotificationActionDetails:
// type: object
// properties:
//     message:
//         type: string
//     recipients:
//         type: array
//         items:
//             type: string
// required:
//     - message
//     - recipients
// StatusChangeActionDetails:
// type: object
// properties:
//     newStatus:
//         type: string
//         enum: [active, cancelled, completed, archived, draft]
// required:
//     - newStatus
// FileShareActionDetails:
// type: object
// properties:
//     fileId:
//         type: string
//     status:
//         type: string
//         enum: [private, public]              
// required:
//     - fileUrl
//     - recipients
// ImageChangeActionDetails:
// type: object
// properties:
//     newImage:
//         type: string
//         format: url
// required:
//     - newImage
// TitleChangeActionDetails:
// type: object
// properties:
//     newTitle:
//         type: string
// required:
//     - newTitle
// DescriptionChangeActionDetails:
// type: object
// properties:
//     newDescription:
//         type: string
// required:
//     - newDescription