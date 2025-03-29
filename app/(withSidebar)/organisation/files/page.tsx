"use client";
import { mockOrg, mockFiles } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import FileTable from "@/components/org/file-table";

export default function OrganizationFilesPage({ params }: { params: { orgId: string } }) {
    // In a real application, you would fetch the organization and its files here
    const orgId = params.orgId;
    const org = mockOrg; // This would come from an API call in a real app

    // Get total size of files (not all mock files might have size property)
    // const totalSize = mockFiles.reduce((total, file) => total + (file.size || 0), 0);

    // Count shared files (if shared property exists)
    // const sharedFilesCount = mockFiles.filter(file => file.shared).length;

    return (
        <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Files Management</h1>
                    <p className="text-muted-foreground">Manage all files for {org.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={`/organisation/files/upload`}>
                            <UploadIcon className="mr-2 h-4 w-4" />
                            Upload File
                        </Link>
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
                        <div className="text-3xl font-bold">{mockFiles.length}</div>
                    </CardContent>
                </Card>
                {/* <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Shared Files</CardTitle>
                        <CardDescription>Files shared with others</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{sharedFilesCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Storage Used</CardTitle>
                        <CardDescription>Total storage space used</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalSize.toFixed(1)} MB</div>
                    </CardContent>
                </Card> */}
            </div>

            {/* Files Table */}
            <FileTable files={mockFiles} orgId={orgId} />
        </div>
    );
}