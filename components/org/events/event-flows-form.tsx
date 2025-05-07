"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
    ArrowLeftIcon,
    Check,
    FunctionSquare,
    Plus,
    Calendar,
    Users,
    Tag,
    Mail,
    Zap,
    FileText,
    LayoutList,
    PencilLine,
    Bell,
    Image
} from "lucide-react";

// Types
import { Flow } from "@/lib/types";

interface EventFlowsFormProps {
  selectedFlows: Flow[];
  availableFlows: Flow[];
  onFlowsChange: (flows: Flow[]) => void;
  onTabChange?: (tab: string) => void;
  eventId?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function EventFlowsForm({
  selectedFlows,
  availableFlows,
  onFlowsChange,
  onTabChange,
  eventId,
  submitLabel = "Save Changes",
  isSubmitting = false
}: EventFlowsFormProps) {
  // Handle selecting flows
  const toggleFlowSelection = (flow: Flow) => {
    if (selectedFlows.some(f => f.id === flow.id)) {
      onFlowsChange(selectedFlows.filter(f => f.id !== flow.id));
    } else {
      onFlowsChange([...selectedFlows, flow]);
    }
  };

  // Get icon for a trigger type
  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'numOfAttendees':
        return <Users className="h-4 w-4" />;
      case 'status':
        return <Tag className="h-4 w-4" />;
      case 'registration':
        return <Check className="h-4 w-4" />;
      default:
        return <FunctionSquare className="h-4 w-4" />;
    }
  };

  // Get icon for an action type
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'statusChange':
        return <Tag className="h-4 w-4" />;
      case 'fileShare':
        return <FileText className="h-4 w-4" />;
      case 'imageChange':
        return <Image className="h-4 w-4" />;
      case 'titleChange':
        return <LayoutList className="h-4 w-4" />;
      case 'descriptionChange':
        return <PencilLine className="h-4 w-4" />;
      default:
        return <FunctionSquare className="h-4 w-4" />;
    }
  };

  // Get a human-readable description for a trigger
  const getTriggerDescription = (type: string, details: any) => {
    switch (type) {
      case 'date':
        return details?.reference ? 
          `${details.amount} ${details.unit} ${details.direction} event ${details.reference}` : 
          'On a specific date';
      case 'numOfAttendees':
        return details?.operator ? 
          `When attendance ${details.operator} ${details.value}${details.valueType === 'percentage' ? '%' : ''}` :
          'When attendance reaches a certain level';
      case 'status':
        return details?.status ? 
          `When event status changes to ${details.status}` :
          'When event status changes';
      case 'registration':
        return 'When someone registers for the event';
      default:
        return 'When triggered';
    }
  };

  // Get a human-readable description for an action
  const getActionDescription = (type: string, details: any) => {
    switch (type) {
      case 'email':
        return details?.subject ? 
          `Send email: "${details.subject}"` :
          'Send an email notification';
      case 'notification':
        return 'Send an in-app notification';
      case 'statusChange':
        return details?.newStatus ? 
          `Change event status to ${details.newStatus}` :
          'Update the event status';
      case 'fileShare':
        return 'Share files with attendees';
      case 'titleChange':
        return details?.newTitle ? 
          `Update title to "${details.newTitle}"` :
          'Change the event title';
      case 'descriptionChange':
        return 'Update the event description';
      default:
        return 'Perform an action';
    }
  };

  return (
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
            <p className="text-sm text-muted-foreground">
              Select automation flows to attach to your event
              {selectedFlows.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {selectedFlows.length} selected
                </Badge>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={eventId ? `/organization/flows/create?eventId=${eventId}` : "/organization/flows/create"}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Flow
            </Link>
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        {availableFlows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FunctionSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No flows available</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Create new automation flows to associate with this event
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href={eventId ? `/organization/flows/create?eventId=${eventId}` : "/organization/flows/create"}>
                <FunctionSquare className="h-4 w-4 mr-2" />
                Create Flow
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {availableFlows.map((flow) => {
                const isSelected = selectedFlows.some(f => f.id === flow.id);
                return (
                  <div 
                    key={flow.id} 
                    className={cn(
                      "border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow cursor-pointer",
                      isSelected ? "border-primary shadow-sm" : "hover:border-primary/50"
                    )}
                    onClick={() => toggleFlowSelection(flow)}
                  >
                    <div className={cn(
                      "p-4 border-b flex justify-between items-center",
                      isSelected ? "bg-primary/5" : "bg-muted/20"
                    )}>
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
                        {isSelected ? (
                          <div className="ml-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="ml-2 h-6 w-6 border rounded-full flex items-center justify-center text-muted-foreground shrink-0">
                            <Plus className="h-4 w-4" />
                          </div>
                        )}
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
                          
                          <div className="space-y-2">
                            {flow.trigger.map((trigger) => (
                              <div 
                                key={trigger.id} 
                                className="flex items-start gap-3 p-2 border rounded-md bg-muted/20"
                              >
                                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                  {getTriggerIcon(trigger.type)}
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium capitalize">{trigger.type}</h6>
                                  <p className="text-xs text-muted-foreground">
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
                          
                          <div className="space-y-2">
                            {flow.actions.map((action) => (
                              <div 
                                key={action.id} 
                                className="flex items-start gap-3 p-2 border rounded-md bg-muted/20"
                              >
                                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                  {getActionIcon(action.type)}
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium capitalize">{action.type}</h6>
                                  <p className="text-xs text-muted-foreground">
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
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" type="button" onClick={() => onTabChange && onTabChange("files")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Previous: Files
        </Button>
        <Button variant="default" type="button" onClick={() => onTabChange && onTabChange("agenda")}>
          Next: Agenda
          <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
        </Button>
      </CardFooter>
    </Card>
  );
}