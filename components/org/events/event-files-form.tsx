"use client";

import { useState } from "react";
import { format } from "date-fns";
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
import FileUploadDialog from "@/components/org/file-upload-dialog";

// Icons
import {
  ArrowLeftIcon,
  Check,
  FileText,
  Plus, Upload
} from "lucide-react";

// Types
import { EmsFile } from "@/lib/types";

interface EventFilesFormProps {
  selectedFiles: EmsFile[];
  availableFiles: EmsFile[];
  onFilesChange: (files: EmsFile[]) => void;
  onTabChange?: (tab: string) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function EventFilesForm({
  selectedFiles,
  availableFiles,
  onFilesChange,
  onTabChange,
  submitLabel = "Save Changes",
  isSubmitting = false
}: EventFilesFormProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Handle file upload dialog open/close
  const openUploadDialog = () => setIsUploadDialogOpen(true);
  const closeUploadDialog = () => setIsUploadDialogOpen(false);
  
  // Handle file upload completion
  const handleUploadComplete = (uploadedFiles: EmsFile[]) => {
    onFilesChange([...uploadedFiles, ...selectedFiles]);
    closeUploadDialog();
  };

  // Handle selecting existing files
  const toggleFileSelection = (file: EmsFile) => {
    if (selectedFiles.some(f => f.id === file.id)) {
      onFilesChange(selectedFiles.filter(f => f.id !== file.id));
    } else {
      onFilesChange([...selectedFiles, file]);
    }
  };

  return (
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
            <p className="text-sm text-muted-foreground">
              Select files to attach to your event 
              {selectedFiles.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {selectedFiles.length} selected
                </Badge>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openUploadDialog}>
            <Upload className="h-4 w-4 mr-2" />
            Upload New Files
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        {availableFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No files available</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Upload new files to associate them with this event
            </p>
            <Button variant="outline" className="mt-4" onClick={openUploadDialog}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
              {availableFiles.map((file) => {
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
                    <div className="h-10 w-10 mr-3 flex items-center justify-center rounded bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
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
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" type="button" onClick={() => onTabChange && onTabChange("basic")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Previous: Basic Info
        </Button>
        <Button variant="default" type="button" onClick={() => onTabChange && onTabChange("flows")}>
          Next: Flows
          <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
        </Button>
      </CardFooter>

      {/* File Upload Dialog */}
      <FileUploadDialog 
        isOpen={isUploadDialogOpen}
        onClose={closeUploadDialog}
        orgId="1" // In a real app, you would use the actual organization ID
        onUploadComplete={handleUploadComplete}
      />
    </Card>
  );
}