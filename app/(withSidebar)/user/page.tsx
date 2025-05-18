"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, Building, KeyRound, AlertTriangle, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

const profileFormSchema = z.object({
    firstName: z
        .string()
        .min(1, { message: "First name is required." })
        .max(50, { message: "First name must not be longer than 50 characters." }),
    lastName: z
        .string()
        .min(1, { message: "Last name is required." })
        .max(50, { message: "Last name must not be longer than 50 characters." }),
    email: z.string().min(1, { message: "Email is required." }).email("This is not a valid email."),
})

const passwordResetSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordResetValues = z.infer<typeof passwordResetSchema>

export default function ProfileEditPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { data: session } = useSession()
    const user = session?.user;
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false)
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false)
    const [isDeleteAccountLoading, setIsDeleteAccountLoading] = useState(false)

    // Initialize the form with empty values first
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
        },
        mode: "onChange",
    });

    const passwordResetForm = useForm<PasswordResetValues>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    // Update form values when user data becomes available
    useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
            });
        }
    }, [user, form]);

    // Return early after all hooks have been called
    if (!session || !user) {
        return null 
    }

    function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)
        setTimeout(() => {
            console.log(data)
            setIsLoading(false)
            toast.success("Profil erfolgreich aktualisiert!")
        }, 1000)
    }

    function handleSignOut() {
        router.push("/")
        toast.success("Erfolgreich abgemeldet!")
    }

    function handlePasswordReset(data: PasswordResetValues) {
        setIsPasswordResetLoading(true);
        // Simuliert einen API-Aufruf zum Passwort zurücksetzen
        setTimeout(() => {
            console.log("Password reset data:", data);
            setIsPasswordResetLoading(false);
            setIsPasswordDialogOpen(false);
            passwordResetForm.reset();
            toast.success("Passwort erfolgreich aktualisiert!");
        }, 1500);
    }

    function handleDeleteAccount() {
        setIsDeleteAccountLoading(true);
        // Simuliert einen API-Aufruf zum Löschen des Accounts
        setTimeout(() => {
            console.log("Deleting account for user:", user.id);
            setIsDeleteAccountLoading(false);
            setIsDeleteAccountDialogOpen(false);
            toast.success("Konto wurde erfolgreich gelöscht!");
            // Zum Login weiterleiten
            router.push("/login");
        }, 2000);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <>
            <SiteHeader actions={[]}>
                Benutzerprofil
            </SiteHeader>

            <div className="flex w-full justify-center space-y-6 p-4 md:p-6">
                <div className="container max-w-2xl">
                    <div className="space-y-8">
                        {/* User Profile Header */}
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profilbild" />
                                <AvatarFallback>
                                    <User className="h-10 w-10" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-medium mb-1">
                                    {user.firstName} {user.lastName}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {user.role == "0" && <Badge variant="outline">Admin</Badge>}
                                    <Badge variant="outline">{user.orgRole || "Nutzer" }</Badge>
                                </div>
                               
                            </div>
                        </div>

                        {/* Organization Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Organisation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage
                                            src={user.organization.profilePicture || "/placeholder.svg"}
                                            alt={user.organization.name}
                                        />
                                        <AvatarFallback>
                                            <Building className="h-7 w-7" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">{user.organization.name}</h3>
                                        <p className="text-sm text-muted-foreground">ID: {user.organization.id}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Form */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Persönliche Informationen</CardTitle>
                                <CardDescription>Aktualisieren Sie Ihre Profildaten unten</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Vorname</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Vorname" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nachname</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nachname" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>E-Mail</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@beispiel.de" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Account Information */}
                                        <div className="pt-2 border-t">
                                            <h3 className="text-sm font-medium mb-3">Kontoinformationen</h3>
                                            <div className="grid gap-3 text-sm">
                                                <div className="grid grid-cols-2">
                                                    <span className="text-muted-foreground">Benutzer-ID:</span>
                                                    <span>{user.id}</span>
                                                </div>
                                                <div className="grid grid-cols-2">
                                                    <span className="text-muted-foreground">Erstellt am:</span>
                                                    <span>{formatDate(user.createdAt)}</span>
                                                </div>
                                                <div className="grid grid-cols-2">
                                                    <span className="text-muted-foreground">Zuletzt aktualisiert:</span>
                                                    <span>{formatDate(user.updatedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4 flex justify-between">
                                <Button variant="outline" onClick={() => router.back()}>
                                    Abbrechen
                                </Button>
                                <div className="flex gap-3">
                                    <Button variant="destructive" onClick={handleSignOut}>
                                        Abmelden
                                    </Button>
                                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                                        {isLoading ? "Speichern..." : "Änderungen speichern"}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Password Reset Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Passwort & Sicherheit</CardTitle>
                                <CardDescription>Verwalten Sie Ihre Anmeldedaten</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Passwort ändern</h3>
                                        <p className="text-sm text-muted-foreground">Aktualisieren Sie Ihr aktuelles Passwort</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsPasswordDialogOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <KeyRound className="h-4 w-4" />
                                        Passwort zurücksetzen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Password Reset Dialog */}
                        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Passwort zurücksetzen</DialogTitle>
                                    <DialogDescription>
                                        Bitte geben Sie Ihr aktuelles Passwort und das neue Passwort ein.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...passwordResetForm}>
                                    <form onSubmit={passwordResetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                                        <FormField
                                            control={passwordResetForm.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Aktuelles Passwort</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Aktuelles Passwort" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordResetForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Neues Passwort</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Neues Passwort" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordResetForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Neues Passwort bestätigen</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Neues Passwort bestätigen" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                                Abbrechen
                                            </Button>
                                            <Button type="submit" disabled={isPasswordResetLoading}>
                                                {isPasswordResetLoading ? "Speichern..." : "Passwort zurücksetzen"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        {/* Account Delete Card */}
                        <Card className="border-destructive/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-destructive">Konto löschen</CardTitle>
                                <CardDescription>Löschen Sie Ihr Konto dauerhaft</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Konto dauerhaft löschen</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht.
                                        </p>
                                    </div>
                                    <Button 
                                        variant="destructive"
                                        onClick={() => setIsDeleteAccountDialogOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Trash className="h-4 w-4" />
                                        Konto löschen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Delete Confirmation Dialog */}
                        <AlertDialog 
                            open={isDeleteAccountDialogOpen}
                            onOpenChange={setIsDeleteAccountDialogOpen}
                        >
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Konto dauerhaft löschen
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Sind Sie sicher, dass Sie Ihr Konto dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                                        Alle Ihre Daten, einschließlich Profildaten und persönlicher Informationen, werden dauerhaft gelöscht.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleteAccountLoading}>
                                        Abbrechen
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        disabled={isDeleteAccountLoading}
                                    >
                                        {isDeleteAccountLoading ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                                                Löschen...
                                            </>
                                        ) : (
                                            "Konto löschen"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </>
    )
}
