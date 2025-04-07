"use client";

import { useState } from "react";
import { mockFiles } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  FileIcon,
  ArrowLeftIcon,
  Download,
  Share2,
  Trash,
  FileType,
  LayoutGrid,
  Eye,
  LayoutList,
  Check,
  Copy
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function FileDetailPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const params = useParams();
  const fileId = params.fileId;    
  
  
  // Find the file by ID from mockFiles
  const file = mockFiles.find(f => f.id === fileId);
  
  // If file not found, return 404
  if (!file) {
    notFound();
  }

  // Get file type icon
  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return <FileIcon className="h-6 w-6" />;
      case 'xlsx':
      case 'spreadsheet':
        return <LayoutGrid className="h-6 w-6" />;
      case 'pptx':
      case 'presentation':
        return <LayoutList className="h-6 w-6" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'image':
        return <Eye className="h-6 w-6" />;
      case 'mp4':
      case 'video':
        return <FileType className="h-6 w-6" />;
      default:
        return <FileIcon className="h-6 w-6" />;
    }
  };

  // Mock download function
  const handleDownload = () => {
    // In a real app, this would trigger a file download
    toast.success(`Starting download: ${file.name}`);
    
    // Create a fake download effect
    setTimeout(() => {
      toast.success(`Download complete: ${file.name}`);
    }, 2000);
  };

  // Mock share function
  const handleShare = () => {
    setShowShareDialog(true);
  };

  // Copy share link to clipboard
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared-files/${file.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        toast.success("Share link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  // Mock delete function
  const handleDelete = () => {
    // In a real application, you would call an API to delete the file
    console.log(`Delete file ${file.id}`);
    setShowDeleteDialog(false);
    toast.success(`File ${file.name} has been deleted`);
    // Redirect to files page after deletion
    window.location.href = "/organisation/files";
  };

  // Generate a share URL for the file
  const getShareUrl = () => {
    return `${window.location.origin}/shared-files/${file.id}`;
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/organisation/files" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Files
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this file?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the file.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Share Dialog */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share File</DialogTitle>
                <DialogDescription>
                  Share this file with others by copying the link below.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-4">
                <Input 
                  value={getShareUrl()} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={copyShareLink}
                  className="flex-shrink-0"
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copySuccess ? "Copied" : "Copy Link"}
                </Button>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Preview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getFileTypeIcon(file.type)}
              <span>{file.name}</span>
            </CardTitle>
            <CardDescription>
              <Badge variant="outline" className="capitalize">{file.type}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-0 h-[300px] md:h-[400px] overflow-hidden">
            {/* File Preview based on type */}
            {['image', 'png', 'jpg', 'jpeg'].includes(file.type.toLowerCase()) ? (
              <Image 
                src={file.url} 
                alt={file.name}
                width={800}
                height={600}
                className="object-contain max-h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                {getFileTypeIcon(file.type)}
                <p className="mt-4 text-muted-foreground">Preview not available for {file.type} files.</p>
                <Button className="mt-4" size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download to view
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Details */}
        <Card>
          <CardHeader>
            <CardTitle>File Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="mt-1">{file.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <p className="mt-1 capitalize">{file.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created by</h3>
              <p className="mt-1">{file.createdBy}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Creation date</h3>
              <p className="mt-1">{format(new Date(file.createdAt), "PPP")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last modified by</h3>
              <p className="mt-1">{file.updatedBy}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last modified</h3>
              <p className="mt-1">{format(new Date(file.updatedAt), "PPP")}</p>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}