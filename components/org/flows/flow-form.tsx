"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Save,
  Zap,
  Calendar,
  Users,
  Tag,
  Check,
  Mail,
  Bell,
  FileText,
  Image,
  LayoutList,
  PencilLine
} from "lucide-react";
import { Flow } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddActionDialog, AddTriggerDialog } from "@/components/org/flows/flow-dialogs";

// Helper to get appropriate icon for trigger types
export const getTriggerIcon = (type: string) => {
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

// Helper to get appropriate icon for action types
export const getActionIcon = (type: string) => {
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
      return <Image className="h-5 w-5" />;
    case 'titleChange':
      return <LayoutList className="h-5 w-5" />;
    case 'descriptionChange':
      return <PencilLine className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
};

interface FlowFormProps {
  flow: Flow;
  isEditing: boolean;
  onSave: (flow: Flow) => void;
  isCreating?: boolean;
}

export function FlowForm({ flow, isEditing, onSave, isCreating = false }: FlowFormProps) {
  const [editedFlow, setEditedFlow] = useState<Flow>({...flow});
  
  // State for dialog control
  const [isAddTriggerOpen, setIsAddTriggerOpen] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  
  // Function to handle adding a new trigger
  const handleAddTrigger = (triggerType: string, details: any) => {
    const newTrigger = {
      id: `trigger-${Date.now()}`,
      type: triggerType as "date" | "numOfAttendees" | "status" | "registration",
      details: details
    };
    
    setEditedFlow(prev => ({
      ...prev,
      trigger: [...prev.trigger, newTrigger]
    }));
  };
  
  // Function to handle adding a new action
  const handleAddAction = (actionType: string, details: any) => {
    const newAction = {
      id: `action-${Date.now()}`,
      type: actionType as "email" | "notification" | "statusChange" | "fileShare" | "imageChange" | "titleChange" | "descriptionChange",
      details: details
    };
    
    setEditedFlow(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };
  
  // Function to handle saving changes
  const handleSave = () => {
    onSave(editedFlow);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Flow Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Flow Information</CardTitle>
            <CardDescription>Basic details about this automation flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Flow Name</Label>
                <Input 
                  id="name" 
                  value={editedFlow.name} 
                  onChange={(e) => setEditedFlow({...editedFlow, name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Enter flow name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={editedFlow.description} 
                  onChange={(e) => setEditedFlow({...editedFlow, description: e.target.value})}
                  className="min-h-[100px]"
                  disabled={!isEditing}
                  placeholder="Describe what this flow does"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Triggers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Triggers</CardTitle>
            <CardDescription>Conditions that initiate this flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {editedFlow.trigger.length > 0 ? (
                <ul className="space-y-4">
                  {editedFlow.trigger.map((trigger) => (
                    <li key={trigger.id} className="flex items-start gap-3 rounded-md border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                        {getTriggerIcon(trigger.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium capitalize">{trigger.type} Trigger</div>
                        {trigger.details && (
                          <div className="text-sm text-muted-foreground">
                            {Object.entries(trigger.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="capitalize">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-[100px] items-center justify-center text-center text-muted-foreground">
                  <div>
                    <p>No triggers added yet</p>
                    <p className="text-sm">Add a trigger to determine when this flow should run</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          {isEditing && (
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" size="sm" onClick={() => setIsAddTriggerOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Trigger
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Actions */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Actions</CardTitle>
            <CardDescription>Actions performed when this flow is triggered</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {editedFlow.actions.length > 0 ? (
                <ul className="space-y-4">
                  {editedFlow.actions.map((action) => (
                    <li key={action.id} className="flex items-start gap-3 rounded-md border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium capitalize">{action.type} Action</div>
                        {action.details && (
                          <div className="text-sm text-muted-foreground">
                            {Object.entries(action.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="capitalize">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-[100px] items-center justify-center text-center text-muted-foreground">
                  <div>
                    <p>No actions added yet</p>
                    <p className="text-sm">Add actions to determine what happens when this flow runs</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          {isEditing && (
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" size="sm" onClick={() => setIsAddActionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Action
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {isCreating ? 'Create Flow' : 'Save Changes'}
          </Button>
        </div>
      )}

      {/* Add Trigger Dialog */}
      <AddTriggerDialog 
        open={isAddTriggerOpen} 
        onOpenChange={setIsAddTriggerOpen} 
        onAdd={handleAddTrigger} 
      />

      {/* Add Action Dialog */}
      <AddActionDialog 
        open={isAddActionOpen} 
        onOpenChange={setIsAddActionOpen} 
        onAdd={handleAddAction} 
      />
    </div>
  );
}