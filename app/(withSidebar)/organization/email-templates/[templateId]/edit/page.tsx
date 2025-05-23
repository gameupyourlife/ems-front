"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMailTemplate } from "@/lib/backend/hooks/use-mail-templates";
import MailEditor from "@/components/mail-editor";


export default function TemplateEditPage() {
    const params = useParams();
    const templateId = params.templateId as string;

    const { data: session } = useSession();
    const { data: template, isLoading, error } = useMailTemplate(session?.user?.organization.id || "", templateId, session?.user?.jwt || "")


    return (
        <MailEditor
            error={error}
            isLoading={isLoading}
            mail={template}
        />
    );
}