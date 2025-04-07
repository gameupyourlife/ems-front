"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    SearchIcon,
    FilterIcon,
    Calendar,
    MapPin,
    Users,
    MoreHorizontal,
    ChevronRight,
    Edit,
    Trash as TrashIcon,
    Share as ShareIcon,
    PlusIcon,
    ArrowUpDown,
    Clock,
    SortAsc,
    SortDesc,
    Check,
    X,
} from "lucide-react";
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
    RowSelectionState,
    VisibilityState,
    getFacetedRowModel,
    getFacetedUniqueValues,
} from "@tanstack/react-table";
import { EventInfo } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import { de } from 'date-fns/locale';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface EventTableProps {
    events: EventInfo[];
    orgId: string;
}

export default function EventTable({ events, orgId }: EventTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Toggle status filter
    const toggleStatusFilter = (status: string) => {
        if (activeStatus === status) {
            setActiveStatus(null);
            // Remove status filter
            setColumnFilters(prevFilters =>
                prevFilters.filter(filter => filter.id !== "status")
            );
        } else {
            setActiveStatus(status);
            // Apply status filter
            setColumnFilters(prevFilters => {
                // Remove any existing status filter
                const filters = prevFilters.filter(filter => filter.id !== "status");
                // Add new status filter
                return [...filters, { id: "status", value: status }];
            });
        }
    };

    // Toggle category filter
    const toggleCategoryFilter = (category: string) => {
        if (activeCategory === category) {
            setActiveCategory(null);
            // Remove category filter
            setColumnFilters(prevFilters =>
                prevFilters.filter(filter => filter.id !== "category")
            );
        } else {
            setActiveCategory(category);
            // Apply category filter
            setColumnFilters(prevFilters => {
                // Remove any existing category filter
                const filters = prevFilters.filter(filter => filter.id !== "category");
                // Add new category filter
                return [...filters, { id: "category", value: [category] }];
            });
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setActiveStatus(null);
        setActiveCategory(null);
        setSearchQuery("");
        setColumnFilters([]);
    };

    // Define table columns
    const columns: ColumnDef<EventInfo>[] = [
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
            accessorKey: "title",
            header: "Titel",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 max-w-[400px]">
                    <div className="font-medium truncate">{row.original.title}</div>
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: "Kategorie",
            cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Datum
                    {column.getIsSorted() === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <SortDesc className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.date);
                const now = new Date();
                const isToday = date.toDateString() === now.toDateString();
                const isUpcoming = date > now;
                const isPast = date < now && !isToday;

                // Format the date
                const formattedDate = format(date, "dd. MMM yyyy", { locale: de });
                const formattedTime = format(date, "HH:mm");

                // Get status display
                let statusDisplay = { text: "", variant: "" as "default" | "destructive" | "secondary" };
                if (isPast) statusDisplay = { text: "Vergangen", variant: "secondary" };
                else if (isToday) statusDisplay = { text: "Heute", variant: "destructive" };
                else statusDisplay = { text: `In ${formatDistanceToNow(date, { locale: de })}`, variant: "default" };

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formattedTime}</span>
                            <Badge variant={statusDisplay.variant} className="ml-2">
                                {statusDisplay.text}
                            </Badge>
                        </div>
                    </div>
                );
            },
            sortingFn: "datetime",
        },
        {
            accessorKey: "location",
            header: "Ort",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.location}</span>
                </div>
            ),
        },
        {
            accessorKey: "attendees",
            header: ({ column }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Teilnehmer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const attendees = row.original.attendees;
                const capacityPercent = Math.min(100, (attendees / 100) * 100);

                return (
                    <div className="text-right w-32">
                        <div className="flex justify-between mb-1">
                            <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{attendees}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{capacityPercent}%</span>
                        </div>
                        <Progress
                            value={capacityPercent}
                            className={cn("h-1.5 rounded-full", {
                                "bg-muted": capacityPercent < 70,
                                "bg-amber-100": capacityPercent >= 70 && capacityPercent < 90,
                                "bg-red-100": capacityPercent >= 90
                            })}
                            indicatorClassName={cn({
                                "bg-primary": capacityPercent < 70,
                                "bg-amber-500": capacityPercent >= 70 && capacityPercent < 90,
                                "bg-red-500": capacityPercent >= 90
                            })}
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ cell }) => <div>{cell.getValue() as string}</div>,
        },
        {
            accessorKey: "description",
            header: "Beschreibung",
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate">
                    {row.original.description}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const event = row.original;

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/organisation/events/${event.id}`} className="flex items-center">
                                <span className="sr-only">Event anzeigen</span>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Aktionen</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/organisation/events/${event.id}/edit`} className="flex cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Event bearbeiten</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/organisation/events/${event.id}`} className="flex cursor-pointer">
                                        <ShareIcon className="mr-2 h-4 w-4" />
                                        <span>Event teilen</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    <span>Event löschen</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Get all unique categories from the data
    const categories = Array.from(new Set(events.map(event => event.category)));

    // Custom global filter function for OR logic across columns
    const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
        if (filterValue === "") return true;
        
        const eventTitle = String(row.original.title).toLowerCase();
        const eventLocation = String(row.original.location).toLowerCase();
        const eventDescription = String(row.original.description).toLowerCase();
        const searchTerm = filterValue.toLowerCase();

        return eventTitle.includes(searchTerm) ||
            eventLocation.includes(searchTerm) ||
            eventDescription.includes(searchTerm);
    };

    // Create the table instance
    const table = useReactTable({
        data: events,
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
        globalFilterFn,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            columnVisibility,
        },
    });

    // Apply global search filter
    React.useEffect(() => {
        if (searchQuery) {
            table.setGlobalFilter(searchQuery);
        } else {
            table.resetGlobalFilter();
        }
    }, [searchQuery, table]);

    // Status options
    const statuses = ["Aktiv", "Abgeschlossen", "Entwurf", "Abgesagt"];

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="relative w-full max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Events durchsuchen..."
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Unified Filter Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Filter
                                {(columnFilters.length > 0 || searchQuery) && (
                                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                        {columnFilters.length + (searchQuery ? 1 : 0)}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72" align="start">
                            <Command>
                                <CommandInput placeholder="Filter suchen..." />
                                <CommandList className="max-h-[300px]">
                                    <CommandEmpty>Keine Filter gefunden.</CommandEmpty>
                                    <CommandGroup heading="Status">
                                        {statuses.map((status) => (
                                            <CommandItem
                                                key={status}
                                                onSelect={() => toggleStatusFilter(status)}
                                                className="flex items-center gap-2"
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-6 w-6 items-center justify-center rounded-lg border border-primary/20",
                                                        activeStatus === status ? "bg-primary text-white" : "opacity-50"
                                                    )}
                                                >
                                                    {activeStatus === status ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : null}
                                                </div>
                                                <span>{status}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandGroup heading="Kategorie">
                                        {categories.map((category) => (
                                            <CommandItem
                                                key={category}
                                                onSelect={() => toggleCategoryFilter(category)}
                                                className="flex items-center gap-2"
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-6 w-6 items-center justify-center rounded-lg border border-primary/20",
                                                        activeCategory === category ? "bg-primary text-white" : "opacity-50"
                                                    )}
                                                >
                                                    {activeCategory === category ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : null}
                                                </div>
                                                <span>{category}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandGroup heading="Aktive Filter">
                                        {activeStatus && (
                                            <CommandItem
                                                onSelect={() => toggleStatusFilter(activeStatus)}
                                                className="flex items-center gap-2"
                                            >
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    Status: {activeStatus}
                                                    <X className="h-3 w-3" />
                                                </Badge>
                                            </CommandItem>
                                        )}
                                        {activeCategory && (
                                            <CommandItem
                                                onSelect={() => toggleCategoryFilter(activeCategory)}
                                                className="flex items-center gap-2"
                                            >
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    Kategorie: {activeCategory}
                                                    <X className="h-3 w-3" />
                                                </Badge>
                                            </CommandItem>
                                        )}
                                        {searchQuery && (
                                            <CommandItem
                                                onSelect={() => setSearchQuery("")}
                                                className="flex items-center gap-2"
                                            >
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    Suche: {searchQuery.length > 10 ? `${searchQuery.substring(0, 10)}...` : searchQuery}
                                                    <X className="h-3 w-3" />
                                                </Badge>
                                            </CommandItem>
                                        )}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                            <div className="mt-4 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-xs"
                                    disabled={!columnFilters.length && !searchQuery}
                                >
                                    Alle Filter zurücksetzen
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" size="sm" className="h-8" asChild>
                        <Link href={`/organisation/events/create`}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Neues Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Active Filters */}
            {(activeStatus || activeCategory || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Aktive Filter:</span>
                    {activeStatus && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Status: {activeStatus}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleStatusFilter(activeStatus)}
                            />
                        </Badge>
                    )}
                    {activeCategory && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Kategorie: {activeCategory}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleCategoryFilter(activeCategory)}
                            />
                        </Badge>
                    )}
                    {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Suche: {searchQuery.length > 15 ? `${searchQuery.substring(0, 15)}...` : searchQuery}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setSearchQuery("")}
                            />
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={clearAllFilters}
                    >
                        Alle zurücksetzen
                    </Button>
                </div>
            )}

            {/* Selected Items Count */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="bg-muted text-muted-foreground rounded-md px-4 py-2 text-sm">
                    {Object.keys(rowSelection).length} Element(e) ausgewählt
                </div>
            )}

            {/* Shadcn Tanstack Table for Events - Made horizontally scrollable */}
            <div className="rounded-md border w-full overflow-auto">
                <Table className="min-w-full">
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
                                    Keine Events gefunden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Zeige {table.getRowModel().rows.length} von {events.length} Events
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
                    <div className="text-sm">
                        Seite{" "}
                        <strong>
                            {table.getState().pagination.pageIndex + 1} von{" "}
                            {table.getPageCount()}
                        </strong>
                    </div>
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
        </div>
    );
}