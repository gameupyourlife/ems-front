"use client";;
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeftIcon,
    CalendarIcon,
    Clock,
    Download,
    Edit,
    ExternalLink,
    FileText,
    FunctionSquare,
    ListTodo,
    Mail,
    MapPin,
    MoreHorizontal,
    Pencil,
    Share,
    Tag,
    Trash2,
    Upload,
    Users,
    Bell,
    Check,
    Calendar,
    Image as ImageIcon,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { mockedEventDetails } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Get appropriate icon for trigger types
const getTriggerIcon = (type: string) => {
  switch (type) {
    case 'date':
      return <Calendar className="h-5 w-5" />;
    case 'numOfAttendees':
      return <Users className="h-5 w-5" />;
    case 'status':
      return <Tag className="h-5 w-5" />;
    case 'registration':
      return <Check className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
};

// Get appropriate icon for action types
const getActionIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-5 w-5" />;
    case 'notification':
      return <Bell className="h-5 w-5" />;
    case 'statusChange':
      return <Tag className="h-5 w-5" />;
    case 'fileShare':
      return <FileText className="h-5 w-5" />;
    case 'imageChange':
      return <ImageIcon className="h-5 w-5" />;
    case 'titleChange':
      return <Pencil className="h-5 w-5" />;
    case 'descriptionChange':
      return <FileText className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
};

// Get human-readable text for trigger details
const getTriggerDescription = (type: string, details: any) => {
  switch (type) {
    case 'date':
      if (details?.operator && details?.value) {
        return `${details.operator === 'on' ? 'Exactly on' : details.operator === 'before' ? 'Before' : 'After'} ${details.value}`;
      } else if (details?.reference && details?.direction && details?.amount && details?.unit) {
        return `${details.amount} ${details.unit} ${details.direction} ${details.reference === 'start' ? 'event start' : 'event end'}`;
      }
      return 'Date trigger';
      
    case 'numOfAttendees':
      if (details?.operator && details?.value !== undefined) {
        const opText = details.operator === 'equals' ? 'equals' : details.operator === 'lessThan' ? 'less than' : 'greater than';
        return `When attendance ${opText} ${details.value}${details.valueType === 'percentage' ? '%' : ''}`;
      }
      return 'Attendance trigger';
      
    case 'status':
      return details?.status ? `When status changes to ${details.status}` : 'Status change trigger';
      
    case 'registration':
      return 'When a new user registers';
      
    default:
      return 'Unknown trigger';
  }
};

// Get human-readable text for action details
const getActionDescription = (type: string, details: any) => {
  switch (type) {
    case 'email':
      return `Send email with subject "${details?.subject || 'No subject'}"`;
      
    case 'notification':
      return `Send notification: "${details?.message || 'No message'}"`;
      
    case 'statusChange':
      return `Change event status to ${details?.newStatus || 'unknown'}`;
      
    case 'fileShare':
      return `Share file ${details?.fileId ? `(ID: ${details.fileId})` : ''} with ${details?.status || 'unknown'} access`;
      
    case 'imageChange':
      return 'Update event image';
      
    case 'titleChange':
      return `Change event title to "${details?.newTitle || 'unknown'}"`;
      
    case 'descriptionChange':
      return 'Update event description';
      
    default:
      return 'Unknown action';
  }
};

