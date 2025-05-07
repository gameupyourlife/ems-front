"use client";;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { emailTemplates } from "@/lib/mock/email-data";
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
  Copy,
  Eye,
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

// Add a user-created flag to templates
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  isUserCreated?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export default function EmailTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateToPreview, setTemplateToPreview] = useState<EmailTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [activeTemplateType, setActiveTemplateType] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // In a real app, this would be a fetch call to your API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Add metadata to system templates
        const templatesWithMetadata = emailTemplates.map(template => ({
          ...template,
          isUserCreated: false, // System templates
          createdBy: "System",
          updatedBy: "System",
          createdAt: new Date("2023-01-15"),
          updatedAt: new Date("2023-01-15")
        }));

        // Add a few user-created templates with metadata
        const userTemplates: EmailTemplate[] = [
          {
            id: "user-template-1",
            name: "My Custom Welcome Email",
            subject: "Welcome to [Event Name] - Important Information",
            body: `<h2>Welcome to [Event Name]!</h2>
              <p>Thank you for registering for our upcoming event. We're excited to have you join us!</p>
              <p>This email contains all the information you'll need to make the most of your experience.</p>
              <h3>Event Details:</h3>
              <ul>
                <li><strong>Date:</strong> [Event Date]</li>
                <li><strong>Time:</strong> [Start Time] - [End Time]</li>
                <li><strong>Location:</strong> [Venue Name]</li>
              </ul>
              <h3>What to Bring:</h3>
              <ul>
                <li>Your ticket (digital or printed)</li>
                <li>A notebook and pen</li>
                <li>Business cards for networking</li>
                <li>A fully charged laptop or tablet</li>
              </ul>
              <p>We look forward to seeing you at the event!</p>
              <p>Best regards,<br>The Event Team</p>`,
            description: "My customized welcome email for attendees",
            isUserCreated: true,
            createdBy: "Jane Doe",
            updatedBy: "Jane Doe",
            createdAt: new Date("2023-06-20"),
            updatedAt: new Date("2023-06-25")
          },
          {
            id: "user-template-2",
            name: "Speaker Thank You",
            subject: "Thank You for Speaking at [Event Name]",
            body: `<h2>Thank You for Speaking at [Event Name]!</h2>
              <p>On behalf of all attendees and our organizing team, I want to extend our sincere gratitude for your excellent presentation.</p>
              <p>Your insights on the topic were valuable and generated a lot of positive feedback from our attendees.</p>
              <p>We'd love to invite you back to speak at our future events. In the meantime, we've shared your contact information with those who requested it for follow-up questions.</p>
              <p>Thank you once again for your contribution to making our event a success!</p>
              <p>Best regards,<br>The Event Team</p>`,
            description: "Thank you note for event speakers",
            isUserCreated: true,
            createdBy: "John Smith",
            updatedBy: "John Smith",
            createdAt: new Date("2023-05-10"),
            updatedAt: new Date("2023-05-10")
          }
        ];

        setTemplates([...templatesWithMetadata, ...userTemplates]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePreview = (template: EmailTemplate) => {
    setTemplateToPreview(template);
    setPreviewDialogOpen(true);
  };

  const handleDelete = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      // Filter out the template to delete
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setDeleteDialogOpen(false);
      toast.success(`Template "${templateToDelete.name}" deleted successfully`);
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    // Create a copy of the template with a new ID
    const newTemplate: EmailTemplate = {
      ...template,
      id: `copy-${template.id}-${Date.now()}`,
      name: `Copy of ${template.name}`,
      isUserCreated: true, // Mark as user created
      createdBy: "Current User",
      updatedBy: "Current User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates([...templates, newTemplate]);
    toast.success(`Template "${template.name}" duplicated successfully`);
  };

  // Template type options
  const templateTypes = ["System", "Custom"];

  // Function to toggle template type filter
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

  // Function to check if a filter is active
  const isFilterActive = (value: string) => {
    return activeTemplateType === value;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveTemplateType(null);
    setColumnFilters([]);
    setSearchQuery("");
  };

  // Custom global filter function
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
  const columns: ColumnDef<EmailTemplate>[] = [
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
          Template Name
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
      header: "Description",
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
          Subject Line
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
      accessorFn: (row) => row.isUserCreated ? "Custom" : "System",
      header: "Type",
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
            {isUserCreated ? "Custom" : "System"}
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
      header: "Created By",
      cell: ({ row }) => (
        <div>{row.original.createdBy || "Unknown"}</div>
      ),
    },
    {
      id: "actions",
      header: "Options",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex justify-end">
            <Link href={`/organization/email-templates/${template.id}`} className="flex items-center">
              <Button variant="outline" size="sm" className="mr-2" >
                View
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePreview(template)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Preview</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                {template.isUserCreated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/organization/email-templates/${template.id}/edit`} className="flex cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
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

  // Create the table instance
  const table = useReactTable({
    data: templates,
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

  const quickActions: QuickAction[] = [
    {
        label: "Template erstellen",
        onClick: () => router.push("/organization/email-templates/create"),
        icon: <Plus className="h-4 w-4" />,
    },

];


  return (
    <>
                <SiteHeader actions={quickActions} />

    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-6">

        <div>
          <div className="space-y-4">
            {/* Table Controls */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
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
                        <CommandGroup heading="Template Types">
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

                        {/* Show active filters section if any filters are applied */}
                        {(activeTemplateType || searchQuery) && (
                          <>
                            <CommandSeparator />
                            <CommandGroup heading="Active Filters">
                              {activeTemplateType && (
                                <CommandItem
                                  onSelect={() => toggleTemplateTypeFilter(activeTemplateType)}
                                  className="flex items-center gap-2"
                                >
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    Type: {activeTemplateType}
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
                                createdBy: false,
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
              </div>
            </div>

            {/* Active Filters Display */}
            {(activeTemplateType || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {activeTemplateType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {activeTemplateType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleTemplateTypeFilter(activeTemplateType)}
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

            {/* Selected Templates Count */}
            {Object.keys(rowSelection).length > 0 && (
              <div className="bg-muted text-muted-foreground rounded-md px-4 py-2 text-sm">
                {Object.keys(rowSelection).length} template(s) selected
              </div>
            )}

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              /* Tanstack Table for Templates */
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
                          No templates found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of {templates.length} templates
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
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <AlertDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {templateToPreview?.name}
              {templateToPreview && !templateToPreview.isUserCreated && (
                <Badge className="ml-2 bg-blue-50 text-blue-800">System Template</Badge>
              )}
              {templateToPreview && templateToPreview.isUserCreated && (
                <Badge className="ml-2 bg-green-50 text-green-800">Custom Template</Badge>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {templateToPreview?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="overflow-y-auto max-h-[50vh]">
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                <div className="text-sm border rounded-md p-3 bg-muted/50">{templateToPreview?.subject}</div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Email Body</h3>
                <div className="border rounded-md p-4 ">
                  <div
                    className="prose dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: templateToPreview?.body || "" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            {templateToPreview?.isUserCreated && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mr-auto"
              >
                <Link href={`/organization/email-templates/${templateToPreview?.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Link>
              </Button>
            )}
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Button onClick={() => handleDuplicate(templateToPreview!)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template &quot;{templateToDelete?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>

  );
}