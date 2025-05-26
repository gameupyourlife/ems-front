"use client";
// React & externe Libraries importieren
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { SiteHeader } from "@/components/site-header";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { updateOrg } from "@/lib/backend/org";
import { useSession } from "next-auth/react";

// 1. Zod-Schema für das Organisationsformular definieren
const organizationSchema = z.object({
    name: z.string().min(3, {
        message: "Organisationsname muss mindestens 3 Zeichen lang sein.",
    }),
    description: z.string().min(10, {
        message: "Beschreibung muss mindestens 10 Zeichen lang sein.",
    }),
    address: z.string().min(5, {
        message: "Adresse muss mindestens 5 Zeichen lang sein.",
    }),
    website: z.string().url({
        message: "Bitte eine gültige Website-URL eingeben.",
    }).optional().or(z.literal("")),
});

// Typ für die Formulardaten
type OrganizationFormValues = z.infer<typeof organizationSchema>;

export default function Page() {

    const { data: session, update } = useSession()
    const currentOrg = session?.org;


    const [isSubmitting, setIsSubmitting] = useState(false);

    const quickActions: QuickAction[] = [
        {
            label: "Speichern",
            onClick: () => form.handleSubmit(onSubmit),
            icon: <Save className="h-4 w-4" />,
        }
    ];

    const form = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: currentOrg?.name,
            description: currentOrg?.description,
            address: currentOrg?.address,
            website: currentOrg?.website || "",
        },
    });


    useEffect(() => {
        // Setze die Formulardaten, wenn die Organisation geladen ist
        currentOrg && form.reset({
            name: currentOrg?.name,
            description: currentOrg?.description,
            address: currentOrg?.address,
            website: currentOrg?.website || "",
        });
    }, [currentOrg, form]);

    if (!currentOrg) return null;

    // Formular-Submit-Handler
    const onSubmit = async (data: OrganizationFormValues) => {
        setIsSubmitting(true);
        try {
            console.log("Zu aktualisierende Organisationsdaten:", data);

            const updatedOrg = {
                ...currentOrg,
                ...data,
                id: session?.user?.organization.id || "",
                updatedAt: new Date().toISOString(),
            };

            await updateOrg(updatedOrg, session.user?.jwt || "" ); 

            update({
                org: updatedOrg,
            })

            toast.success("Organisationsdaten erfolgreich aktualisiert!");
            setIsSubmitting(false);
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Organisation:", error);
            toast.error("Aktualisierung der Organisationsdaten fehlgeschlagen. Bitte erneut versuchen.");
            setIsSubmitting(false);
        }
    };

    // Rendern des Formulars
    return (
        <>
            <SiteHeader actions={quickActions} />

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl">Organisation bearbeiten</CardTitle>
                        <CardDescription>
                            Aktualisieren Sie die Daten und Informationen Ihrer Organisation
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
                                            <FormLabel>Organisationsname</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Organisationsname eingeben" {...field} />
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
                                            <FormLabel>Beschreibung</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Beschreibung der Organisation eingeben"
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
                                            <FormLabel>Adresse</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Adresse der Organisation eingeben" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://beispiel.de" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Bitte die vollständige URL inkl. http:// oder https:// eingeben
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6">
                                {/* Zusätzliche Metainformationen */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 flex-grow">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Erstellt am</p>
                                        <p className="text-sm text-muted-foreground">{new Date(currentOrg.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Zuletzt aktualisiert</p>
                                        <p className="text-sm text-muted-foreground">{new Date(currentOrg.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Speichern...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Änderungen speichern
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