"use client";
import { useState } from "react";
import { notFound, useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  CalendarIcon,
  Edit,
  FunctionSquare,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Tag,
  Trash2,
  Users,
  MailsIcon,
  UsersIcon,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EventOverviewTab from "./event-overview-tab";
import EventFlowsTab from "./event-flows-tab";
import EventAgendaTab from "./event-agenda-tab";
import EventEmailsTab from "./event-emails-tab";
import EventAttendeesTab from "./event-attendees-tab";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/loading-spinner";
import { useEventDetails } from "@/lib/backend/hooks/events";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SiteHeader } from "@/components/site-header";

// Hauptkomponente für die Event-Detailseite
export default function EventDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const params = useParams();
  const path = usePathname();
  const eventId = params.eventId as string;

  const { data: session } = useSession();
  const { data: event, isLoading } = useEventDetails(session?.user?.organization.id || "", eventId, session?.user?.jwt || "");

  const [activeTab, setActiveTabState] = useState(searchParams.get('tab') || "overview");

  // Ladeanzeige, solange die Eventdaten geladen werden
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Fehleranzeige, falls das Event nicht gefunden wurde
  if (!event) {
    return notFound()
  }

  console.log(event);

  // Tab-Wechsel und Aktualisierung der URL-Parameter
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    let params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(path + '?' + params.toString());
  };

  // Event-Löschfunktion (hier nur Dummy, API-Aufruf fehlt)
  const handleDeleteEvent = () => {
    toast.success(`Event "${event?.metadata?.title}" erfolgreich gelöscht`);
    router.push("/organization/events");
  };

  // Gibt das passende Status-Badge zurück
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Bevorstehend</Badge>;
      case 'done':
        return <Badge className="bg-green-500 hover:bg-green-600">Abgeschlossen</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Abgesagt</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <SiteHeader actions={[
        {
          label: "Zurück",
          icon: <ArrowLeft className=" h-4 w-4" />,
          onClick: () => router.back(),
          variant: "outline"
        },
        {
          children: (
            <Button variant="default" asChild >
              <Link href={`/organization/events/${eventId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Event bearbeiten
              </Link>
            </Button>
          )
        },
        {
          children: (<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => toast.success("Event-Link zum Teilen wurde kopiert")}>
                <Share className="mr-2 h-4 w-4" />
                Event teilen
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem asChild>
                <Link href={`/organization/events/${eventId}/invite`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Teilnehmer einladen
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteEvent} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Event löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>)
        }
      ]} >
        <BreadcrumbItem>
          <BreadcrumbPage>
            {event.metadata.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </SiteHeader>
      <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
        {/* Kopfbereich mit Zurück-Button */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 mr-1">
                <Link href="/organization/events">
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold truncate">{event?.metadata?.title}</h1>
              {getStatusBadge(String(event?.metadata?.status))}
            </div>
            <p className="text-muted-foreground ml-10">
              {event?.metadata?.organization} • {format(new Date(event?.metadata?.start), "dd. MMMM yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Platz für weitere Aktionen */}
          </div>
        </div>

        {/* Event Hero-Bereich mit Bild und Badges */}
        <div className="relative rounded-lg overflow-hidden h-40 md:h-60">
          <img
            src={event?.metadata?.image || "https://via.placeholder.com/1200x400"}
            alt={event?.metadata?.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                  <Tag className="mr-1 h-3 w-3" />
                  {event?.metadata?.category}
                </Badge>
                <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                  <Users className="mr-1 h-3 w-3" />
                  {event?.metadata?.attendeeCount} / {event?.metadata?.capacity} Teilnehmer
                </Badge>
                <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                  <MapPin className="mr-1 h-3 w-3" />
                  {event?.metadata?.location}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full mx-auto bg-muted">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Übersicht</span>
            </TabsTrigger>

            <TabsTrigger
              value="flows"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <FunctionSquare className="h-4 w-4" />
              <span>Flow</span>
            </TabsTrigger>
            <TabsTrigger
              value="agenda"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <ListTodo className="h-4 w-4" />
              <span>Agenda</span>
            </TabsTrigger>
            <TabsTrigger
              value="emails"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <MailsIcon className="h-4 w-4" />
              <span>E-Mails</span>
            </TabsTrigger>
            <TabsTrigger
              value="attendees"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <UsersIcon className="h-4 w-4" />
              <span>Teilnehmer</span>
            </TabsTrigger>
          </TabsList>

          {/* Übersicht-Tab */}
          <TabsContent value="overview" className="space-y-6">
            <EventOverviewTab eventDetails={event} />
          </TabsContent>

          {/* Abläufe-Tab */}
          <TabsContent value="flows" className="space-y-6">
            <EventFlowsTab eventDetails={event} />
          </TabsContent>

          {/* Agenda-Tab */}
          <TabsContent value="agenda" className="space-y-6">
            <EventAgendaTab eventDetails={event} />
          </TabsContent>

          {/* Teilnehmer-Tab */}
          <TabsContent value="attendees" className="space-y-6">
            <EventAttendeesTab eventDetails={event} />
          </TabsContent>

          {/* E-Mails-Tab */}
          <TabsContent value="emails" className="space-y-6">
            <EventEmailsTab eventDetails={event} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}