"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logInActionPleaseCallThisOneToSetSession } from "@/lib/actions/auth";
import { useState } from "react";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    // const searchParams = useSearchParams()
    // const router = useRouter()
    // const redirectTo = searchParams.get("redirectTo") || "/"
    const [isSubmitting, setIsSubmitting] = useState(false)



    return (
        <form className={cn("flex flex-col gap-6", className)} action={logInActionPleaseCallThisOneToSetSession} onSubmit={() => setIsSubmitting(true)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">In dein Konto einloggen</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Gib deine Email-Adresse ein, um dich in dein Konto einzuloggen
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="credentials-email" name="email" placeholder="m@example.com" required />

                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Passwort</Label>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Passwort vergessen?
                        </a>
                    </div>
                    <Input type="password" id="credentials-password" name="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting} >
                    {isSubmitting ? "Melde an..." : "Anmelden"}
                </Button>
            </div>
            <div className="text-center text-sm">
                Du hast noch kein Konto?{" "}
                <a href="/register" className="underline underline-offset-4">
                    Registrieren
                </a>
            </div>
        </form>
    )
}
