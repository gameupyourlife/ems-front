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
import { EmsFile } from "@/lib/types";
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

    // Map icons to file types
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

    // Define all unique file types from the data
    const fileTypes = Array.from(new Set(files.map(file => file.type)));

    // Helper function to format file size
    const formatFileSize = (sizeInMB?: number) => {
        if (!sizeInMB) return "N/A";
        
        if (sizeInMB < 1) {
            return `${Math.round(sizeInMB * 1024)} KB`;
        }
        return `${sizeInMB.toFixed(1)} MB`;
    };

    // Define the columns for the table
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
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    File Name
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
            header: "Type",
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
        //             Size
        //             <ArrowUpDown className="ml-2 h-4 w-4" />
        //         </Button>
        //     ),
        //     cell: ({ row }) => {
        //         // If the size property exists, format it
        //         return <div>{row.original.size ? formatFileSize(row.original.size) : "N/A"}</div>;
        //     },
        // },
        {
            accessorKey: "createdBy",
            header: "Created By",
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
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt);
                return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
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
                    Updated At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.updatedAt);
                return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
            },
            sortingFn: "datetime",
        },
        // {
        //     accessorKey: "shared",
        //     header: "Shared",
        //     cell: ({ row }) => (
        //         <div>
        //             {row.original.shared ? 
        //                 <Badge variant="success" className="bg-green-100 text-green-800">Yes</Badge> : 
        //                 <Badge variant="outline">No</Badge>
        //             }
        //         </div>
        //     ),
        // },
        {
            id: "actions",
            header: "Options",
            cell: ({ row }) => {
                const file = row.original;

                return (
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="mr-2" asChild>
                            <Link href={`/organization/files/${file.id}`}>
                                View
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
                                <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    <span>Share</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/organization/files/${file.id}`} className="flex cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit Info</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete File</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Function to toggle file type filter
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

    // Function to check if a filter is active
    const isFilterActive = (value: string) => {
        return activeFileType === value;
    };

    // Custom global filter function for OR logic across columns
    const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
        const fileName = String(row.original.name).toLowerCase();
        const fileType = String(row.original.type).toLowerCase();
        const createdBy = String(row.original.createdBy).toLowerCase();
        const searchTerm = filterValue.toLowerCase();

        return fileName.includes(searchTerm) ||
            fileType.includes(searchTerm) ||
            createdBy.includes(searchTerm);
    };

    // Handle file upload dialog
    const openUploadDialog = () => setIsUploadDialogOpen(true);
    const closeUploadDialog = () => setIsUploadDialogOpen(false);
    
    const handleUploadComplete = (uploadedFiles: any[]) => {
        // In a real application, you would refresh the files list from the server
        closeUploadDialog();
        // For now we just close the dialog as we can't modify the files prop directly
        // We'd either need to lift state up or use a more sophisticated state management approach
        window.location.reload(); // Temporary solution to refresh the page
    };

    // Create the table instance
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

    // Clear all filters
    const clearAllFilters = () => {
        setActiveFileType(null);
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
                        placeholder="Search files..."
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filter Menu */}
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
                                    <CommandGroup heading="File Types">
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

                                    {/* Show active filters section if any filters are applied */}
                                    {(activeFileType || searchQuery) && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Active Filters">
                                                {activeFileType && (
                                                    <CommandItem
                                                        onSelect={() => toggleFileTypeFilter(activeFileType)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            Type: {activeFileType}
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

                    {/* Column Visibility Menu */}
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
                                                    updatedAt: false,
                                                    shared: false,
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

                    {/* Upload Button */}
                    <Button size="sm" className="h-8" onClick={openUploadDialog}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>
                </div>
            </div>

            {/* Active Filters Display */}
            {(activeFileType || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {activeFileType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Type: {activeFileType}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleFileTypeFilter(activeFileType)}
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

            {/* Tanstack Table for Files */}
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
                                    No files found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of {files.length} files
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
            
            {/* File Upload Dialog */}
            <FileUploadDialog 
                isOpen={isUploadDialogOpen}
                onClose={closeUploadDialog}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}