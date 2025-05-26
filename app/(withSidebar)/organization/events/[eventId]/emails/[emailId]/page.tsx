"use client";;
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Calendar,
  Edit,
  Copy,
  Trash,
  User,
  Clock,
  AlertTriangle,
  SendIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmationButton } from "@/components/ui/confirmation-button";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner";
import { useMail } from "@/lib/backend/hooks/use-mails";
import { deleteMail, sendMail } from "@/lib/backend/mails";

export default function MailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const emailId = params.emailId as string;

  const { data: session } = useSession();
  const queryClient = useQueryClient()
  const { data: email, isLoading, error } = useMail(session?.user?.organization.id || "", eventId, emailId, session?.user?.jwt || "")


  const handleDeleteMail = async () => {
    if (!email) {
      toast.error("Keine Mail, die gelöscht werden könnte gefunden")
      return;
    }
    try {
      deleteMail(session?.user?.organization.id || "", eventId, email.id, session?.user?.jwt || "")
      queryClient.invalidateQueries({ queryKey: ["mailMails"] })
      toast.success(`Mail "${email.name}" erfolgreich gelöscht`);
      router.push(`/organization/events/${eventId}/emails`);
    } catch (err) {
      console.error("Error deleting Mail:", err);
      toast.error("Löschen fehlgeschlagen")
    }
  };


  const handleDuplicateMail = async () => {
    router.push(`/organization/events/${eventId}/emails/create?mailIdToDuplicate=${emailId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && (error || !email)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Mail Not Found</h2>
        <p className="text-muted-foreground mb-6">{error?.message || "The requested Mail could not be found."}</p>
        <Button variant="outline" asChild>
          <Link href={`/organization/events/${eventId}/emails`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Mails
          </Link>
        </Button>
      </div>
    );
  }

  const quickActions: QuickAction[] = [
    {
      children: (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" asChild >
              <Link href={`/organization/events/${eventId}/emails`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent >
            <p>Zurück</p>
          </TooltipContent>
        </Tooltip >

      ),
    },
    {
      children: (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handleDuplicateMail}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mail duplizieren</p>
          </TooltipContent>
        </Tooltip >
      ),
    },
    {
      // Send Mail manually
      children: (
        <Button variant="outline" asChild onClick={async () => {
          try {

            toast.promise(
              sendMail(session?.user?.organization.id || "", eventId, emailId, session?.user?.jwt || ""),
              {
                loading: "Sende Mail...",
                success: (res) => {
                  if (res) {
                    return `Mail erfolgreich gesendet`;
                  }
                  return "Fehler beim Senden der Mail";
                },
                error: "Fehler beim Senden der Mail",
              }
            );

          }

          catch (error) {
            console.error("Error sending Mail:", error);
            toast.error("Fehler beim Senden der Mail");
          }
        }
        } >
          <span className="flex items-center">
            <SendIcon className="mr-2 h-4 w-4" />
            <span className="">Manuell senden</span>
          </span>
        </Button>

      )
    },

    {
      children: (
        <Button variant="outline" asChild>
          <Link href={`/organization/events/${eventId}/emails/${emailId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Link>
        </Button>

      ),
    },

    {
      children: (
        <>

          <ConfirmationButton confirmText="Löschen" confirmTitle="Mail löschen?" confirmDescription="Bist du sicher, dass du das Mail löschen möchtest? Diese Handlung kann nicht rückgängig gemacht werden." onConfirm={handleDeleteMail}
            variant="destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Löschen
          </ConfirmationButton>

        </>
      ),
    },
  ];

  return <>
    <SiteHeader actions={quickActions} >
      <BreadcrumbItem>
        <BreadcrumbPage>
          {email?.name}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </SiteHeader>


    <div className="space-y-6 p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{email?.name}</CardTitle>
                  <CardDescription className="mt-1">{email?.description}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {email?.isTemplate ? "Mail" : "Mail"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="space-y-2">
                <div className="text-sm font-medium">Empfänger:</div>
                <div className="border rounded-md p-3 bg-muted text-sm">
                  {(email?.recipients?.length || 0) > 0 ? (
                    <div className="flex flex-col gap-1">
                      {email?.recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-3 w-3" />
                          </div>
                          <span>{recipient}</span>
                        </div>
                      ))}
                    </div>
                  ) : (

                    email?.sendToAllParticipants ? (
                      <div className="text-sm text-muted-foreground">Send to all participants</div>
                    ) : (
                      // Fallback message if no recipients are specified
                      <div className="text-sm text-muted-foreground">No recipients specified</div>
                    )
                  )}


                </div>
              </div>


              <div className="space-y-2">
                <div className="text-sm font-medium">Subject:</div>
                <div className="border rounded-md p-3 bg-muted text-sm">
                  {email?.subject}
                </div>
              </div>

              <div className="space-y-2">
                <div className="border rounded-md p-3 bg-muted text-sm min-h-52 ">
                  {email?.body}
                </div>
              </div>


            </CardContent>
          </Card>

        </div>

        <div className="space-y-6 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Mail Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Mail ID</div>
                <div className="font-mono text-sm">{email?.id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Created By</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{email?.createdBy}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Last Updated By</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{email?.updatedBy}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Created Date</div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(email?.createdAt || 0), "MMMM d, yyyy")}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(email?.updatedAt || 0), "MMMM d, yyyy")}</span>
                </div>
              </div>



              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Type</div>
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {email?.isTemplate ? "Mail" : "Mail"}
                  </Badge>
                </div>
              </div>


            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </>;
}