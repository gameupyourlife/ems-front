"use client"

// --- React & Imports ---
import React, { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SearchIcon,
  FilterIcon,
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  ChevronRight,
  Edit,
  TrashIcon,
  ShareIcon,
  PlusIcon,
  ArrowUpDown,
  Clock,
  SortAsc,
  SortDesc,
  Check,
  X,
} from "lucide-react"
import Link from "next/link"
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
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table"
import type { EventInfo } from "@/lib/types-old"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useEventsByCreator } from "@/lib/backend/hooks/events"
import { useSession } from "next-auth/react"
import { useDeleteAttendee } from "@/lib/backend/hooks/events"
import { useQueryClient } from "@tanstack/react-query"
import router, { useRouter } from "next/navigation"

export default function EventTable() {
  // --- Zustand für Sortierung, Filter, Auswahl, Sichtbarkeit, Suche ---
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [searchInput, setSearchInput] = useState("")

  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const token = session?.user?.jwt ?? ""
  const orgId = session?.user?.organization.id ?? ""
  const userId = session?.user?.id ?? ""

  const { data: rawEvents = [], isLoading, error } = useEventsByCreator(orgId, userId, token)
  const { mutate: deleteEvent, status: deleteStatus } = useDeleteAttendee({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventsByCreator", orgId, userId] })
    },
  })

  // --- Daten für die Tabelle vorbereiten ---
  const data: EventInfo[] = useMemo(
    () =>
      rawEvents.map((e: any) => ({
        id: e.id!,
        title: e.title!,
        description: e.description!,
        location: e.location!,
        creatorName: e.creatorName ?? "",
        createdAt: new Date(e.createdAt ?? 0),
        updatedAt: new Date(e.updatedAt ?? 0),
        status: e.status!,
        start: new Date(e.start ?? 0),
        end: new Date(e.end ?? 0),
        category: e.category!,
        attendeeCount: e.attendeeCount!,
        capacity: e.capacity!,
        organization: e.organization ?? "",
        image: e.image ?? "",
        createdBy: e.createdBy ?? "",
        updatedBy: e.updatedBy ?? "",
        isAttending: e.isAttending ?? false,
      })),
    [rawEvents],
  )

  // --- Kategorien extrahieren ---
  const categories = useMemo(
    () => Array.from(new Set(data.map((d) => d.category))),
    [data],
  )

  // --- Debounced globaler Filter ---
  const [globalFilter, setGlobalFilter] = useState("")
  const debouncedSetGlobalFilter = useCallback(
    (() => {
      let timeout: ReturnType<typeof setTimeout>
      return (val: string) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          setGlobalFilter(val)
        }, 300)
      }
    })(),
    []
  )

  // --- Filterfunktion für die globale Suche ---
  const globalFilterFn = useCallback((row: { original: { title: string; location: string; description: string } }, _columnId: any, filterValue: string) => {
    if (!filterValue) return true
    const term = filterValue.toLowerCase()
    return (
      row.original.title.toLowerCase().includes(term) ||
      row.original.location.toLowerCase().includes(term) ||
      row.original.description.slice(0, 100).toLowerCase().includes(term)
    )
  }, [])

  // --- Status- und Kategorie-Filter ---
  const [activeStatus, setActiveStatus] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleStatusFilter = useCallback(
    (status: string) => {
      setActiveStatus((curr) => (curr === status ? null : status))
      setColumnFilters((prev) => {
        const others = prev.filter((f) => f.id !== "status")
        return activeStatus === status ? others : [...others, { id: "status", value: status }]
      })
    },
    [activeStatus],
  )

  const toggleCategoryFilter = useCallback(
    (cat: string) => {
      setActiveCategory((curr) => (curr === cat ? null : cat))
      setColumnFilters((prev) => {
        const others = prev.filter((f) => f.id !== "category")
        return activeCategory === cat ? others : [...others, { id: "category", value: cat }]
      })
    },
    [activeCategory],
  )

  const clearAllFilters = useCallback(() => {
    setActiveStatus(null)
    setActiveCategory(null)
    setSearchInput("")
    setColumnFilters([])
    setGlobalFilter("")
  }, [])

  // --- Spalten-Definitionen ---
  const columns = useMemo<ColumnDef<EventInfo>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Zeile auswählen"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: "Titel",
        cell: ({ row }) => <div className="font-medium truncate">{row.original.title}</div>,
      },
      {
        accessorKey: "category",
        header: "Kategorie",
        cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
        filterFn: (row, id, value) => value === row.getValue(id),
      },
      {
        id: "date",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
          const date = row.original.start
          const now = new Date()
          const isToday = date.toDateString() === now.toDateString()
          const isPast = date < now && !isToday
          const formattedDate = format(date, "dd. MMM yyyy", { locale: de })
          const formattedTime = format(date, "HH:mm")
          let badge = { text: "", variant: "default" as "default" | "destructive" | "secondary" }
          if (isPast) badge = { text: "Vergangen", variant: "secondary" }
          else if (isToday) badge = { text: "Heute", variant: "destructive" }
          else badge = { text: `In ${formatDistanceToNow(date, { locale: de })}`, variant: "default" }

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formattedTime}</span>
                <Badge variant={badge.variant} className="ml-2">{badge.text}</Badge>
              </div>
            </div>
          )
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
        accessorKey: "attendeeCount",
        header: ({ column }) => (
          <div className="text-right">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Teilnehmer
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const { attendeeCount, capacity } = row.original
          const pct = capacity ? Math.min(100, Math.round((attendeeCount / capacity) * 100)) : 0
          return (
            <div className="text-right w-32">
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {attendeeCount} / {capacity}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
              <Progress value={pct} className={cn("h-1.5 rounded-full", {
                "bg-muted": pct < 70,
                "bg-amber-100": pct >= 70 && pct < 90,
                "bg-red-100": pct >= 90,
              })} indicatorClassName={cn({
                "bg-primary": pct < 70,
                "bg-amber-500": pct >= 70 && pct < 90,
                "bg-red-500": pct >= 90,
              })} />
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
      },
      {
        accessorKey: "description",
        header: "Beschreibung",
        cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.description}</div>,
      },
      {
        id: "actions",
        cell: ({ row }) => <RowActions event={row.original} onDelete={deleteEvent} />,
      },
    ]
  }, [deleteEvent, activeCategory, activeStatus])

  // --- Aktionen für jede Zeile ---
  const RowActions = React.memo(({ event, onDelete }: { event: EventInfo; onDelete: any }) => (
    <div className="flex items-center justify-end gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/organization/events/${event.id}`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/organization/events/${event.id}/edit`} className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Event bearbeiten
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/organization/events/${event.id}`} className="flex items-center gap-2">
              <ShareIcon className="h-4 w-4" /> Event teilen
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => window.confirm("Bist du sicher, dass du dieses Event löschen möchtest?") && onDelete({ orgId, eventId: event.id, token })} className="text-destructive flex items-center gap-2">
            <TrashIcon className="h-4 w-4" /> Event löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ))
  RowActions.displayName = "RowActions"

  // --- Tabelle initialisieren ---
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  const router = useRouter();
  return (
    <div className="space-y-4">
      {/* Suchfeld */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Events durchsuchen..."
            className="pl-8 w-full"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              debouncedSetGlobalFilter(e.target.value)
            }}
          />
        </div>
        {/* Filter & Neuer Event */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter-Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filter
                {(columnFilters.length > 0 || searchInput) && (
                  <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                    {columnFilters.length + (searchInput ? 1 : 0)}
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
                    {["Aktiv","Abgeschlossen","Entwurf","Abgesagt"].map(status => (
                      <CommandItem
                        key={status}
                        onSelect={() => toggleStatusFilter(status)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-lg border border-primary/20",
                            activeStatus === status ? "bg-primary text-white" : "opacity-50",
                          )}
                        >
                          {activeStatus === status && <Check className="h-4 w-4" />}
                        </div>
                        <span>{status}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Kategorie">
                    {categories.map(cat => (
                      <CommandItem
                        key={cat}
                        onSelect={() => toggleCategoryFilter(cat)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-lg border border-primary/20",
                            activeCategory === cat ? "bg-primary text-white" : "opacity-50",
                          )}
                        >
                          {activeCategory === cat && <Check className="h-4 w-4" />}
                        </div>
                        <span>{cat}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Aktive Filter">
                    {activeStatus && <CommandItem onSelect={() => toggleStatusFilter(activeStatus)} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        Status: {activeStatus}<X className="h-3 w-3"/>
                      </Badge>
                    </CommandItem>}
                    {activeCategory && <CommandItem onSelect={() => toggleCategoryFilter(activeCategory)} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        Kategorie: {activeCategory}<X className="h-3 w-3"/>
                      </Badge>
                    </CommandItem>}
                    {searchInput && <CommandItem onSelect={() => { setSearchInput(""); setGlobalFilter(""); }} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        Suche: {searchInput.length>10?`${searchInput.slice(0,10)}...`:searchInput}<X className="h-3 w-3"/>
                      </Badge>
                    </CommandItem>}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs" disabled={!columnFilters.length && !searchInput}>
                  Alle Filter zurücksetzen
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabelle */}
      <div className="overflow-auto border rounded-md">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} >
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
                <TableRow key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => router.push(`/organization/events/${row.original.id}`)}
                  className="cursor-pointer hover:bg-muted/40 transition">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

      {/* Paginierung */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Zeige {table.getRowModel().rows.length} von {data.length} Events
        </div>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Zurück
          </Button>
          <span className="text-sm">
            Seite <strong>{table.getState().pagination.pageIndex + 1} von {table.getPageCount()}</strong>
          </span>
          <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Weiter
          </Button>
        </div>
      </div>
    </div>
  )
}