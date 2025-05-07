import { mockOrgUsers } from "../data";
import { Organization, OrgUser } from "../types";
import { getAuthToken, isMock } from "./utils";

export async function getMembers(orgId: string) : Promise<OrgUser[]> {
    if(isMock()) return mockOrgUsers;

    const token = await getAuthToken();

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

export async function updateMemberRole(orgId: string, userId: string, role: string) {
    if(isMock()) return true;

    const token = await getAuthToken();

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

export async function updateOrg(organization: Organization) {
    if(isMock()) return true;

    const token = await getAuthToken();

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${organization.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
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