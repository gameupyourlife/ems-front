"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Edit, ListTodo } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { EventDetails } from "@/lib/types-old";

export default function EventAgendaTab ({ eventDetails }: { eventDetails: EventDetails }) {
    const eventId = eventDetails.metadata.id;

    return (
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
                  <Link href={`/organization/events/${eventId}/edit?tab=agenda`}>
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
                      (new Date(step.end).getTime() - new Date(step.start).getTime()) / (1000 * 60)
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
                              {format(new Date(step.start), "h:mm")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(step.end), "a")}
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
                              <span>From {format(new Date(step.start), "h:mm a")}</span>
                              <span>To {format(new Date(step.end), "h:mm a")}</span>
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
                    <Link href={`/organization/events/${eventId}/edit?tab=agenda`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Create Agenda
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
    )
}