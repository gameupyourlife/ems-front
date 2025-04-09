"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, FunctionSquare, Zap, History, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { EventDetails } from "@/lib/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getActionDescription, getActionIcon, getTriggerDescription, getTriggerIcon } from "@/lib/flows/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// Interface for flow runs (executions)
interface FlowRun {
  id: string;
  flowId: string;
  flowName: string;
  status: "success" | "failed" | "running";
  startedAt: Date;
  completedAt?: Date;
  triggerType: string;
  actions: {
    type: string;
    status: "success" | "failed" | "skipped" | "running";
    details: string;
  }[];
  error?: string;
}

// Mock data for flow runs
const mockFlowRuns: FlowRun[] = [
  {
    id: "run-1",
    flowId: "flow-1",
    flowName: "Registration Confirmation",
    status: "success",
    startedAt: new Date("2023-10-18T14:23:12"),
    completedAt: new Date("2023-10-18T14:23:15"),
    triggerType: "registration",
    actions: [
      {
        type: "email",
        status: "success",
        details: "Email sent to john.doe@example.com"
      }
    ]
  },
  {
    id: "run-2",
    flowId: "flow-2",
    flowName: "Reminder Before Event",
    status: "success",
    startedAt: new Date("2023-10-19T08:00:03"),
    completedAt: new Date("2023-10-19T08:00:08"),
    triggerType: "schedule",
    actions: [
      {
        type: "email",
        status: "success",
        details: "Reminder emails sent to 24 recipients"
      }
    ]
  },
  {
    id: "run-3",
    flowId: "flow-3",
    flowName: "Post-Event Feedback",
    status: "failed",
    startedAt: new Date("2023-10-20T17:00:01"),
    completedAt: new Date("2023-10-20T17:00:04"),
    triggerType: "event",
    actions: [
      {
        type: "email",
        status: "failed",
        details: "Failed to send emails"
      }
    ],
    error: "Email server error: Connection refused"
  },
  {
    id: "run-4",
    flowId: "flow-1",
    flowName: "Registration Confirmation",
    status: "running",
    startedAt: new Date(),
    triggerType: "registration",
    actions: [
      {
        type: "email",
        status: "running",
        details: "Sending email to new registrant"
      }
    ]
  }
];

export default function EventFlowsTab({ eventDetails }: { eventDetails: EventDetails }) {
    const eventId = eventDetails.metadata.id;
    const [activeTab, setActiveTab] = useState<string>("instances");
    const [flowRuns, setFlowRuns] = useState<FlowRun[]>(mockFlowRuns);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge variant="outline" className="bg-green-50 text-green-800">Success</Badge>;
            case 'failed':
                return <Badge variant="outline" className="bg-red-50 text-red-800">Failed</Badge>;
            case 'running':
                return <Badge variant="outline" className="bg-blue-50 text-blue-800">Running</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <FunctionSquare className="h-5 w-5 text-primary" />
                    Event Automation
                </CardTitle>
                <CardDescription>
                    Automation flows for this event
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="instances" className="flex items-center gap-2">
                          <FunctionSquare className="h-4 w-4" />
                          Flows
                      </TabsTrigger>
                      <TabsTrigger value="runs" className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          Flow Runs
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="instances" className="space-y-6">
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
                    </TabsContent>
                    
                    <TabsContent value="runs">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Flow Executions</h3>
                                    <p className="text-sm text-muted-foreground">History of flow runs for this event</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setFlowRuns(mockFlowRuns)}>
                                    <History className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px]">Flow</TableHead>
                                            <TableHead>Trigger</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Started</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Actions</TableHead>
                                            <TableHead className="text-right">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {flowRuns.length > 0 ? (
                                            flowRuns.map((run) => (
                                                <TableRow key={run.id}>
                                                    <TableCell className="font-medium">{run.flowName}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                                {getTriggerIcon(run.triggerType)}
                                                            </div>
                                                            <span className="capitalize">{run.triggerType}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                                                    <TableCell>{format(new Date(run.startedAt), "MMM d, HH:mm:ss")}</TableCell>
                                                    <TableCell>
                                                        {run.completedAt 
                                                            ? `${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s`
                                                            : "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {run.actions.map((action, idx) => (
                                                                <div key={idx} className="flex items-center text-sm">
                                                                    {action.status === 'success' && <CheckCircle className="h-3 w-3 text-green-600 mr-1" />}
                                                                    {action.status === 'failed' && <XCircle className="h-3 w-3 text-red-600 mr-1" />}
                                                                    {action.status === 'skipped' && <div className="h-3 w-3 rounded-full bg-gray-300 mr-1" />}
                                                                    {action.status === 'running' && <div className="h-3 w-3 rounded-full bg-blue-500 mr-1 animate-pulse" />}
                                                                    <span className="capitalize">{action.type}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/organisation/events/${eventId}/flows/runs/${run.id}`}>
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <History className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                                                        <p className="text-muted-foreground">No flow executions found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                           
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}