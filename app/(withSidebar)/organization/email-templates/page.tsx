"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Trash,
  Edit,
  MoreHorizontal,
  FilterIcon,
  ArrowUpDown,
  ChevronRight,
  X,
  Check,
  LayoutList,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { useSession } from "next-auth/react";
import { useMailTemplates } from "@/lib/backend/hooks/use-mail-templates";
import { OrgMail } from "@/lib/backend/types";
import { deleteMailTemplate } from "@/lib/backend/mail-templates";
import { useQueryClient } from "@tanstack/react-query";

export default function EmailTemplates() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient()
  const { data: templates, isLoading } = useMailTemplates(session?.user?.organization.id || "", session?.user?.jwt || "")

  const [searchQuery, setSearchQuery] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<OrgMail | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [activeTemplateType, setActiveTemplateType] = useState<string | null>(null);

  const handleDelete = (template: OrgMail) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        deleteMailTemplate(session?.user?.organization.id || "", templateToDelete.id, session?.user?.jwt || "")
        queryClient.invalidateQueries({ queryKey: ["mailTemplates"] })
        toast.success(`Vorlage "${templateToDelete.name}" erfolgreich gelöscht`);
      } catch {
        toast.error("Löschen fehlgeschlagen")
      } finally {
        setDeleteDialogOpen(false);
      }
    }
  };

  // Filter-Logik
  const templateTypes = ["System", "Benutzerdefiniert"];

  // Template-Typ-Filter umschalten
  const toggleTemplateTypeFilter = (type: string) => {
    if (activeTemplateType === type) {
      setActiveTemplateType(null);
      setColumnFilters(prevFilters => prevFilters.filter(filter => filter.id !== "templateType"));
      return;
    }

    setActiveTemplateType(type);
    setColumnFilters(prevFilters => {
      const otherFilters = prevFilters.filter(filter => filter.id !== "templateType");
      return [...otherFilters, {
        id: "templateType",
        value: type === "System" ? false : true
      }];
    });
  };

  // Prüfen, ob Filter aktiv ist
  const isFilterActive = (value: string) => {
    return activeTemplateType === value;
  };

  // Alle Filter zurücksetzen
  const clearAllFilters = () => {
    setActiveTemplateType(null);
    setColumnFilters([]);
    setSearchQuery("");
  };

  // Benutzerdefinierte globale Filterfunktion
  const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
    const templateName = String(row.original.name).toLowerCase();
    const templateDesc = String(row.original.description).toLowerCase();
    const templateSubject = String(row.original.subject).toLowerCase();
    const createdBy = String(row.original.createdBy || "").toLowerCase();
    const searchTerm = filterValue.toLowerCase();

    return templateName.includes(searchTerm) ||
      templateDesc.includes(searchTerm) ||
      templateSubject.includes(searchTerm) ||
      createdBy.includes(searchTerm);
  };

  // Define the columns for the table
  const columns: ColumnDef<OrgMail>[] = [
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
          Vorlagenname
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.original.name}</span>
        </div>
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
      accessorKey: "subject",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Betreffzeile
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.original.subject}
        </div>
      ),
    },
    {
      id: "templateType",
      accessorFn: (row) => row.isUserCreated ? "Benutzerdefiniert" : "System",
      header: "Typ",
      cell: ({ row }) => {
        const isUserCreated = row.original.isUserCreated;
        return (
          <Badge
            variant="outline"
            className={cn(
              isUserCreated
                ? "bg-green-50 text-green-800"
                : "bg-blue-50 text-blue-800"
            )}
          >
            {isUserCreated ? "Benutzerdefiniert" : "System"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === null) return true;
        return row.original.isUserCreated === value;
      },
    },
    {
      accessorKey: "createdBy",
      header: "Erstellt von",
      cell: ({ row }) => (
        <div>{row.original.createdBy || "Unbekannt"}</div>
      ),
    },
    {
      id: "actions",
      header: "Optionen",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex justify-end">
            <Link href={`/organization/email-templates/${template.id}`} className="flex items-center">
              <Button variant="outline" size="sm" className="mr-2" >
                Anzeigen
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menü öffnen</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">


                {template.isUserCreated && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/organization/email-templates/${template.id}/edit`} className="flex cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Bearbeiten</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Löschen</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Tabelle initialisieren
  const table = useReactTable({
    data: templates || [],
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
        createdBy: false,
      },
    },
  });

  if (!templates && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Keine Vorlagen gefunden.</p>
      </div>
    );
  }

  // Quick Actions für Header
  const quickActions: QuickAction[] = [
    {
      label: "Vorlage erstellen",
      onClick: () => router.push("/organization/email-templates/create"),
      icon: <Plus className="h-4 w-4" />,
    },

  ];

  // Render
  return (
    <>
      <SiteHeader actions={quickActions} />

      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-6">

          <div>
            <div className="space-y-4">
              {/* Tabellen-Steuerung */}
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Vorlagen durchsuchen..."
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
                          <CommandGroup heading="Vorlagentypen">
                            {templateTypes.map((type) => (
                              <CommandItem
                                key={type}
                                onSelect={() => toggleTemplateTypeFilter(type)}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={cn(
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

                          {/* Aktive Filter anzeigen */}
                          {(activeTemplateType || searchQuery) && (
                            <>
                              <CommandSeparator />
                              <CommandGroup heading="Aktive Filter">
                                {activeTemplateType && (
                                  <CommandItem
                                    onSelect={() => toggleTemplateTypeFilter(activeTemplateType)}
                                    className="flex items-center gap-2"
                                  >
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      Typ: {activeTemplateType}
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

                  {/* Spaltenauswahl-Menü */}
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
                                  createdBy: false,
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
                </div>
              </div>

              {/* Aktive Filter-Anzeige */}
              {(activeTemplateType || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Aktive Filter:</span>
                  {activeTemplateType && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Typ: {activeTemplateType}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleTemplateTypeFilter(activeTemplateType)}
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

              {/* Anzahl ausgewählter Vorlagen */}
              {Object.keys(rowSelection).length > 0 && (
                <div className="bg-muted text-muted-foreground rounded-md px-4 py-2 text-sm">
                  {Object.keys(rowSelection).length} Vorlage(n) ausgewählt
                </div>
              )}

              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                /* Tanstack Tabelle für Vorlagen */
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
                            Keine Vorlagen gefunden.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Paginierungs-Steuerung */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Zeige {table.getRowModel().rows.length} von {templates?.length} Vorlagen
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
          </div>
        </div>

        

        {/* Lösch-Bestätigungsdialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Vorlage löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie die Vorlage &quot;{templateToDelete?.name}&quot; wirklich löschen?
                Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash className="h-4 w-4 mr-2" />
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}