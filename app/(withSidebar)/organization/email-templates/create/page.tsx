"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailTemplateForm, { EmailTemplateFormData } from "@/components/org/email-template-form";

export default function CreateTemplate() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Speichert eine neue E-Mail-Vorlage.
   * @param templateData Die Daten der E-Mail-Vorlage
   */
  const handleSaveTemplate = async (templateData: EmailTemplateFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        isUserCreated: true,
      };

      console.log("Vorlage erstellt:", newTemplate);

      return Promise.resolve();
    } catch (error) {
      console.error("Fehler beim Erstellen der Vorlage:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <EmailTemplateForm
        onSave={handleSaveTemplate}
        isSubmitting={isSubmitting}
      />
    </>
  );
}