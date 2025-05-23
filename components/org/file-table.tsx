"use client";;
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
    ArrowUpDown, FileIcon,
    Download,
    Share2,
    Eye,
    LayoutList,
    FileType,
    UserIcon,
    LayoutGrid,
    Check,
    X,
    Upload
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
import { EmsFile } from "@/lib/types-old";
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
import FileUploadDialog from "@/components/org/file-upload-dialog";

interface FileTableProps {
    files: EmsFile[];
}

export default function FileTable({ files }: FileTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [columnsOpen, setColumnsOpen] = useState(false);
    const [activeFileType, setActiveFileType] = useState<string | null>(null);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    // Ordnet Dateitypen Icons zu
    const getFileTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf':
            case 'document':
                return <FileIcon className="h-4 w-4" />;
            case 'xlsx':
            case 'spreadsheet':
                return <LayoutGrid className="h-4 w-4" />;
            case 'pptx':
            case 'presentation':
                return <LayoutList className="h-4 w-4" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'image':
                return <Eye className="h-4 w-4" />;
            case 'mp4':
            case 'video':
                return <FileType className="h-4 w-4" />;
            default:
                return <FileIcon className="h-4 w-4" />;
        }
    };

    // Alle einzigartigen Dateitypen aus den Daten extrahieren
    const fileTypes = Array.from(new Set(files.map(file => file.type)));

    // Hilfsfunktion zur Formatierung der Dateigröße
    const formatFileSize = (sizeInMB?: number) => {
        if (!sizeInMB) return "N/A";
        if (sizeInMB < 1) {
            return `${Math.round(sizeInMB * 1024)} KB`;
        }
        return `${sizeInMB.toFixed(1)} MB`;
    };

    // Spalten für die Tabelle definieren
    const columns: ColumnDef<EmsFile>[] = [
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
                    Dateiname
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    {getFileTypeIcon(row.original.type)}
                    <span className="font-medium">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Typ",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.type}
                </Badge>
            ),
            filterFn: (row, id, value) => {
                if (!value) return true;
                return row.original.type.toLowerCase() === value.toLowerCase();
            },
        },
        // {
        //     accessorKey: "size",
        //     header: ({ column }) => (
        //         <Button
        //             variant="ghost"
        //             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        //         >
        //             Größe
        //             <ArrowUpDown className="ml-2 h-4 w-4" />
        //         </Button>
        //     ),
        //     cell: ({ row }) => {
        //         // Falls die Größe vorhanden ist, wird sie formatiert angezeigt
        //         return <div>{row.original.size ? formatFileSize(row.original.size) : "N/A"}</div>;
        //     },
        // },
        {
            accessorKey: "createdBy",
            header: "Erstellt von",
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{row.original.createdBy}</span>
                </div>
            ),
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
                const date = new Date(row.original.createdAt);
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
                const date = new Date(row.original.updatedAt);
                return <div className="text-sm">{format(date, "dd.MM.yyyy")}</div>;
            },
            sortingFn: "datetime",
        },
        // {
        //     accessorKey: "shared",
        //     header: "Geteilt",
        //     cell: ({ row }) => (
        //         <div>
        //             {row.original.shared ? 
        //                 <Badge variant="success" className="bg-green-100 text-green-800">Ja</Badge> : 
        //                 <Badge variant="outline">Nein</Badge>
        //             }
        //         </div>
        //     ),
        // },
        {
            id: "actions",
            header: "Optionen",
            cell: ({ row }) => {
                const file = row.original;

                return (
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="mr-2" asChild>
                            <Link href={`/organization/files/${file.id}`}>
                                Anzeigen
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
                                <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Herunterladen</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    <span>Teilen</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/organization/files/${file.id}`} className="flex cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Bearbeiten</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Datei löschen</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Filter für Dateityp umschalten
    const toggleFileTypeFilter = (type: string) => {
        if (activeFileType === type) {
            setActiveFileType(null);
            setColumnFilters(prevFilters => prevFilters.filter(filter => filter.id !== "type"));
            return;
        }

        setActiveFileType(type);
        setColumnFilters(prevFilters => {
            const otherFilters = prevFilters.filter(filter => filter.id !== "type");
            return [...otherFilters, {
                id: "type",
                value: type
            }];
        });
    };

    // Prüft, ob ein Filter aktiv ist
    const isFilterActive = (value: string) => {
        return activeFileType === value;
    };

    // Globale Filterfunktion für ODER-Logik über mehrere Spalten
    const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
        const fileName = String(row.original.name).toLowerCase();
        const fileType = String(row.original.type).toLowerCase();
        const createdBy = String(row.original.createdBy).toLowerCase();
        const searchTerm = filterValue.toLowerCase();

        return fileName.includes(searchTerm) ||
            fileType.includes(searchTerm) ||
            createdBy.includes(searchTerm);
    };

    // Dialog zum Hochladen öffnen/schließen
    const openUploadDialog = () => setIsUploadDialogOpen(true);
    const closeUploadDialog = () => setIsUploadDialogOpen(false);
    
    const handleUploadComplete = (uploadedFiles: any[]) => {
        // In einer echten Anwendung würde hier die Dateiliste vom Server aktualisiert werden
        closeUploadDialog();
        // Aktuell wird nur der Dialog geschlossen, da files nicht direkt geändert werden kann
        window.location.reload(); // Temporäre Lösung zum Aktualisieren der Seite
    };

    // Tabelle initialisieren
    const table = useReactTable({
        data: files,
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
                shared: false,
            },
        },
    });

    // Alle Filter zurücksetzen
    const clearAllFilters = () => {
        setActiveFileType(null);
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
                        placeholder="Dateien durchsuchen..."
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
                                    <CommandGroup heading="Dateitypen">
                                        {fileTypes.map((type) => (
                                            <CommandItem
                                                key={type}
                                                onSelect={() => toggleFileTypeFilter(type)}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getFileTypeIcon(type)}
                                                    <span className={cn(
                                                        "capitalize",
                                                        isFilterActive(type) ? "font-medium" : ""
                                                    )}>
                                                        {type}
                                                    </span>
                                                </div>
                                                {isFilterActive(type) && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>

                                    {/* Aktive Filter anzeigen, falls vorhanden */}
                                    {(activeFileType || searchQuery) && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Aktive Filter">
                                                {activeFileType && (
                                                    <CommandItem
                                                        onSelect={() => toggleFileTypeFilter(activeFileType)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            Typ: {activeFileType}
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
                                            Alle Filter entfernen
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
                                    <CommandGroup heading="Spalten ein-/ausblenden">
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
                                                // Sichtbarkeit auf Standard zurücksetzen
                                                table.setColumnVisibility({
                                                    updatedAt: false,
                                                    shared: false,
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

                    {/* Hochladen-Button */}
                    <Button size="sm" className="h-8" onClick={openUploadDialog}>
                        <Upload className="mr-2 h-4 w-4" />
                        Hochladen
                    </Button>
                </div>
            </div>

            {/* Anzeige aktiver Filter */}
            {(activeFileType || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Aktive Filter:</span>
                    {activeFileType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Typ: {activeFileType}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleFileTypeFilter(activeFileType)}
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
                        Alle entfernen
                    </Button>
                </div>
            )}

            {/* Anzeige der Anzahl ausgewählter Elemente */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="bg-muted text-muted-foreground rounded-md px-4 py-2 text-sm">
                    {Object.keys(rowSelection).length} Element(e) ausgewählt
                </div>
            )}

            {/* Tanstack Tabelle für Dateien */}
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
                                    Keine Dateien gefunden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginierungs-Steuerung */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Zeige {table.getRowModel().rows.length} von {files.length} Dateien
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
            
            {/* Dialog zum Datei-Upload */}
            <FileUploadDialog 
                isOpen={isUploadDialogOpen}
                onClose={closeUploadDialog}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}