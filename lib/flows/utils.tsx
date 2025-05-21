import {
    Calendar,
    Check,
    FileText,
    ImageIcon,
    Mail,
    Pencil,
    Tag,
    Users,
    Zap,
    Activity,
} from "lucide-react";
import { ActionType, TriggerType } from '@/lib/backend/types';







// Get appropriate icon for trigger types
export function getTriggerIcon(type: TriggerType) {
    switch (type) {
        case TriggerType.Date || TriggerType.RelativeDate:
            return <Calendar className="h-4 w-4" />;
        case TriggerType.NumOfAttendees:
            return <Users className="h-4 w-4" />;
        case TriggerType.Status:
            return <Tag className="h-4 w-4" />;
        case TriggerType.Registration:
            return <Check className="h-4 w-4" />;
        default:
            return <Activity className="h-4 w-4" />;
    }
}

// Get appropriate icon for action types
export function getActionIcon(type: ActionType) {
    switch (type) {
        case ActionType.SendEmail:
            return <Mail className="h-5 w-5" />;
        case ActionType.ChangeStatus:
            return <Tag className="h-5 w-5" />;
        case ActionType.ShareFile:
            return <FileText className="h-5 w-5" />;
        case ActionType.ChangeImage:
            return <ImageIcon className="h-5 w-5" />;
        case ActionType.ChangeTitle:
            return <Pencil className="h-5 w-5" />;
        case ActionType.ChangeDescription:
            return <FileText className="h-5 w-5" />;
        default:
            return <Zap className="h-5 w-5" />;
    }
}

// Get human-readable text for trigger details
export function getTriggerDescription(type: TriggerType, details: any) {
    switch (type) {
        case TriggerType.Date || TriggerType.RelativeDate:
            if (details?.operator && details?.value) {
                return `${details.operator === 'on' ? 'Exactly on' : details.operator === 'before' ? 'Before' : 'After'} ${details.value}`;
            } else if (details?.reference && details?.direction && details?.amount && details?.unit) {
                return `${details.amount} ${details.unit} ${details.direction} ${details.reference === 'start' ? 'event start' : 'event end'}`;
            }
            return 'Date trigger';

        case TriggerType.NumOfAttendees:
            if (details?.operator && details?.value !== undefined) {
                const opText = details.operator === 'equals' ? 'equals' : details.operator === 'lessThan' ? 'less than' : 'greater than';
                return `When attendance ${opText} ${details.value}${details.valueType === 'percentage' ? '%' : ''}`;
            }
            return 'Attendance trigger';

        case TriggerType.Status:
            return details?.status ? `When status changes to ${details.status}` : 'Status change trigger';

        case TriggerType.Registration:
            return 'When a new user registers';

        default:
            return 'Unknown trigger';
    }
}

// Get human-readable text for action details
export function getActionDescription(type: ActionType, details: any) {
    switch (type) {
        case ActionType.SendEmail:
            return `Send email with subject "${details?.subject || 'No subject'}"`;

        case ActionType.ChangeStatus:
            return `Change event status to ${details?.newStatus || 'unknown'}`;

        case ActionType.ShareFile:
            return `Share file ${details?.fileId ? `(ID: ${details.fileId})` : ''} with ${details?.status || 'unknown'} access`;

        case ActionType.ChangeImage:
            return 'Update event image';

        case ActionType.ChangeTitle:
            return `Change event title to "${details?.newTitle || 'unknown'}"`;

        case ActionType.ChangeDescription:
            return 'Update event description';

        default:
            return 'Unknown action';
    }
}

// Format the details object to a more readable form
export function formatDetailsLabel(key: string): string {
    // Handle special cases
    if (key === 'selectedTriggerId') return 'Trigger';
    if (key === 'newStatus') return 'New Status';
    if (key === 'newTitle') return 'New Title';
    if (key === 'newDescription') return 'New Description';
    if (key === 'newImage') return 'New Image';

    // General formatting - replace camelCase with spaces and capitalize first letter
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}



// Format the details value to a more readable form
export function formatDetailsValue(key: string, value: any): string {
    if (value === null || value === undefined) return 'Not specified';

    // Format different types of values
    if (key === 'recipients' && typeof value === 'string' && value.includes('trigger.')) {
        return 'Registered User';
    }
    if (key === 'recipients' && value === 'all.users') {
        return 'All Users';
    }
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}

export function getActionTitle(type: ActionType): string {
    switch (type) {
        case ActionType.SendEmail:
            return 'Send Email';
        case ActionType.ChangeStatus:
            return 'Change Status';
        case ActionType.ShareFile:
            return 'Share File';
        case ActionType.ChangeImage:
            return 'Change Image';
        case ActionType.ChangeTitle:
            return 'Change Title';
        case ActionType.ChangeDescription:
            return 'Change Description';
        default:
            //@ts-ignore
            return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
}

export function getTriggerTitle(type: TriggerType): string {
    switch (type) {
        case TriggerType.Date:
            return 'Date & Time';
        case TriggerType.RelativeDate:
            return 'Relative Date & Time';
        case TriggerType.NumOfAttendees:
            return 'Attendees Count';
        case TriggerType.Status:
            return 'Status Change';
        case TriggerType.Registration:
            return 'New Registration';
        default:
            //@ts-ignore
            return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
}

export function getActionSummary(type: ActionType, details: any): string {
    if (!details) return '';
    switch (type) {
        case ActionType.SendEmail:
            return details.subject ? `"${details.subject.slice(0, 30)}${details.subject.length > 30 ? '...' : ''}"` : '';

        case ActionType.ChangeStatus:
            return details.newStatus ? `Change to ${details.newStatus}` : '';

        case ActionType.ShareFile:
            return details.status ? `Make file ${details.status}` : '';

        case ActionType.ChangeImage:
        case ActionType.ChangeTitle:
        case ActionType.ChangeDescription:
            return 'Update event content';

        default:
            return '';
    }
}

export function getTriggerSummary(type: TriggerType, details: any): string {
    if (!details) return '';

    switch (type) {
        case TriggerType.Date || TriggerType.RelativeDate:
            if (details.operator && details.value) {
                return `${details.operator === 'on' ? 'Exactly on' : details.operator === 'before' ? 'Before' : 'After'} ${details.value}`;
            }
            if (details.reference && details.direction && details.amount && details.unit) {
                return `${details.amount} ${details.unit} ${details.direction} ${details.reference === 'start' ? 'event start' : 'event end'}`;
            }
            return '';

        case TriggerType.NumOfAttendees:
            if (details.operator && details.value !== undefined) {
                const opText = details.operator === 'equals' ? 'equals' : details.operator === 'lessThan' ? 'less than' : 'greater than';
                return `When attendance ${opText} ${details.value}${details.valueType === 'percentage' ? '%' : ''}`;
            }
            return '';

        case TriggerType.Status:
            return details.status ? `When status changes to ${details.status}` : '';

        case TriggerType.Registration:
            return 'When a new user registers';

        default:
            return '';
    }
}
