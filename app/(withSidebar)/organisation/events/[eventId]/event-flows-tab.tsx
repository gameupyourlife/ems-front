"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, FunctionSquare, Zap } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { EventDetails } from "@/lib/types";
import { getActionDescription, getActionIcon, getTriggerDescription, getTriggerIcon } from "@/lib/flows/utils";

export default function EventFlowsTab({ eventDetails }: { eventDetails: EventDetails }) {
    const eventId = eventDetails.metadata.id;
    
    return (
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
    )

}