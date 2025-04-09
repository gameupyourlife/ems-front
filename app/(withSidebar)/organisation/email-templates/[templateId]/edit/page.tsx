"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Save,
  Eye, Wand,
  X,
  AlertTriangle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emailTemplates } from "@/lib/mock/email-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
}

// Define form schema with validation
const formSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters.").max(100),
  description: z.string().max(200, "Description must not exceed 200 characters.").optional(),
  subject: z.string().min(2, "Subject line must be at least 2 characters.").max(150, "Subject must not exceed 150 characters."),
  body: z.string().min(10, "Email body must be at least 10 characters."),
});

export default function TemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const isNewTemplate = templateId === "create";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      subject: "",
      body: "<p>Your email content here...</p>"
    },
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        // For a new template, we just use default values
        if (isNewTemplate) {
          setTemplate({
            id: "new-template",
            name: "New Template",
            description: "Enter your template description",
            subject: "Your subject line",
            body: "<p>Enter your email content here...</p>"
          });
          form.reset({
            name: "New Template",
            description: "Enter your template description",
            subject: "Your subject line",
            body: "<p>Enter your email content here...</p>"
          });
          setIsLoading(false);
          return;
        }

        // In a real app, this would be an API call to fetch the template
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find the template in our mock data
        const foundTemplate = emailTemplates.find(t => t.id === templateId);
        
        if (!foundTemplate) {
          setError("Template not found");
          setTemplate(null);
        } else {
          setTemplate(foundTemplate);
          form.reset({
            name: foundTemplate.name,
            description: foundTemplate.description,
            subject: foundTemplate.subject,
            body: foundTemplate.body
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
  }, [templateId, form, isNewTemplate]);

  // Watch form values for preview
  const previewSubject = form.watch("subject");
  const previewBody = form.watch("body");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      // In a real app, this would be an API call to save the template
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate back to template details or templates list
      if (isNewTemplate) {
        router.push('/organisation/email-templates');
      } else {
        router.push(`/organisation/email-templates/${templateId}`);
      }
    } catch (err) {
      console.error("Error saving template:", err);
      // Show error toast or notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call an AI service
      // For now we'll just generate some mock content
      const generatedSubject = `${aiPrompt.substring(0, 20)}${aiPrompt.length > 20 ? '...' : ''}`;
      const generatedBody = `<h2>Generated Email for: ${aiPrompt}</h2>
        <p>This is an AI-generated email based on your request. You can now edit this content to fit your specific needs.</p>
        <p>Your prompt was related to: <strong>${aiPrompt}</strong></p>
        <ul>
          <li>This is a sample bullet point</li>
          <li>You can customize this content</li>
          <li>Add your own specific details</li>
        </ul>
        <p>Thank you for using our service.</p>
        <p><em>Best regards,<br>[Organization]</em></p>`;
      
      // Update the form with generated content
      form.setValue("subject", generatedSubject);
      form.setValue("body", generatedBody);
      
      // Close the AI generator dialog
      setAiGeneratorOpen(false);
      setAiPrompt("");
    } catch (err) {
      console.error("Error generating content:", err);
      // Show error toast or notification here
    } finally {
      setIsGenerating(false);
    }
  };

  // Insert a placeholder at cursor position in body or subject field
  const insertPlaceholder = (placeholder: string, field: "subject" | "body") => {
    const currentValue = form.getValues(field);
    // In a real app, you would use the cursor position
    // For simplicity, we're just appending to the end
    const newValue = `${currentValue} [${placeholder}]`;
    form.setValue(field, newValue);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !isNewTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={isNewTemplate ? "/organisation/email-templates" : `/organisation/email-templates/${templateId}`}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1">Back</span>
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                  {isNewTemplate ? "Create Template" : "Edit Template"}
                </h1>
              </div>
              <p className="text-muted-foreground">
                {isNewTemplate 
                  ? "Create a new organization email template" 
                  : "Update your email template details and content"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A recognizable name for your template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a brief description of this template" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what this template is used for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Email Content</CardTitle>
                  
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="px-6">
                    <TabsList className="grid grid-cols-2 mb-6 w-[200px]">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="code">HTML</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="space-y-1 mb-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject Line</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email subject" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-2 my-3">
                      <div className="text-sm text-muted-foreground">Insert placeholder:</div>
                      <div className="flex flex-wrap gap-1">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => insertPlaceholder("Event Name", "subject")}
                        >
                          [Event Name]
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => insertPlaceholder("Attendee Name", "subject")}
                        >
                          [Attendee Name]
                        </Button>
                      </div>
                    </div>

                    <TabsContent value="edit" className="mt-4">
                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Body</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter email body content (HTML supported)" 
                                className="min-h-[300px] font-mono" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2 mt-4 mb-2">
                        <div className="text-sm text-muted-foreground">Insert placeholder:</div>
                        <div className="flex flex-wrap gap-1">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => insertPlaceholder("Event Name", "body")}
                          >
                            [Event Name]
                          </Button>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => insertPlaceholder("Attendee Name", "body")}
                          >
                            [Attendee Name]
                          </Button>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => insertPlaceholder("Event Date", "body")}
                          >
                            [Event Date]
                          </Button>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => insertPlaceholder("Organization", "body")}
                          >
                            [Organization]
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-6">
                        Use HTML tags for formatting. Placeholders will be replaced with actual content when the email is sent.
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="code" className="mt-4">
                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTML Source</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter HTML code" 
                                className="min-h-[300px] font-mono bg-black text-green-400 dark:bg-black" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-sm text-muted-foreground mt-4">
                        Edit the raw HTML directly. Be careful with syntax to avoid rendering issues.
                      </p>
                    </TabsContent>

                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Template Preview</DialogTitle>
            <DialogDescription>
              This is how your email will appear when sent
            </DialogDescription>
          </DialogHeader>
          
          <div className="border-t -mx-6 px-6 pt-6 flex-1 overflow-hidden">
            <div className="space-y-6 flex-1 overflow-auto">
              <div className="space-y-2">
                <div className="text-sm font-medium">Subject:</div>
                <div className="border rounded-md p-3 bg-muted text-sm">
                  {previewSubject || "No subject provided"}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Email Body:</div>
                <div className="border rounded-md overflow-auto flex-1">
                  <div className="p-5 bg-card">
                    {previewBody ? (
                      <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewBody }}
                      />
                    ) : (
                      <p className="text-muted-foreground">No content provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t -mx-6 px-6 pt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generator Dialog */}
      <Dialog open={aiGeneratorOpen} onOpenChange={setAiGeneratorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Email Generator</DialogTitle>
            <DialogDescription>
              Describe what kind of email you want to create, and our AI will generate content for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="aiPrompt" className="text-sm font-medium">
                What kind of email do you want to create?
              </label>
              <textarea
                id="aiPrompt"
                className="w-full p-2 h-32 border rounded-md resize-none"
                placeholder="e.g. Create a welcome email for new conference attendees with information about the schedule"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiGeneratorOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button 
              onClick={handleAiGenerate}
              disabled={!aiPrompt || isGenerating}
              className="ml-2"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}