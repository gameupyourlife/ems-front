"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
    SearchIcon,
    FilterIcon,
    MoreHorizontal,
    ChevronRight,
    Edit,
    Trash,
    ArrowUpDown,
    Plus,
    Check,
    X,
    LayoutList,
    Activity,
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
import { ActionType, FlowTemplateResponseDto, TriggerType } from "@/lib/backend/types";
import { getActionIcon, getActionTitle, getTriggerIcon, getTriggerTitle } from "@/lib/flows/utils";

interface FlowTableProps {
    flows: FlowTemplateResponseDto[];
}

export default function FlowTable({ flows }: FlowTableProps) {
    // Zustand für Sortierung, Filter, Sichtbarkeit, Auswahl und Suche
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [columnsOpen, setColumnsOpen] = useState(false);
    const [activeTriggerType, setActiveTriggerType] = useState<TriggerType | null>(null);
    const [activeActionType, setActiveActionType] = useState<ActionType | null>(null);

    // Alle eindeutigen Trigger-Typen aus den Daten extrahieren
    const triggerTypes = Array.from(new Set(
        flows.flatMap(flow => flow.triggers?.map(trigger => trigger.type) || [])
    ));

    // Alle eindeutigen Action-Typen aus den Daten extrahieren
    const actionTypes = Array.from(new Set(
        flows.flatMap(flow => flow.actions?.map(action => action.type) || [])
    ));

    // Spalten-Definitionen für die Tabelle
    const columns: ColumnDef<FlowTemplateResponseDto>[] = [
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
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Flow-Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
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
            accessorKey: "trigger",
            header: "Trigger",
            cell: ({ row }) => {
                const triggers = row.original.triggers;

                return (
                    <div className="flex flex-wrap gap-1.5">
                        {triggers?.map((trigger) => (
                            <Badge key={trigger.id} variant="outline" className="flex items-center gap-1 px-2 py-0.5">
                                {getTriggerIcon(trigger.type)}
                                <span className="capitalize">{getTriggerTitle(trigger.type)}</span>
                            </Badge>
                        ))}
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                if (!value) return true;
                const triggerTypes = row.original.triggers?.map(t => t.type);
                return triggerTypes?.some(type => type === value) || false;
            },
        },
        {
            accessorKey: "actions",
            header: "Aktionen",
            cell: ({ row }) => {
                const actions = row.original.actions;

                return (
                    <div className="flex flex-wrap gap-1.5">
                        {actions?.map((action) => (
                            <Badge key={action.id} variant="outline" className="flex items-center gap-1 px-2 py-0.5">
                                {getActionIcon(action.type)}
                                <span className="capitalize">{getActionTitle(action.type)}</span>
                            </Badge>
                        ))}
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                if (!value) return true;
                const actionTypes = row.original.actions?.map(a => a.type);
                return actionTypes?.some(type => type === value) || false;
            },
        },
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
                // @ts-ignore
                const date = new Date(row.original.createdAt || Date.now());
                return <div className="text-sm">{format(date, "dd.MM.yyyy")}</div>;
            },
            sortingFn: "datetime",
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Aktualisiert am
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.updatedAt || Date.now());
                return <div className="text-sm">{row.original.updatedAt == "0001-01-01T00:00:00" ? "-" : format(date, "dd.MM.yyyy")}</div>;
            },
            sortingFn: "datetime",
        },
        {
            id: "actions-col",
            header: "Optionen",
            cell: ({ row }) => {
                const flow = row.original;
                const id = flow.id;

                return (
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="mr-2" asChild>
                            <Link href={`/organization/flows/${id}`}>
                                Verwalten
                                <ChevronRight className="ml-1 h-4 w-4" />
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
                                <DropdownMenuItem asChild>
                                    <Link href={`/organization/flows/${id}`} className="flex cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Flow bearbeiten</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Activity className="mr-2 h-4 w-4" />
                                    <span>Logs anzeigen</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Flow löschen</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Trigger-Filter umschalten
    const toggleTriggerTypeFilter = (type: TriggerType) => {
        if (activeTriggerType === type) {
            setActiveTriggerType(null);
            setColumnFilters(prevFilters => prevFilters.filter(filter => filter.id !== "trigger"));
            return;
        }

        setActiveTriggerType(type);
        setColumnFilters(prevFilters => {
            const otherFilters = prevFilters.filter(filter => filter.id !== "trigger");
            return [...otherFilters, {
                id: "trigger",
                value: type
            }];
        });
    };

    // Action-Filter umschalten
    const toggleActionTypeFilter = (type: ActionType) => {
        if (activeActionType === type) {
            setActiveActionType(null);
            setColumnFilters(prevFilters => prevFilters.filter(filter => filter.id !== "actions"));
            return;
        }

        setActiveActionType(type);
        setColumnFilters(prevFilters => {
            const otherFilters = prevFilters.filter(filter => filter.id !== "actions");
            return [...otherFilters, {
                id: "actions",
                value: type
            }];
        });
    };

    // Prüfen, ob ein Filter aktiv ist
    const isFilterActive = (type: 'triggerType' | 'actionType', value: TriggerType | ActionType) => {
        if (type === 'triggerType') {
            return activeTriggerType === value;
        } else {
            return activeActionType === value;
        }
    };

    // Benutzerdefinierte globale Filterfunktion (OR-Logik über mehrere Spalten)
    const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
        const flowName = String(row.original.name).toLowerCase();
        const flowDescription = String(row.original.description).toLowerCase();
        const searchTerm = filterValue.toLowerCase();

        return flowName.includes(searchTerm) ||
            flowDescription.includes(searchTerm);
    };

    // Tabelle initialisieren
    const table = useReactTable({
        data: flows,
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
                updatedAt: false,
            },
        },
    });

    // Alle Filter zurücksetzen
    const clearAllFilters = () => {
        setActiveTriggerType(null);
        setActiveActionType(null);
        setColumnFilters([]);
        setSearchQuery("");
    };

    return (
        <div className="space-y-4">
            {/* Tabellen-Steuerung */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="relative w-full max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Flows durchsuchen..."
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filter-Menü */}
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
                        <PopoverContent className="w-[220px] p-0" align="end">
                            <Command>
                                <CommandInput placeholder="Filter suchen..." />
                                <CommandList>
                                    <CommandEmpty>Keine Filter gefunden.</CommandEmpty>
                                    <CommandGroup heading="Trigger-Typen">
                                        {triggerTypes.map((type, i) => (
                                            <CommandItem
                                                key={"trigger" + type + i}
                                                onSelect={() => toggleTriggerTypeFilter(type)}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getTriggerIcon(type)}
                                                    <span className={cn(
                                                        "capitalize",
                                                        isFilterActive('triggerType', type) ? "font-medium" : ""
                                                    )}>
                                                        {type}
                                                    </span>
                                                </div>
                                                {isFilterActive('triggerType', type) && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Aktionstypen">
                                        {actionTypes.map((type, i) => (
                                            <CommandItem
                                                key={"action" + type + i}
                                                onSelect={() => toggleActionTypeFilter(type)}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getActionIcon(type)}
                                                    <span className={cn(
                                                        "capitalize",
                                                        isFilterActive('actionType', type) ? "font-medium" : ""
                                                    )}>
                                                        {type}
                                                    </span>
                                                </div>
                                                {isFilterActive('actionType', type) && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>

                                    {/* Aktive Filter anzeigen, falls vorhanden */}
                                    {(activeTriggerType || activeActionType || searchQuery) && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Aktive Filter">
                                                {activeTriggerType && (
                                                    <CommandItem
                                                        onSelect={() => toggleTriggerTypeFilter(activeTriggerType)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            Trigger: {activeTriggerType}
                                                            <X className="h-3 w-3" />
                                                        </Badge>
                                                    </CommandItem>
                                                )}
                                                {activeActionType && (
                                                    <CommandItem
                                                        onSelect={() => toggleActionTypeFilter(activeActionType)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            Aktion: {activeActionType}
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
                                        </>
                                    )}

                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={clearAllFilters}
                                            className="justify-center text-center"
                                        >
                                            Alle Filter zurücksetzen
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Spalten-Sichtbarkeit */}
                    <Popover open={columnsOpen} onOpenChange={setColumnsOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                <LayoutList className="mr-2 h-4 w-4" />
                                Spalten
                                {Object.values(columnVisibility).some(Boolean) && (
                                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                        {Object.values(columnVisibility).filter(Boolean).length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[220px] p-0">
                            <Command>
                                <CommandInput placeholder="Spalten suchen..." />
                                <CommandList>
                                    <CommandEmpty>Keine Spalten gefunden.</CommandEmpty>
                                    <CommandGroup heading="Spalten umschalten">
                                        {table
                                            .getAllColumns()
                                            .filter(column => column.getCanHide())
                                            .map((column, i) => {
                                                return (
                                                    <CommandItem
                                                        key={column.id + i}
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
                                                // Sichtbarkeit auf Standard zurücksetzen
                                                table.setColumnVisibility({
                                                    updatedAt: false,
                                                });
                                            }}
                                            className="justify-center text-center"
                                        >
                                            Auf Standard zurücksetzen
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <Button size="sm" className="h-8" asChild>
                        <Link href={`/organization/flows/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Flow erstellen
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Anzeige der aktiven Filter */}
            {(activeTriggerType || activeActionType || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Aktive Filter:</span>
                    {activeTriggerType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Trigger: {activeTriggerType}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleTriggerTypeFilter(activeTriggerType)}
                            />
                        </Badge>
                    )}
                    {activeActionType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Aktion: {activeActionType}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleActionTypeFilter(activeActionType)}
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
                        Alle löschen
                    </Button>
                </div>
            )}

            {/* Anzeige der Anzahl ausgewählter Elemente */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="bg-muted text-muted-foreground rounded-md px-4 py-2 text-sm">
                    {Object.keys(rowSelection).length} Element(e) ausgewählt
                </div>
            )}

            {/* Tanstack Tabelle für Flows */}
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
                                    Keine Flows gefunden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginierungs-Steuerung */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Zeige {table.getRowModel().rows.length} von {flows.length} Flows
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