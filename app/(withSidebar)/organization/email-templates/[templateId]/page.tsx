"use client";;
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, Edit, Copy, Trash, User, Clock, AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmationButton } from "@/components/ui/confirmation-button";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMailTemplate } from "@/lib/backend/hooks/use-mail-templates";
import { deleteMailTemplate } from "@/lib/backend/mail-templates";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner";

export default function TemplateDetailPage() {
  //#region State und Routing
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;

  const { data: session } = useSession();
  const queryClient = useQueryClient()
  const { data: template, isLoading, error } = useMailTemplate(session?.user?.organization.id || "", templateId, session?.user?.jwt || "")


  const handleDeleteTemplate = async () => {
    if (!template) {
      toast.error("Kein Template, das gelöscht werden könnte gefunden")
      return;
    }
    try {
      deleteMailTemplate(session?.user?.organization.id || "", template.id, session?.user?.jwt || "")
      queryClient.invalidateQueries({ queryKey: ["mailTemplates"] })
      toast.success(`Template "${template.name}" erfolgreich gelöscht`);
      router.push('/organization/email-templates');
    } catch (err) {
      console.error("Error deleting template:", err);
      toast.error("Löschen fehlgeschlagen")
    }
  };

  // ToDo: Implement the duplication logic
  const handleDuplicateTemplate = async () => {
    router.push(`/organization/email-templates/create?templateIdToDuplicate=${templateId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && (error || !template)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Template nicht gefunden</h2>
        <p className="text-muted-foreground mb-6">{error?.message || "Das angeforderte Template konnte nicht gefunden werden."}</p>
        <Button variant="outline" asChild>
          <Link href="/organization/email-templates">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück zu den Templates
          </Link>
        </Button>
      </div>
    );
  }
  //#endregion

  //#region Quick Actions für die Kopfzeile
  const quickActions: QuickAction[] = [
    {
      children: (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" asChild >
              <Link href="/organization/email-templates">
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
            <Button variant="outline" onClick={handleDuplicateTemplate}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mail-Template duplizieren</p>
          </TooltipContent>
        </Tooltip >
      ),
    },

    {
      children: (
        <Button variant="outline" asChild>
          <Link href={`/organization/email-templates/${templateId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Link>
        </Button>
      ),
    },
    {
      children: (
        <ConfirmationButton confirmText="Löschen" confirmTitle="Template löschen?" confirmDescription="Bist du sicher, dass du das Template löschen möchtest? Diese Handlung kann nicht rückgängig gemacht werden." onConfirm={handleDeleteTemplate}
          variant="destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Löschen
        </ConfirmationButton>
      ),
    },
  ];
  //#endregion

  //#region Haupt-Renderbereich
  return <>
    <SiteHeader actions={quickActions} >
      <BreadcrumbItem>
        <BreadcrumbPage>
          {template?.name}
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
                  <CardTitle className="text-xl">{template?.name}</CardTitle>
                  <CardDescription className="mt-1">{template?.description}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Organisations-Template
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="space-y-2">
                <div className="text-sm font-medium">Empfänger:</div>
                <div className="border rounded-md p-3 bg-muted text-sm">
                  {(template?.recipients?.length || 0) > 0 ? (
                    <div className="flex flex-col gap-1">
                      {template?.recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-3 w-3" />
                          </div>
                          <span>{recipient}</span>
                        </div>
                      ))}
                    </div>
                  ) : (

                    template?.sendToAllParticipants ? (
                      <div className="text-sm text-muted-foreground">Send to all participants</div>
                    ) : (
                      // Fallback message if no recipients are specified
                      <div className="text-sm text-muted-foreground">No recipients specified</div>
                    )
                  )}


                </div>
              </div>


              <div className="space-y-2">
                <div className="text-sm font-medium">Betreff:</div>
                <div className="border rounded-md p-3 bg-muted text-sm">
                  {template?.subject}
                </div>
              </div>

              <div className="space-y-2">
                <div className="border rounded-md p-3 bg-muted text-sm min-h-52 ">
                  {template?.body}
                </div>
              </div>


            </CardContent>
          </Card>

        </div>

        <div className="space-y-6 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Template-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Template ID</div>
                <div className="font-mono text-sm">{template?.id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Erstellt von</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{template?.createdBy}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Zuletzt bearbeitet von</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{template?.updatedBy}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Erstellungsdatum</div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(template?.createdAt || 0), "MMMM d, yyyy")}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Zuletzt aktualisiert</div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(template?.updatedAt || 0), "MMMM d, yyyy")}</span>
                </div>
              </div>



              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Typ</div>
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Organisations-Template
                  </Badge>
                </div>
              </div>


            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  </>;
  //#endregion
}