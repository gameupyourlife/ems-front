"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Mail,
  Calendar,
  FileText,
  Code,
  Settings,
  Edit,
  Copy,
  Trash,
  Eye,
  User,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { emailTemplates } from "@/lib/mock/email-data";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  isSystemTemplate?: boolean;
  isOrgTemplate?: boolean;
  isEventTemplate?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  usageCount?: number;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call to fetch the template
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find the template in our mock data
        const foundTemplate = emailTemplates.find(t => t.id === templateId);
        
        if (!foundTemplate) {
          setError("Template not found");
          setTemplate(null);
        } else {
          // Extend the template with additional properties for the detail view
          setTemplate({
            ...foundTemplate,
            isOrgTemplate: true,
            createdAt: new Date("2023-09-15"),
            updatedAt: new Date("2023-10-01"),
            createdBy: "Administrator",
            updatedBy: "Jane Smith",
            usageCount: Math.floor(Math.random() * 25) + 1 // Random usage count for demonstration
          });
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching template:", err);
        setError("Failed to load template. Please try again.");
        setTemplate(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  // Extract placeholders from the template content
  const extractPlaceholders = () => {
    if (!template) return [];
    
    const combinedText = template.subject + template.body;
    const regex = /\[([^\]]+)\]/g;
    const matches = combinedText.match(regex);
    
    if (!matches) return [];
    
    // Remove duplicates and brackets
    return [...new Set(matches)].map(item => item.replace(/[\[\]]/g, ''));
  };

  const placeholders = extractPlaceholders();

  const handleDeleteTemplate = async () => {
    try {
      // In a real app, this would be a DELETE request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Redirect to templates list
      router.push('/organisation/email-templates');
    } catch (err) {
      console.error("Error deleting template:", err);
      // Show error toast or notification here
    }
  };

  const handleDuplicateTemplate = async () => {
    try {
      // In a real app, this would be a POST request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Redirect to the duplicated template (in a real app, you'd use the new ID)
      const newTemplateId = `copy-${templateId}`;
      router.push(`/organisation/email-templates/${newTemplateId}`);
    } catch (err) {
      console.error("Error duplicating template:", err);
      // Show error toast or notification here
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) return;
    
    setIsSendingTestEmail(true);
    try {
      // In a real app, this would be a POST request to your API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTestEmailSent(true);
      // Reset after 3 seconds
      setTimeout(() => {
        setIsTestEmailDialogOpen(false);
        setTestEmailSent(false);
        setTestEmailAddress("");
      }, 3000);
    } catch (err) {
      console.error("Error sending test email:", err);
      // Show error toast or notification here
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || "The requested template could not be found."}</p>
        <Button variant="outline" asChild>
          <Link href="/organisation/email-templates">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/organisation/email-templates">
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Template Details</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage email template details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isTestEmailDialogOpen} onOpenChange={setIsTestEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
                <DialogDescription>
                  Send a test email using this template to verify its appearance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="testEmail" className="text-sm font-medium">
                    Recipient Email
                  </label>
                  <input
                    id="testEmail"
                    type="email"
                    placeholder="email@example.com"
                    className="w-full p-2 border rounded-md"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    disabled={isSendingTestEmail || testEmailSent}
                  />
                </div>
              </div>
              <DialogFooter>
                {testEmailSent ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Test email sent successfully!
                  </div>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsTestEmailDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendTestEmail}
                      disabled={!testEmailAddress || isSendingTestEmail}
                      className="ml-2"
                    >
                      {isSendingTestEmail ? (
                        <>
                          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" asChild>
            <Link href={`/organisation/email-templates/${templateId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </Link>
          </Button>

          <Button variant="outline" onClick={handleDuplicateTemplate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this template? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTemplate}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Organization Template
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="preview" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="placeholders" className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Placeholders
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="usage" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Usage
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="preview" className="border-t pt-6 px-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Subject:</div>
                      <div className="border rounded-md p-3 bg-muted text-sm">
                        {template.subject}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Email Body:</div>
                      <div className="border rounded-md overflow-auto">
                        <div className="p-5 bg-card">
                          <div 
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: template.body }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="placeholders" className="border-t pt-6 px-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Template Placeholders</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placeholders will be replaced with actual content when an email is sent.
                      </p>
                    </div>
                    
                    {placeholders.length > 0 ? (
                      <div className="border rounded-md divide-y">
                        {placeholders.map((placeholder, index) => (
                          <div key={index} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <Tag className="h-5 w-5" />
                              </div>
                              <div>
                                <h6 className="font-medium">[{placeholder}]</h6>
                                <p className="text-sm text-muted-foreground">
                                  {placeholder === "Event Name" && "The name of the event"}
                                  {placeholder === "Event Date" && "The date when the event takes place"}
                                  {placeholder === "Attendee Name" && "The name of the attendee"}
                                  {placeholder === "Organization" && "Your organization's name"}
                                  {!["Event Name", "Event Date", "Attendee Name", "Organization"].includes(placeholder) && "Dynamic content"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="dark:bg-blue-950 dark:text-blue-300 bg-blue-50 text-blue-800">
                              Dynamic Content
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border rounded-md p-6 text-center bg-muted">
                        <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No placeholders found in this template</p>
                      </div>
                    )}
                    
                    <div className="dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200 bg-amber-50 border border-amber-200 rounded-md p-4">
                      <h4 className="text-sm font-medium dark:text-amber-200 text-amber-800 mb-2">Available Placeholders</h4>
                      <p className="text-sm mb-3">These standard placeholders can be used in any template:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <Tag className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Event Name]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Event Date]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Attendee Name]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Email Address]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Organization]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="code" className="border-t pt-6 px-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">HTML Source Code</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        The underlying HTML code for this email template.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Subject:</div>
                        <div className="border rounded-md p-3 bg-black text-green-400 font-mono text-sm">
                          {template.subject}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Body:</div>
                        <div className="border rounded-md bg-black text-green-400 p-4 overflow-auto max-h-[500px]">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {template.body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="usage" className="border-t pt-6 px-6 pb-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Template Usage</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        How this template is being used across your organization.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{template.usageCount}</div>
                          <p className="text-xs text-muted-foreground mt-1">Times this template has been used</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium">Events Using</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{Math.ceil((template.usageCount ?? 0) / 3)}</div>
                          <p className="text-xs text-muted-foreground mt-1">Events using this template</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium">Last Used</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-base font-bold">{format(new Date(), "MMM d, yyyy")}</div>
                          <p className="text-xs text-muted-foreground mt-1">For Autumn Conference</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="font-medium mb-3">Recent Emails Using This Template</h4>
                      <div className="border rounded-md divide-y">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="h-4 w-4" />
                              </div>
                              <div>
                                <h6 className="font-medium">{
                                  i === 1 ? "Event Reminder" : 
                                  i === 2 ? "Welcome to Conference" : 
                                  "Thank you for attending"
                                }</h6>
                                <p className="text-xs text-muted-foreground">
                                  Sent to {i * 5} recipients • {
                                    i === 1 ? "2 days ago" : 
                                    i === 2 ? "1 week ago" : 
                                    "2 weeks ago"
                                  }
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                                i === 1 ? "default" : 
                                i === 2 ? "secondary" : 
                                "outline"
                            }>
                              {
                                i === 1 ? "Autumn Conference" : 
                                i === 2 ? "Tech Summit" : 
                                "Product Launch"
                              }
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-none">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">How to use this template</h3>
                <p className="text-muted-foreground mt-1 text-sm">There are several ways to utilize this email template:</p>
              </div>
              <Button variant="outline" className="shrink-0" onClick={() => setIsTestEmailDialogOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">Use in event communications</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This template can be used when sending emails to event attendees.
                    Go to an event page and select this template from the communications tab.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">Create an event-specific version</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can duplicate this template for a specific event to customize it further.
                    Go to an event's templates tab and choose "Duplicate from Organization".
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-300">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">Use in automation flows</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This template can be selected when creating email actions in automation flows,
                    allowing you to send emails automatically based on triggers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Template ID</div>
                <div className="font-mono text-sm">{template.id}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Created By</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{template.createdBy}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Last Updated By</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{template.updatedBy}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Created Date</div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(template.createdAt!), "MMMM d, yyyy")}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(template.updatedAt!), "MMMM d, yyyy")}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Used In</div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{template.usageCount} emails</span>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Type</div>
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Organization Template
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Template Usage</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">Reminders</Badge>
                  <Badge variant="outline">Notifications</Badge>
                  <Badge variant="outline">Confirmations</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/organisation/email-templates/${templateId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={handleDuplicateTemplate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Template
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsTestEmailDialogOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}