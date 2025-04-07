"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailTemplateForm, { EmailTemplateFormData } from "@/components/org/email-template-form";

export default function CreateTemplate() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveTemplate = async (templateData: EmailTemplateFormData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be a POST request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a unique ID for the new template
      const newTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        isUserCreated: true,
      };
      
      console.log("Template created:", newTemplate);
      
      // In a real app, we would save this to a database
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EmailTemplateForm 
      onSave={handleSaveTemplate}
      isSubmitting={isSubmitting}
    />
  );
}