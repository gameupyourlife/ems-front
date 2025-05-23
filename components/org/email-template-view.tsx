import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    Copy,
    Eye,
    Edit,
    Trash,
    Calendar,
    Mail,
    User,
    Tag,
    FileText,
    LayoutGrid,
    Code,
    X
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle, DialogClose
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface EmailTemplateViewProps {
  template: {
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
  };
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCreateEmail?: () => void;
  isEvent?: boolean;
  eventId?: string;
  className?: string;
}

export default function EmailTemplateView({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onCreateEmail,
  isEvent = false,
  eventId,
  className = ""
}: EmailTemplateViewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("preview");

  // Gibt das Badge für den Typ der Vorlage zurück
  const getTemplateBadge = () => {
    if (template.isSystemTemplate) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Systemvorlage</Badge>;
    }
    if (template.isEventTemplate) {
      return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">Event-Vorlage</Badge>;
    }
    if (template.isOrgTemplate) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Organisationsvorlage</Badge>;
    }
    return <Badge variant="outline">Vorlage</Badge>;
  };

  // Extrahiert verfügbare Platzhalter aus dem Vorlageninhalt
  const extractPlaceholders = () => {
    const combinedText = template.subject + template.body;
    const regex = /\[([^\]]+)\]/g;
    const matches = combinedText.match(regex);
    if (!matches) return [];
    
    // Entfernt Duplikate und Klammern
    return [...new Set(matches)].map(item => item.replace(/[\[\]]/g, ''));
  };

  const placeholders = extractPlaceholders();

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3 relative">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTemplateBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Vorlage bearbeiten</span>
                  </DropdownMenuItem>
                )}
                
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Vorlage duplizieren</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Vorlage ansehen</span>
                </DropdownMenuItem>
                
                {onCreateEmail && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onCreateEmail}>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>E-Mail aus Vorlage erstellen</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Vorlage löschen</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Betreff
            </div>
            <div className="text-sm border rounded-md p-2 bg-muted">
              {template.subject}
            </div>
          </div>
          
          <div className="space-y-1 flex-grow">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Inhaltsvorschau
            </div>
            <div className="border rounded-md p-3 bg-card text-sm h-32 overflow-hidden relative">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none line-clamp-5"
                dangerouslySetInnerHTML={{ __html: template.body }}
              />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
            </div>
          </div>
          
          {placeholders.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Platzhalter
              </div>
              <div className="flex flex-wrap gap-1">
                {placeholders.map((placeholder, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                  >
                    {placeholder}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {template.updatedAt ? 
            `Aktualisiert am ${format(new Date(template.updatedAt), "d. MMM yyyy")}` : 
            "Kürzlich hinzugefügt"}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8" 
          onClick={() => setIsPreviewOpen(true)}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Vorschau
        </Button>
      </CardFooter>
      
      {/* Dialog für die Vorlagenvorschau */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Vorlagenvorschau: {template.name}</DialogTitle>
              {getTemplateBadge()}
            </div>
            <DialogDescription>
              {template.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="border-t -mx-6 px-6 pt-6 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList>
                <TabsTrigger value="preview" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Vorschau
                </TabsTrigger>
                <TabsTrigger value="placeholders" className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Platzhalter
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-1">
                  <LayoutGrid className="h-4 w-4" />
                  Layout
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="flex-1 overflow-hidden flex flex-col mt-4">
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium">Betreff:</div>
                  <div className="border rounded-md p-3 bg-muted text-sm">
                    {template.subject}
                  </div>
                </div>
                
                <div className="text-sm font-medium mb-2">E-Mail-Inhalt:</div>
                <div className="border rounded-md overflow-auto flex-1">
                  <div className="p-5 bg-card">
                    <div 
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: template.body }}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="placeholders" className="flex-1 overflow-auto mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Platzhalter der Vorlage</h3>
                    <p className="text-sm text-muted-foreground">
                      Die folgenden Platzhalter werden beim Versand der E-Mail durch echte Inhalte ersetzt:
                    </p>
                  </div>
                  
                  {placeholders.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {placeholders.map((placeholder, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium">[{placeholder}]</span>
                          </div>
                          <Badge variant="outline" className="dark:bg-blue-950 dark:text-blue-300 bg-blue-50 text-blue-800">
                            Dynamischer Inhalt
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border rounded-md p-4 text-center bg-muted">
                      <p className="text-sm text-muted-foreground">Keine Platzhalter in dieser Vorlage gefunden</p>
                    </div>
                  )}
                  
                  <div className="dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200 bg-amber-50 border border-amber-200 rounded-md p-4">
                    <h4 className="text-sm font-medium dark:text-amber-200 text-amber-800 mb-1">Verfügbare Platzhalter</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>[Event Name]</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>[Event Date]</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>[Attendee Name]</span>
                      </div>
                      {/* Weitere gängige Platzhalter können hier aufgelistet werden */}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="code" className="flex-1 overflow-auto mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">HTML-Quelltext</h3>
                    <p className="text-sm text-muted-foreground">
                      Der zugrundeliegende HTML-Code dieser Vorlage:
                    </p>
                  </div>
                  
                  <div className="border rounded-md bg-black text-green-400 p-4 overflow-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {template.body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="layout" className="flex-1 overflow-auto mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Layout-Struktur</h3>
                    <p className="text-sm text-muted-foreground">
                      Visuelle Darstellung der Vorlagenstruktur:
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    {/* Hier wird eine vereinfachte HTML-Struktur als Diagramm angezeigt */}
                    <div className="space-y-3">
                      <div className="border border-dashed border-blue-300 dark:border-blue-700 rounded p-2 dark:bg-blue-950 dark:text-blue-300 bg-blue-50 text-blue-800 text-sm text-center">
                        Kopfbereich
                      </div>
                      <div className="border border-dashed border-green-300 dark:border-green-700 rounded p-6 dark:bg-green-950 dark:text-green-300 bg-green-50 text-green-800 text-center">
                        Hauptinhalt
                      </div>
                      <div className="border border-dashed border-amber-300 dark:border-amber-700 rounded p-2 dark:bg-amber-950 dark:text-amber-300 bg-amber-50 text-amber-800 text-sm text-center">
                        Fußbereich
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex justify-between items-center border-t -mx-6 px-6 pt-4">
            {onCreateEmail && (
              <Button onClick={onCreateEmail}>
                <Mail className="h-4 w-4 mr-2" />
                E-Mail erstellen
              </Button>
            )}
            
            <DialogClose asChild>
              <Button variant="outline">
                <X className="h-4 w-4 mr-2" />
                Vorschau schließen
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}