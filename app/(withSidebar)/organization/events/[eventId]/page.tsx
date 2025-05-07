"use client";;
import { useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  CalendarIcon,
  Edit,
  FileText,
  FunctionSquare,
  ListTodo,
  Mail,
  MapPin,
  MoreHorizontal,
  Share,
  Tag,
  Trash2,
  Users,
  MailsIcon,
  UsersIcon,
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
import EventFilesTab from "./event-files-tab";
import EventFlowsTab from "./event-flows-tab";
import EventAgendaTab from "./event-agenda-tab";
import EventAttendeesTab from "./event-attendees-tab";
import EventEmailsTab from "./event-emails-tab";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { useEventDetails } from "@/lib/backend/hooks/events";


export default function EventDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const params = useParams();
  const path = usePathname();
  const eventId = params.eventId;

  let { data: event } = useEventDetails(eventId as string);

  // In a real app, you would fetch the event details by ID
  // const eventDetails = mockedEventDetails;
  // const event = eventDetails.metadata;

  const [activeTab, setActiveTabState] = useState(searchParams.get('tab') || "overview");
  if (!event) return null; // Ensure event is available before proceeding

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    let params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(path + '?' + params.toString());
  };

  // Handle event deletion
  const handleDeleteEvent = () => {
    // In a real app, you would call an API to delete the event
    toast.success(`Event "${event.metadata.title}" deleted successfully`);
    router.push("/organization/events");
  };

  // Calculate attendance percentage
  const attendancePercentage = Math.round((event.metadata.attendees / event.metadata.capacity) * 100);

  // Function to get appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
      case 'done':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const quickActions: QuickAction[] = [
    {
      children: (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/organization/events/${eventId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Link>
        </Button>
      ),
    },
    {
      children: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.success("Event sharing link copied to clipboard")}>
              <Share className="mr-2 h-4 w-4" />
              Share Event
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/organization/events/${eventId}/invite`}>
                <Mail className="mr-2 h-4 w-4" />
                Invite Attendees
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteEvent} className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }



  ];


  return (
    <>
      <SiteHeader actions={quickActions} />

      <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
        {/* Header with back button */}


        {/* Event Hero Section */}
        <div className="relative rounded-lg overflow-hidden h-40 md:h-60">

          <div className="absolute flex flex-col p-4 md:p-6 gap-4 md:flex-row md:items-center md:justify-between z-40 bg-gradient-to-b from-black/70 via-black/40 to-transparent w-full ">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 mr-1">
                  <Link href="/organization/events">
                    <ArrowLeftIcon className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold truncate">{event.metadata.title}</h1>
                {getStatusBadge(event.metadata.status.toString())}
              </div>
              <p className="text-muted-foreground ml-10">
                {event.metadata.organization} • {format(new Date(event.metadata.start), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>

          <img
            src={event.metadata.image || "https://via.placeholder.com/1200x400"}
            alt={event.metadata.title}
            className="object-cover w-full h-full z-10"
          />


          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-30">
            <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                  <Tag className="mr-1 h-3 w-3" />
                  {event.metadata.category}
                </Badge>
                <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                  <Users className="mr-1 h-3 w-3" />
                  {event.metadata.attendees} / {event.metadata.capacity} attendees
                </Badge>
                <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                  <MapPin className="mr-1 h-3 w-3" />
                  {event.metadata.location}
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
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <FileText className="h-4 w-4" />
              <span>Files</span>
            </TabsTrigger>
            <TabsTrigger
              value="flows"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <FunctionSquare className="h-4 w-4" />
              <span>Flows</span>
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
              <span>Mails</span>
            </TabsTrigger>
            <TabsTrigger
              value="attendees"
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <UsersIcon className="h-4 w-4" />
              <span>Teilnehmer</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <EventOverviewTab eventDetails={event} />
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <EventFilesTab eventDetails={event} />
          </TabsContent>

          {/* Flows Tab - IMPROVED VISUALIZATION */}
          <TabsContent value="flows" className="space-y-6">
            <EventFlowsTab eventDetails={event} />
          </TabsContent>

          {/* Agenda Tab - IMPROVED TIMELINE */}
          <TabsContent value="agenda" className="space-y-6">
            <EventAgendaTab eventDetails={event} />
          </TabsContent>

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="space-y-6">
            <EventAttendeesTab eventDetails={event} />
          </TabsContent>

          {/* emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            <EventEmailsTab eventDetails={event} />
          </TabsContent>
        </Tabs>
      </div>
    </>

  );
}