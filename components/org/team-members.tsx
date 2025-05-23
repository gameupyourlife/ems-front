"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    SearchIcon,
    FilterIcon,
    UserIcon,
    ClipboardIcon,
    MoreHorizontal,
    UserPlusIcon,
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
import { OrgUser, UserRole } from "@/lib/types-old";
import LoadingSpinner from "../loading-spinner";
import { useSession } from "next-auth/react";
import { updateMemberRole } from "@/lib/backend/org";
import { toast } from "sonner";

interface TeamMembersProps {
    members: OrgUser[];
    orgId: string;
    loading?: boolean;
    error: Error | null;
}

export default function TeamMembers({ members, orgId, loading, error }: TeamMembersProps) {
    // Zustand für Sortierung, Filter, Suche und Zeilenauswahl der Tabelle
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [rowSelection, setRowSelection] = useState({});
    const { data: session } = useSession()

    // Initialen für Avatar-Fallback generieren
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    function userRoleToString(role: UserRole) {
        switch(role) {
            case UserRole.Admin:
                return "Admin"
            case UserRole.EventOrganizer:
                return "EventOrganizer"
            case UserRole.Organizer:
                return "Organizer"
            case UserRole.Owner:
                return "Owner"
            case UserRole.User:
                return "User"
        }

    }

    // Tabellenspalten definieren
    const columns: ColumnDef<OrgUser>[] = useMemo(() => [
        {
            accessorKey: "fullName",
            header: "Name",
            id: "name",
            cell: ({ row }) => {
                const member = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={member?.profilePicture || ""} alt={member.fullName} />
                            <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{member.fullName}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            id: "role",
            header: "Rolle",
            cell: ({ cell }) => {
                const role = cell.getValue() as UserRole;
                return (
                    <Badge>
                        {userRoleToString(role)}
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
                                    <Link href={`/user/${member.id}`} className="flex cursor-pointer items-center">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        Profil anzeigen
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.email)}>
                                    <ClipboardIcon className="mr-2 h-4 w-4" />
                                    E-Mail kopieren
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.id)}>
                                    <ClipboardIcon className="mr-2 h-4 w-4" />
                                    ID kopieren
                                </DropdownMenuItem>
                                {/* For all UserRole entiries create promote/demote buttons */}
                                {
                                    Object.values(UserRole).map((role) => {
                                        // If role is typeof string return
                                        if (typeof role === 'string') return;
                                                                                    
                                            
                                        if ((role as UserRole) < (session?.user?.role as UserRole || 0)) return null;

                                        if (role !== member.role) {
                                            return (
                                                <DropdownMenuItem key={role} className="flex cursor-pointer items-center"
                                                    onClick={() => {
                                                        updateMemberRole(member.id, {
                                                            userId: member.id,
                                                            organizationId: orgId,
                                                            newRole: role as UserRole
                                                        }, session?.user?.jwt || "")
                                                            .then(() => {
                                                                toast.success(`Mitgliedsrolle erfolgreich aktualisiert!`);
                                                            })
                                                            .catch((error) => {
                                                                console.error("Error updating member role:", error);
                                                                toast.error(`Fehler beim Aktualisieren der Mitgliedsrolle`);
                                                            });
                                                    }}
                                                >
                                                    <UserIcon className="mr-2 h-4 w-4" />
                                                    {(role as UserRole) < member.role ? `Befördern zu ${userRoleToString(role)}` : `Herabstufen zu ${userRoleToString(role)}`}
                                                </DropdownMenuItem>
                                            );
                                        }
                                        return null;
                                    })
                                }
                                {/* <DropdownMenuItem className="text-destructive focus:text-destructive stroke-destructive">
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Entfernen
                                </DropdownMenuItem> */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], []);

    // Eigene globale Filterfunktion für ODER-Suche über Name und E-Mail
    const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
        const userName = row.original.fullName.toLowerCase();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500">Fehler beim Laden der Mitglieder: {error.message}</p>
            </div>
        );
    }

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
                        <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue(UserRole.Admin)}>
                            Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue(UserRole.User)}>
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