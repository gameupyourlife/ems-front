"use client";;
import MailEditor from "@/components/mail-editor";
import { OrgMail } from "@/lib/backend/types";


export default function TemplateEditPage() {

  const mail : OrgMail = {
    body: "",
    existsInDB: false,
    isTemplate: true,
    id: "New-mail-template",
    isUserCreated: true,
    createdAt: new Date().toString(),
    name: "",
    recipients: [],
    subject: "",
    createdBy: "",
    updatedBy: "",
    description: "",
    sendToAllParticipants: false,
    scheduledFor: "",
    updatedAt: new Date().toString(),
  }

  return (
    <MailEditor
      error={null}
      isLoading={false}
      mail={mail}
    />
  );
}