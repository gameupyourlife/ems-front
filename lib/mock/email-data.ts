import { Email } from "@/lib/types";

// Mock emails for testing and development
export const mockEmails: Email[] = [
  {
    id: "email-1",
    eventId: "event-1",
    subject: "Registration Confirmation - Event Name",
    body: `<h2>Thank you for registering!</h2>
      <p>We're excited to have you join us for our upcoming event. Here are the important details:</p>
      <ul>
        <li><strong>Event:</strong> Conference Name</li>
        <li><strong>Date:</strong> October 15, 2023</li>
        <li><strong>Time:</strong> 10:00 AM - 4:00 PM</li>
        <li><strong>Location:</strong> Conference Center, Room 302</li>
      </ul>
      <p>Please arrive 15 minutes early for check-in. You'll need to bring:</p>
      <ul>
        <li>Photo ID</li>
        <li>Confirmation email (digital or printed)</li>
      </ul>
      <p>If you have any questions, don't hesitate to reach out!</p>
      <p>Best regards,<br>The Event Team</p>`,
    recipients: ["attendee1@example.com", "attendee2@example.com"],
    status: "sent",
    sentAt: new Date("2023-09-15T14:30:00"),
    createdAt: new Date("2023-09-14T10:00:00"),
    updatedAt: new Date("2023-09-14T10:00:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "email-2",
    eventId: "event-1",
    subject: "Event Reminder - Tomorrow!",
    body: `<h2>Your Event Is Tomorrow!</h2>
      <p>We're looking forward to seeing you tomorrow at our event. Here's a quick reminder of what to bring:</p>
      <ol>
        <li>Your ticket (digital or printed)</li>
        <li>Photo ID</li>
        <li>A notebook and pen</li>
        <li>Business cards for networking</li>
      </ol>
      <h3>Schedule</h3>
      <ul>
        <li>9:30 AM - 10:00 AM: Check-in & Coffee</li>
        <li>10:00 AM - 11:30 AM: Opening Keynote</li>
        <li>11:45 AM - 12:45 PM: Breakout Sessions</li>
        <li>1:00 PM - 2:00 PM: Lunch</li>
        <li>2:15 PM - 4:00 PM: Workshops</li>
      </ul>
      <p>Parking is available in the main garage. Please use the validation code <strong>EVENT2023</strong> for complimentary parking.</p>
      <p>See you soon!</p>`,
    recipients: ["attendee1@example.com", "attendee2@example.com", "attendee3@example.com"],
    status: "scheduled",
    scheduledFor: new Date("2023-09-25T08:00:00"),
    createdAt: new Date("2023-09-20T16:45:00"),
    updatedAt: new Date("2023-09-20T16:45:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "email-3",
    eventId: "event-1",
    subject: "Event Feedback Request",
    body: `<h2>We Value Your Feedback</h2>
      <p>Thank you for attending our recent event. We hope you had a wonderful experience!</p>
      <p>Your insights are invaluable to us as we plan future events. Please take a moment to <a href='https://example.com/feedback'>fill out our short survey</a>.</p>
      <p>The survey will only take about 5 minutes to complete, and your feedback will help us improve future experiences.</p>
      <p>As a token of our appreciation, all survey respondents will be entered into a draw to win a free ticket to our next event.</p>
      <p>Thank you for your time and support!</p>`,
    recipients: ["attendee1@example.com"],
    status: "draft",
    createdAt: new Date("2023-09-21T09:15:00"),
    updatedAt: new Date("2023-09-21T09:15:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "email-4",
    eventId: "event-2",
    subject: "Speaker Information for Upcoming Workshop",
    body: `<h2>Information for Featured Speakers</h2>
      <p>Thank you for agreeing to speak at our upcoming workshop. We're thrilled to have you share your expertise!</p>
      <h3>Important Dates</h3>
      <ul>
        <li><strong>Slide Submission Deadline:</strong> October 1, 2023</li>
        <li><strong>Tech Check:</strong> October 10, 2023 (3:00 PM - 5:00 PM)</li>
        <li><strong>Event Date:</strong> October 15, 2023</li>
      </ul>
      <h3>Presentation Guidelines</h3>
      <ul>
        <li>Presentation length: 20-30 minutes</li>
        <li>Q&A period: 10 minutes</li>
        <li>Please use our slide template (attached)</li>
      </ul>
      <p>If you have any questions or special requirements, please contact our speaker coordinator at speakers@example.com.</p>
      <p>We look forward to your presentation!</p>`,
    recipients: ["speaker1@example.com", "speaker2@example.com"],
    status: "sent",
    sentAt: new Date("2023-09-10T11:20:00"),
    createdAt: new Date("2023-09-09T16:30:00"),
    updatedAt: new Date("2023-09-09T16:30:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "email-5",
    eventId: "event-2",
    subject: "Last Chance to Register - Special Discount Code",
    body: `<h2>Last Chance to Register!</h2>
      <p>Our event is just one week away, and we still have a few spots left. Don't miss out on this amazing opportunity!</p>
      <h3>Special Offer</h3>
      <p>Use discount code <strong>LASTCHANCE25</strong> at checkout to receive 25% off your registration fee.</p>
      <p>This offer expires in 48 hours, so act fast!</p>
      <h3>What's Included</h3>
      <ul>
        <li>Full access to all sessions and workshops</li>
        <li>Catered lunch and refreshments</li>
        <li>Networking reception</li>
        <li>Digital resource package</li>
      </ul>
      <p><a href="https://example.com/register">Click here to register now</a></p>
      <p>We hope to see you there!</p>`,
    recipients: ["prospect1@example.com", "prospect2@example.com", "prospect3@example.com"],
    status: "failed",
    createdAt: new Date("2023-09-05T08:00:00"),
    updatedAt: new Date("2023-09-05T08:00:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "email-6",
    eventId: "event-1",
    subject: "Important Venue Change Notice",
    body: `<h2>Venue Change: Important Information</h2>
      <p>Due to unforeseen circumstances, we need to inform you about a change in venue for our upcoming event.</p>
      <h3>New Venue Details</h3>
      <p><strong>Location:</strong> Grand Conference Center<br>
      <strong>Address:</strong> 123 Main Street, Downtown<br>
      <strong>Room:</strong> Ballroom A, Second Floor</p>
      <p>The date and time of the event remain unchanged.</p>
      <h3>What You Need to Know</h3>
      <ul>
        <li>The new venue has complimentary parking</li>
        <li>Public transport options: Bus routes 10, 15, and 22 stop nearby</li>
        <li>The venue is wheelchair accessible</li>
      </ul>
      <p>We apologize for any inconvenience this may cause. If you have any questions or concerns, please contact our support team.</p>
      <p>Thank you for your understanding.</p>`,
    recipients: ["attendee1@example.com", "attendee2@example.com", "attendee3@example.com", "attendee4@example.com"],
    status: "draft",
    createdAt: new Date("2023-09-22T14:20:00"),
    updatedAt: new Date("2023-09-22T14:20:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  }
];

// Email templates that can be used when creating new emails
export const emailTemplates = [
  {
    id: "template-1",
    name: "Registration Confirmation",
    subject: "Registration Confirmation - [Event Name]",
    body: `<h2>Thank you for registering!</h2>
      <p>We're excited to have you join us for our upcoming event. Here are the important details:</p>
      <ul>
        <li><strong>Event:</strong> [Event Name]</li>
        <li><strong>Date:</strong> [Event Date]</li>
        <li><strong>Time:</strong> [Start Time] - [End Time]</li>
        <li><strong>Location:</strong> [Venue Name], [Room/Area]</li>
      </ul>
      <p>Please arrive 15 minutes early for check-in. You'll need to bring:</p>
      <ul>
        <li>Photo ID</li>
        <li>Confirmation email (digital or printed)</li>
      </ul>
      <p>If you have any questions, don't hesitate to reach out!</p>
      <p>Best regards,<br>The Event Team</p>`,
    description: "Send to confirm registration for an event"
  },
  {
    id: "template-2",
    name: "Event Reminder",
    subject: "Reminder: [Event Name] is Coming Soon",
    body: `<h2>Your Event Is Approaching!</h2>
      <p>We're looking forward to seeing you at [Event Name]. Here's a quick reminder of what to bring:</p>
      <ol>
        <li>Your ticket (digital or printed)</li>
        <li>Photo ID</li>
        <li>A notebook and pen</li>
        <li>Business cards for networking</li>
      </ol>
      <h3>Schedule</h3>
      <ul>
        <li>[Time Slot 1]: [Activity 1]</li>
        <li>[Time Slot 2]: [Activity 2]</li>
        <li>[Time Slot 3]: [Activity 3]</li>
      </ul>
      <p>Parking is available in the main garage. Please use the validation code <strong>[Code]</strong> for complimentary parking.</p>
      <p>See you soon!</p>`,
    description: "Send a reminder before the event date"
  },
  {
    id: "template-3",
    name: "Post-Event Feedback Request",
    subject: "We Value Your Feedback - [Event Name]",
    body: `<h2>We Value Your Feedback</h2>
      <p>Thank you for attending [Event Name]. We hope you had a wonderful experience!</p>
      <p>Your insights are invaluable to us as we plan future events. Please take a moment to <a href='[Survey Link]'>fill out our short survey</a>.</p>
      <p>The survey will only take about 5 minutes to complete, and your feedback will help us improve future experiences.</p>
      <p>As a token of our appreciation, all survey respondents will be entered into a draw to win [Prize Description].</p>
      <p>Thank you for your time and support!</p>`,
    description: "Request feedback after the event is completed"
  },
  {
    id: "template-4",
    name: "Event Cancellation",
    subject: "Important: [Event Name] Cancellation Notice",
    body: `<h2>Event Cancellation Notice</h2>
      <p>We regret to inform you that [Event Name] scheduled for [Event Date] has been cancelled due to [Reason for Cancellation].</p>
      <h3>What This Means For You</h3>
      <p>Your registration fee will be fully refunded within the next 5-7 business days to the original payment method.</p>
      <p>We understand this is disappointing news, and we sincerely apologize for any inconvenience this may cause.</p>
      <h3>Future Events</h3>
      <p>We are planning to reschedule this event in the future. As a registered attendee, you'll be the first to know when new dates are announced and will receive priority registration.</p>
      <p>If you have any questions or concerns, please contact our support team at [Support Email] or call [Support Phone].</p>
      <p>Thank you for your understanding.</p>`,
    description: "Send when an event needs to be cancelled"
  },
  {
    id: "template-5",
    name: "Last Minute Details",
    subject: "Last Minute Details for [Event Name]",
    body: `<h2>Final Details for Tomorrow's Event</h2>
      <p>We're excited to see you tomorrow at [Event Name]! Here are some last-minute details to ensure you have the best experience:</p>
      <h3>Quick Reminders</h3>
      <ul>
        <li><strong>Venue:</strong> [Venue Name]</li>
        <li><strong>Address:</strong> [Venue Address]</li>
        <li><strong>Start Time:</strong> [Start Time] (Doors open at [Doors Open Time])</li>
        <li><strong>Weather Forecast:</strong> [Weather Forecast]</li>
      </ul>
      <h3>Tips</h3>
      <ul>
        <li>Dress code is [Dress Code]</li>
        <li>Bring a water bottle - we'll have refill stations</li>
        <li>Download the event app for real-time updates: [App Download Link]</li>
      </ul>
      <p>Have questions? Reply to this email or find our help desk at the main entrance.</p>
      <p>We look forward to welcoming you!</p>`,
    description: "Send final details shortly before the event"
  },
  {
    id: "template-6",
    name: "Speaker Information",
    subject: "Speaker Information for [Event Name]",
    body: `<h2>Information for Featured Speakers</h2>
      <p>Thank you for agreeing to speak at [Event Name]. We're thrilled to have you share your expertise!</p>
      <h3>Important Dates</h3>
      <ul>
        <li><strong>Slide Submission Deadline:</strong> [Deadline Date]</li>
        <li><strong>Tech Check:</strong> [Tech Check Date] ([Tech Check Time])</li>
        <li><strong>Event Date:</strong> [Event Date]</li>
      </ul>
      <h3>Presentation Guidelines</h3>
      <ul>
        <li>Presentation length: [Presentation Length]</li>
        <li>Q&A period: [Q&A Length]</li>
        <li>Please use our slide template (attached)</li>
      </ul>
      <p>If you have any questions or special requirements, please contact our speaker coordinator at [Coordinator Email].</p>
      <p>We look forward to your presentation!</p>`,
    description: "Information for event speakers"
  }
];

// Helper function to get an email template by ID
export function getEmailTemplateById(templateId: string) {
  return emailTemplates.find(template => template.id === templateId);
}

// Helper function to generate placeholder values in templates
export function generatePlaceholderValues(eventDetails: any) {
  return {
    "[Event Name]": eventDetails?.title || "Event Name",
    "[Event Date]": eventDetails?.date ? new Date(eventDetails.date).toLocaleDateString() : "Event Date",
    "[Start Time]": eventDetails?.start ? new Date(eventDetails.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Start Time",
    "[End Time]": eventDetails?.end ? new Date(eventDetails.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "End Time",
    "[Venue Name]": eventDetails?.location || "Venue Name",
    "[Room/Area]": "Room/Area",
    "[Code]": "EVENT2023",
    "[Survey Link]": "https://example.com/feedback",
    "[Prize Description]": "a free ticket to our next event",
    "[Reason for Cancellation]": "unforeseen circumstances",
    "[Support Email]": "support@example.com",
    "[Support Phone]": "(555) 123-4567",
    "[Venue Address]": "123 Main Street, Anytown",
    "[Doors Open Time]": eventDetails?.start ? 
      new Date(new Date(eventDetails.start).getTime() - 30*60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
      "9:30 AM",
    "[Weather Forecast]": "Sunny, 75°F",
    "[Dress Code]": "Business Casual",
    "[App Download Link]": "https://example.com/app",
    "[Deadline Date]": eventDetails?.start ?
      new Date(new Date(eventDetails.start).getTime() - 14*86400000).toLocaleDateString() :
      "Deadline Date",
    "[Tech Check Date]": eventDetails?.start ?
      new Date(new Date(eventDetails.start).getTime() - 5*86400000).toLocaleDateString() :
      "Tech Check Date",
    "[Tech Check Time]": "3:00 PM - 5:00 PM",
    "[Presentation Length]": "20-30 minutes",
    "[Q&A Length]": "10 minutes",
    "[Coordinator Email]": "speakers@example.com"
  };
}

// Function to apply placeholder values to a template
export function applyTemplateValues(template: string, placeholders: Record<string, string>): string {
  let result = template;
  Object.entries(placeholders).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  return result;
}