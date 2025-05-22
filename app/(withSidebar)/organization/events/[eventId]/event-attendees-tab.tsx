"use client";;
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

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
} from "lucide-react";

import { EventDetails, User } from "@/lib/types-old";
import { Textarea } from "@/components/ui/textarea";

// Attendee status types
type AttendeeStatus = "attending" | "pending" | "declined" | "cancelled";

interface Attendee extends User {
    status: AttendeeStatus;
    registeredAt: Date;
    checkedIn: boolean;
    notes?: string;
}

// Mock attendees with additional properties
const generateMockAttendees = (baseUsers: User[]): Attendee[] => {
    const statuses: AttendeeStatus[] = ["attending", "pending", "declined", "cancelled"];

    return baseUsers.concat([
        {
            id: "3",
            name: "Michael Johnson",
            email: "michael@example.com",
            createdAt: "2023-03-12",
            updatedAt: "2023-03-12",
            profilePicture: "",
        },
        {
            id: "4",
            name: "Sarah Williams",
            email: "sarah@example.com",
            createdAt: "2023-04-05",
            updatedAt: "2023-04-05",
            profilePicture: "",
        },
        {
            id: "5",
            name: "Robert Brown",
            email: "robert@example.com",
            createdAt: "2023-02-20",
            updatedAt: "2023-02-20",
            profilePicture: "",
        }
    ]).map((user, idx) => ({
        ...user,
        status: statuses[idx % statuses.length],
        registeredAt: new Date(),
        checkedIn: idx % 3 === 0
    }));
};

// Helper functions
const getStatusBadge = (status: AttendeeStatus) => {
    switch (status) {
        case "attending":
            return <Badge className="bg-green-500 hover:bg-green-600">Teilnehmend</Badge>;
        case "pending":
            return <Badge variant="outline" className="text-amber-600 border-amber-600">Ausstehend</Badge>;
        case "declined":
            return <Badge variant="destructive">Abgelehnt</Badge>;
        case "cancelled":
            return <Badge variant="secondary">Storniert</Badge>;
        default:
            return <Badge variant="outline">Unbekannt</Badge>;
    }
};

// Main component
export default function EventAttendeesTab({ eventDetails }: { eventDetails: EventDetails }) {
    const router = useRouter();
    const eventId = eventDetails.metadata.id;
    const event = eventDetails.metadata;

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<string | null>(null);
    const [attendees, setAttendees] = useState<Attendee[]>(generateMockAttendees(eventDetails.attendees));
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    // Calculate attendance statistics
    const attendingCount = attendees.filter(a => a.status === "attending").length;
    const pendingCount = attendees.filter(a => a.status === "pending").length;
    const declinedCount = attendees.filter(a => a.status === "declined").length;
    const cancelledCount = attendees.filter(a => a.status === "cancelled").length;
    const checkedInCount = attendees.filter(a => a.checkedIn).length;

    const attendancePercentage = Math.round((attendingCount / event.capacity) * 100);

    // Filter attendees based on search and status filter
    const filteredAttendees = useMemo(() => {
        let result = attendees;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                a => a.name.toLowerCase().includes(query) ||
                    a.email.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (activeTab !== "all") {
            if (activeTab === "checked-in") {
                result = result.filter(a => a.checkedIn);
            } else {
                result = result.filter(a => a.status === activeTab);
            }
        }

        return result;
    }, [attendees, searchQuery, activeTab]);

    // Handler functions
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedAttendees(filteredAttendees.map(a => a.id));
        } else {
            setSelectedAttendees([]);
        }
    };

    const handleSelectAttendee = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedAttendees(prev => [...prev, id]);
        } else {
            setSelectedAttendees(prev => prev.filter(attendeeId => attendeeId !== id));
        }
    };



    const handleRemoveAttendees = () => {
        // In a real app, you'd call an API to remove the attendees
        setAttendees(prev => prev.filter(a => !selectedAttendees.includes(a.id)));
        setSelectedAttendees([]);
        setIsDeleteDialogOpen(false);

        toast.success(`${selectedAttendees.length} Teilnehmer wurden entfernt`);
    };

    const handleUpdateStatus = (id: string, newStatus: AttendeeStatus) => {
        // In a real app, you'd call an API to update the status
        setAttendees(prev => prev.map(a =>
            a.id === id ? { ...a, status: newStatus } : a
        ));

        toast.success("Teilnehmerstatus wurde aktualisiert");
    };




    return (
        <div className="flex flex-1 flex-col space-y-6">
            {/* Header with back button and title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">

                <ActionButtons attendees={attendees} setAttendees={setAttendees}  />

            </div>

            {/* Statistics Cards */}
            <div className="flex w-full flex-wrap gap-4">
                <Card className="grow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Gesamte Teilnehmer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">{attendingCount}</div>
                            <div className="text-sm text-muted-foreground">von {event.capacity} Plätzen</div>
                        </div>
                        <Progress
                            value={attendancePercentage}
                            className="h-2 mt-2"
                            aria-label={`${attendancePercentage}% besetzt`}
                        />
                    </CardContent>
                </Card>

                <Card className="grow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ausstehende Antworten
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        {pendingCount > 0 && (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                                Ausstehend
                            </Badge>
                        )}
                    </CardContent>
                </Card>



                <Card className="grow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Absagen / Stornierungen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{declinedCount + cancelledCount}</div>
                        {attendees.length > 0 && (
                            <Badge variant="secondary">
                                {Math.round(((declinedCount + cancelledCount) / attendees.length) * 100)}%
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tabs, Search and Filter */}
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
                                <span>Teilnehmend ({attendingCount})</span>
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="flex gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Ausstehend ({pendingCount})</span>
                            </TabsTrigger>

                        </TabsList>
                    </Tabs>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Teilnehmer suchen..."
                                className="pl-8 w-full md:w-[250px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendees Table */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <CardTitle>Teilnehmerliste</CardTitle>
                        {selectedAttendees.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedAttendees([])}
                                    size="sm"
                                >
                                    Auswahl aufheben ({selectedAttendees.length})
                                </Button>
                                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Entfernen
                                    </Button>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Teilnehmer entfernen</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Du bist dabei, {selectedAttendees.length} Teilnehmer zu entfernen.
                                                Diese Aktion kann nicht rückgängig gemacht werden.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-2 sm:gap-0">
                                            <AlertDialogCancel className="w-full sm:w-auto">Abbrechen</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleRemoveAttendees}
                                                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Entfernen
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                    <CardDescription className="mt-2">
                        {filteredAttendees.length} Teilnehmer werden angezeigt
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={
                                                    filteredAttendees.length > 0 &&
                                                    selectedAttendees.length === filteredAttendees.length
                                                }
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
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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
                                        filteredAttendees.map((attendee) => (
                                            <TableRow key={attendee.id} className="group">
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedAttendees.includes(attendee.id)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectAttendee(attendee.id, checked as boolean)
                                                        }
                                                        aria-label={`${attendee.name} auswählen`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={attendee.profilePicture || ""} alt={attendee.name} />
                                                            <AvatarFallback>{attendee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{attendee.name}</div>
                                                            <div className="text-sm text-muted-foreground">{attendee.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(attendee.status)}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell whitespace-nowrap">
                                                    {format(new Date(attendee.registeredAt), "dd.MM.yyyy, HH:mm")}
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
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(attendee.id, "attending")}>
                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                Als teilnehmend markieren
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(attendee.id, "declined")}>
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
                                                                    setSelectedAttendees([attendee.id]);
                                                                    setIsDeleteDialogOpen(true);
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
    );
}

