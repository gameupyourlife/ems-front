"use client";;
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import MailEditor from "@/components/mail-editor";
import { useMail } from "@/lib/backend/hooks/use-mails";


export default function TemplateEditPage() {
    const params = useParams();
    const emailId = params.emailId as string;
    const eventId = params.eventId as string;

    const { data: session } = useSession();
    const { data: template, isLoading, error } = useMail(session?.user?.organization.id || "", eventId, emailId, session?.user?.jwt || "")


    return (
        <MailEditor
            error={error}
            isLoading={isLoading}
            mail={template}
        />
    );
}