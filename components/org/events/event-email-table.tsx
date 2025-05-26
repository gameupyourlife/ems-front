"use client";;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronRight, Trash, ArrowUpDown, Mail as MailIcon, Copy } from "lucide-react";
import Link from "next/link";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    VisibilityState,
    getFacetedRowModel,
    getFacetedUniqueValues,
} from "@tanstack/react-table";

import { format } from "date-fns";
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
import { Mail } from "@/lib/backend/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useMailTemplates } from "@/lib/backend/hooks/use-mail-templates";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface EmailTableProps {
    emails: Mail[];
    eventId: string;
    onDeleteEmail?: (emailId: string) => void;
    onSendEmail?: (emailId: string) => void;
}

export default function EmailTable({ emails, eventId, onDeleteEmail, onSendEmail }: EmailTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [emailToSend, setEmailToSend] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const router = useRouter();
    const { data: session } = useSession();
    const { data: mailTemplates, isLoading: isLoadingTemplates } = useMailTemplates(session?.user?.organization.id || "", session?.user?.jwt || "");

    // Define the columns for the table
    const columns: ColumnDef<Mail>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Alle auswählen"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Zeile auswählen"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "subject",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Betreff
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.subject}</div>
            ),
        },
        // {
        //     accessorKey: "recipients",
        //     header: "Empfänger",
        //     cell: ({ row }) => {
        //         const recipients = row.original.recipients;
        //         console.log("row.original", row.original)
        //         const count = recipients.length;

        //         return (
        //             <TooltipProvider>
        //                 <Tooltip>
        //                     <TooltipTrigger className="cursor-default">
        //                         <div className="max-w-[150px] truncate">
        //                             {count === 1
        //                                 ? recipients[0]
        //                                 : `${recipients[0]} ${count > 1 ? `+ ${count - 1} weitere` : ""}`}
        //                         </div>
        //                     </TooltipTrigger>
        //                     <TooltipContent>
        //                         <div className="max-w-[300px] space-y-1 text-xs">
        //                             {recipients.map((recipient, index) => (
        //                                 <div key={index}>{recipient}</div>
        //                             ))}
        //                         </div>
        //                     </TooltipContent>
        //                 </Tooltip>
        //             </TooltipProvider>
        //         );
        //     },
        // },
        // {
        //     accessorKey: "status",
        //     header: "Status",
        //     cell: ({ row }) => getStatusBadge(row.original.status),
        //     filterFn: (row, id, value) => {
        //         return value.includes(row.getValue(id));
        //     },
        // },
        // {
        //     accessorKey: "scheduledFor",
        //     header: ({ column }) => (
        //         <Button
        //             variant="ghost"
        //             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        //         >
        //             Scheduled For
        //             <ArrowUpDown className="ml-2 h-4 w-4" />
        //         </Button>
        //     ),
        //     cell: ({ row }) => {
        //         const value = row.original.scheduledFor;
        //         return value ? (
        //             <div className="flex items-center">
        //                 <Clock className="mr-2 h-4 w-4 text-gray-500" />
        //                 {format(new Date(value), "MMM dd, yyyy HH:mm")}
        //             </div>
        //         ) : (
        //             <div className="text-gray-500">—</div>
        //         );
        //     },
        // },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Erstellt am
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                return <div className="text-sm">{format(new Date(row.original.createdAt), "dd. MMM yyyy")}</div>;
            },
        },
        {
            id: "actions",
            header: "Aktionen",
            cell: ({ row }) => {
                const email = row.original;

                return (
                    <div className="flex justify-end">
                        {/* {email.status === "draft" && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600"
                                onClick={() => {
                                    setEmailToSend(email.id);
                                    setSendDialogOpen(true);
                                }}
                            >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Senden</span>
                            </Button>
                        )} */}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                        >
                            <Link href={`/organization/events/${eventId}/emails/${email.id}`}>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Anzeigen</span>
                            </Link>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Menü öffnen</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {/* {email.status === "draft" && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/organization/events/${eventId}/emails/${email.id}/edit`} className="flex cursor-pointer">
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Email bearbeiten</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )} */}

                                <DropdownMenuItem asChild>
                                    <Link href={`/organization/events/${eventId}/emails/create?mailIdToDuplicate=${email.id}`} className="flex cursor-pointer">
                                        <Copy className="mr-2 h-4 w-4" />
                                        <span>Duplizieren</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => {
                                        setEmailToDelete(email.id);
                                        setDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Email löschen</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Erstelle die Tabelleninstanz
    const table = useReactTable({
        data: emails,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    // Behandelt die globale Suche
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Filtert die Betreff-Spalte
        table.getColumn("subject")?.setFilterValue(value);
    };

    // Bestätigt das Löschen einer E-Mail
    const handleDeleteConfirm = () => {
        if (emailToDelete && onDeleteEmail) {
            onDeleteEmail(emailToDelete);
        }
        setDeleteDialogOpen(false);
        setEmailToDelete(null);
    };

    // Bestätigt das Senden einer E-Mail
    const handleSendConfirm = () => {
        if (emailToSend && onSendEmail) {
            onSendEmail(emailToSend);
        }
        setSendDialogOpen(false);
        setEmailToSend(null);
    };

    // Redirect to create email page
    const handleCreateNew = () => {
        window.location.href = `/organization/events/${eventId}/emails/create`;
        setIsCreateDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="E-Mails durchsuchen..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="max-w-sm"
                    />

                    {/* <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1">
                                <FilterIcon className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Status filtern..." />
                                <CommandList>
                                    <CommandGroup heading="Status">
                                        <CommandItem
                                            onSelect={() => {
                                                const value = table.getColumn("status")?.getFilterValue() as string[] || [];
                                                if (value.includes("draft")) {
                                                    table.getColumn("status")?.setFilterValue(value.filter(item => item !== "draft"));
                                                } else {
                                                    table.getColumn("status")?.setFilterValue([...value, "draft"]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={(table.getColumn("status")?.getFilterValue() as string[] || []).includes("draft")}
                                                />
                                                <span>Entwurf</span>
                                            </div>
                                        </CommandItem>
                                        <CommandItem
                                            onSelect={() => {
                                                const value = table.getColumn("status")?.getFilterValue() as string[] || [];
                                                if (value.includes("scheduled")) {
                                                    table.getColumn("status")?.setFilterValue(value.filter(item => item !== "scheduled"));
                                                } else {
                                                    table.getColumn("status")?.setFilterValue([...value, "scheduled"]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={(table.getColumn("status")?.getFilterValue() as string[] || []).includes("scheduled")}
                                                />
                                                <span>Geplant</span>
                                            </div>
                                        </CommandItem>
                                        <CommandItem
                                            onSelect={() => {
                                                const value = table.getColumn("status")?.getFilterValue() as string[] || [];
                                                if (value.includes("sent")) {
                                                    table.getColumn("status")?.setFilterValue(value.filter(item => item !== "sent"));
                                                } else {
                                                    table.getColumn("status")?.setFilterValue([...value, "sent"]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={(table.getColumn("status")?.getFilterValue() as string[] || []).includes("sent")}
                                                />
                                                <span>Gesendet</span>
                                            </div>
                                        </CommandItem>
                                        <CommandItem
                                            onSelect={() => {
                                                const value = table.getColumn("status")?.getFilterValue() as string[] || [];
                                                if (value.includes("failed")) {
                                                    table.getColumn("status")?.setFilterValue(value.filter(item => item !== "failed"));
                                                } else {
                                                    table.getColumn("status")?.setFilterValue([...value, "failed"]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={(table.getColumn("status")?.getFilterValue() as string[] || []).includes("failed")}
                                                />
                                                <span>Fehlgeschlagen</span>
                                            </div>
                                        </CommandItem>
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => {
                                                table.getColumn("status")?.setFilterValue([]);
                                            }}
                                        >
                                            Filter zurücksetzen
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover> */}
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <MailIcon className="mr-2 h-4 w-4" />
                            E-Mail erstellen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Neue E-Mail erstellen</DialogTitle>
                            <DialogDescription>
                                Wähle aus, wie du deine E-Mail erstellen möchtest
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 py-4">
                            <Button
                                onClick={handleCreateNew}
                                variant="outline"
                                className="flex items-start justify-start gap-3 h-auto p-4 text-left"
                            >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MailIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Von Grund auf neu erstellen</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Beginne mit einer leeren E-Mail und erstelle sie selbst
                                    </p>
                                </div>
                            </Button>

                            {mailTemplates && mailTemplates.length > 0 ? (
                                <>
                                    <Separator />
                                    <div className="text-sm font-medium">Oder nutze eine Vorlage:</div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                        {mailTemplates.map((template) => (
                                            <Button
                                                key={template.id}
                                                onClick={() => {
                                                    router.push(`/organization/events/${eventId}/emails/create?templateIdToCopy=${template.id}`);
                                                }}
                                                variant="outline"
                                                className="flex items-start justify-start gap-3 h-auto p-4 text-left w-full"
                                            >
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                    <Copy className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{template.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {template.description || "Keine Beschreibung verfügbar"}
                                                    </p>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </>
                            ) : isLoadingTemplates ? (
                                <div className="py-4 text-center text-muted-foreground">
                                    Vorlagen werden geladen...
                                </div>
                            ) : (
                                <div className="py-4 text-center text-muted-foreground">
                                    Keine Vorlagen verfügbar
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {emails.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                                            <MailIcon className="h-8 w-8 mb-2 opacity-50" />
                                            <p>Noch keine E-Mails</p>
                                            <p className="text-sm">Erstelle deine erste E-Mail für diese Veranstaltung</p>
                                        </div>
                                    ) : (
                                        <p>Keine Ergebnisse gefunden</p>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} von{" "}
                    {table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt.
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Zurück
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Weiter
                    </Button>
                </div>
            </div>

            {/* Bestätigungsdialog für das Löschen */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>E-Mail löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bist du sicher, dass du diese E-Mail löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bestätigungsdialog für das Senden */}
            <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>E-Mail senden</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bist du sicher, dass du diese E-Mail jetzt senden möchtest? Die E-Mail wird sofort an alle Empfänger verschickt.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendConfirm} className="bg-blue-600 hover:bg-blue-700">
                            Jetzt senden
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}