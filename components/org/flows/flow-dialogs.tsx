"use client";;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Component for adding a new trigger (condition)
export function AddTriggerDialog({ 
    open, 
    onOpenChange, 
    onAdd 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onAdd: (triggerType: string, details: any) => void 
}) {
    const [triggerType, setTriggerType] = useState<string>("");
    const [details, setDetails] = useState<any>({});

    const handleAddTrigger = () => {
        onAdd(triggerType, details);
        onOpenChange(false);
        // Reset form
        setTriggerType("");
        setDetails({});
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Trigger</DialogTitle>
                    <DialogDescription>
                        Create a new trigger that will initiate this flow.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="triggerType">Trigger Type</Label>
                        <Select
                            value={triggerType}
                            onValueChange={(value) => {
                                setTriggerType(value);
                                // Reset details when changing type
                                setDetails({});
                            }}
                        >
                            <SelectTrigger id="triggerType">
                                <SelectValue placeholder="Select a trigger type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="numOfAttendees">Number of Attendees</SelectItem>
                                <SelectItem value="status">Event Status</SelectItem>
                                <SelectItem value="registration">Registration</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {triggerType === "date" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateOperator">Operator</Label>
                                <Select
                                    value={details.operator || ""}
                                    onValueChange={(value) => setDetails({ ...details, operator: value })}
                                >
                                    <SelectTrigger id="dateOperator">
                                        <SelectValue placeholder="Select an operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="before">Before</SelectItem>
                                        <SelectItem value="after">After</SelectItem>
                                        <SelectItem value="on">On</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateValue">Date</Label>
                                <Input
                                    id="dateValue"
                                    type="datetime-local"
                                    value={details.value || ""}
                                    onChange={(e) => setDetails({ ...details, value: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {triggerType === "numOfAttendees" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="attendeesOperator">Operator</Label>
                                <Select
                                    value={details.operator || ""}
                                    onValueChange={(value) => setDetails({ ...details, operator: value })}
                                >
                                    <SelectTrigger id="attendeesOperator">
                                        <SelectValue placeholder="Select an operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="equals">Equals</SelectItem>
                                        <SelectItem value="less">Less Than</SelectItem>
                                        <SelectItem value="greater">Greater Than</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attendeesValue">Number of Attendees</Label>
                                <Input
                                    id="attendeesValue"
                                    type="number"
                                    min="0"
                                    value={details.value || ""}
                                    onChange={(e) => setDetails({ ...details, value: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}

                    {triggerType === "status" && (
                        <div className="space-y-2">
                            <Label htmlFor="statusValue">Status</Label>
                            <Select
                                value={details.status || ""}
                                onValueChange={(value) => setDetails({ ...details, status: value })}
                            >
                                <SelectTrigger id="statusValue">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {triggerType === "registration" && (
                        <div className="text-muted-foreground text-sm">
                            This trigger will be activated when a new registration occurs. No additional configuration needed.
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddTrigger}
                        disabled={!triggerType || (triggerType !== "registration" && Object.keys(details).length === 0)}
                    >
                        Add Trigger
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


// Component for adding a new action
export function AddActionDialog({ 
    open, 
    onOpenChange, 
    onAdd 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onAdd: (actionType: string, details: any) => void 
}) {
    const [actionType, setActionType] = useState<string>("");
    const [details, setDetails] = useState<any>({});

    const handleAddAction = () => {
        onAdd(actionType, details);
        onOpenChange(false);
        // Reset form
        setActionType("");
        setDetails({});
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Action</DialogTitle>
                    <DialogDescription>
                        Create a new action that will be executed when this flow is triggered.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="actionType">Action Type</Label>
                        <Select
                            value={actionType}
                            onValueChange={(value) => {
                                setActionType(value);
                                // Reset details when changing type
                                setDetails({});
                            }}
                        >
                            <SelectTrigger id="actionType">
                                <SelectValue placeholder="Select an action type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="notification">Notification</SelectItem>
                                <SelectItem value="statusChange">Status Change</SelectItem>
                                <SelectItem value="fileShare">File Share</SelectItem>
                                <SelectItem value="imageChange">Image Change</SelectItem>
                                <SelectItem value="titleChange">Title Change</SelectItem>
                                <SelectItem value="descriptionChange">Description Change</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {actionType === "email" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="emailSubject">Subject</Label>
                                <Input
                                    id="emailSubject"
                                    value={details.subject || ""}
                                    onChange={(e) => setDetails({ ...details, subject: e.target.value })}
                                    placeholder="Enter email subject"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailBody">Body</Label>
                                <Textarea
                                    id="emailBody"
                                    value={details.body || ""}
                                    onChange={(e) => setDetails({ ...details, body: e.target.value })}
                                    placeholder="Enter email body"
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailRecipients">Recipients</Label>
                                <Input
                                    id="emailRecipients"
                                    value={details.recipients || ""}
                                    onChange={(e) => setDetails({ ...details, recipients: e.target.value })}
                                    placeholder="e.g., trigger.1.user.email or specific@email.com"
                                />
                                <p className="text-xs text-muted-foreground">
                                    You can use variables like trigger.1.user.email or enter specific email addresses.
                                </p>
                            </div>
                        </div>
                    )}

                    {actionType === "notification" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notificationMessage">Message</Label>
                                <Textarea
                                    id="notificationMessage"
                                    value={details.message || ""}
                                    onChange={(e) => setDetails({ ...details, message: e.target.value })}
                                    placeholder="Enter notification message"
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notificationRecipients">Recipients</Label>
                                <Input
                                    id="notificationRecipients"
                                    value={details.recipients ? details.recipients.join(", ") : ""}
                                    onChange={(e) => setDetails({ 
                                        ...details, 
                                        recipients: e.target.value.split(",").map((item: string) => item.trim())
                                    })}
                                    placeholder="Enter recipient IDs, separated by commas"
                                />
                            </div>
                        </div>
                    )}

                    {actionType === "statusChange" && (
                        <div className="space-y-2">
                            <Label htmlFor="statusValue">New Status</Label>
                            <Select
                                value={details.newStatus || ""}
                                onValueChange={(value) => setDetails({ ...details, newStatus: value })}
                            >
                                <SelectTrigger id="statusValue">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {actionType === "fileShare" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fileId">File ID</Label>
                                <Input
                                    id="fileId"
                                    value={details.fileId || ""}
                                    onChange={(e) => setDetails({ ...details, fileId: e.target.value })}
                                    placeholder="Enter file ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fileStatus">Status</Label>
                                <Select
                                    value={details.status || ""}
                                    onValueChange={(value) => setDetails({ ...details, status: value })}
                                >
                                    <SelectTrigger id="fileStatus">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {actionType === "imageChange" && (
                        <div className="space-y-2">
                            <Label htmlFor="newImage">New Image URL</Label>
                            <Input
                                id="newImage"
                                value={details.newImage || ""}
                                onChange={(e) => setDetails({ ...details, newImage: e.target.value })}
                                placeholder="Enter image URL"
                            />
                        </div>
                    )}

                    {actionType === "titleChange" && (
                        <div className="space-y-2">
                            <Label htmlFor="newTitle">New Title</Label>
                            <Input
                                id="newTitle"
                                value={details.newTitle || ""}
                                onChange={(e) => setDetails({ ...details, newTitle: e.target.value })}
                                placeholder="Enter new title"
                            />
                        </div>
                    )}

                    {actionType === "descriptionChange" && (
                        <div className="space-y-2">
                            <Label htmlFor="newDescription">New Description</Label>
                            <Textarea
                                id="newDescription"
                                value={details.newDescription || ""}
                                onChange={(e) => setDetails({ ...details, newDescription: e.target.value })}
                                placeholder="Enter new description"
                                className="min-h-[100px]"
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddAction}
                        disabled={!actionType || Object.keys(details).length === 0}
                    >
                        Add Action
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}