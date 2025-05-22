"use client";;
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronLeft, Save, TrashIcon, X } from "lucide-react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail } from "@/lib/backend/types";
import { useEffect, useState } from "react";
import LoadingSpinner from "./loading-spinner";
import { useRouter } from "next/navigation";
import { useMembers } from "@/lib/backend/hooks/org";
import { useSession } from "next-auth/react";
import { createMailTemplate, deleteMailTemplate, updateMailTemplate } from "@/lib/backend/mail-templates";
import { toast } from "sonner";
import { createMail, deleteMail, updateMail } from "@/lib/backend/mails";
import { ConfirmationButton } from "./ui/confirmation-button";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Define form schema with validation
const formSchema = z.object({
    name: z.string().min(2, "Template name must be at least 2 characters.").max(100),
    description: z.string().max(200, "Description must not exceed 200 characters.").optional(),
    subject: z.string().min(2, "Subject line must be at least 2 characters.").max(150, "Subject must not exceed 150 characters."),
    body: z.string().min(10, "Email body must be at least 10 characters."),
    recipients: z.array(z.string()).min(1, "At least one recipient is required."),
});

export default function MailEditor({ mail, isLoading, error }: { mail: Mail | undefined, isLoading: boolean, error: Error | null }) {
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const { data: session } = useSession()
    const { data: members } = useMembers(session?.user?.organization.id || "", session?.user?.jwt || "")
    const queryClient = useQueryClient()

    // Filter members based on search query
    const filteredMembers = members?.filter((member) => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            member.fullName?.toLowerCase().includes(query) || 
            member.email?.toLowerCase().includes(query)
        );
    });

    // React Hook Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: mail?.name || "",
            description: (mail && "description" in mail) ? mail.description : "",
            subject: mail?.subject || "",
            recipients: mail?.recipients || [],
            body: mail?.body || "Your email content here..."
        },
    });

    useEffect(() => {
        if (mail) {
            form.reset({
                name: mail.name,
                description: (mail && "description" in mail) ? mail.description : "",
                subject: mail.subject,
                recipients: mail.recipients,
                body: mail.body,
            })
        }
    }, [mail])


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log("=====================")
        setIsSaving(true);
        if (!mail) return;

        try {

            if (mail?.isTemplate) {
                if (mail?.existsInDB) {
                    await updateMailTemplate(session?.user?.organization.id || "", mail.id, {
                        body: values.body,
                        description: values.description,
                        name: values.name,
                        recipients: values.recipients,
                        subject: values.subject
                    }, session?.user?.jwt || "")

                    queryClient.invalidateQueries({ queryKey: ["mailTemplates"] })
                    toast.success("Mail Template erfolgreich aktualisiert")
                    router.push(`/organization/email-templates/${mail.id}`)
                } else {
                    const res = await createMailTemplate(session?.user?.organization.id || "", {
                        body: values.body,
                        description: values.description,
                        name: values.name,
                        recipients: values.recipients,
                        subject: values.subject
                    }, session?.user?.jwt || "")

                    queryClient.invalidateQueries({ queryKey: ["mailTemplates"] })
                    toast.success("Mail Template erfolgreich gespeichert")
                    router.push(`/organization/email-templates/${res.id}`)
                }
            } else {
                if (mail?.existsInDB) {
                    await updateMail(session?.user?.organization.id || "", mail.eventId, mail.id, {
                        body: values.body,
                        // description: values.description,
                        name: values.name,
                        recipients: values.recipients,
                        subject: values.subject,
                    }, session?.user?.jwt || "")

                    queryClient.invalidateQueries({ queryKey: ["mails"] })
                    toast.success("Mail Template erfolgreich aktualisiert")
                    router.push(`/organization/events/${mail.eventId}?tabs=emails`)
                } else {
                    const res = await createMail(session?.user?.organization.id || "", mail.eventId, {
                        body: values.body,
                        // description: values.description,
                        name: values.name,
                        recipients: values.recipients,
                        subject: values.subject,
                        eventId: mail.eventId
                    }, session?.user?.jwt || "")

                    queryClient.invalidateQueries({ queryKey: ["mails"] })
                    toast.success("Mail Template erfolgreich gespeichert")
                    router.push(`/organization/events/${mail.eventId}?tabs=emails`)
                }
            }
        } catch (err) {
            console.error("Error saving template:", err);
            // Show error toast or notification here
            toast.error("Fehler beim speichern")
        } finally {
            setIsSaving(false);
        }
    };

    async function handleDelete() {
        if (!mail) return;

        setIsDeleting(true)
        try {
            if (mail.isTemplate) {
                await deleteMailTemplate(
                    session?.user?.organization.id || "",
                    mail.id,
                    session?.user?.jwt || ""
                )

                queryClient.invalidateQueries({ queryKey: ["mailTemplates"] })
                toast.success("Mail Template erfolgreich gelöscht")
                router.push(`/organization/email-templates`)
            } else {
                await deleteMail(
                    session?.user?.organization.id || "",
                    mail.eventId,
                    mail.id,
                    session?.user?.jwt || ""
                )

                queryClient.invalidateQueries({ queryKey: ["mails"] })
                toast.success("Mail erfolgreich gelöscht")
                router.push(`/organization/events/${mail.eventId}?tabs=emails`)
            }
        } catch {
            toast.error("Löschen fehlgeschlagen")

        } finally {
            setIsDeleting(false)
        }

    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
                <p className="text-muted-foreground mb-6">{error.message}</p>
                <Button variant="outline" asChild>
                    <Link href="/organization/email-templates">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Templates
                    </Link>
                </Button>
            </div>
        );
    }

    const quickActions: QuickAction[] = [
        {
            children: (
                <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" asChild >
                            <Link href={
                                mail?.isTemplate ?
                                    mail?.existsInDB ? "/organization/email-templates" : `/organization/email-templates/${mail.id}`
                                    : `/organization/events/${mail?.eventId}`
                            }>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent >
                        <p>Zurück</p>
                    </TooltipContent>
                </Tooltip >
            )
        },
        {
            children: (
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                    }}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <LoadingSpinner className="border-background" />
                            Speichere...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Speichern
                        </>
                    )}
                </Button>
            )
        },
        {
            children: (
                <>
                    {mail?.existsInDB && <ConfirmationButton
                        onConfirm={() => handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting
                            ?
                            <>
                                <LoadingSpinner className="border-background" />
                                Lösche...
                            </>
                            :
                            <>
                                <TrashIcon className="h-4 w-4" />
                                Löschen
                            </>
                        }
                    </ConfirmationButton>}
                </>
            )
        },
    ]

    return (
        <>
            <SiteHeader actions={quickActions} idName={mail?.name} />

            <div className="space-y-6 p-4 md:p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Template Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Template Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter template name" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    A recognizable name for your template
                                                </FormDescription>
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
                                                        placeholder="Enter a brief description of this template"
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Describe what this template is used for
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl">Email Content</CardTitle>

                                    </div>
                                </CardHeader>
                                <CardContent >
                                    <div className="space-y-1 mb-4">
                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Subject Line</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter email subject" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-1 mb-4">
                                        <FormField
                                            control={form.control}
                                            name="recipients"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Email Recipients</FormLabel>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="relative w-full">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="outline" className="w-full flex justify-between items-center">
                                                                        <span>Select Recipients</span>
                                                                        <ChevronLeft className="h-4 w-4 rotate-90" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className="w-full min-w-[300px] max-h-[300px] overflow-y-auto">
                                                                    {/* Search input */}
                                                                    <div className="p-4 sticky bg-popover -mx-2 -mt-2 -top-2 border-b z-10">
                                                                        <Input
                                                                            placeholder="Search by name or email..."
                                                                            value={searchQuery}
                                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                                            className="w-full"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                    {/* Members list */}
                                                                    {filteredMembers?.map((member) => (
                                                                        <DropdownMenuItem 
                                                                            key={member.id}
                                                                            onClick={() => {
                                                                                // Add member to recipients if not already selected
                                                                                if (!field.value.includes(member.id)) {
                                                                                    field.onChange([...field.value, member.id]);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Avatar className="h-6 w-6">
                                                                                    <AvatarImage src={member.profilePicture || ""} alt={member.fullName} />
                                                                                    <AvatarFallback>
                                                                                        {member.fullName.split(' ').map(part => part[0]).join('').toUpperCase()}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex flex-col text-sm">
                                                                                    <span>{member.fullName}</span>
                                                                                    <span className="text-xs text-muted-foreground">{member.email}</span>
                                                                                </div>
                                                                            </div>
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                    {filteredMembers?.length === 0 ? (
                                                                        <div className="p-2 text-center text-sm text-muted-foreground">
                                                                            No members found
                                                                        </div>
                                                                    ) : null}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        
                                                        {/* Display selected recipients as tags */}
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {field.value.map((recipientId: string) => {
                                                                const member = members?.find(m => m.id === recipientId);
                                                                return (
                                                                    <Badge 
                                                                        key={recipientId} 
                                                                        variant="secondary"
                                                                        className="flex items-center gap-1 px-2 py-1"
                                                                    >
                                                                        <span>{member?.fullName || recipientId}</span>
                                                                        <Button 
                                                                            type="button"
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            className="h-4 w-4 p-0"
                                                                            onClick={() => {
                                                                                field.onChange(field.value.filter((id: string) => id !== recipientId));
                                                                            }}
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                            <span className="sr-only">Remove</span>
                                                                        </Button>
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <FormField
                                            control={form.control}
                                            name="body"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Body</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter email body content (Only Text supported)"
                                                            className="min-h-[300px] font-mono"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}
