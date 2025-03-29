"use client";

import { mockFiles } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftIcon, Save, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { EmsFile } from "@/lib/types";
import { toast } from "sonner";

// Define the form data structure
interface FileFormData {
  name: string;
  type: string;
}

export default function FileEditPage({ params }: { params: { fileId: string } }) {
  const router = useRouter();
  const fileId = params.fileId;
  
  // Find the file by ID from mockFiles
  const file = mockFiles.find(f => f.id === fileId);
  
  // If file not found, return 404
  if (!file) {
    notFound();
  }

  // Initialize the form with file data
  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<FileFormData>({
    defaultValues: {
      name: file.name,
      type: file.type
    }
  });

  // Available file types
  const fileTypes = [
    "document",
    "presentation",
    "spreadsheet",
    "image",
    "video",
    "audio",
    "archive",
    "code",
    "other"
  ];

  // Handle download function
  const handleDownload = () => {
    // In a real app, this would trigger a file download
    toast.success(`Starting download: ${file.name}`);
    
    // Create a fake download effect
    setTimeout(() => {
      toast.success(`Download complete: ${file.name}`);
    }, 2000);
  };

  // Handle form submission
  const onSubmit = (data: FileFormData) => {
    // In a real application, you would call an API to update the file
    console.log(`Update file ${file.id} with data:`, data);
    
    // Mock update the file
    const updatedFile: EmsFile = {
      ...file,
      name: data.name,
      type: data.type,
      updatedAt: new Date(),
      updatedBy: "current user" // In a real app, this would be the current user
    };
    
    console.log("Updated file:", updatedFile);
    toast.success("File information updated successfully");
    
    // Redirect back to file details page
    router.push(`/organisation/files/${file.id}`);
  };

  // Handle file type change
  const handleTypeChange = (value: string) => {
    setValue('type', value, { shouldDirty: true });
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/organisation/files/${file.id}`} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to File Details
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit File Information</CardTitle>
          <CardDescription>
            Update the file details below. This will not change the actual file content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">File Name</Label>
                <Input
                  id="name"
                  placeholder="Enter file name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">File Type</Label>
                <Select
                  defaultValue={file.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="capitalize">{type}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Created By</Label>
                <Input
                  value={file.createdBy}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Created On</Label>
                <Input
                  value={format(new Date(file.createdAt), "PPP")}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Last Modified By</Label>
                <Input
                  value={file.updatedBy}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Last Modified On</Label>
                <Input
                  value={format(new Date(file.updatedAt), "PPP")}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                type="button"
                onClick={() => router.push(`/organisation/files/${file.id}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!isDirty}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}