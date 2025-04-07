"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlowForm } from "@/components/org/flows/flow-form";
import { Flow } from "@/lib/types";

export default function CreateFlowPage() {
  const router = useRouter();
  
  // Initialize with a new empty flow template
  const [isCreating, setIsCreating] = useState(true);
  
  // Create a new empty flow template
  const emptyFlow: Flow = {
    templateId: "1",
    eventId: "event-123", // This would come from the auth context in a real app
    id: "",
    name: "",
    description: "",
    trigger: [],
    actions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "current-user", // This would come from auth in a real app
    updatedBy: "current-user"  // This would come from auth in a real app
  };
  
  // Function to handle flow creation
  const handleCreateFlow = (flow: Flow) => {
    // In a real app, you would make an API call here
    
    // Simulate a successful creation
    setIsCreating(false);
    
    toast.success("Flow created", {
      description: "Your flow has been created successfully and is now ready to use.",
      duration: 3000,
    });
    
    // Navigate to the flows list after a short delay
    setTimeout(() => {
      router.push('/organisation/flows');
    }, 1500);
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/organisation">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/organisation`}>Organization</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/organisation/flows`}>Flows</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Flow</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create New Flow</h1>
          <p className="text-muted-foreground mt-1">
            Set up an automated workflow for your organization
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/organisation/flows">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flows
          </Link>
        </Button>
      </div>

      {/* Flow Form */}
      <FlowForm 
        flow={emptyFlow} 
        isEditing={true} 
        onSave={handleCreateFlow} 
        isCreating={true}
      />
    </div>
  );
}