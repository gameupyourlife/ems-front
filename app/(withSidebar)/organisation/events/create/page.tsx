"use client";;
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeftIcon,
    Calendar,
    CalendarIcon,
    Clock,
    FileText,
    FunctionSquare,
    Image as ImageIcon,
    ListTodo,
    MapPin,
    Plus,
    Save,
    Trash2,
    Upload,
    Users
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { EventInfo, Flow, AgendaStep, EmsFile } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import FileUploadDialog from "@/components/org/file-upload-dialog";
import { mockFiles, mockFlows } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectionCard } from "@/components/selection-card";

// Define the form data structure
interface EventFormData {
  title: string;
  description: string;
  location: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  capacity: number;
  image: string;
  status: string;
}

// Status options for events
const statusOptions = [
  { id: "draft", name: "Draft", description: "Save as draft, not visible to attendees", icon: <FileText className="h-5 w-5" /> },
  { id: "upcoming", name: "Upcoming", description: "Published and open for registration", icon: <Calendar className="h-5 w-5" /> },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<EmsFile[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>([]);
  const [agenda, setAgenda] = useState<Partial<AgendaStep>[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("upcoming");
  
  // Initialize the form with default values
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid, isDirty } } = useForm<EventFormData>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "12:00",
      endDate: format(new Date(), "yyyy-MM-dd"),
      endTime: "13:00",
      capacity: 100,
      image: "",
      status: "upcoming"
    }
  });

  // Make sure form's status state is synced with our selected status
  const onStatusChange = (status: string) => {
    setSelectedStatus(status);
    setValue("status", status, { shouldValidate: true });
  };

  // Available event categories
  const eventCategories = [
    "Conference",
    "Workshop",
    "Seminar",
    "Webinar",
    "Meetup",
    "Hackathon",
    "Summit",
    "Exhibition",
    "Networking",
    "Tech",
    "Bootcamp",
    "Other"
  ];

  // Handle file upload dialog open/close
  const openUploadDialog = () => setIsUploadDialogOpen(true);
  const closeUploadDialog = () => setIsUploadDialogOpen(false);
  
  // Handle file upload completion
  const handleUploadComplete = (uploadedFiles: EmsFile[]) => {
    setSelectedFiles(prev => [...uploadedFiles, ...prev]);
    closeUploadDialog();
  };

  // Handle selecting existing files
  const toggleFileSelection = (file: EmsFile) => {
    if (selectedFiles.some(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };
  
  // Handle selecting flows
  const toggleFlowSelection = (flow: Flow) => {
    if (selectedFlows.some(f => f.id === flow.id)) {
      setSelectedFlows(selectedFlows.filter(f => f.id !== flow.id));
    } else {
      setSelectedFlows([...selectedFlows, flow]);
    }
  };
  
  // Handle agenda step creation
  const addAgendaStep = () => {
    setAgenda([...agenda, {
      id: `step-${Date.now()}`,
      title: "",
      description: "",
      startTime: "",
      endTime: ""
    }]);
  };
  
  // Handle agenda step deletion
  const removeAgendaStep = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };
  
  // Handle agenda step update
  const updateAgendaStep = (index: number, field: keyof AgendaStep, value: string) => {
    const updatedAgenda = [...agenda];
    updatedAgenda[index] = {
      ...updatedAgenda[index],
      [field]: value
    };
    setAgenda(updatedAgenda);
  };

  // Handle form submission
  const onSubmit = (data: EventFormData) => {
    // Combine date and time fields
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
    
    // Prepare the event data
    const newEvent: Partial<EventInfo> = {
      title: data.title,
      description: data.description,
      location: data.location,
      category: data.category,
      capacity: data.capacity,
      image: data.image,
      start: startDateTime,
      end: endDateTime,
      date: startDateTime, // For backward compatibility
      status: data.status,
      attendees: 0
    };
    
    // In a real application, you would send this data to an API
    console.log("Creating new event:", newEvent);
    console.log("Selected files:", selectedFiles);
    console.log("Selected flows:", selectedFlows);
    console.log("Agenda:", agenda);
    
    // Show success message
    toast.success("Event created successfully");
    
    // Redirect to the events page
    router.push("/organisation/events");
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
            <h1 className="text-2xl font-bold">Create New Event</h1>
          </div>
          <p className="text-muted-foreground ml-10">Fill in the details to create a new event</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push("/organisation/events")}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || !isDirty}
          >
            <Save className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto p-1 bg-muted">
          <TabsTrigger 
            value="basic" 
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Basic Info</span>
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

        <form className="space-y-6">
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  Basic information about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      placeholder="Enter event title"
                      {...register("title", { required: "Title is required" })}
                      className="focus-within:ring-1 focus-within:ring-primary"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select
                      defaultValue=""
                      onValueChange={(value) => register("category").onChange({ target: { value } })}
                    >
                      <SelectTrigger className="focus-within:ring-1 focus-within:ring-primary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <Input
                      id="location"
                      placeholder="Enter event location"
                      className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                      {...register("location", { required: "Location is required" })}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Enter event description"
                    className="min-h-[120px] focus-within:ring-1 focus-within:ring-primary"
                    {...register("description", { required: "Description is required" })}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Cover Image URL</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                      {...register("image")}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your event cover image. For best results, use an image with a 16:9 aspect ratio.
                  </p>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Date & Time</h3>
                      <p className="text-sm text-muted-foreground">When will your event take place?</p>
                    </div>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <Input
                          id="startDate"
                          type="date"
                          className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                          {...register("startDate", { required: "Start date is required" })}
                        />
                      </div>
                      {errors.startDate && (
                        <p className="text-sm text-red-500">{errors.startDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          <Clock className="h-4 w-4" />
                        </span>
                        <Input
                          id="startTime"
                          type="time"
                          className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                          {...register("startTime", { required: "Start time is required" })}
                        />
                      </div>
                      {errors.startTime && (
                        <p className="text-sm text-red-500">{errors.startTime.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <Input
                          id="endDate"
                          type="date"
                          className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                          {...register("endDate", { required: "End date is required" })}
                        />
                      </div>
                      {errors.endDate && (
                        <p className="text-sm text-red-500">{errors.endDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          <Clock className="h-4 w-4" />
                        </span>
                        <Input
                          id="endTime"
                          type="time"
                          className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                          {...register("endTime", { required: "End time is required" })}
                        />
                      </div>
                      {errors.endTime && (
                        <p className="text-sm text-red-500">{errors.endTime.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Capacity & Status</h3>
                      <p className="text-sm text-muted-foreground">Set attendance capacity and event status</p>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Maximum Capacity <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          <Users className="h-4 w-4" />
                        </span>
                        <Input
                          id="capacity"
                          type="number"
                          min="1"
                          className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                          {...register("capacity", { 
                            required: "Capacity is required",
                            min: { value: 1, message: "Capacity must be at least 1" }
                          })}
                        />
                      </div>
                      {errors.capacity && (
                        <p className="text-sm text-red-500">{errors.capacity.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Event Status <span className="text-red-500">*</span></Label>
                      <div className="grid grid-cols-2 gap-3">
                        {statusOptions.map((status) => (
                          <SelectionCard
                            key={status.id}
                            title={status.name}
                            description={status.description}
                            icon={status.icon}
                            selected={selectedStatus === status.id}
                            onClick={() => onStatusChange(status.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <div />
                <Button variant="default" type="button" onClick={() => setActiveTab("files")}>
                  Next: Files
                  <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </CardFooter>
            </Card>
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
                  Add files that will be associated with this event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Files for this event</h3>
                    <p className="text-sm text-muted-foreground">Upload or select files to attach to your event</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={openUploadDialog}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Files
                  </Button>
                </div>
                
                <Separator className="my-2" />
                
                {selectedFiles.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No files selected yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Upload new files or select from existing files below to associate them with this event
                    </p>
                    <Button variant="outline" className="mt-4" onClick={openUploadDialog}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center">
                      Available Files
                      {selectedFiles.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedFiles.length} selected
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">Click on a file to select/deselect it</p>
                  </div>
                  <ScrollArea className="h-[400px] rounded-md border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                      {mockFiles.map((file) => {
                        const isSelected = selectedFiles.some(f => f.id === file.id);
                        return (
                          <div 
                            key={file.id} 
                            className={cn(
                              "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                              isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/50 hover:border-primary/50"
                            )}
                            onClick={() => toggleFileSelection(file)}
                          >
                            <div className="flex-1">
                              <p className="font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.type} • Created {format(new Date(file.createdAt), "MMM dd, yyyy")}</p>
                            </div>
                            {isSelected ? (
                              <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                <Check className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 border rounded-full flex items-center justify-center text-muted-foreground">
                                <Plus className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" type="button" onClick={() => setActiveTab("basic")}>
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Previous: Basic Info
                </Button>
                <Button variant="default" type="button" onClick={() => setActiveTab("flows")}>
                  Next: Flows
                  <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Flows Tab */}
          <TabsContent value="flows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FunctionSquare className="h-5 w-5 text-primary" />
                  Event Flows
                </CardTitle>
                <CardDescription>
                  Add automation flows that will be associated with this event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Flows for this event</h3>
                    <p className="text-sm text-muted-foreground">Select automation flows to attach to your event</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/organisation/flows/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Flow
                    </Link>
                  </Button>
                </div>
                
                <Separator className="my-2" />
                
                {selectedFlows.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <FunctionSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No flows selected yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Select from the available flows below to associate them with this event
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center">
                      Available Flows
                      {selectedFlows.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedFlows.length} selected
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">Click on a flow to select/deselect it</p>
                  </div>
                  <ScrollArea className="h-[400px] rounded-md border">
                    <div className="space-y-3 p-3">
                      {mockFlows.map((flow) => {
                        const isSelected = selectedFlows.some(f => f.id === flow.id);
                        return (
                          <div 
                            key={flow.id} 
                            className={cn(
                              "flex items-start p-4 border rounded-md cursor-pointer transition-colors",
                              isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/50 hover:border-primary/50"
                            )}
                            onClick={() => toggleFlowSelection(flow)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h5 className="font-medium">{flow.name}</h5>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {flow.trigger.length} {flow.trigger.length === 1 ? 'trigger' : 'triggers'}
                                </Badge>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {flow.actions.length} {flow.actions.length === 1 ? 'action' : 'actions'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{flow.description}</p>
                            </div>
                            {isSelected ? (
                              <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                <Check className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 border rounded-full flex items-center justify-center text-muted-foreground">
                                <Plus className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" type="button" onClick={() => setActiveTab("files")}>
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Previous: Files
                </Button>
                <Button variant="default" type="button" onClick={() => setActiveTab("agenda")}>
                  Next: Agenda
                  <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Agenda Tab */}
          <TabsContent value="agenda" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Event Agenda
                </CardTitle>
                <CardDescription>
                  Add agenda steps to your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Agenda Steps</h3>
                    <p className="text-sm text-muted-foreground">Create a detailed schedule for your event</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addAgendaStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                
                <Separator className="my-2" />
                
                {agenda.length > 0 ? (
                  <div className="space-y-6">
                    {agenda.map((step, index) => (
                      <div 
                        key={step.id} 
                        className="space-y-4 p-5 border rounded-md relative bg-card shadow-sm hover:border-primary/50 transition-colors"
                      >
                        <div className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-medium text-muted-foreground">
                          Step {index + 1}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-red-500"
                          onClick={() => removeAgendaStep(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor={`step-${index}-title`}>Title <span className="text-red-500">*</span></Label>
                            <Input
                              id={`step-${index}-title`}
                              value={step.title || ""}
                              onChange={(e) => updateAgendaStep(index, "title", e.target.value)}
                              placeholder="e.g., Welcome & Introduction"
                              className="focus-within:ring-1 focus-within:ring-primary"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`step-${index}-start`}>Start Time <span className="text-red-500">*</span></Label>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                </span>
                                <Input
                                  id={`step-${index}-start`}
                                  type="time"
                                  value={step.startTime || ""}
                                  onChange={(e) => updateAgendaStep(index, "startTime", e.target.value)}
                                  className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`step-${index}-end`}>End Time <span className="text-red-500">*</span></Label>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                </span>
                                <Input
                                  id={`step-${index}-end`}
                                  type="time"
                                  value={step.endTime || ""}
                                  onChange={(e) => updateAgendaStep(index, "endTime", e.target.value)}
                                  className="rounded-l-none focus-within:ring-1 focus-within:ring-primary"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`step-${index}-description`}>Description</Label>
                          <Textarea
                            id={`step-${index}-description`}
                            value={step.description || ""}
                            onChange={(e) => updateAgendaStep(index, "description", e.target.value)}
                            placeholder="Describe what will happen during this agenda step..."
                            className="min-h-[100px] focus-within:ring-1 focus-within:ring-primary"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        className="w-full max-w-md"
                        onClick={addAgendaStep}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Step
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ListTodo className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No agenda steps added yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Add steps to create a schedule for your event
                    </p>
                    <Button variant="outline" className="mt-4" onClick={addAgendaStep}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Step
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" type="button" onClick={() => setActiveTab("flows")}>
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Previous: Flows
                </Button>
                <Button 
                  variant="default" 
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isValid || !isDirty}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>

      {/* File Upload Dialog */}
      <FileUploadDialog 
        isOpen={isUploadDialogOpen}
        onClose={closeUploadDialog}
        orgId="1" // In a real app, you would use the actual organization ID
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}