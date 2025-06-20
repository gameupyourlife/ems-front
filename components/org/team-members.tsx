"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useUpdateMemberRole, useDeleteMember } from "@/lib/backend/hooks/use-org"
import type { OrgUser } from "@/lib/types-old"


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Row } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { SearchIcon, FilterIcon, ShieldIcon, XIcon, MoreHorizontal, ClipboardIcon } from "lucide-react"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TeamMembersProps {
  members: OrgUser[]
  orgId: string
}

export default function TeamMembers({ members, orgId }: TeamMembersProps) {
  // Table-State
  const [sorting, setSorting] = useState<SortingState>([{ id: "fullName", desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeRoleFilter, setActiveRoleFilter] = useState<number | null>(null)

  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    isOpen: boolean
    member: OrgUser | null
  }>({ isOpen: false, member: null })
  const [selectedNewRole, setSelectedNewRole] = useState<string>("")
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    member: OrgUser | null
    newRole: number
  }>({ isOpen: false, member: null, newRole: 0 })

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [candidate, setCandidate] = useState<OrgUser | null>(null)
  const [confirmText, setConfirmText] = useState("")

  const openDeleteDialog = (m: OrgUser) => {
    setCandidate(m)
    setIsDeleteOpen(true)
    setConfirmText("")
  }

  const handleConfirmDelete = () => {
    if (!candidate) return
    deleteMember.mutate({ userId: candidate.id })
    setIsDeleteOpen(false)
    setCandidate(null)
  }

  const { data: session } = useSession()
  const token = session?.user?.jwt ?? ""
const updateRole = useUpdateMemberRole(orgId, token);
const deleteMember = useDeleteMember(orgId, token);
  // Hilfsfunktionen
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()

  const roleLabels: Record<number, string> = {
    0: "Admin",
    1: "Owner",
    2: "Organizer",
    3: "EventOrganizer",
    4: "User",
  }

  const handleRoleChange = (member: OrgUser) => {
    setRoleChangeDialog({ isOpen: true, member })
    setSelectedNewRole("")
  }

const handleRoleSelect = () => {
  if (roleChangeDialog.member && selectedNewRole !== "") {
    const newRole = Number.parseInt(selectedNewRole, 10)
    setRoleChangeDialog({ isOpen: false, member: null })
    setConfirmDialog({
      isOpen: true,
      member: roleChangeDialog.member,
      newRole,
    })
  }
}

const confirmRoleChange = async () => {
  if (!confirmDialog.member) {
    setConfirmDialog({ isOpen: false, member: null, newRole: 0 })
    return
  }

  try {
    await updateRole.mutateAsync({
      userId: confirmDialog.member.id,
      newRole: confirmDialog.newRole,
    })
  } catch {
    // bei Bedarf hier Fehler-UI anzeigen
  } finally {
    setConfirmDialog({ isOpen: false, member: null, newRole: 0 })
  }
}

  // table columns
  const columns: ColumnDef<OrgUser>[] = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "",
        cell: ({ row }) => {
          const m = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback>{getInitials(m.fullName)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{m.fullName}</div>
            </div>
          )
        },
      },
      {
        accessorKey: "role",
        header: "Rolle",
        filterFn: (row, columnId, filterValue) => {
          if (filterValue === undefined || filterValue === null) return true
          return row.getValue(columnId) === filterValue
        },
        cell: ({ cell }) => {
          const code = Number(cell.getValue())
          const label = roleLabels[code] ?? "Unknown"
          const variant = code === 0 ? "default" : "secondary"
          return <Badge variant={variant}>{label}</Badge>
        },
      },
      {
        accessorKey: "email",
        header: "E-Mail",
        cell: ({ cell }) => <div className="text-muted-foreground">{cell.getValue<string>()}</div>,
      },
      {
        accessorKey: "createdAt",
        header: "Beigetreten",
        cell: ({ cell }) => {
          const d = new Date(cell.getValue<string>())
          return <div>{d.toLocaleDateString()}</div>
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const m = row.original
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
                  <DropdownMenuItem>
                    <ClipboardIcon className="mr-2 h-4 w-4" />
                    E-Mail kopieren
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleRoleChange(m)}>
                    <ShieldIcon className="mr-2 h-4 w-4" />
                    Rolle ändern
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive stroke-destructive" onSelect={() => openDeleteDialog(m)}>
                    <XIcon className="mr-2 h-4 w-4" />
                    Benutzer entfernen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [updateRole],
  )

  const globalFilterFn = (row: Row<OrgUser>, _columnId: string, filterValue: string) => {
    const term = filterValue.toLowerCase()
    return row.original.fullName.toLowerCase().includes(term) || row.original.email.toLowerCase().includes(term)
  }

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <>
    <div className="flex flex-col space-y-4">
      {/* Header & Search */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Teammitglieder</h2>
      </div>

      <div className="flex gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name oder E-Mail suchen…"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              const v = e.target.value
              setSearchQuery(v)
              if (v) {
                table.setGlobalFilter(v)
              } else {
                table.resetGlobalFilter()
              }
            }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FilterIcon className="h-4 w-4" />
              {activeRoleFilter !== null ? `Rolle: ${roleLabels[activeRoleFilter]}` : "Nach Rolle"}
              {activeRoleFilter !== null && (
                <XIcon
                  className="h-3 w-3 ml-1 hover:bg-muted rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    table.getColumn("role")?.setFilterValue(undefined)
                    setActiveRoleFilter(null)
                  }}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                table.getColumn("role")?.setFilterValue(undefined)
                setActiveRoleFilter(null)
              }}
              className={activeRoleFilter === null ? "bg-accent" : ""}
            >
              Alle Rollen
            </DropdownMenuItem>
            {Object.entries(roleLabels).map(([code, label]) => (
              <DropdownMenuItem
                key={code}
                onClick={() => {
                  const roleCode = Number(code)
                  table.getColumn("role")?.setFilterValue(roleCode)
                  setActiveRoleFilter(roleCode)
                }}
                className={activeRoleFilter === Number(code) ? "bg-accent" : ""}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabelle */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Zurück
        </Button>
        <div className="text-sm">
          Seite{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
          </strong>
        </div>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Weiter
        </Button>
      </div>
      {/* Role Change Dialog */}
      <Dialog
        open={roleChangeDialog.isOpen}
        onOpenChange={(open) => setRoleChangeDialog({ isOpen: open, member: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rolle ändern</DialogTitle>
            <DialogDescription>Wählen Sie eine neue Rolle für {roleChangeDialog.member?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedNewRole} onValueChange={setSelectedNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Admin</SelectItem>
                <SelectItem value="1">Owner</SelectItem>
                <SelectItem value="2">Organizer</SelectItem>
                <SelectItem value="3">EventOrganizer</SelectItem>
                <SelectItem value="4">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeDialog({ isOpen: false, member: null })}>
              Abbrechen
            </Button>
            <Button onClick={handleRoleSelect} disabled={selectedNewRole === ""}>
              Weiter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog({ isOpen: open, member: null, newRole: 0 })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rolle ändern bestätigen</DialogTitle>
            <DialogDescription>
              Möchten Sie die Rolle von {confirmDialog.member?.fullName} wirklich zu &quot;{roleLabels[confirmDialog.newRole]}&quot; ändern?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, member: null, newRole: 0 })}>
              Abbrechen
            </Button>
            <Button onClick={confirmRoleChange} disabled={updateRole.isPending}>
              {updateRole.isPending ? "Wird geändert..." : "Bestätigen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    {/* Lösch-Bestätigungs-Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{candidate?.fullName} wirklich entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Bitte gib zur Sicherheit den Namen des Nutzers ein: <strong>{candidate?.fullName}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Input
            className="w-full my-2"
            placeholder={candidate?.fullName ?? "Name eingeben"}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={confirmText !== candidate?.fullName || deleteMember.isPending}
            >
              {deleteMember.isPending ? "Lösche..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  </>
  )
}
