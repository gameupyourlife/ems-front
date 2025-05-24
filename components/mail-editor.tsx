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
import { useParams, useRouter } from "next/navigation";
import { useMembers } from "@/lib/backend/hooks/use-org";
import { useSession } from "next-auth/react";
import { createMailTemplate, deleteMailTemplate, updateMailTemplate } from "@/lib/backend/mail-templates";
import { toast } from "sonner";
import { createMail, deleteMail, updateMail } from "@/lib/backend/mails";
import { ConfirmationButton } from "./ui/confirmation-button";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "./ui/switch";

// Define form schema with validation
const formSchema = z.object({
    name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein.").max(100),
    description: z.string().max(200, "Beschreibung darf 200 Zeichen nicht überschreiten.").optional(),
    subject: z.string().min(2, "Betreffzeile muss mindestens 2 Zeichen lang sein.").max(150, "Betreff darf 150 Zeichen nicht überschreiten."),
    body: z.string().min(10, "E-Mail-Text muss mindestens 10 Zeichen lang sein."),
    recipients: z.array(z.string()).optional(),
    sendToAllParticipants: z.boolean(),
}).superRefine((data, ctx) => {
    if (!data.sendToAllParticipants && (!data.recipients || data.recipients.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mindestens ein Empfänger muss ausgewählt werden.",
        });
    }
});

export default function MailEditor({ mail, isLoading, error }: { mail: Mail | undefined, isLoading: boolean, error: Error | null }) {
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayRecipientsSelect, setDisplayRecipientsSelect] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const params = useParams();
    const eventId = params.eventId as string;
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
                        subject: values.subject,
                        isUserCreated: mail.isUserCreated,
                        sendToAllParticipants: values.sendToAllParticipants,
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
                        subject: values.subject,
                        isUserCreated: mail.isUserCreated,
                        sendToAllParticipants: values.sendToAllParticipants,
                    }, session?.user?.jwt || "")

                    queryClient.invalidateQueries({ queryKey: ["mailTemplates"] })
                    toast.success("Mail Template erfolgreich gespeichert")
                    router.push(`/organization/email-templates/${res.id}`)
                }
            } else {
                if (mail?.existsInDB) {
                    await updateMail(session?.user?.organization.id || "", eventId, mail.id, {
                        body: values.body,
                        description: values.description,
                        name: values.name,
                        recipients: values.recipients,
                        subject: values.subject,
                        isUserCreated: mail.isUserCreated,
                        sendToAllParticipants: values.sendToAllParticipants,
                    }, session?.user?.jwt || "")

                    queryClient.invalidateQueries({ queryKey: ["mails"] })
                    toast.success("Mail Template erfolgreich aktualisiert")
                    router.push(`/organization/events/${eventId}?tabs=emails`)
                } else {
                    const res = await createMail(session?.user?.organization.id || "", eventId, {
                        body: values.body,
                        description: values.description,
                        name: values.name,
                        recipients: values.recipients,
                        subject: values.subject,
                        isUserCreated: mail.isUserCreated,
                        sendToAllParticipants: values.sendToAllParticipants,
                    }, session?.user?.jwt || "")

                    queryClient.invalidateQueries({ queryKey: ["mails"] })
                    toast.success("Mail Template erfolgreich gespeichert")
                    router.push(`/organization/events/${eventId}?tabs=emails`)
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
                    eventId,
                    mail.id,
                    session?.user?.jwt || ""
                )

                queryClient.invalidateQueries({ queryKey: ["mails"] })
                toast.success("Mail erfolgreich gelöscht")
                router.push(`/organization/events/${eventId}?tabs=emails`)
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
                <h2 className="text-2xl font-bold mb-2">Vorlage nicht gefunden</h2>
                <p className="text-muted-foreground mb-6">{error.message}</p>
                <Button variant="outline" asChild>
                    <Link href="/organization/email-templates">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Zurück zu den Vorlagen
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
                                    : `/organization/events/${eventId}`
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





    return <>
        <SiteHeader actions={quickActions} idName={mail?.name} />

        <div className="space-y-6 p-4 md:p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Vorlagen-Informationen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vorlagenname</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Gib einen Namen für die Vorlage ein" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Ein erkennbarer Name für deine Vorlage
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
                                            <FormLabel>Beschreibung</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Gib eine kurze Beschreibung dieser Vorlage ein"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Beschreibe, wofür diese Vorlage verwendet wird
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
                                    <CardTitle className="text-xl">E-Mail-Inhalt</CardTitle>

                                </div>
                            </CardHeader>
                            <CardContent >
                                <div className="space-y-1 mb-8">
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>E-Mail-Betreffzeile</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Gib den E-Mail-Betreff ein" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {displayRecipientsSelect && <div className="space-y-1 mb-2">
                                    <FormField
                                        control={form.control}
                                        name="recipients"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>E-Mail-Empfänger</FormLabel>
                                                <div className="flex flex-col gap-2">
                                                    <div className="relative w-full">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" className="w-full flex justify-between items-center">
                                                                    <span>Empfänger auswählen</span>
                                                                    <ChevronLeft className="h-4 w-4 rotate-90" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-full min-w-[300px] max-h-[300px] overflow-y-auto">
                                                                {/* Search input */}
                                                                <div className="p-4 sticky bg-popover -mx-2 -mt-2 -top-2 border-b z-10">
                                                                    <Input
                                                                        placeholder="Nach Name oder E-Mail suchen..."
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
                                                                            if (!field.value?.includes(member.id)) {
                                                                                field.onChange([...(field.value || []), member.id]);
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
                                                                        Keine Mitglieder gefunden
                                                                    </div>
                                                                ) : null}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Display selected recipients as tags */}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {field.value?.map((recipientId: string) => {
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
                                                                            field.onChange(field.value?.filter((id: string) => id !== recipientId));
                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                        <span className="sr-only">Entfernen</span>
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
                                </div>}

                                <div className="space-y-1 mb-8">
                                    <FormField
                                        control={form.control}
                                        name="sendToAllParticipants"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormLabel>An alle Teilnehmer senden</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        defaultChecked={field.value}
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => {
                                                            setDisplayRecipientsSelect(!checked);
                                                            field.onChange(checked);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Wenn aktiviert, werden alle Teilnehmer des Events diese E-Mail erhalten.
                                                </FormDescription>
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
                                                <FormLabel>E-Mail-Text</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Gib den E-Mail-Text ein (nur Text wird unterstützt)"
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
}
