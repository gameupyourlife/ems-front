"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { emailTemplates } from "@/lib/mock/email-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  FileText, 
  Search, 
  Plus, 
  Trash, 
  Edit, 
  Copy, 
  Eye, 
  Mail, 
  MoreVertical 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Add a user-created flag to templates
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  isUserCreated?: boolean;
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

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // In a real app, this would be a fetch call to your API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add a flag to differentiate system vs user templates
        const templatesWithFlag = emailTemplates.map(template => ({
          ...template,
          isUserCreated: false // System templates
        }));
        
        // Add a few user-created templates
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
            isUserCreated: true
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
            isUserCreated: true
          }
        ];
        
        setTemplates([...templatesWithFlag, ...userTemplates]);
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

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    // Create a copy of the template with a new ID
    const newTemplate: EmailTemplate = {
      ...template,
      id: `copy-${template.id}-${Date.now()}`,
      name: `Copy of ${template.name}`,
      isUserCreated: true, // Mark as user created
    };
    
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Create and manage email templates for your events
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/organisation/email-templates/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="flex-1"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No templates found. Try adjusting your search or create a new template.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base truncate">{template.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(template)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            {template.isUserCreated && (
                              <DropdownMenuItem asChild>
                                <Link href={`/organisation/email-templates/${template.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {template.isUserCreated && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(template)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <CardDescription className="truncate max-w-[80%]">
                          {template.description}
                        </CardDescription>
                        {!template.isUserCreated && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800">
                            System
                          </Badge>
                        )}
                        {template.isUserCreated && (
                          <Badge variant="outline" className="bg-green-50 text-green-800">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Subject: </span> 
                        <span className="truncate">{template.subject}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> 
                        Preview
                      </Button>
                      {template.isUserCreated && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                        >
                          <Link href={`/organisation/email-templates/${template.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                <div className="border rounded-md p-4 bg-white">
                  <div 
                    className="prose max-w-none text-sm"
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
                <Link href={`/organisation/email-templates/${templateToPreview?.id}/edit`}>
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
  );
}