"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Info } from "lucide-react";
import FlowTable from "@/components/org/flows/flow-table";
import { Badge } from "@/components/ui/badge";
import { getActionTitle, getTriggerIcon, getTriggerTitle } from "@/lib/flows/utils";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { useOrgFlowTemplates } from "@/lib/backend/hooks/org-flows";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TriggerType } from "@/lib/backend/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FlowsOverview() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data, isLoading } = useOrgFlowTemplates(session?.user?.organization?.id || "", session?.user?.jwt || "");

  const flows = data || [];

  // if (isLoading) {
  //   return (
  //     <div className="container mx-auto py-20 text-center">
  //       <div className="animate-pulse">Loading flows...</div>
  //     </div>
  //   );
  // }

  if (!flows) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-muted-foreground mb-4">No flows found.</div>
        <Button variant="outline" onClick={() => router.refresh()}>
          Reload
        </Button>
      </div>
    );
  }


  // Count flows by trigger type
  const triggerTypeCounts = flows.reduce((acc, flow) => {
    flow.triggers?.forEach(trigger => {
      acc[trigger.type] = (acc[trigger.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<TriggerType, number>);

  // Get the trigger types ordered by count (descending)
  const orderedTriggerTypes = Object.entries(triggerTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Show top 4 trigger types

  // Count flows by action type  
  const actionTypeCounts = flows.reduce((acc, flow) => {
    flow.actions?.forEach(action => {
      acc[action.type] = (acc[action.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Get the action types ordered by count (descending)
  const orderedActionTypes = Object.entries(actionTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Show top 4 action types

  const quickActions: QuickAction[] = [
    {
      children: (
        <Button asChild>
          <Link href="/organization/flows/create">
            <Plus className="mr-2 h-4 w-4" /> Create Flow
          </Link>
        </Button>
      )
    }
  ];


  return (
    <>
      <SiteHeader actions={quickActions} />

      <div className="flex-1 space-y-6 p-6 pt-0">
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1" >
            <AccordionTrigger className="pl-1">Stats zu Triggern und Aktionen</AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-4 flex-wrap">
                {/* Popular Triggers */}
                <Card className="grow">
                  <CardHeader>
                    <CardTitle>Popular Triggers</CardTitle>
                    <CardDescription>Most common flow triggers in your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderedTriggerTypes.map(([type, count], i) => (
                        <div key={`${type}-${i}`} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-2 h-8 w-8 rounded-md border bg-background flex items-center justify-center">
                              {getTriggerIcon(type as unknown as TriggerType)}
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">{getTriggerTitle(Number(type))}</p>
                              <p className="text-xs text-muted-foreground">Trigger type</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{count} flows</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Actions */}
                <Card className="grow">
                  <CardHeader>
                    <CardTitle>Popular Actions</CardTitle>
                    <CardDescription>Most common flow actions in your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderedActionTypes.map(([type, count]) => (
                        <div key={type + "dfdsafgsdg"} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-2 h-8 w-8 rounded-md border bg-background flex items-center justify-center">
                              <Info className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">{getActionTitle(Number(type))}</p>
                              <p className="text-xs text-muted-foreground">Action type</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{count} flows</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>


              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* Flows List */}
        <FlowTable flows={flows} />

      </div>
    </>
  );
}