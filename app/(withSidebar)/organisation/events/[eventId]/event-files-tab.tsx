"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, FileText, Upload } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { EventDetails } from "@/lib/types";

export default function EventFilesTab({ eventDetails }: { eventDetails: EventDetails }) {

    return (
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
    )

}