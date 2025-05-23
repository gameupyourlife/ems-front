"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FunctionSquare, History, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getActionIcon, getTriggerIcon } from "@/lib/flows/utils";

// Interface für Flow-Runs (Ausführungen)
interface FlowRun {
  id: string;
  flowId: string;
  flowName: string;
  status: "success" | "failed" | "running";
  startedAt: Date;
  completedAt?: Date;
  triggerType: string;
  triggerDetails?: any;
  actions: {
    id: string;
    type: string;
    name: string;
    status: "success" | "failed" | "skipped" | "running";
    details: string;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
    logs?: string[];
  }[];
  error?: string;
}

export default function FlowRunDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const runId = params.runId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flowRun, setFlowRun] = useState<FlowRun | null>(null);

  useEffect(() => {
    const fetchFlowRun = async () => {
      setIsLoading(true);
      try {
        // In einer echten App wäre dies ein API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock-Daten für Flow-Run
        const mockFlowRun: FlowRun = {
          id: runId,
          flowId: "flow-1",
          flowName: "Registrierungsbestätigung",
          status: runId === "run-3" ? "failed" : (runId === "run-4" ? "running" : "success"),
          startedAt: new Date("2023-10-18T14:23:12"),
          completedAt: runId === "run-4" ? undefined : new Date("2023-10-18T14:23:19"),
          triggerType: "registration",
          triggerDetails: {
            attendeeEmail: "john.doe@example.com",
            attendeeName: "John Doe",
            registrationTime: "2023-10-18T14:23:10"
          },
          actions: [
            {
              id: "action-1",
              type: "email",
              name: "Bestätigungs-E-Mail senden",
              status: runId === "run-3" ? "failed" : (runId === "run-4" ? "running" : "success"),
              details: "E-Mail-Vorlage: Registrierungsbestätigung",
              startedAt: new Date("2023-10-18T14:23:15"),
              completedAt: runId === "run-4" ? undefined : new Date("2023-10-18T14:23:18"),
              error: runId === "run-3" ? "E-Mail-Server-Fehler: Verbindung abgelehnt" : undefined,
              logs: [
                "Starte E-Mail-Aktion",
                "Lade E-Mail-Vorlage 'Registrierungsbestätigung'",
                "Ersetze Platzhalter mit Teilnehmerdaten",
                runId === "run-3" ? "FEHLER: Verbindung zum E-Mail-Server fehlgeschlagen" : "E-Mail erfolgreich an john.doe@example.com gesendet",
              ]
            },
            {
              id: "action-2",
              type: "notification",
              name: "Team benachrichtigen",
              status: runId === "run-3" ? "skipped" : (runId === "run-4" ? "running" : "success"),
              details: "Benachrichtigungskanal: Slack",
              startedAt: new Date("2023-10-18T14:23:18"),
              completedAt: runId === "run-4" || runId === "run-3" ? undefined : new Date("2023-10-18T14:23:19"),
              logs: [
                "Starte Benachrichtigungsaktion",
                runId === "run-3" ? "Übersprungen wegen vorherigem Fehler" : (runId === "run-4" ? "Bereite Benachrichtigungsinhalt vor..." : "Benachrichtigung an #registrations Kanal gesendet")
              ]
            }
          ],
          error: runId === "run-3" ? "Flow-Ausführung fehlgeschlagen: E-Mail-Aktion fehlgeschlagen" : undefined
        };
        
        setFlowRun(mockFlowRun);
        setError(null);
      } catch (err) {
        console.error("Fehler beim Laden des Flow-Runs:", err);
        setError("Fehler beim Laden der Flow-Run-Details. Bitte versuche es erneut.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlowRun();
  }, [runId]);

  // Gibt ein Status-Badge für den Flow-Run zurück
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">Erfolgreich</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300">Fehlgeschlagen</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Läuft</Badge>;
      case 'skipped':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Übersprungen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Gibt ein Status-Icon zurück
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />;
      case 'running':
        return <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />;
      case 'skipped':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !flowRun) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Fehler beim Laden des Flow-Runs</h2>
        <p className="text-muted-foreground mb-6">{error || "Flow-Run nicht gefunden"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organization/flows/${flowRun.flowId}`}>
              <FunctionSquare className="mr-2 h-4 w-4" />
              Flow-Definition anzeigen
            </Link>
          </Button>
          
          {flowRun.status === "failed" && (
            <Button variant="default" size="sm" onClick={() => console.log("Flow-Ausführung erneut versuchen")}>
              <History className="mr-2 h-4 w-4" />
              Flow erneut ausführen
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Flow-Run: {flowRun.flowName}</CardTitle>
              <CardDescription>{format(new Date(flowRun.startedAt), "PPpp")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(flowRun.status)}
              {flowRun.status === "success" && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />}
              {flowRun.status === "failed" && <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />}
              {flowRun.status === "running" && <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Run-ID</div>
              <div className="font-mono text-sm">{flowRun.id}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Flow-ID</div>
              <div className="font-mono text-sm">{flowRun.flowId}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Gestartet am</div>
              <div>{format(new Date(flowRun.startedAt), "PPp")}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Beendet am</div>
              <div>{flowRun.completedAt ? format(new Date(flowRun.completedAt), "PPp") : "—"}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Dauer</div>
              <div>
                {flowRun.completedAt 
                  ? `${Math.round((new Date(flowRun.completedAt).getTime() - new Date(flowRun.startedAt).getTime()) / 1000)}s`
                  : "Läuft..."}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="flex items-center gap-2">
                {getStatusBadge(flowRun.status)}
              </div>
            </div>
          </div>

          {/* Trigger-Bereich */}
          <div className="pt-4">
            <h3 className="font-medium text-lg mb-4">Trigger</h3>
            <div className="border rounded-lg p-4 bg-muted">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  {getTriggerIcon(flowRun.triggerType)}
                </div>
                <div>
                  <h4 className="font-medium capitalize">{flowRun.triggerType} Trigger</h4>
                  <p className="text-sm text-muted-foreground">
                    {flowRun.triggerType === "registration" && "Ausgelöst, wenn sich ein Teilnehmer registriert"}
                  </p>
                </div>
              </div>
              
              {flowRun.triggerDetails && (
                <div className="mt-2 border-t pt-4">
                  <h5 className="text-sm font-medium mb-2">Trigger-Details</h5>
                  <div className="bg-card rounded p-2 font-mono text-xs overflow-auto max-h-32">
                    <pre>{JSON.stringify(flowRun.triggerDetails, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aktionen-Bereich */}
          <div className="pt-4">
            <h3 className="font-medium text-lg mb-4">Aktionen</h3>
            <div className="space-y-4">
              {flowRun.actions.map((action, index) => (
                <div key={action.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4 flex justify-between items-center border-b bg-muted/30 dark:bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                        {getActionIcon(action.type)}
                      </div>
                      <div>
                        <h5 className="font-medium">{action.name}</h5>
                        <p className="text-xs text-muted-foreground">{action.details}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(action.status)}
                      {getStatusIcon(action.status)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Gestartet</div>
                        <div className="text-sm">
                          {format(new Date(action.startedAt), "HH:mm:ss")}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Beendet</div>
                        <div className="text-sm">
                          {action.completedAt ? format(new Date(action.completedAt), "HH:mm:ss") : "—"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Aktions-Logs */}
                    {action.logs && action.logs.length > 0 && (
                      <div className="mt-2">
                        <h6 className="text-sm font-medium mb-2">Logs</h6>
                        <div className="bg-black rounded p-3 font-mono text-xs text-green-400 overflow-auto max-h-60">
                          {action.logs.map((log, i) => (
                            <div key={i} className={log.includes("FEHLER") ? "text-red-400" : ""}>
                              {i+1}. {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Fehlermeldung, falls vorhanden */}
                    {action.error && (
                      <div className="mt-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <h6 className="text-sm font-medium text-red-800 dark:text-red-300">Fehler</h6>
                            <p className="text-sm text-red-700 dark:text-red-400">{action.error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fehler bei der Flow-Ausführung, falls vorhanden */}
          {flowRun.error && (
            <div className="mt-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Flow-Ausführung fehlgeschlagen</h3>
                  <p className="text-red-700 dark:text-red-400 mt-1">{flowRun.error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <History className="h-3 w-3 mr-1" />
            {flowRun.completedAt 
              ? `Ausführung abgeschlossen am ${format(new Date(flowRun.completedAt), "PPp")}` 
              : "Ausführung läuft..."}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}