"use client"

import type React from "react"

import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateInputProps {
  id?: string
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  error?: string | null
  placeholder?: string
}

export default function DateInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "TT.MM.JJJJ",
}: DateInputProps) {
  return (
    <div>
      {/* Optionales Label für das Eingabefeld */}
      {label && (
        <Label htmlFor={id} className="text-xs mb-1 block">
          {label}
        </Label>
      )}
      <div className="relative">
        {/* Eingabefeld für das Datum */}
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={error ? "border-destructive" : ""}
          maxLength={10} // Begrenze die Eingabe auf 10 Zeichen (TT.MM.JJJJ)
          onBlur={onBlur}
        />
        {/* Kalender-Icon rechts im Eingabefeld */}
        <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      {/* Fehlermeldung anzeigen, falls vorhanden */}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

