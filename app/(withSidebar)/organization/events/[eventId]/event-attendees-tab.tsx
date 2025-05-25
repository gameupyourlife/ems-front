"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

// React Query Hook für Live-Daten
import { useGetEventAttendees } from "@/lib/backend/hooks/events"

// UI Komponenten
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Icons
import {
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
  UserCheck,
  Clock,
  FileText,
  SendIcon,
  Download,
} from "lucide-react"

// Typen aus deinem Code
import type { EventDetails, User } from "@/lib/types-old"

// Teilnehmer-Status-Typ
type AttendeeStatus = "attending" | "pending" | "declined" | "cancelled"

interface Attendee extends User {
  status: AttendeeStatus
  registeredAt: string | Date
  checkedIn: boolean
  notes?: string
}

// Hilfsfunktion für Status-Badges
const getStatusBadge = (status: AttendeeStatus) => {
  switch (status) {
    case "attending":
      return <Badge className="bg-green-500 hover:bg-green-600">Teilnehmend</Badge>
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-600">
          Ausstehend
        </Badge>
      )
    case "declined":
      return <Badge variant="destructive">Abgelehnt</Badge>
    case "cancelled":
      return <Badge variant="secondary">Storniert</Badge>
    default:
      return <Badge variant="outline">Unbekannt</Badge>
  }
}

