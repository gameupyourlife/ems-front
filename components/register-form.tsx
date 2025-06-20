"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { registerAction } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

interface PasswordRequirement {
  text: string
  met: boolean
}

export function RegisterForm({ className, ...props }: React.ComponentProps<"form">) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const router = useRouter()

  const validatePassword = (password: string): PasswordRequirement[] => {
    return [
      {
        text: "Mindestens 8 Zeichen",
        met: password.length >= 8,
      },
      {
        text: "Großbuchstaben (A-Z)",
        met: /[A-Z]/.test(password),
      },
      {
        text: "Kleinbuchstaben (a-z)",
        met: /[a-z]/.test(password),
      },
      {
        text: "Mindestens eine Zahl (0-9)",
        met: /\d/.test(password),
      },
      {
        text: "Mindestens ein Sonderzeichen (!@#$%^&*)",
        met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      },
    ]
  }

  const passwordRequirements = validatePassword(password)
  const isPasswordValid = passwordRequirements.every((req) => req.met)

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={async (formData) => {
        setIsSubmitting(true)
        setError(null)

        try {
          const result = await registerAction(formData)
          if (!result.success && result.error) {
            setError(result.error)
            setIsSubmitting(false)
          } else {
            router.push("/login")
          }
        } catch (error) {
            console.error("Registration error:", error)
          setIsSubmitting(false)
        }
      }}
      onSubmit={() => setIsSubmitting(true)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Neues Konto anlegen</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Bitte gib deine persönlichen Daten ein, um ein Konto zu erstellen
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="firstName">Vorname</Label>
            <Input type="text" id="firstName" name="firstName" placeholder="Max" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lastName">Nachname</Label>
            <Input type="text" id="lastName" name="lastName" placeholder="Mustermann" required />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" name="email" placeholder="max.mustermann@example.com" required />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Passwort</Label>
          </div>
          <Input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {password && (
            <div className="mt-2 p-3 bg-muted/50 rounded-md">
              <p className="text-xs font-medium text-muted-foreground mb-2">Passwort-Anforderungen:</p>
              <div className="space-y-1">
                {passwordRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {requirement.met ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn(requirement.met ? "text-green-600" : "text-red-500")}>{requirement.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-destructive/10 text-destructive text-center p-2 rounded-md text-sm">{error}</div>}

        <Button type="submit" className="w-full" disabled={isSubmitting || (password.length > 0 && !isPasswordValid)}>
          {isSubmitting ? "Registriere..." : "Registrieren"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Du hast bereits ein Konto?{" "}
        <a href="/login" className="underline underline-offset-4">
          Anmelden
        </a>
      </div>
    </form>
  )
}
