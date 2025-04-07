"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { Flow } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddActionDialog, AddTriggerDialog } from "@/components/org/flows/flow-dialogs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDetailsLabel, formatDetailsValue, getActionIcon, getItemSummary, getItemTitle, getTriggerIcon } from "@/lib/flows/utils";









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
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editItemType, setEditItemType] = useState<'trigger' | 'action' | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean,
    itemId: string | null,
    itemType: 'trigger' | 'action' | null
  }>({ open: false, itemId: null, itemType: null });
  
  // Function to handle adding a new trigger
  const handleAddTrigger = (triggerType: string, details: any) => {
    // Edit existing trigger if in edit mode
    if (editItemId && editItemType === 'trigger') {
      setEditedFlow(prev => ({
        ...prev,
        trigger: prev.trigger.map(item => 
          item.id === editItemId 
            ? { ...item, type: triggerType as any, details: details }
            : item
        )
      }));
      setEditItemId(null);
      setEditItemType(null);
    } else {
      // Add new trigger
      const newTrigger = {
        id: `trigger-${Date.now()}`,
        type: triggerType as "date" | "numOfAttendees" | "status" | "registration",
        details: details
      };
      
      setEditedFlow(prev => ({
        ...prev,
        trigger: [...prev.trigger, newTrigger]
      }));
    }
  };
  
  // Function to handle adding a new action
  const handleAddAction = (actionType: string, details: any) => {
    // Edit existing action if in edit mode
    if (editItemId && editItemType === 'action') {
      setEditedFlow(prev => ({
        ...prev,
        actions: prev.actions.map(item => 
          item.id === editItemId 
            ? { ...item, type: actionType as any, details: details }
            : item
        )
      }));
      setEditItemId(null);
      setEditItemType(null);
    } else {
      // Add new action
      const newAction = {
        id: `action-${Date.now()}`,
        type: actionType as "email" | "notification" | "statusChange" | "fileShare" | "imageChange" | "titleChange" | "descriptionChange",
        details: details
      };
      
      setEditedFlow(prev => ({
        ...prev,
        actions: [...prev.actions, newAction]
      }));
    }
  };
  
  // Function to handle editing an existing item (trigger or action)
  const handleEditItem = (id: string, type: 'trigger' | 'action') => {
    setEditItemId(id);
    setEditItemType(type);
    
    // Find the existing item data
    const existingItem = type === 'trigger' 
      ? editedFlow.trigger.find(item => item.id === id)
      : editedFlow.actions.find(item => item.id === id);
    
    if (existingItem) {
      // For triggers, we need to set up some initial states based on the trigger type
      if (type === 'trigger') {
        if (existingItem.type === 'date' && existingItem.details) {
          // Determine if it's an absolute or relative date trigger
          const isRelative = existingItem.details.reference && existingItem.details.direction;
          setIsAddTriggerOpen(true);
        } else {
          setIsAddTriggerOpen(true);
        }
      } else {
        setIsAddActionOpen(true);
      }
    }
  };
  
  // Function to handle deleting an item
  const handleDeleteItem = (id: string, type: 'trigger' | 'action') => {
    setDeleteDialog({
      open: true,
      itemId: id,
      itemType: type
    });
  };
  
  // Function to confirm deletion
  const confirmDelete = () => {
    const { itemId, itemType } = deleteDialog;
    
    if (itemId && itemType) {
      if (itemType === 'trigger') {
        setEditedFlow(prev => ({
          ...prev,
          trigger: prev.trigger.filter(item => item.id !== itemId)
        }));
      } else {
        setEditedFlow(prev => ({
          ...prev,
          actions: prev.actions.filter(item => item.id !== itemId)
        }));
      }
    }
    
    setDeleteDialog({ open: false, itemId: null, itemType: null });
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
            <CardTitle className="flex items-center justify-between">
              <span>Triggers</span>
              {editedFlow.trigger.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {editedFlow.trigger.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Conditions that initiate this flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] pr-4">
              {editedFlow.trigger.length > 0 ? (
                <div className="space-y-3">
                  {editedFlow.trigger.map((trigger) => (
                    <div 
                      key={trigger.id} 
                      className={cn(
                        "group relative rounded-md border bg-card shadow-sm transition-all hover:shadow",
                        isEditing && "hover:border-primary/50"
                      )}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            "bg-primary/10 text-primary"
                          )}>
                            {getTriggerIcon(trigger.type)}
                          </div>
                          
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{getItemTitle(trigger.type)}</h4>
                              
                              {isEditing && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditItem(trigger.id, 'trigger')}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteItem(trigger.id, 'trigger')}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            
                            {getItemSummary(trigger.type, trigger.details) && (
                              <p className="text-sm text-muted-foreground truncate">
                                {getItemSummary(trigger.type, trigger.details)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {trigger.details && Object.keys(trigger.details).length > 0 && (
                          <div className="mt-3 pt-3 border-t text-xs space-y-1.5 text-muted-foreground">
                            {Object.entries(trigger.details)
                              .filter(([key]) => key !== 'selectedTriggerId')
                              .slice(0, 3) // Show only first 3 properties
                              .map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                  <span className="font-medium min-w-24">{formatDetailsLabel(key)}:</span> 
                                  <span className="truncate">{formatDetailsValue(key, value)}</span>
                                </div>
                            ))}
                            {Object.keys(trigger.details).length > 3 && (
                              <div className="text-xs text-muted-foreground/70 italic">
                                + {Object.keys(trigger.details).length - 3} more properties
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm" 
                onClick={() => {
                  setEditItemId(null);
                  setEditItemType(null);
                  setIsAddTriggerOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Trigger
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Actions */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Actions</span>
              {editedFlow.actions.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {editedFlow.actions.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Actions performed when this flow is triggered</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] pr-4">
              {editedFlow.actions.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {editedFlow.actions.map((action) => (
                    <div 
                      key={action.id} 
                      className={cn(
                        "group relative rounded-md border bg-card shadow-sm transition-all hover:shadow",
                        isEditing && "hover:border-primary/50"
                      )}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            "bg-primary/10 text-primary"
                          )}>
                            {getActionIcon(action.type)}
                          </div>
                          
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{getItemTitle(action.type)}</h4>
                              
                              {isEditing && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditItem(action.id, 'action')}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteItem(action.id, 'action')}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            
                            {getItemSummary(action.type, action.details) && (
                              <p className="text-sm text-muted-foreground truncate">
                                {getItemSummary(action.type, action.details)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {action.details && Object.keys(action.details).length > 0 && (
                          <div className="mt-3 pt-3 border-t text-xs space-y-1.5 text-muted-foreground">
                            {Object.entries(action.details)
                              .filter(([key]) => 
                                key !== 'selectedTriggerId' && 
                                key !== 'body' && 
                                key !== 'message' &&
                                key !== 'newDescription'
                              )
                              .slice(0, 3) // Show only first 3 properties
                              .map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                  <span className="font-medium min-w-24">{formatDetailsLabel(key)}:</span> 
                                  <span className="truncate">{formatDetailsValue(key, value)}</span>
                                </div>
                            ))}
                            {Object.keys(action.details).length > 3 && (
                              <div className="text-xs text-muted-foreground/70 italic">
                                + {Object.keys(action.details).length - 3} more properties
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm" 
                onClick={() => {
                  setEditItemId(null);
                  setEditItemType(null);
                  setIsAddActionOpen(true);
                }}
              >
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
        onOpenChange={(open) => {
          setIsAddTriggerOpen(open);
          if (!open) {
            setEditItemId(null);
            setEditItemType(null);
          }
        }} 
        onAdd={handleAddTrigger} 
        existingFlow={editedFlow}
        itemToEdit={editItemId && editItemType === 'trigger' 
          ? editedFlow.trigger.find(item => item.id === editItemId) 
          : undefined}
      />

      {/* Add Action Dialog - pass the current edited flow to use for variables */}
      <AddActionDialog 
        open={isAddActionOpen} 
        onOpenChange={(open) => {
          setIsAddActionOpen(open);
          if (!open) {
            setEditItemId(null);
            setEditItemType(null);
          }
        }} 
        onAdd={handleAddAction}
        existingFlow={editedFlow}
        itemToEdit={editItemId && editItemType === 'action' 
          ? editedFlow.actions.find(item => item.id === editItemId) 
          : undefined}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {deleteDialog.itemType}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}