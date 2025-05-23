"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// UI Komponenten
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

// Typen
import { EmsFile } from "@/lib/types-old";

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
  submitLabel = "Änderungen speichern",
  isSubmitting = false
}: EventFilesFormProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Öffnet den Datei-Upload-Dialog
  const openUploadDialog = () => setIsUploadDialogOpen(true);
  // Schließt den Datei-Upload-Dialog
  const closeUploadDialog = () => setIsUploadDialogOpen(false);
  
  // Wird aufgerufen, wenn der Datei-Upload abgeschlossen ist
  const handleUploadComplete = (uploadedFiles: EmsFile[]) => {
    onFilesChange([...uploadedFiles, ...selectedFiles]);
    closeUploadDialog();
  };

  // Fügt eine Datei zur Auswahl hinzu oder entfernt sie
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
          Event-Dateien
        </CardTitle>
        <CardDescription>
          Füge Dateien hinzu, die mit diesem Event verknüpft werden sollen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Dateien für dieses Event</h3>
            <p className="text-sm text-muted-foreground">
              Wähle Dateien aus, die du deinem Event anhängen möchtest
              {selectedFiles.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {selectedFiles.length} ausgewählt
                </Badge>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openUploadDialog}>
            <Upload className="h-4 w-4 mr-2" />
            Neue Dateien hochladen
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        {availableFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Keine Dateien verfügbar</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Lade neue Dateien hoch, um sie mit diesem Event zu verknüpfen
            </p>
            <Button variant="outline" className="mt-4" onClick={openUploadDialog}>
              <Upload className="h-4 w-4 mr-2" />
              Dateien hochladen
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
                      <p className="text-xs text-muted-foreground">{file.type} • Erstellt am {format(new Date(file.createdAt), "dd.MM.yyyy")}</p>
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
          Zurück
        </Button>
        <Button variant="default" type="button" onClick={() => onTabChange && onTabChange("flows")}>
          {submitLabel}
          <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
        </Button>
      </CardFooter>

      {/* Datei-Upload-Dialog */}
      <FileUploadDialog 
        isOpen={isUploadDialogOpen}
        onClose={closeUploadDialog}
        onUploadComplete={handleUploadComplete}
      />
    </Card>
  );
}