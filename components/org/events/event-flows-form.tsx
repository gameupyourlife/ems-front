"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

// UI-Komponenten
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
    ArrowLeftIcon,
    Check,
    FunctionSquare,
    Plus,
    Calendar,
    Users,
    Tag,
    Mail,
    Zap,
    FileText,
    LayoutList,
    PencilLine,
    Bell,
    Image
} from "lucide-react";

// Typen
import { Flow } from "@/lib/types-old";

interface EventFlowsFormProps {
  selectedFlows: Flow[];
  availableFlows: Flow[];
  onFlowsChange: (flows: Flow[]) => void;
  onTabChange?: (tab: string) => void;
  eventId?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function EventFlowsForm({
  selectedFlows,
  availableFlows,
  onFlowsChange,
  onTabChange,
  eventId,
  submitLabel = "Änderungen speichern",
  isSubmitting = false
}: EventFlowsFormProps) {
  // Auswahl eines Flows umschalten
  const toggleFlowSelection = (flow: Flow) => {
    if (selectedFlows.some(f => f.id === flow.id)) {
      onFlowsChange(selectedFlows.filter(f => f.id !== flow.id));
    } else {
      onFlowsChange([...selectedFlows, flow]);
    }
  };

  // Gibt das passende Icon für einen Trigger-Typ zurück
  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'numOfAttendees':
        return <Users className="h-4 w-4" />;
      case 'status':
        return <Tag className="h-4 w-4" />;
      case 'registration':
        return <Check className="h-4 w-4" />;
      default:
        return <FunctionSquare className="h-4 w-4" />;
    }
  };

  // Gibt das passende Icon für einen Aktions-Typ zurück
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'statusChange':
        return <Tag className="h-4 w-4" />;
      case 'fileShare':
        return <FileText className="h-4 w-4" />;
      case 'imageChange':
        return <Image className="h-4 w-4" />;
      case 'titleChange':
        return <LayoutList className="h-4 w-4" />;
      case 'descriptionChange':
        return <PencilLine className="h-4 w-4" />;
      default:
        return <FunctionSquare className="h-4 w-4" />;
    }
  };

  // Gibt eine verständliche Beschreibung für einen Trigger zurück
  const getTriggerDescription = (type: string, details: any) => {
    switch (type) {
      case 'date':
        return details?.reference ? 
          `${details.amount} ${details.unit} ${details.direction} Event ${details.reference}` : 
          'Zu einem bestimmten Datum';
      case 'numOfAttendees':
        return details?.operator ? 
          `Wenn Teilnehmerzahl ${details.operator} ${details.value}${details.valueType === 'percentage' ? '%' : ''}` :
          'Wenn eine bestimmte Teilnehmerzahl erreicht wird';
      case 'status':
        return details?.status ? 
          `Wenn der Event-Status auf ${details.status} wechselt` :
          'Wenn sich der Event-Status ändert';
      case 'registration':
        return 'Wenn sich jemand für das Event registriert';
      default:
        return 'Wenn ausgelöst';
    }
  };

  // Gibt eine verständliche Beschreibung für eine Aktion zurück
  const getActionDescription = (type: string, details: any) => {
    switch (type) {
      case 'email':
        return details?.subject ? 
          `E-Mail senden: "${details.subject}"` :
          'E-Mail-Benachrichtigung senden';
      case 'notification':
        return 'In-App-Benachrichtigung senden';
      case 'statusChange':
        return details?.newStatus ? 
          `Event-Status auf ${details.newStatus} ändern` :
          'Event-Status aktualisieren';
      case 'fileShare':
        return 'Dateien mit Teilnehmern teilen';
      case 'titleChange':
        return details?.newTitle ? 
          `Titel ändern zu "${details.newTitle}"` :
          'Event-Titel ändern';
      case 'descriptionChange':
        return 'Event-Beschreibung aktualisieren';
      default:
        return 'Aktion ausführen';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FunctionSquare className="h-5 w-5 text-primary" />
          Event-Flows
        </CardTitle>
        <CardDescription>
          Füge Automatisierungs-Flows hinzu, die mit diesem Event verknüpft werden
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Flows für dieses Event</h3>
            <p className="text-sm text-muted-foreground">
              Wähle Automatisierungs-Flows aus, die mit deinem Event verknüpft werden sollen
              {selectedFlows.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {selectedFlows.length} ausgewählt
                </Badge>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={eventId ? `/organization/flows/create?eventId=${eventId}` : "/organization/flows/create"}>
              <Plus className="h-4 w-4 mr-2" />
              Neuen Flow erstellen
            </Link>
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        {availableFlows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FunctionSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Keine Flows verfügbar</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Erstelle neue Automatisierungs-Flows, um sie mit diesem Event zu verknüpfen
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href={eventId ? `/organization/flows/create?eventId=${eventId}` : "/organization/flows/create"}>
                <FunctionSquare className="h-4 w-4 mr-2" />
                Flow erstellen
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {availableFlows.map((flow) => {
                const isSelected = selectedFlows.some(f => f.id === flow.id);
                return (
                  <div 
                    key={flow.id} 
                    className={cn(
                      "border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow cursor-pointer",
                      isSelected ? "border-primary shadow-sm" : "hover:border-primary/50"
                    )}
                    onClick={() => toggleFlowSelection(flow)}
                  >
                    <div className={cn(
                      "p-4 border-b flex justify-between items-center",
                      isSelected ? "bg-primary/5" : "bg-muted/20"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <FunctionSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{flow.name}</h4>
                          <p className="text-xs text-muted-foreground">{flow.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-background">
                          {flow.trigger.length} {flow.trigger.length === 1 ? 'Trigger' : 'Trigger'}
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          {flow.actions.length} {flow.actions.length === 1 ? 'Aktion' : 'Aktionen'}
                        </Badge>
                        {isSelected ? (
                          <div className="ml-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="ml-2 h-6 w-6 border rounded-full flex items-center justify-center text-muted-foreground shrink-0">
                            <Plus className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Trigger-Spalte */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3 pb-1 border-b">
                            <Zap className="h-4 w-4" />
                            WENN F
                          </h5>
                          
                          <div className="space-y-2">
                            {flow.trigger.map((trigger) => (
                              <div 
                                key={trigger.id} 
                                className="flex items-start gap-3 p-2 border rounded-md bg-muted/20"
                              >
                                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                  {getTriggerIcon(trigger.type)}
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium capitalize">{trigger.type}</h6>
                                  <p className="text-xs text-muted-foreground">
                                    {getTriggerDescription(trigger.type, trigger.details)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Aktionen-Spalte */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3 pb-1 border-b">
                            <FunctionSquare className="h-4 w-4" />
                            DANN FÜHRE DIESE AKTIONEN AUS
                          </h5>
                          
                          <div className="space-y-2">
                            {flow.actions.map((action) => (
                              <div 
                                key={action.id} 
                                className="flex items-start gap-3 p-2 border rounded-md bg-muted/20"
                              >
                                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                  {getActionIcon(action.type)}
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium capitalize">{action.type}</h6>
                                  <p className="text-xs text-muted-foreground">
                                    {getActionDescription(action.type, action.details)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" type="button" onClick={() => onTabChange && onTabChange("files")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Zurück: Dateien
        </Button>
        <Button variant="default" type="button" onClick={() => onTabChange && onTabChange("agenda")}>
          Weiter: Agenda
          <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
        </Button>
      </CardFooter>
    </Card>
  );
}