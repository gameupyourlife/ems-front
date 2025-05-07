"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { SiteHeader } from "@/components/site-header";
import { useOrg } from "@/lib/context/user-org-context";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { updateOrg } from "@/lib/backend/org";

// Define the organization form schema with Zod
const organizationSchema = z.object({
    name: z.string().min(3, {
        message: "Organization name must be at least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    address: z.string().min(5, {
        message: "Address must be at least 5 characters.",
    }),
    website: z.string().url({
        message: "Please enter a valid website URL.",
    }).optional().or(z.literal("")),
});

// Type for the form data
type OrganizationFormValues = z.infer<typeof organizationSchema>;

export default function Page() {

    const { currentOrg, setCurrentOrg  } = useOrg();
    if (!currentOrg) return null; // Ensure currentOrg is available before proceeding
    const [isSubmitting, setIsSubmitting] = useState(false);
    const quickActions: QuickAction[] = [
        {
            label: "Speichern",
            onClick: () => form.handleSubmit(onSubmit),
            icon: <Save className="h-4 w-4" />,
        }
    ];

    // Initialize react-hook-form with zod resolver
    const form = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: currentOrg.name,
            description: currentOrg.description,
            address: currentOrg.address,
            website: currentOrg.website || "",
        },
    });

    // Handle form submission
    const onSubmit = async (data: OrganizationFormValues) => {
        setIsSubmitting(true);
        try {
            // In a real app, you would make an API call here to update the organization
            console.log("Organization data to update:", data);
            
            const updatedOrg = {
                ...currentOrg,
                ...data,
                updatedAt: new Date().toISOString(), // Update the timestamp
            };
            
            // Simulate API call delay
            await updateOrg(updatedOrg); // Call the API to update the organization
            
            setCurrentOrg(updatedOrg); // Update the context with the new organization data

            toast.success("Organization details updated successfully!");
            setIsSubmitting(false);
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization details. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SiteHeader actions={quickActions} />

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl">Edit Organization</CardTitle>
                        <CardDescription>
                            Update your organization's details and information
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Organization Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter organization name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter organization description"
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter organization address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the full URL including http:// or https://
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6">
                                {/* Additional meta information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 flex-grow">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Created at</p>
                                        <p className="text-sm text-muted-foreground">{new Date(currentOrg.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Last updated</p>
                                        <p className="text-sm text-muted-foreground">{new Date(currentOrg.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </>
    );
}