// Haupt-Komponente
export default function EventAttendeesTab({ eventDetails }: { eventDetails: EventDetails }) {
  const router = useRouter()
  const { data: session } = useSession()

  // Alle Hooks MÜSSEN an der gleichen Stelle und in der gleichen Reihenfolge stehen
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Stabilisiere die Session-Werte um Re-Renders zu vermeiden
  const stableToken = useMemo(() => session?.user?.jwt, [session?.user?.jwt])
  const stableOrgId = useMemo(() => session?.user?.organization?.id, [session?.user?.organization?.id])
  const stableEventId = useMemo(() => eventDetails?.metadata?.id, [eventDetails?.metadata?.id])
  const stableCapacity = useMemo(() => eventDetails?.metadata?.capacity || 0, [eventDetails?.metadata?.capacity])

  // Session-Daten extrahieren (nach allen useState Hooks)
  const token = session?.user?.jwt
  const orgId = session?.user?.organization?.id
  const eventId = eventDetails?.metadata?.id
  const capacity = eventDetails?.metadata?.capacity || 0

  // React Query Hook - MUSS immer aufgerufen werden
  const {
    data: fetched = [],
    isLoading,
    error,
  } = useGetEventAttendees(stableOrgId || "", stableEventId || "", stableToken || "")

  // useEffect für Daten-Transformation - mit stabiler Referenz-Prüfung
  useEffect(() => {
    if (fetched && Array.isArray(fetched) && fetched.length > 0) {
      // Prüfe ob sich die Daten wirklich geändert haben
      const currentIds = attendees
        .map((a) => a.id)
        .sort()
        .join(",")
      const fetchedIds = fetched
        .map((u) => u.id)
        .sort()
        .join(",")

      if (currentIds !== fetchedIds) {
        const transformedAttendees = fetched.map((u) => ({
          ...u,
          status: "attending" as AttendeeStatus,
          registeredAt: u.createdAt || new Date().toISOString(),
          checkedIn: false,
        }))
        setAttendees(transformedAttendees)
      }
    } else if (fetched && Array.isArray(fetched) && fetched.length === 0 && attendees.length > 0) {
      // Nur leeren wenn wir explizit eine leere Liste bekommen haben
      setAttendees([])
    }
  }, [fetched]) // Entferne attendees aus den Dependencies!

  // Memoized Berechnungen
  const statistics = useMemo(() => {
    const attendingCount = attendees.filter((a) => a.status === "attending").length
    const pendingCount = attendees.filter((a) => a.status === "pending").length
    const declinedCount = attendees.filter((a) => a.status === "declined").length
    const cancelledCount = attendees.filter((a) => a.status === "cancelled").length
    const checkedInCount = attendees.filter((a) => a.checkedIn).length
    const attendancePercentage = stableCapacity > 0 ? Math.round((attendingCount / stableCapacity) * 100) : 0

    return {
      attendingCount,
      pendingCount,
      declinedCount,
      cancelledCount,
      checkedInCount,
      attendancePercentage,
    }
  }, [attendees, stableCapacity])

  // Gefilterte Liste nach Suche & Tab
  const filteredAttendees = useMemo(() => {
    let result = attendees

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((a) => a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
    }

    if (activeTab !== "all") {
      if (activeTab === "checked-in") {
        result = result.filter((a) => a.checkedIn)
      } else {
        result = result.filter((a) => a.status === activeTab)
      }
    }

    return result
  }, [attendees, searchQuery, activeTab])

  // Callback-Handler
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedAttendees(checked ? filteredAttendees.map((a) => a.id) : [])
    },
    [filteredAttendees],
  )

  const handleSelectAttendee = useCallback((id: string, checked: boolean) => {
    setSelectedAttendees((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }, [])

  const handleRemoveAttendees = useCallback(() => {
    setAttendees((prev) => prev.filter((a) => !selectedAttendees.includes(a.id)))
    setSelectedAttendees([])
    setIsDeleteDialogOpen(false)
    toast.success(`${selectedAttendees.length} Teilnehmer entfernt`)
  }, [selectedAttendees])

  const handleUpdateStatus = useCallback((id: string, newStatus: AttendeeStatus) => {
    setAttendees((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
    toast.success("Status aktualisiert")
  }, [])

  // Early returns NACH allen Hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lädt Teilnehmer…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Fehler beim Laden der Teilnehmer</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Aktions-Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <ActionButtons attendees={attendees} setAttendees={setAttendees} />
      </div>

      {/* Statistik-Karten */}
      <div className="flex w-full flex-wrap gap-4">
        {/* Teilnehmer gesamt */}
        <Card className="grow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teilnehmend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{statistics.attendingCount}</div>
              <div className="text-sm text-muted-foreground">von {stableCapacity} Plätzen</div>
            </div>
            <Progress
              value={statistics.attendancePercentage}
              className="h-2 mt-2"
              aria-label={`${statistics.attendancePercentage}% besetzt`}
            />
          </CardContent>
        </Card>

        {/* Ausstehende Antworten */}
        <Card className="grow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ausstehend</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{statistics.pendingCount}</div>
            {statistics.pendingCount > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Ausstehend
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Absagen/Stornos */}
        <Card className="grow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absagen / Stornos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{statistics.declinedCount + statistics.cancelledCount}</div>
            {attendees.length > 0 && (
              <Badge variant="secondary">
                {Math.round(((statistics.declinedCount + statistics.cancelledCount) / attendees.length) * 100)}%
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Suche */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex sm:grid-cols-4">
              <TabsTrigger value="all" className="flex gap-2">
                <Users className="h-4 w-4" />
                <span>Alle ({attendees.length})</span>
              </TabsTrigger>
              <TabsTrigger value="attending" className="flex gap-2">
                <UserCheck className="h-4 w-4" />
                <span>Teilnehmend ({statistics.attendingCount})</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex gap-2">
                <Clock className="h-4 w-4" />
                <span>Ausstehend ({statistics.pendingCount})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Teilnehmer suchen..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Teilnehmer-Tabelle */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle>Teilnehmerliste</CardTitle>

            {selectedAttendees.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedAttendees([])}>
                  Auswahl aufheben ({selectedAttendees.length})
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Entfernen
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Teilnehmer entfernen</AlertDialogTitle>
                      <AlertDialogDescription>
                        Du bist dabei, {selectedAttendees.length} Teilnehmer zu entfernen. Diese Aktion kann nicht
                        rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel className="w-full sm:w-auto">Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleRemoveAttendees}
                      >
                        Entfernen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <CardDescription className="mt-2">{filteredAttendees.length} Teilnehmer werden angezeigt</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={filteredAttendees.length > 0 && selectedAttendees.length === filteredAttendees.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Alle Teilnehmer auswählen"
                      />
                    </TableHead>
                    <TableHead>Teilnehmer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Registriert am</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredAttendees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-8 w-8 opacity-40" />
                          <div className="font-medium">Keine Teilnehmer gefunden</div>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? "Versuche andere Suchbegriffe" : "Lade neue Teilnehmer ein"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendees.map((a) => (
                      <TableRow key={a.id} className="group">
                        <TableCell>
                          <Checkbox
                            checked={selectedAttendees.includes(a.id)}
                            onCheckedChange={(c) => handleSelectAttendee(a.id, c as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={a.profilePicture || "/placeholder.svg"} alt={a.name} />
                              <AvatarFallback>{a.name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{a.name}</div>
                              <div className="text-sm text-muted-foreground">{a.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell whitespace-nowrap">
                          {a.registeredAt && format(new Date(a.registeredAt), "dd.MM.yyyy, HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-70 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menü öffnen</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateStatus(a.id, "attending")}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Als teilnehmend markieren
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(a.id, "declined")}>
                                <X className="h-4 w-4 mr-2" />
                                Als abgelehnt markieren
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Teilnehmer kontaktieren
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Notizen bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                  setSelectedAttendees([a.id])
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Teilnehmer entfernen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ========================
// ActionButtons-Komponente
// ========================
function ActionButtons({
  attendees,
  setAttendees,
}: {
  attendees: Attendee[]
  setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>>
}) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmails, setInviteEmails] = useState("")

  // CSV-Export
  const exportAttendees = useCallback(() => {
    toast.info("Teilnehmerliste wird exportiert…")
    try {
      const csv = [
        ["Name", "E-Mail", "Status", "Registriert"],
        ...attendees.map((a) => [
          a.name || "",
          a.email || "",
          a.status || "",
          typeof a.registeredAt === "string" ? a.registeredAt : a.registeredAt?.toISOString() || "",
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "attendees.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Teilnehmerliste heruntergeladen")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Fehler beim Exportieren")
    }
  }, [attendees])

  // Einladen-Handler
  const handleInviteAttendees = useCallback(() => {
    const emails = inviteEmails
      .split(/[,;\n]/)
      .map((e) => e.trim())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

    if (emails.length === 0) {
      toast.error("Bitte mindestens eine gültige E-Mail eingeben")
      return
    }

    // TODO: API-Call zum Versenden der Einladungen
    toast.success(`${emails.length} Einladungen versendet`)
    setIsInviteDialogOpen(false)
    setInviteEmails("")

    const newAttendees: Attendee[] = emails.map((email, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: email.split("@")[0],
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profilePicture: "",
      status: "pending",
      registeredAt: new Date().toISOString(),
      checkedIn: false,
    }))
    setAttendees((prev) => [...prev, ...newAttendees])
  }, [inviteEmails, setAttendees])

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={exportAttendees} className="flex-1 sm:flex-auto">
        <Download className="h-4 w-4 mr-2" />
        Exportieren
      </Button>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex-1 sm:flex-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Teilnehmer einladen
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Teilnehmer einladen</DialogTitle>
            <DialogDescription>
              Gib die E-Mail-Adressen der Personen ein, die du einladen möchtest. Trenne mehrere E-Mails durch Komma,
              Semikolon oder Zeilenumbruch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="invite-emails" className="text-sm font-medium">
                E-Mail-Adressen
              </label>
              <Textarea
                id="invite-emails"
                placeholder="z.B. email@beispiel.de, email2@beispiel.de"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                className="min-h-[100px] resize-y"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="template-select" className="text-sm font-medium">
                Einladungsvorlage
              </label>
              <Select>
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Vorlage wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Einladung</SelectItem>
                  <SelectItem value="reminder">Erinnerung</SelectItem>
                  <SelectItem value="vip">VIP Einladung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Abbrechen
              </Button>
            </DialogClose>
            <Button onClick={handleInviteAttendees} className="w-full sm:w-auto">
              <SendIcon className="h-4 w-4 mr-2" />
              Einladungen senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
