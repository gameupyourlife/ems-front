export interface EventInfo {
    id: string,
    title: string,
    organization: string,
    date: Date,
    location: string,
    description: string,
    category: string,
    attendees: number,
    image: string,
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