function ActionButtons({ attendees, setAttendees }: { attendees: Attendee[]; setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>> }) {

    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteEmails, setInviteEmails] = useState("");

    
    const exportAttendees = () => {
        // In a real app, you would generate a CSV or Excel file
        toast.info("Teilnehmerliste wird exportiert...");

        try {
            // Put attendees data into CSV format
            const csvContent = `data:text/csv;charset=utf-8,${attendees.map(attendee => `${attendee.name},${attendee.email},${attendee.status},${attendee.registeredAt}`).join("\n")}`;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "attendees.csv");
            document.body.appendChild(link); // Required for FF
            link.click(); // This will download the file
            document.body.removeChild(link); // Clean up the link element
            
            
            
            // Mock download delay
            toast.success("Teilnehmerliste wurde heruntergeladen");
        }
        catch (error) {
            toast.error("Fehler beim Exportieren der Teilnehmerliste");
        }
    };

    const handleInviteAttendees = () => {
        // Split emails by comma, newline, or semicolon
        const emails = inviteEmails
            .split(/[,;\n]/)
            .map(email => email.trim())
            .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

        if (emails.length === 0) {
            toast.error("Bitte gib mindestens eine gültige E-Mail-Adresse ein");
            return;
        }

        // In a real app, you'd call an API to send invitations
        toast.success(`${emails.length} Einladungen wurden erfolgreich versendet`);
        setIsInviteDialogOpen(false);
        setInviteEmails("");

        // Add invited users to the attendees list with "pending" status
        const newAttendees: Attendee[] = emails.map((email, idx) => ({
            id: `new-${Date.now()}-${idx}`,
            name: email.split('@')[0], // Use part before @ as temporary name
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profilePicture: "",
            status: "pending",
            registeredAt: new Date(),
            checkedIn: false
        }));

        setAttendees(prev => [...prev, ...newAttendees]);
    };

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
                            Gib die E-Mail-Adressen der Personen ein, die du einladen möchtest.
                            Trenne mehrere E-Mails durch Komma, Semikolon oder Zeilenumbruch.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="invite-emails" className="text-sm font-medium">E-Mail-Adressen</label>
                            <Textarea
                                id="invite-emails"
                                placeholder="z.B. email@beispiel.de, email2@beispiel.de"
                                value={inviteEmails}
                                onChange={(e) => setInviteEmails(e.target.value)}
                                className="min-h-[100px] resize-y"

                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="template-select" className="text-sm font-medium">Einladungsvorlage</label>
                            <Select>
                                <SelectTrigger id="template-select">
                                    <SelectValue placeholder="Einladungsvorlage wählen" />
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
                            <Button variant="outline" className="w-full sm:w-auto">Abbrechen</Button>
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