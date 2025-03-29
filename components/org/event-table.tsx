"use client";

import { useState } from "react";
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
    LayoutList,
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
    VisibilityState,
    getFacetedRowModel,
    getFacetedUniqueValues,
} from "@tanstack/react-table";
import { EventInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";

interface EventTableProps {
    events: EventInfo[];
    orgId: string;
}

export default function EventTable({ events, orgId }: EventTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [columnsOpen, setColumnsOpen] = useState(false);

    // Track active filters for better visualization
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Define the columns for the table
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
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Event Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="font-medium">{row.original.title}</div>
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
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
                    Date
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
                const formattedDate = format(date, "MMM dd, yyyy");
                const formattedTime = format(date, "HH:mm");

                // Get status display
                let statusDisplay = { text: "", variant: "" as "default" | "destructive" | "secondary" };
                if (isPast) statusDisplay = { text: "Past", variant: "secondary" };
                else if (isToday) statusDisplay = { text: "Today", variant: "destructive" };
                else statusDisplay = { text: `In ${formatDistanceToNow(date)}`, variant: "default" };

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
            header: "Location",
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
                        Attendees
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
            header: "Description",
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate">
                    {row.original.description}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const event = row.original;

                return (
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="mr-2" asChild>
                            <Link href={`/organisation/${orgId}/events/${event.id}`}>
                                Manage
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/organisation/${orgId}/events/${event.id}`} className="flex cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit Event</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/organisation/${orgId}/events/${event.id}`} className="flex cursor-pointer">
                                        <ShareIcon className="mr-2 h-4 w-4" />
                                        <span>Share Event</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    <span>Delete Event</span>
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
            globalFilter: searchQuery,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
            columnVisibility: {
                organization: false,
                description: false,
            },
        },
    });

    // Get all statuses for filtering
    const statuses = ["Past", "Today", "Upcoming"];

    // Function to toggle status filter
    const toggleStatusFilter = (status: string) => {
        // If the status is already active, remove the filter
        if (activeStatus === status) {
            setActiveStatus(null);
            setColumnFilters(prevFilters => prevFilters.filter(filter => filter.id !== "date"));
            return;
        }

        // Otherwise, set the new status filter
        setActiveStatus(status);
        const now = new Date();
        setColumnFilters(prevFilters => {
            // Remove any existing date filters
            const otherFilters = prevFilters.filter(filter => filter.id !== "date");

            // Add the new filter based on status
            if (status === "Past") {
                // Logic for past events
                return [...otherFilters, {
                    id: "date",
                    value: { type: "past", now }
                }];
            } else if (status === "Today") {
                // Logic for today's events
                return [...otherFilters, {
                    id: "date",
                    value: { type: "today", now }
                }];
            } else if (status === "Upcoming") {
                // Logic for upcoming events
                return [...otherFilters, {
                    id: "date",
                    value: { type: "upcoming", now }
                }];
            }

            // If no valid status is provided, return filters without date filter
            return otherFilters;
        });
    };

    // Function to toggle category filter
    const toggleCategoryFilter = (category: string) => {
        // If the category is already active, remove the filter
        if (activeCategory === category) {
            setActiveCategory(null);
            setColumnFilters(prevFilters => prevFilters.filter(filter => filter.id !== "category"));
            return;
        }

        // Otherwise, set the new category filter
        setActiveCategory(category);
        table.getColumn("category")?.setFilterValue(category);
    };

    // Function to check if a filter is active
    const isFilterActive = (type: 'status' | 'category', value: string) => {
        if (type === 'status') {
            return activeStatus === value;
        } else {
            return activeCategory === value;
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setActiveStatus(null);
        setActiveCategory(null);
        setColumnFilters([]);
        setSearchQuery("");
    };

    return (
        <div className="space-y-4">
            {/* Table Controls */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="relative w-full max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search events..."
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
                                Filters
                                {(columnFilters.length > 0 || searchQuery) && (
                                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                        {columnFilters.length + (searchQuery ? 1 : 0)}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="end">
                            <Command>
                                <CommandInput placeholder="Search filters..." />
                                <CommandList>
                                    <CommandEmpty>No filters found.</CommandEmpty>
                                    <CommandGroup heading="Event Status">
                                        {statuses.map((status) => (
                                            <CommandItem
                                                key={status}
                                                onSelect={() => toggleStatusFilter(status)}
                                                className="flex items-center justify-between"
                                            >
                                                <span className={isFilterActive('status', status) ? "font-medium" : ""}>
                                                    {status}
                                                </span>
                                                {isFilterActive('status', status) && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Category">
                                        {categories.map((category) => (
                                            <CommandItem
                                                key={category}
                                                onSelect={() => toggleCategoryFilter(category)}
                                                className="flex items-center justify-between"
                                            >
                                                <span className={isFilterActive('category', category) ? "font-medium" : ""}>
                                                    {category}
                                                </span>
                                                {isFilterActive('category', category) && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>

                                    {/* Show active filters section if any filters are applied */}
                                    {(activeStatus || activeCategory || searchQuery) && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Active Filters">
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
                                                            Category: {activeCategory}
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
                                                            Search: {searchQuery.length > 10 ? `${searchQuery.substring(0, 10)}...` : searchQuery}
                                                            <X className="h-3 w-3" />
                                                        </Badge>
                                                    </CommandItem>
                                                )}
                                            </CommandGroup>
                                        </>
                                    )}

                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={clearAllFilters}
                                            className="justify-center text-center"
                                        >
                                            Clear All Filters
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Column Visibility Menu - Matching Filter UI */}
                    <Popover open={columnsOpen} onOpenChange={setColumnsOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                <LayoutList className="mr-2 h-4 w-4" />
                                Columns
                                {Object.values(columnVisibility).some(Boolean) && (
                                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                        {Object.values(columnVisibility).filter(Boolean).length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[220px] p-0">
                            <Command>
                                <CommandInput placeholder="Search columns..." />
                                <CommandList>
                                    <CommandEmpty>No columns found.</CommandEmpty>
                                    <CommandGroup heading="Toggle columns">
                                        {table
                                            .getAllColumns()
                                            .filter(column => column.getCanHide())
                                            .map(column => {
                                                return (
                                                    <CommandItem
                                                        key={column.id}
                                                        onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className={column.getIsVisible() ? "font-medium" : ""}>
                                                            {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                                                        </span>
                                                        {column.getIsVisible() && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </CommandItem>
                                                );
                                            })}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => {
                                                // Reset to default visibility
                                                table.setColumnVisibility({
                                                    organization: false,
                                                    description: false,
                                                });
                                            }}
                                            className="justify-center text-center"
                                        >
                                            Reset to default
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <Button size="sm" className="h-8" asChild>
                        <Link href={`/organisation/${orgId}/events/create`}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Active Filters Display */}
            {(activeStatus || activeCategory || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
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
                            Category: {activeCategory}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleCategoryFilter(activeCategory)}
                            />
                        </Badge>
                    )}
                    {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Search: {searchQuery.length > 15 ? `${searchQuery.substring(0, 15)}...` : searchQuery}
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
                        Clear all
                    </Button>
                </div>
            )}

            {/* Selected Items Count */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="bg-muted text-muted-foreground rounded-md px-4 py-2 text-sm">
                    {Object.keys(rowSelection).length} item(s) selected
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
                                    No events found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of {events.length} events
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <div className="text-sm">
                        Page{" "}
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </strong>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}