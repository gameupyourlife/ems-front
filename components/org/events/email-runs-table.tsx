"use client";;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilterIcon, MoreHorizontal, Trash, ArrowUpDown, Mail as MailIcon } from "lucide-react";
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
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
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
import { MailRun, MailRunStatus } from "@/lib/backend/mails";

interface EmailTableProps {
    mailRuns: MailRun[];
    eventId: string;
    onDeleteEmailRun?: (emailId: string) => void;
}

export default function EmailRunsTable({ mailRuns, eventId, onDeleteEmailRun: onDeleteEmail }: EmailTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [emailToDelete, setEmailToDelete] = useState<string | null>(null);

    // Helper to get status badge color
    const getStatusBadge = (status: MailRunStatus) => {
        switch (status) {
            case MailRunStatus.Completed:
                return <Badge >Sent</Badge>;
            case MailRunStatus.Failed:
                return <Badge >Failed</Badge>;
            case MailRunStatus.Pending:
                return <Badge >Scheduled</Badge>;
            case MailRunStatus.InProgress:
                return <Badge >Draft</Badge>;
            case MailRunStatus.Cancelled:
                return <Badge >Cancelled</Badge>;
            default:
                return <Badge >Unknown</Badge>;
        };
    }

    // Define the columns for the table
    const columns: ColumnDef<MailRun>[] = [

        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row,cell }) => getStatusBadge(cell.getValue() as MailRunStatus),
            filterFn: (row, id, value) => {
                return value.includes(MailRunStatus[row.getValue(id) as number].toLowerCase());
            },
        },
        {
            accessorKey: "timestamp",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Run Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                return <div className="text-sm">{format(new Date(row.original.timestamp), "MMM dd, yyyy HH:mm")}</div>;
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const mailRun = row.original;

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => {
                                        setEmailToDelete(mailRun.mailRunId || null);
                                        setDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete Email Run</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Create the table instance
    const table = useReactTable({
        data: mailRuns,
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

    // Handle global search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Filter the subject column
        table.getColumn("subject")?.setFilterValue(value);
    };

    // Handle deletion confirmation
    const handleDeleteConfirm = () => {
        if (emailToDelete && onDeleteEmail) {
            onDeleteEmail(emailToDelete);
        }
        setDeleteDialogOpen(false);
        setEmailToDelete(null);
    };


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="max-w-sm"
                    // prefix={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1">
                                <FilterIcon className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Filter status..." />
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
                                                <span>Draft</span>
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
                                                <span>Scheduled</span>
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
                                                <span>Sent</span>
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
                                                <span>Failed</span>
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
                                            Clear filters
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <Button asChild>
                    <Link href={`/organization/events/${eventId}/emails/create`}>
                        <MailIcon className="mr-2 h-4 w-4" />
                        Create Email
                    </Link>
                </Button>
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
                                    {mailRuns.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                                            <MailIcon className="h-8 w-8 mb-2 opacity-50" />
                                            <p>No emails yet</p>
                                            <p className="text-sm">Create your first email for this event</p>
                                        </div>
                                    ) : (
                                        <p>No results found</p>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Email</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this email? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}