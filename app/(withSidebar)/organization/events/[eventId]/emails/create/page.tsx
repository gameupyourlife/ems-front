"use client";;
import MailEditor from "@/components/mail-editor";
import { EventMail } from "@/lib/backend/types";
import { useParams } from "next/navigation";


export default function TemplateEditPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const mail: EventMail = {
    body: "",
    existsInDB: false,
    isTemplate: false,
    id: "New-mail",
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