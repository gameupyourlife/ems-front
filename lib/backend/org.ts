import { Organization, OrgUser } from "../types-old";
import { guardUUID } from "./utils";

export async function getMembers(orgId: string, token: string): Promise<OrgUser[]> {
    guardUUID(orgId);

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/members`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    })
        .then((res) => res.json())
        .then((data) => data)
        .catch((err) => {
            console.error(err);
            throw new Error('Failed to fetch members');
        });
}

export async function updateMemberRole(orgId: string, userId: string, role: string, token: string) {
    guardUUID(orgId);
    guardUUID(userId);

    if (!role) {
        throw new Error("Role is required");
    }

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/members/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ role }),
    })
        .then((res) => res.json())
        .then((data) => data)
        .catch((err) => {
            console.error(err);
            throw new Error('Failed to update member role');
        });
}

export async function updateOrg(organization: Organization, token: string): Promise<Organization> {
    guardUUID(organization.id);

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${organization.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(organization),
    })
        .then((res) => res.json())
        .then((data) => data)
        .catch((err) => {
            console.error(err);
            throw new Error('Failed to update organization');
        });
}

export async function getOrg(orgId: string, token: string): Promise<Organization> {
    guardUUID(orgId);

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    })
        .then((res) => res.json())
        .then((data) => data)
        .catch((err) => {
            console.error(err);
            throw new Error('Failed to fetch organization');
        });
}

interface OrgsDto {
    "orgId": string,
    "numOfMembers": number,
    "numOfEvents": number,
    "ownerId": string,
    "createdAt": string,
    "updatedAt": string,
    "updatedBy": string,
    "name": string,
    "address": string,
    "description": string,
    "profilePicture": string,
    "website": string
}

export async function getOrgsOfUser(userId: string, token: string): Promise<Organization[]> {
    guardUUID(userId);

    try {
        const orgs: OrgsDto[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/orgs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        })
            .then((res) => res.json())
            .then((data) => data)

        return orgs.map((org) => ({
            id: org.orgId,
            numOfMembers: org.numOfMembers,
            numOfEvents: org.numOfEvents,
            owner: org.ownerId,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
            updatedBy: org.updatedBy,
            name: org.name,
            address: org.address,
            description: org.description,
            profilePicture: org.profilePicture,
            website: org.website
        })) as Organization[];
    }
    catch (err) {
        console.error(err);
        throw new Error('Failed to fetch organizations of user');
    }

}