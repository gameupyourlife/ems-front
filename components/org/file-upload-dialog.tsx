"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: any[]) => void;
}

export default function FileUploadDialog({ isOpen, onClose, onUploadComplete }: FileUploadDialogProps) {
  const [uploadingFiles, setUploadingFiles] = useState<{
    file: File;
    progress: number;
    error?: string;
    complete?: boolean;
  }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesToUpload = acceptedFiles.map(file => ({
      file,
      progress: 0
    }));
    
    setUploadingFiles(prev => [...prev, ...filesToUpload]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      // Accept all common file types
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'video/mp4': ['.mp4'],
    },
    maxSize: 10485760, // 10MB
  });

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate upload progress for each file
    uploadingFiles.forEach((fileData, index) => {
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadingFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], progress: 100, complete: true };
            
            // Check if all files are complete
            const allComplete = newFiles.every(f => f.complete);
            if (allComplete) {
              setIsUploading(false);
              
              // In a real app, you would get the uploaded file information from the server
              if (onUploadComplete) {
                const mockUploadedFiles = newFiles.map(f => ({
                  id: Math.random().toString(36).substring(2, 15),
                  name: f.file.name,
                  type: f.file.type.split('/')[1] || f.file.type,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  createdBy: "Current User",
                  updatedBy: "Current User",
                  url: URL.createObjectURL(f.file)
                }));
                onUploadComplete(mockUploadedFiles);
              }
              
              toast.success(`Successfully uploaded ${newFiles.length} ${newFiles.length === 1 ? 'file' : 'files'}`);
            }
            
            return newFiles;
          });
        } else {
          setUploadingFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], progress };
            return newFiles;
          });
        }
      }, 300);
    });
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const closeDialog = () => {
    if (isUploading) {
      toast.error("Please wait until upload is complete");
      return;
    }
    
    // Reset state
    setUploadingFiles([]);
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to your organization. Accepted file types include images, documents, spreadsheets, and more.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {uploadingFiles.length === 0 && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors focus:outline-none",
                isDragActive && "border-primary/50 bg-primary/5",
                isDragAccept && "border-green-500/50 bg-green-500/5",
                isDragReject && "border-red-500/50 bg-red-500/5",
                !isDragActive && "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-medium">
                    {isDragActive 
                      ? isDragAccept 
                        ? "Drop the files here" 
                        : "Some files will be rejected"
                      : "Drag & drop files here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (10MB max per file)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {uploadingFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Files to upload</h3>
                {!isUploading && (
                  <Button variant="ghost" size="sm" onClick={() => setUploadingFiles([])}>
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="grid gap-3 max-h-60 overflow-y-auto pr-2">
                {uploadingFiles.map((fileData, index) => (
                  <div key={index} className="flex items-center gap-3 border rounded-md p-3">
                    <div className="shrink-0">
                      <File className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                        {!isUploading && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {isUploading && fileData.complete && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {isUploading && fileData.error && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(fileData.file.size / 1024).toFixed(0)} KB
                      </div>
                      {(isUploading || fileData.progress > 0) && (
                        <div className="mt-2">
                          <Progress value={fileData.progress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {!isUploading && (
                <div 
                  {...getRootProps()}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-muted-foreground">
                    Drop more files or click to browse
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={closeDialog}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploadingFiles.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}