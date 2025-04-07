import { Bell, Calendar, Check, FileText, ImageIcon, Mail, Pencil, Tag, Users, Zap } from "lucide-react";

// Get appropriate icon for trigger types
export function getTriggerIcon(type: string) {
    switch (type) {
        case 'date':
            return <Calendar className="h-5 w-5" />;
        case 'numOfAttendees':
            return <Users className="h-5 w-5" />;
        case 'status':
            return <Tag className="h-5 w-5" />;
        case 'registration':
            return <Check className="h-5 w-5" />;
        default:
            return <Zap className="h-5 w-5" />;
    }
}

// Get appropriate icon for action types
export function getActionIcon(type: string) {
    switch (type) {
        case 'email':
            return <Mail className="h-5 w-5" />;
        case 'notification':
            return <Bell className="h-5 w-5" />;
        case 'statusChange':
            return <Tag className="h-5 w-5" />;
        case 'fileShare':
            return <FileText className="h-5 w-5" />;
        case 'imageChange':
            return <ImageIcon className="h-5 w-5" />;
        case 'titleChange':
            return <Pencil className="h-5 w-5" />;
        case 'descriptionChange':
            return <FileText className="h-5 w-5" />;
        default:
            return <Zap className="h-5 w-5" />;
    }
}

// Get human-readable text for trigger details
export function getTriggerDescription(type: string, details: any) {
    switch (type) {
        case 'date':
            if (details?.operator && details?.value) {
                return `${details.operator === 'on' ? 'Exactly on' : details.operator === 'before' ? 'Before' : 'After'} ${details.value}`;
            } else if (details?.reference && details?.direction && details?.amount && details?.unit) {
                return `${details.amount} ${details.unit} ${details.direction} ${details.reference === 'start' ? 'event start' : 'event end'}`;
            }
            return 'Date trigger';

        case 'numOfAttendees':
            if (details?.operator && details?.value !== undefined) {
                const opText = details.operator === 'equals' ? 'equals' : details.operator === 'lessThan' ? 'less than' : 'greater than';
                return `When attendance ${opText} ${details.value}${details.valueType === 'percentage' ? '%' : ''}`;
            }
            return 'Attendance trigger';

        case 'status':
            return details?.status ? `When status changes to ${details.status}` : 'Status change trigger';

        case 'registration':
            return 'When a new user registers';

        default:
            return 'Unknown trigger';
    }
}

// Get human-readable text for action details
export function getActionDescription(type: string, details: any) {
    switch (type) {
        case 'email':
            return `Send email with subject "${details?.subject || 'No subject'}"`;

        case 'notification':
            return `Send notification: "${details?.message || 'No message'}"`;

        case 'statusChange':
            return `Change event status to ${details?.newStatus || 'unknown'}`;

        case 'fileShare':
            return `Share file ${details?.fileId ? `(ID: ${details.fileId})` : ''} with ${details?.status || 'unknown'} access`;

        case 'imageChange':
            return 'Update event image';

        case 'titleChange':
            return `Change event title to "${details?.newTitle || 'unknown'}"`;

        case 'descriptionChange':
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
};



// Format the details value to a more readable form
export function formatDetailsValue (key: string, value: any): string  {
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
  };

// Helper function to get a human-readable title for trigger and action types
export function getItemTitle  (type: string): string  {
    switch (type) {
      // Triggers
      case 'date': return 'Date & Time';
      case 'numOfAttendees': return 'Attendees Count';
      case 'status': return 'Status Change';
      case 'registration': return 'New Registration';
      
      // Actions
      case 'email': return 'Send Email';
      case 'notification': return 'Send Notification';
      case 'statusChange': return 'Change Status';
      case 'fileShare': return 'Share File';
      case 'imageChange': return 'Update Image';
      case 'titleChange': return 'Change Title';
      case 'descriptionChange': return 'Change Description';
      
      default: return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  };

// Get a summary of the trigger or action details
export function getItemSummary(type: string, details: any): string {
    if (!details) return '';

    switch (type) {
        case 'date':
            if (details.operator && details.value) {
                return `${details.operator === 'on' ? 'Exactly on' : details.operator === 'before' ? 'Before' : 'After'} ${details.value}`;
            }
            if (details.reference && details.direction && details.amount && details.unit) {
                return `${details.amount} ${details.unit} ${details.direction} ${details.reference === 'start' ? 'event start' : 'event end'}`;
            }
            return '';

        case 'numOfAttendees':
            if (details.operator && details.value !== undefined) {
                const opText = details.operator === 'equals' ? 'equals' : details.operator === 'less' ? 'less than' : 'greater than';
                return `When attendance ${opText} ${details.value}`;
            }
            return '';

        case 'status':
            return details.status ? `When status changes to ${details.status}` : '';

        case 'registration':
            return 'When a new user registers';

        case 'email':
            return details.subject ? `"${details.subject.slice(0, 30)}${details.subject.length > 30 ? '...' : ''}"` : '';

        case 'notification':
            return details.message ? `"${details.message.slice(0, 30)}${details.message.length > 30 ? '...' : ''}"` : '';

        case 'statusChange':
            return details.newStatus ? `Change to ${details.newStatus}` : '';

        case 'fileShare':
            return details.status ? `Make file ${details.status}` : '';

        case 'imageChange':
        case 'titleChange':
        case 'descriptionChange':
            return 'Update event content';

        default:
            return '';
    }
};