export default function EventDetailsPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const eventId = params.eventId;
  
  // In a real app, you would fetch the event details by ID
  const eventDetails = mockedEventDetails;
  const event = eventDetails.metadata;
  
  const [activeTab, setActiveTab] = useState("overview");
  
  // Handle event deletion
  const handleDeleteEvent = () => {
    // In a real app, you would call an API to delete the event
    toast.success(`Event "${event.title}" deleted successfully`);
    router.push("/organisation/events");
  };

  // Calculate attendance percentage
  const attendancePercentage = Math.round((event.attendees / event.capacity) * 100);

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

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Header with back button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 mr-1">
              <Link href="/organisation/events">
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold truncate">{event.title}</h1>
            {getStatusBadge(event.status)}
          </div>
          <p className="text-muted-foreground ml-10">
            {event.organization} • {format(new Date(event.date), "MMMM dd, yyyy")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organisation/events/${eventId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Event
            </Link>
          </Button>
          
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
                <Link href={`/organisation/events/${eventId}/invite`}>
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
        </div>
      </div>

      {/* Event Hero Section - IMPROVED HEIGHT */}
      <div className="relative rounded-lg overflow-hidden h-40 md:h-60">
        <img 
          src={event.image || "https://via.placeholder.com/1200x400"} 
          alt={event.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                <Tag className="mr-1 h-3 w-3" />
                {event.category}
              </Badge>
              <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                <Users className="mr-1 h-3 w-3" />
                {event.attendees} / {event.capacity} attendees
              </Badge>
              <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-sm text-white">
                <MapPin className="mr-1 h-3 w-3" />
                {event.location}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto p-1 bg-muted">
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
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Date & Time</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <div>
                        <div>{format(new Date(event.start), "MMMM dd, yyyy")}</div>
                        <div>{format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Location</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Category</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="mr-2 h-4 w-4" />
                      <span>{event.category}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Attendance</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{event.attendees} / {event.capacity} attendees</span>
                    </div>
                    
                    <div className="pt-1">
                      <Progress 
                        value={attendancePercentage} 
                        className={cn("h-1.5 w-full", {
                          "bg-green-100": attendancePercentage < 70,
                          "bg-amber-100": attendancePercentage >= 70 && attendancePercentage < 90,
                          "bg-red-100": attendancePercentage >= 90
                        })}
                        indicatorClassName={cn({
                          "bg-green-500": attendancePercentage < 70,
                          "bg-amber-500": attendancePercentage >= 70 && attendancePercentage < 90,
                          "bg-red-500": attendancePercentage >= 90
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/40 border-t px-6 py-4 text-xs text-muted-foreground">
                <div className="flex justify-between w-full">
                  <div>Created: {format(new Date(event.createdAt), "MMM dd, yyyy")} by {event.createdBy}</div>
                  <div>Last updated: {format(new Date(event.updatedAt), "MMM dd, yyyy")} by {event.updatedBy}</div>
                </div>
              </CardFooter>
            </Card>
            
            {/* Attendees Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Attendees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{event.attendees}</div>
                    <p className="text-sm text-muted-foreground">of {event.capacity} capacity</p>
                  </div>
                  <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center bg-background relative">
                    <div className="text-lg font-bold">{attendancePercentage}%</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Recent Attendees</h3>
                  
                  <div className="space-y-3">
                    {eventDetails.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={attendee.profilePicture} alt={attendee.name} />
                          <AvatarFallback>{attendee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{attendee.name}</div>
                          <div className="text-xs text-muted-foreground">{attendee.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/organisation/events/${eventId}/attendees`}>
                      <Users className="mr-2 h-4 w-4" />
                      View All Attendees
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Event Files
              </CardTitle>
              <CardDescription>
                Files associated with this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Files ({eventDetails.files.length})</h3>
                  <p className="text-sm text-muted-foreground">View or download files for this event</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New File
                </Button>
              </div>
              
              <Separator className="my-2" />
              
              {eventDetails.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventDetails.files.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center p-3 border rounded-md hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="h-10 w-10 mr-3 flex items-center justify-center rounded bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.type} • {format(new Date(file.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No files added yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    Upload files to share with attendees or event organizers
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flows Tab - IMPROVED VISUALIZATION */}
        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FunctionSquare className="h-5 w-5 text-primary" />
                Automation Flows
              </CardTitle>
              <CardDescription>
                Automation flows for this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Flows ({eventDetails.flows.length})</h3>
                  <p className="text-sm text-muted-foreground">Automations that run based on event triggers</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/organisation/flows/create?eventId=${eventId}`}>
                    <FunctionSquare className="h-4 w-4 mr-2" />
                    Create New Flow
                  </Link>
                </Button>
              </div>
              
              <Separator className="my-2" />
              
              {eventDetails.flows.length > 0 ? (
                <div className="space-y-6">
                  {eventDetails.flows.map((flow) => (
                    <div 
                      key={flow.id} 
                      className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 bg-primary/5 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FunctionSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{flow.name}</h4>
                            <p className="text-xs text-muted-foreground">{flow.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-background">
                            {flow.trigger.length} {flow.trigger.length === 1 ? 'Trigger' : 'Triggers'}
                          </Badge>
                          <Badge variant="outline" className="bg-background">
                            {flow.actions.length} {flow.actions.length === 1 ? 'Action' : 'Actions'}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild className="ml-2">
                            <Link href={`/organisation/flows/${flow.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Triggers column */}
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3 pb-1 border-b">
                              <Zap className="h-4 w-4" />
                              WHEN THESE TRIGGERS OCCUR
                            </h5>
                            
                            <div className="space-y-3">
                              {flow.trigger.map((trigger) => (
                                <div 
                                  key={trigger.id} 
                                  className="flex items-start gap-3 p-3 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                                >
                                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    {getTriggerIcon(trigger.type)}
                                  </div>
                                  <div>
                                    <h6 className="font-medium capitalize">{trigger.type} Trigger</h6>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {getTriggerDescription(trigger.type, trigger.details)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Actions column */}
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3 pb-1 border-b">
                              <FunctionSquare className="h-4 w-4" />
                              THEN PERFORM THESE ACTIONS
                            </h5>
                            
                            <div className="space-y-3">
                              {flow.actions.map((action) => (
                                <div 
                                  key={action.id} 
                                  className="flex items-start gap-3 p-3 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                                >
                                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                    {getActionIcon(action.type)}
                                  </div>
                                  <div>
                                    <h6 className="font-medium capitalize">{action.type} Action</h6>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {getActionDescription(action.type, action.details)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FunctionSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No flows added yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    Create automation flows to send emails, change event status, and more
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href={`/organisation/flows/create?eventId=${eventId}`}>
                      <FunctionSquare className="h-4 w-4 mr-2" />
                      Create First Flow
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda Tab - IMPROVED TIMELINE */}
        <TabsContent value="agenda" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                Event Agenda
              </CardTitle>
              <CardDescription>
                Schedule for this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Agenda Steps ({eventDetails.agenda.length})</h3>
                  <p className="text-sm text-muted-foreground">Timeline of activities for the event</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/organisation/events/${eventId}/edit?tab=agenda`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Agenda
                  </Link>
                </Button>
              </div>
              
              <Separator className="my-2" />
              
              {eventDetails.agenda.length > 0 ? (
                <div className="space-y-6">
                  {/* Time header */}
                  <div className="flex items-center justify-between px-4">
                    <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  </div>
                  
                  {/* Agenda items */}
                  {eventDetails.agenda.map((step, index) => {
                    const duration = Math.round(
                      (new Date(step.endTime).getTime() - new Date(step.startTime).getTime()) / (1000 * 60)
                    );
                    return (
                      <div 
                        key={step.id}
                        className="relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow hover:border-primary/50 group"
                      >
                        <div className="absolute top-0 left-0 h-full w-1 bg-primary"></div>
                        
                        <div className="flex items-stretch">
                          {/* Time column */}
                          <div className="w-28 shrink-0 bg-muted/30 flex flex-col items-center justify-center px-3 py-4 border-r">
                            <div className="text-xl font-semibold">
                              {format(new Date(step.startTime), "h:mm")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(step.startTime), "a")}
                            </div>
                          </div>
                          
                          {/* Content column */}
                          <div className="flex-1 p-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                  {index + 1}
                                </div>
                                <h4 className="text-lg font-medium">{step.title}</h4>
                              </div>
                              
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 md:mt-0">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{duration} min</span>
                              </div>
                            </div>
                            
                            {step.description && (
                              <div className="mt-2 text-sm text-muted-foreground pl-9">
                                {step.description}
                              </div>
                            )}
                            
                            <div className="mt-2 pl-9 flex justify-between text-xs text-muted-foreground">
                              <span>From {format(new Date(step.startTime), "h:mm a")}</span>
                              <span>To {format(new Date(step.endTime), "h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ListTodo className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No agenda created yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    Add agenda steps to create a schedule for your event
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href={`/organisation/events/${eventId}/edit?tab=agenda`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Create Agenda
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}