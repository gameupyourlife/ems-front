"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { User, Building, AlertTriangle, Lock, Shield, Check, X, Upload, LogOut } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "next-themes"
import { SiteHeader } from "@/components/site-header"
import { deleteAccount, resetPasswort, updateUser } from "@/lib/backend/users"
import { useSession } from "next-auth/react"
import { logOutActionPleaseCallThisOneToUnsetSession } from "@/lib/actions/auth"


const profileFormSchema = z.object({
    firstName: z
        .string()
        .min(1, { message: "Vorname ist erforderlich." })
        .max(50, { message: "Vorname darf nicht länger als 50 Zeichen sein." }),
    lastName: z
        .string()
        .min(1, { message: "Nachname ist erforderlich." })
        .max(50, { message: "Nachname darf nicht länger als 50 Zeichen sein." }),
    email: z.string().min(1, { message: "E-Mail ist erforderlich." }).email("Dies ist keine gültige E-Mail-Adresse."),
})

const passwordFormSchema = z
    .object({
        currentPassword: z.string().min(1, { message: "Aktuelles Passwort ist erforderlich." }),
        newPassword: z
            .string()
            .min(8, { message: "Passwort muss mindestens 8 Zeichen lang sein." })
            .regex(/[A-Z]/, { message: "Passwort muss mindestens einen Großbuchstaben enthalten." })
            .regex(/[a-z]/, { message: "Passwort muss mindestens einen Kleinbuchstaben enthalten." })
            .regex(/[0-9]/, { message: "Passwort muss mindestens eine Zahl enthalten." }),
        confirmPassword: z.string().min(1, { message: "Bitte bestätigen Sie Ihr Passwort." }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwörter stimmen nicht überein.",
        path: ["confirmPassword"],
    })

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function ProfileEditPage() {
    const router = useRouter()
    const { theme } = useTheme()
    const [activeTab, setActiveTab] = useState("profile")
    const [isLoading, setIsLoading] = useState(false)
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [passwordStrength, setPasswordStrength] = useState(0)

    const { data: session, update } = useSession();
    const user = session?.user;

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
        },
        mode: "onChange",
    })

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
    })

    useEffect(() => {
        if (user)
            profileForm.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            })
    }, [user])


    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">Laden...</p>
            </div>
        )
    }

    function onProfileSubmit(data: ProfileFormValues) {
        setIsLoading(true)

        if (!user) {
            toast.error("Kein Benutzer angemeldet")
            router.push("/login")
            return
        }

        toast.promise(async () => {
            await updateUser(user.id, {
                // updatedAt: new Date().toISOString(),
                firstName: data.firstName,
                lastName: data.lastName,
                profilePicture: user.profilePicture,
                // email: data.email,
            }, user.jwt)
            await update()
        },
            {
                loading: "Aktualisiere Profil...",
                success: () => {
                    setIsLoading(false)
                    if (data.email !== user.email)
                        return "E-Mail kann nicht aktualisiert werden. Der Rest wurde erfolgreich aktualisiert."
                    return "Profil erfolgreich aktualisiert."
                },
                error: (error) => {
                    console.error("Error updating profile:", error)
                    setIsLoading(false)
                    return "Fehler beim Aktualisieren des Profils."
                },
            },
        )


    }

    function onPasswordSubmit(data: PasswordFormValues) {
        if (!user) {
            toast.error("Kein Benutzer angemeldet")
            router.push("/login")
            return
        }

        setIsPasswordLoading(true)

        toast.promise(resetPasswort(
            user.email, passwordForm.getValues("newPassword"), passwordForm.getValues("confirmPassword"), user.jwt
        ),
            {
                loading: "Passwort wird aktualisiert...",
                success: () => {
                    setIsPasswordLoading(false)
                    return "Passwort erfolgreich aktualisiert."
                },
                error: (error) => {
                    console.error("Error updating password:", error)
                    setIsPasswordLoading(false)
                    return "Fehler beim Aktualisieren des Passworts."
                },
            },
        )

    }

    function handleDeleteAccount() {
        // In a real app, this would call your API to delete the account
        // console.log("Deleting account:", user?.id)

        if (!user) {
            toast.error("Kein Benutzer angemeldet")
            router.push("/login")
            return
        }

        toast.promise(
            deleteAccount(user.id, user.jwt),
            {
                loading: "Konto wird gelöscht...",
                success: () => {
                    setDeleteConfirmText("")
                    router.push("/register")
                    return "Konto erfolgreich gelöscht."
                },
                error: (error) => {
                    console.error("Error deleting account:", error)
                    return "Fehler beim Löschen des Kontos."
                },
            },
        )
    }

    function calculatePasswordStrength(password: string) {
        if (!password) return 0

        let strength = 0

        // Length check
        if (password.length >= 8) strength += 25

        // Character type checks
        if (/[A-Z]/.test(password)) strength += 25
        if (/[a-z]/.test(password)) strength += 25
        if (/[0-9]/.test(password)) strength += 25

        return strength
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value
        passwordForm.setValue("newPassword", newPassword)
        setPasswordStrength(calculatePasswordStrength(newPassword))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getStrengthColor = (strength: number) => {
        if (strength === 0) return "bg-gray-200 dark:bg-neutral-700"
        if (strength < 50) return "bg-red-500"
        if (strength < 100) return "bg-yellow-500"
        return "bg-green-500"
    }

    const getStrengthText = (strength: number) => {
        if (strength === 0) return "Nicht bewertet"
        if (strength < 50) return "Schwach"
        if (strength < 100) return "Mittel"
        return "Stark"
    }

    return <>

        <SiteHeader actions={[]}>
            Kontoeinstellungen
        </SiteHeader>

        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Header */}
                <div className="md:w-1/3">
                    <div className="sticky top-8 space-y-6">
                        <Card className="border ">
                            <CardContent className="p-6 flex flex-col items-center">
                                <div className="relative mb-4 group">
                                    <Avatar className="h-24 w-24 border-background shadow-md">
                                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profilbild" />
                                        <AvatarFallback>
                                            <User className="h-12 w-12" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-white">
                                            <Upload className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold mb-1">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-muted-foreground text-sm mb-3">{user.email}</p>
                                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                                    <Badge variant="secondary" className="rounded-full px-3">
                                        {user.role}
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full px-3">
                                        {user.orgRole}
                                    </Badge>
                                </div>
                                <div className="w-full pt-4 border-t ">
                                    <p className="text-sm text-center text-muted-foreground mb-1">Mitglied seit</p>
                                    <p className="text-sm font-medium text-center">{formatDate(user.createdAt)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border ">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center">
                                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Organisation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={user.organization?.profilePicture || "/placeholder.svg"}
                                            alt={user.organization?.name}
                                        />
                                        <AvatarFallback>
                                            <Building className="h-6 w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-medium">{user.organization?.name}</h4>
                                        <p className="text-xs text-muted-foreground">ID: {user.organization?.id}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button variant="outline" className="w-full justify-start" onClick={logOutActionPleaseCallThisOneToUnsetSession}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Abmelden
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* <Card className="mb-6 border ">
                        <CardHeader>
                            <CardTitle>Kontoeinstellungen</CardTitle>
                            <CardDescription>
                                Verwalten Sie Ihre persönlichen Informationen und Sicherheitseinstellungen
                            </CardDescription>
                        </CardHeader>
                    </Card> */}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger
                                value="profile"
                                className="h-fit"
                            >
                                <User className="h-4 w-4 mr-2" />
                                Profil
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="h-fit"
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Sicherheit
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="space-y-6">
                            <Card className="border ">
                                <CardHeader>
                                    <CardTitle>Persönliche Informationen</CardTitle>
                                    <CardDescription>Aktualisieren Sie Ihre persönlichen Daten</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...profileForm}>
                                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <FormField
                                                    control={profileForm.control}
                                                    name="firstName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Vorname</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Vorname" {...field} className="h-10" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={profileForm.control}
                                                    name="lastName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nachname</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Nachname" {...field} className="h-10" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={profileForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>E-Mail</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="email@beispiel.de" {...field} className="h-10" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Account Information */}
                                            <div className="pt-4 mt-4 border-t ">
                                                <h3 className="text-sm font-medium mb-3">Kontoinformationen</h3>
                                                <div className="grid gap-3 text-sm bg-muted/50 dark:bg-neutral-800 p-3 rounded-md">
                                                    <div className="grid grid-cols-2">
                                                        <span className="text-muted-foreground">Benutzer-ID:</span>
                                                        <span className="font-mono text-xs">{user.id}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2">
                                                        <span className="text-muted-foreground">Erstellt am:</span>
                                                        <span>{formatDate(user.createdAt)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2">
                                                        <span className="text-muted-foreground">Letzte Aktualisierung:</span>
                                                        <span>{formatDate(user.updatedAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                                <CardFooter className="border-t  px-6 py-4 flex justify-between">
                                    <Button variant="outline" onClick={() => router.back()}>
                                        Abbrechen
                                    </Button>
                                    <Button
                                        onClick={profileForm.handleSubmit(onProfileSubmit)}
                                        disabled={isLoading}
                                        className="min-w-[120px]"
                                    >
                                        {isLoading ? "Speichern..." : "Änderungen speichern"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                            {/* Password Reset */}
                            <Card className="border ">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Lock className="h-5 w-5 mr-2 text-muted-foreground" />
                                        Passwort ändern
                                    </CardTitle>
                                    <CardDescription>Aktualisieren Sie Ihr Passwort, um Ihr Konto zu schützen</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...passwordForm}>
                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                                            <FormField
                                                control={passwordForm.control}
                                                name="currentPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Aktuelles Passwort</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" {...field} className="h-10" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={passwordForm.control}
                                                name="newPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Neues Passwort</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                {...field}
                                                                className="h-10"
                                                                onChange={handlePasswordChange}
                                                            />
                                                        </FormControl>
                                                        <div className="mt-2 space-y-2">
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span>Passwortstärke</span>
                                                                    <span>{getStrengthText(passwordStrength)}</span>
                                                                </div>
                                                                <Progress
                                                                    value={passwordStrength}
                                                                    className={`h-1.5 ${getStrengthColor(passwordStrength)}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    {/^.{8,}$/.test(field.value) ? (
                                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                                    ) : (
                                                                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    )}
                                                                    <span
                                                                        className={
                                                                            /^.{8,}$/.test(field.value)
                                                                                ? "text-green-700 dark:text-green-500"
                                                                                : "text-muted-foreground"
                                                                        }
                                                                    >
                                                                        Mindestens 8 Zeichen
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    {/[A-Z]/.test(field.value) ? (
                                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                                    ) : (
                                                                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    )}
                                                                    <span
                                                                        className={
                                                                            /[A-Z]/.test(field.value)
                                                                                ? "text-green-700 dark:text-green-500"
                                                                                : "text-muted-foreground"
                                                                        }
                                                                    >
                                                                        Mindestens ein Großbuchstabe
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    {/[a-z]/.test(field.value) ? (
                                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                                    ) : (
                                                                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    )}
                                                                    <span
                                                                        className={
                                                                            /[a-z]/.test(field.value)
                                                                                ? "text-green-700 dark:text-green-500"
                                                                                : "text-muted-foreground"
                                                                        }
                                                                    >
                                                                        Mindestens ein Kleinbuchstabe
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    {/[0-9]/.test(field.value) ? (
                                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                                    ) : (
                                                                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    )}
                                                                    <span
                                                                        className={
                                                                            /[0-9]/.test(field.value)
                                                                                ? "text-green-700 dark:text-green-500"
                                                                                : "text-muted-foreground"
                                                                        }
                                                                    >
                                                                        Mindestens eine Zahl
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={passwordForm.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passwort bestätigen</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" {...field} className="h-10" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </form>
                                    </Form>
                                </CardContent>
                                <CardFooter className="border-t  px-6 py-4 flex justify-end">
                                    <Button
                                        onClick={passwordForm.handleSubmit(onPasswordSubmit)}
                                        disabled={isPasswordLoading}
                                        className="min-w-[150px]"
                                    >
                                        {isPasswordLoading ? "Aktualisiere..." : "Passwort aktualisieren"}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Danger Zone - Account Deletion */}
                            <Card className="border border-red-200 dark:border-red-900/50">
                                <CardHeader className="pb-3 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
                                    <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
                                        Gefahrenbereich
                                    </CardTitle>
                                    <CardDescription className="text-red-700/70 dark:text-red-400/70">
                                        Aktionen in diesem Bereich können nicht rückgängig gemacht werden
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium mb-2">Konto löschen</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Wenn Sie Ihr Konto löschen, gibt es kein Zurück mehr. Diese Aktion ist dauerhaft und entfernt
                                                alle Ihre Daten von unseren Servern.
                                            </p>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
                                                    >
                                                        Konto löschen
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Diese Aktion kann nicht rückgängig gemacht werden. Dies wird Ihr Konto dauerhaft löschen
                                                            und alle Ihre Daten von unseren Servern entfernen.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="py-4">
                                                        <p className="text-sm font-medium mb-2">
                                                            Geben Sie zur Bestätigung &quot;{user.firstName.toLowerCase()}-{user.id}&quot; ein:
                                                        </p>
                                                        <Input
                                                            value={deleteConfirmText}
                                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                            placeholder={`${user.firstName.toLowerCase()}-${user.id}`}
                                                            className="mb-2"
                                                        />
                                                    </div>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleDeleteAccount}
                                                            disabled={deleteConfirmText !== `${user.firstName.toLowerCase()}-${user.id}`}
                                                            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
                                                        >
                                                            Konto löschen
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>

    </>;
}
