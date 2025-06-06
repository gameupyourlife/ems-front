"use client";;
import { EventDetails } from "@/lib/types-old";
import EmailTable from "@/components/org/events/event-email-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useMails } from "@/lib/backend/hooks/use-mails";
import { useSession } from "next-auth/react";
import { sendMail, deleteMail } from "@/lib/backend/mails";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";



export default function EventEmailsTab({ eventDetails }: { eventDetails: EventDetails }) {
  const eventId = eventDetails.metadata.id;

  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: emails, isLoading, error } = useMails(session?.user?.organization.id || "", eventId, session?.user?.jwt || "")


  // Löscht eine E-Mail-Instanz
  const handleDeleteEmail = async (emailId: string) => {
    try {
      await deleteMail(
        session?.user?.organization.id || "",
        eventId,
        emailId,
        session?.user?.jwt || "")

      queryClient.invalidateQueries({ queryKey: ["mail"] })
      toast.success("E-Mail erfolgreich gelöscht")

    } catch (err) {
      console.error("Fehler beim Löschen der E-Mail:", err);
      toast.error("E-Mail konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.");
    }
  };

  // Sendet eine E-Mail-Instanz
  const handleSendEmail = async (emailId: string) => {
    try {
      const res = await sendMail(
        session?.user?.organization.id || "",
        eventId,
        emailId,
        session?.user?.jwt || ""
      )

      if(res)
        toast.success("E-Mail erfolgreich in die Warteschlange gestellt")
      else
        toast.error("Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut.");
    } catch (err) {
      console.error("Fehler beim Senden der E-Mail:", err);
      toast.error("E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Veranstaltungs-Kommunikation
          </CardTitle>
          <CardDescription>
            Verwalten Sie E-Mails und Vorlagen für diese Veranstaltung
          </CardDescription>
        </CardHeader>
        <CardContent>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error.message}
            </div>
          ) : (
            <EmailTable
              emails={emails || []}
              eventId={eventId}
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendEmail}
            />
          )}


        </CardContent>
      </Card>
    </div>
  );
}