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
  Plus
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
            <Link href={eventId ? `/organisation/flows/create?eventId=${eventId}` : "/organisation/flows/create"}>
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
              <Link href={eventId ? `/organisation/flows/create?eventId=${eventId}` : "/organisation/flows/create"}>
                <FunctionSquare className="h-4 w-4 mr-2" />
                Create Flow
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="space-y-3 p-3">
              {availableFlows.map((flow) => {
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
                    <div className="h-10 w-10 mr-3 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FunctionSquare className="h-5 w-5" />
                    </div>
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
                      <div className="h-6 w-6 ml-3 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 ml-3 border rounded-full flex items-center justify-center text-muted-foreground shrink-0">
                        <Plus className="h-4 w-4" />
                      </div>
                    )}
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