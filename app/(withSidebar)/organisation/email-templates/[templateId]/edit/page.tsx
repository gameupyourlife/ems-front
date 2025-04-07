"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import EmailTemplateForm, { EmailTemplateFormData } from "@/components/org/email-template-form";
import { emailTemplates } from "@/lib/mock/email-data";

// Mock user-created templates for testing
const mockUserTemplates = [
  {
    id: "user-template-1",
    name: "My Custom Welcome Email",
    subject: "Welcome to [Event Name] - Important Information",
    body: `<h2>Welcome to [Event Name]!</h2>
      <p>Thank you for registering for our upcoming event. We're excited to have you join us!</p>
      <p>This email contains all the information you'll need to make the most of your experience.</p>
      <h3>Event Details:</h3>
      <ul>
        <li><strong>Date:</strong> [Event Date]</li>
        <li><strong>Time:</strong> [Start Time] - [End Time]</li>
        <li><strong>Location:</strong> [Venue Name]</li>
      </ul>
      <h3>What to Bring:</h3>
      <ul>
        <li>Your ticket (digital or printed)</li>
        <li>A notebook and pen</li>
        <li>Business cards for networking</li>
        <li>A fully charged laptop or tablet</li>
      </ul>
      <p>We look forward to seeing you at the event!</p>
      <p>Best regards,<br>The Event Team</p>`,
    description: "My customized welcome email for attendees",
    isUserCreated: true
  },
  {
    id: "user-template-2",
    name: "Speaker Thank You",
    subject: "Thank You for Speaking at [Event Name]",
    body: `<h2>Thank You for Speaking at [Event Name]!</h2>
      <p>On behalf of all attendees and our organizing team, I want to extend our sincere gratitude for your excellent presentation.</p>
      <p>Your insights on the topic were valuable and generated a lot of positive feedback from our attendees.</p>
      <p>We'd love to invite you back to speak at our future events. In the meantime, we've shared your contact information with those who requested it for follow-up questions.</p>
      <p>Thank you once again for your contribution to making our event a success!</p>
      <p>Best regards,<br>The Event Team</p>`,
    description: "Thank you note for event speakers",
    isUserCreated: true
  }
];

export default function EditTemplate() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  
  const [template, setTemplate] = useState<EmailTemplateFormData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a fetch request to your API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to find the template in the system templates first
        let foundTemplate = emailTemplates.find(t => t.id === templateId);
        
        // If not found in system templates, check user templates
        if (!foundTemplate) {
          foundTemplate = mockUserTemplates.find(t => t.id === templateId);
        }
        
        if (foundTemplate) {
          setTemplate({
            ...foundTemplate,
            isUserCreated: foundTemplate.hasOwnProperty('isUserCreated') 
              ? (foundTemplate as any).isUserCreated 
              : true
          });
          setError(null);
        } else {
          setError("Template not found");
        }
      } catch (err) {
        console.error("Error fetching template:", err);
        setError("Failed to load template. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplate();
  }, [templateId]);
  
  const handleSaveTemplate = async (templateData: EmailTemplateFormData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be a PUT request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update with the new data
      const updatedTemplate = {
        ...templateData,
        id: templateId,
        isUserCreated: true,
      };
      
      console.log("Template updated:", updatedTemplate);
      
      // In a real app, we would update this in a database
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error || !template) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 text-lg">{error || "Template not found"}</p>
        <button 
          onClick={() => router.push('/organisation/email-templates')} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Return to Templates
        </button>
      </div>
    );
  }

  // Don't allow editing system templates
  if (!template.isUserCreated) {
    return (
      <div className="py-20 text-center">
        <p className="text-amber-600 text-lg">System templates cannot be edited.</p>
        <p className="mt-2 text-muted-foreground">You can duplicate this template to create your own version of it.</p>
        <button 
          onClick={() => router.push('/organisation/email-templates')} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Return to Templates
        </button>
      </div>
    );
  }

  return (
    <EmailTemplateForm 
      template={template}
      onSave={handleSaveTemplate}
      isSubmitting={isSubmitting}
    />
  );
}