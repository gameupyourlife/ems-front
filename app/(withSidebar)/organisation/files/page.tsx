"use client";
import { useState } from "react";
import { mockOrg, mockFiles } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import FileTable from "@/components/org/file-table";
import FileUploadDialog from "@/components/org/file-upload-dialog";
import { EmsFile } from "@/lib/types";

export default function OrganizationFilesPage({ params }: { params: { orgId: string } }) {
    // In a real application, you would fetch the organization and its files here
    const orgId = params.orgId;
    const org = mockOrg; // This would come from an API call in a real app
    
    // State for file list and upload dialog
    const [files, setFiles] = useState<EmsFile[]>(mockFiles);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    // Handle upload dialog open/close
    const openUploadDialog = () => setIsUploadDialogOpen(true);
    const closeUploadDialog = () => setIsUploadDialogOpen(false);

    // Handle upload completion
    const handleUploadComplete = (uploadedFiles: EmsFile[]) => {
        // In a real app, you'd refresh the file list from the server
        // Here we'll just add the mock uploaded files to our state
        setFiles(prevFiles => [...uploadedFiles, ...prevFiles]);
        closeUploadDialog();
    };

    return (
        <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Files Management</h1>
                    <p className="text-muted-foreground">Manage all files for {org.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={openUploadDialog}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/organisation/files/create`}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Folder
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Files Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">All Files</CardTitle>
                        <CardDescription>Total number of files</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{files.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">File Types</CardTitle>
                        <CardDescription>Number of unique file types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {new Set(files.map(file => file.type)).size}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Last Upload</CardTitle>
                        <CardDescription>Most recently uploaded file</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {files.length > 0 ? (
                            <div className="text-xl font-medium truncate">
                                {files.sort((a, b) => 
                                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                )[0].name}
                            </div>
                        ) : (
                            <div className="text-xl font-medium">No files</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Files Table */}
            <FileTable files={files} orgId={orgId} />
            
            {/* File Upload Dialog */}
            <FileUploadDialog 
                isOpen={isUploadDialogOpen}
                onClose={closeUploadDialog}
                orgId={orgId}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}