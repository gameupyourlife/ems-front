"use client";;
import { AgendaStep, Email, EmsFile, EventDetails, EventInfo, Organization, User } from '../types-old';
import { components, Flow } from './types';
import { guardUUID } from './utils';



export async function getEvents(orgId: string, token: string) {
	guardUUID(orgId);

	const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events`;
	console.log('Fetching events from URL:', fetchUrl); // Debugging line

	return fetch(fetchUrl, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': token ? `Bearer ${token}` : '',
		},
	})
		.then((res) => res.json())
		.then((data) => data)

}




type EventBasicDetailedDto = components['schemas']['EventBasicDetailedDto'];

export async function getEventDetails(orgId: string, eventId: string, token: string): Promise<EventInfo> {
	guardUUID(eventId);
	guardUUID(orgId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
		});

		const basicData: EventInfo = await response.json();



		return basicData;
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch event details');
	}
}

async function getEventFlows(eventId: string, token: string): Promise<EventBasicDetailedDto> {
	guardUUID(eventId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});

		const basicData: EventBasicDetailedDto = await response.json();
		return basicData;
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch event details');
	}
}

export async function getEventsByCreator(orgId: string, userId: string, token: string): Promise<EventDetails[]> {
    guardUUID(orgId);
    guardUUID(userId);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/creator/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

		if (!response.ok) {
			if (response.status === 404) return [];
			throw new Error(`Failed to fetch events by creator: ${response.status}`);
		}

        const basicData : EventDetails[] = await response.json();
        return basicData;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch event details');
    }
}

export async function getEventsById(orgId: string, eventId: string, token: string): Promise<EventDetails> {
    guardUUID(orgId);
    guardUUID(eventId);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        const data = (await response.json()) as EventDetails;
        return data;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch event details');
    }
}

export async function registerAttendee(
  orgId: string, 
  eventId: string, 
  userId: string, 
  profilePicture: string, 
  token: string
): Promise<any> {
  guardUUID(orgId);
  guardUUID(eventId);
  guardUUID(userId);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/attendees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ userId, profilePicture }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register attendee');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to register attendee');
  }
}

export async function deleteAttendee(
  orgId: string,
  eventId: string,
  userId: string,
  token: string
): Promise<any> {
  guardUUID(orgId);
  guardUUID(eventId);
  guardUUID(userId);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/attendees/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete attendee');
  }

  return res.json();
}

export async function deleteEvent(
  orgId: string,
  eventId: string,
  token: string
): Promise<any> {
  guardUUID(orgId);
  guardUUID(eventId);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete event');
  }

  return res.json();
    
}

/**
 * Fetches complete event details including metadata, organization, attendees, flows, files, agenda, and emails
 * @param orgId Organization ID
 * @param eventId Event ID
 * @param token Auth token
 * @returns Complete EventDetails object
 */
export async function getCompleteEventDetails(orgId: string, eventId: string, token: string): Promise<EventDetails> {
	guardUUID(orgId);
	guardUUID(eventId);

	try {
		// Fetch all data in parallel for better performance
		const [
			eventInfo,
			organization,
			attendees,
			flows,
			agenda,
			emails
		] = await Promise.all([
			getEventDetails(orgId, eventId, token),
			getEventOrganization(orgId, token),
			getEventAttendees(orgId, eventId, token),
			getEventFlowsList(orgId, eventId, token),
			getEventAgenda(orgId, eventId, token),
			getEventEmails(orgId, eventId, token)
		]);

		return {
			start: new Date(eventInfo.start),
			metadata: eventInfo,
			organization,
			attendees,
			flows,
			agenda,
			emails
		};
	} catch (err) {
		console.error('Failed to fetch complete event details:', err);
		throw new Error('Failed to fetch complete event details');
	}
}

/**
 * Fetches the organization details for an event
 * @param orgId Organization ID
 * @param token Auth token
 * @returns Organization details
 */
export async function getEventOrganization(orgId: string, token: string): Promise<Organization> {
	guardUUID(orgId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch organization: ${response.status}`);
		}

		const orgData = await response.json();
		
		// Transform the API response to match the Organization interface
		const organization: Organization = {
			id: orgData.id,
			numOfMembers: orgData.memberCount || 0,
			numOfEvents: 0, // This might need to be fetched separately
			owner: orgData.creator?.id || '',
			createdAt: orgData.createdAt,
			updatedAt: orgData.updatedAt,
			updatedBy: orgData.updater?.id || '',
			name: orgData.name || '',
			address: orgData.address || '',
			description: orgData.description || '',
			profilePicture: orgData.profilePicture || '',
			website: orgData.website || '',
		};

		return organization;
	} catch (err) {
		console.error('Failed to fetch organization details:', err);
		throw new Error('Failed to fetch organization details');
	}
}

/**
 * Fetches attendees for an event
 * @param orgId Organization ID
 * @param eventId Event ID
 * @param token Auth token
 * @returns List of attendees
 */
