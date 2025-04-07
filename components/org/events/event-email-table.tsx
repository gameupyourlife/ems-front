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
    FilterIcon,
    MoreHorizontal,
    ChevronRight,
    Edit,
    Trash,
    ArrowUpDown,
    Mail,
    Clock,
    Copy,
    Send,
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
import { Email } from "@/lib/types";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

interface EmailTableProps {
    emails: Email[];
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

    // Helper to get status badge color
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
            case 'scheduled':
                return <Badge variant="outline" className="bg-blue-50 text-blue-800">Scheduled</Badge>;
            case 'sent':
                return <Badge variant="outline" className="bg-green-50 text-green-800">Sent</Badge>;
            case 'failed':
                return <Badge variant="outline" className="bg-red-50 text-red-800">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Define the columns for the table
    const columns: ColumnDef<Email>[] = [
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
            accessorKey: "subject",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Subject
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.subject}</div>
            ),
        },
        {
            accessorKey: "recipients",
            header: "Recipients",
            cell: ({ row }) => {
                const recipients = row.original.recipients;
                const count = recipients.length;
                
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="cursor-default">
                                <div className="max-w-[150px] truncate">
                                    {count === 1 
                                        ? recipients[0] 
                                        : `${recipients[0]} ${count > 1 ? `+ ${count - 1} more` : ""}`}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="max-w-[300px] space-y-1 text-xs">
                                    {recipients.map((recipient, index) => (
                                        <div key={index}>{recipient}</div>
                                    ))}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.original.status),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "scheduledFor",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Scheduled For
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = row.original.scheduledFor;
                return value ? (
                    <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        {format(new Date(value), "MMM dd, yyyy HH:mm")}
                    </div>
                ) : (
                    <div className="text-gray-500">—</div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                return <div className="text-sm">{format(new Date(row.original.createdAt), "MMM dd, yyyy")}</div>;
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const email = row.original;
                
                return (
                    <div className="flex justify-end">
                        {email.status === "draft" && (
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
                                <span className="sr-only">Send</span>
                            </Button>
                        )}
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            asChild
                        >
                            <Link href={`/organisation/events/${eventId}/emails/${email.id}`}>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">View</span>
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
                                {email.status === "draft" && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/organisation/events/${eventId}/emails/${email.id}/edit`} className="flex cursor-pointer">
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit Email</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem asChild>
                                    <Link href={`/organisation/events/${eventId}/emails/create?duplicate=${email.id}`} className="flex cursor-pointer">
                                        <Copy className="mr-2 h-4 w-4" />
                                        <span>Duplicate</span>
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
                                    <span>Delete Email</span>
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

    // Handle send confirmation
    const handleSendConfirm = () => {
        if (emailToSend && onSendEmail) {
            onSendEmail(emailToSend);
        }
        setSendDialogOpen(false);
        setEmailToSend(null);
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
                    <Link href={`/organisation/events/${eventId}/emails/create`}>
                        <Mail className="mr-2 h-4 w-4" />
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
                                    {emails.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                                            <Mail className="h-8 w-8 mb-2 opacity-50" />
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

            {/* Send confirmation dialog */}
            <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Send Email</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to send this email now? This will send the email to all recipients immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendConfirm} className="bg-blue-600 hover:bg-blue-700">
                            Send Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}