"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    UserIcon,
    ClipboardIcon,
    ShieldIcon,
    XIcon,
    MoreHorizontal,
    UserPlusIcon
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
} from "@tanstack/react-table";
import { OrgUser } from "@/lib/types-old";

interface TeamMembersProps {
    members: OrgUser[];
    orgId: string;
}

export default function TeamMembers({ members, orgId }: TeamMembersProps) {
    // Zustand für Sortierung, Filter, Suche und Zeilenauswahl der Tabelle
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [rowSelection, setRowSelection] = useState({});

    // Initialen für Avatar-Fallback generieren
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    // Tabellenspalten definieren
    const columns: ColumnDef<OrgUser>[] = useMemo(() => [
        {
            accessorKey: "user.name",
            header: "Name",
            id: "name",
            cell: ({ row }) => {
                const member = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={member.user.profilePicture} alt={member.user.name} />
                            <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{member.user.name}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            id: "role",
            header: "Rolle",
            cell: ({ cell }) => {
                const role = cell.getValue() as string;
                return (
                    <Badge variant={role === "Admin" ? "default" : "secondary"}>
                        {role}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "user.email",
            id: "email",
            header: "E-Mail",
            cell: ({ cell }) => {
                return (
                    <div className="flex items-center text-muted-foreground">
                        <span>{cell.getValue() as string}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "user.createdAt",
            id: "joined",
            header: "Beigetreten",
            cell: ({ cell }) => {
                const date = new Date(cell.getValue() as string);
                return <div>{date.toLocaleDateString()}</div>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const member = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Menü öffnen</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/user/${member.user.id}`} className="flex cursor-pointer items-center">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        Profil anzeigen
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <ClipboardIcon className="mr-2 h-4 w-4" />
                                    E-Mail kopieren
                                </DropdownMenuItem>
                                {member.role !== "Admin" && (
                                    <DropdownMenuItem>
                                        <ShieldIcon className="mr-2 h-4 w-4" />
                                        Zum Admin machen
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {member.role === "Admin" && (
                                    <DropdownMenuItem className="text-destructive focus:text-destructive stroke-destructive">
                                        <ShieldIcon className="mr-2 h-4 w-4 " />
                                        Admin-Status entfernen
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive focus:text-destructive stroke-destructive">
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Entfernen
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], []);

    // Eigene globale Filterfunktion für ODER-Suche über Name und E-Mail
    const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
        const userName = row.original.user.name.toLowerCase();
        const userEmail = row.original.user.email.toLowerCase();
        const searchTerm = filterValue.toLowerCase();

        return userName.includes(searchTerm) || userEmail.includes(searchTerm);
    };

    // Tabellendaten und -funktionen initialisieren
    const table = useReactTable({
        data: members,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        globalFilterFn: globalFilterFn,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            globalFilter: searchQuery,
        },
        initialState: {
            pagination: { pageSize: 5 }
        }
    });

    // Globale Filterfunktion für das Suchfeld
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Nutzt globalen Filter für ODER-Suche über Name und E-Mail
        if (value) {
            table.setGlobalFilter(value);
        } else {
            table.resetGlobalFilter();
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Teammitglieder</h2>
                <Button size="sm">
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    Mitglied einladen
                </Button>
            </div>

            {/* Suche und Rollenfilter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Mitglieder nach Name oder E-Mail suchen..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <FilterIcon className="h-4 w-4" />
                            Nach Rolle filtern
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue(undefined)}>
                            Alle Rollen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue("Admin")}>
                            Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue("Member")}>
                            Mitglied
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Mitglieder-Tabelle */}
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
                                    Keine Mitglieder gefunden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginierungs-Steuerung */}
            <div className="flex items-center justify-end space-x-2">
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
    );
}