export async function getEventAttendees(orgId: string, eventId: string, token: string): Promise<User[]> {
	guardUUID(orgId);
	guardUUID(eventId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/attendees`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});

		if (!response.ok) {
			if (response.status === 404) return [];
			throw new Error(`Failed to fetch attendees: ${response.status}`);
		}

		const attendeesData = await response.json();
		
		// Transform EventAttendeeDto[] to User[]
		const attendees: User[] = attendeesData.map((attendee: any) => ({
			id: attendee.userId,
			name: attendee.userName || '',
			email: attendee.userEmail || '', 
			createdAt: '',
			updatedAt: '',
			profilePicture: attendee.profilePicture || '',
		}));

		return attendees;
	} catch (err) {
		console.error('Failed to fetch event attendees:', err);
		throw new Error('Failed to fetch event attendees');
	}
}

/**
 * Fetches all flows for an event
 * @param orgId Organization ID
 * @param eventId Event ID
 * @param token Auth token
 * @returns List of flows
 */
export async function getEventFlowsList(orgId: string, eventId: string, token: string): Promise<Flow[]> {
	guardUUID(orgId);
	guardUUID(eventId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/flows`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			if (response.status === 404) return [];
			throw new Error(`Failed to fetch flows: ${response.status}`);
		}

		const flowsData = await response.json();
		
		// Transform FlowResponseDto[] to Flow[]
		const flows: Flow[] = flowsData.map((flowDto: any) => ({
			id: flowDto.id,
			name: flowDto.name || '',
			description: flowDto.description || '',
			triggers: flowDto.triggers || [],
			actions: flowDto.actions || [],
			createdAt: flowDto.createdAt,
			updatedAt: flowDto.updatedAt,
			updatedBy: flowDto.updatedBy || '',
			createdBy: flowDto.createdBy || '',
			eventId: eventId,
			existInDb: true,
			isActive: flowDto.isActive || false,
			isUserCreated: flowDto.isUserCreated || true,
			isTemplate: flowDto.isTemplate || false,
			multipleRuns: flowDto.multipleRuns || false,
			stillPending: flowDto.stillPending || false,

		} as Flow));

		return flows;
	} catch (err) {
		console.error('Failed to fetch event flows:', err);
		throw new Error('Failed to fetch event flows');
	}
}

/**
 * Fetches files associated with an event
 * @param orgId Organization ID
 * @param eventId Event ID
 * @param token Auth token
 * @returns List of files
 */
export async function getEventFiles(orgId: string, eventId: string, token: string): Promise<EmsFile[]> {
	guardUUID(orgId);
	guardUUID(eventId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/files`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});

		if (!response.ok) {
			if (response.status === 404) return [];
			throw new Error(`Failed to fetch files: ${response.status}`);
		}

		const filesData = await response.json();
		
		// Transform FileDto[] to EmsFile[]
		const files:  [] = filesData.map((fileDto: any) => ({
			id: fileDto.id || '',
			name: fileDto.originalName || '',
			type: fileDto.contentType || '',
			createdAt: new Date(fileDto.uploadedAt),
			updatedAt: new Date(fileDto.uploadedAt),
			createdBy: fileDto.uploader?.id || '',
			updatedBy: fileDto.uploader?.id || '',
			url: fileDto.url || '',
		}));

		return files;
	} catch (err) {
		console.error('Failed to fetch event files:', err);
		throw new Error('Failed to fetch event files');
	}
}

/**
 * Fetches agenda for an event
 * @param orgId Organization ID
 * @param eventId Event ID
 * @param token Auth token
 * @returns List of agenda steps
 */
export async function getEventAgenda(orgId: string, eventId: string, token: string): Promise<AgendaStep[]> {
	guardUUID(orgId);
	guardUUID(eventId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/agenda`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});

		if (!response.ok) {
			if (response.status === 404) return [];
			throw new Error(`Failed to fetch agenda: ${response.status}`);
		}

		const agendaData = await response.json();
		
		// Transform AgendaEntryDto[] to AgendaStep[]
		const agenda: AgendaStep[] = agendaData.map((entryDto: any) => ({
			id: entryDto.id || '',
			title: entryDto.title || '',
			description: entryDto.description || '',
			startTime: new Date(entryDto.start),
			endTime: new Date(entryDto.end),
		}));

		return agenda;
	} catch (err) {
		console.error('Failed to fetch event agenda:', err);
		throw new Error('Failed to fetch event agenda');
	}
}

/**
 * Fetches emails associated with an event
 * @param orgId Organization ID
 * @param eventId Event ID
 * @param token Auth token
 * @returns List of emails
 */
export async function getEventEmails(orgId: string, eventId: string, token: string): Promise<Email[]> {
	guardUUID(orgId);
	guardUUID(eventId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}/emails`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});

		if (!response.ok) {
			if (response.status === 404) return [];
			throw new Error(`Failed to fetch emails: ${response.status}`);
		}

		const emailsData = await response.json();
		
		// Transform EmailDto[] to Email[]
		const emails: Email[] = emailsData.map((emailDto: any) => ({
			id: emailDto.mailId || '',
			eventId: eventId,
			subject: emailDto.subject || '',
			body: emailDto.body || '',
			recipients: emailDto.recipients || [],
			status: emailDto.status || 'draft',
			scheduledFor: emailDto.scheduledFor ? new Date(emailDto.scheduledFor) : undefined,
			sentAt: emailDto.sentAt ? new Date(emailDto.sentAt) : undefined,
			createdAt: new Date(emailDto.createdAt),
			updatedAt: emailDto.updatedAt ? new Date(emailDto.updatedAt) : new Date(emailDto.createdAt),
			createdBy: emailDto.createdBy || '',
			updatedBy: emailDto.updatedBy || emailDto.createdBy || '',
			flowId: emailDto.flowId,
		}));

		return emails;
	} catch (err) {
		console.error('Failed to fetch event emails:', err);
		throw new Error('Failed to fetch event emails');
	}
}

export async function updateEvent(orgId: string, eventId: string, token: string): Promise<EventDetails> {
	guardUUID(orgId);
	guardUUID(eventId);

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orgs/${orgId}/events/${eventId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to update event: ${response.status}`);
		}

		const eventData = await response.json();
		return eventData;
	} catch (err) {
		console.error('Failed to update event:', err);
		throw new Error('Failed to update event');
	}
}
