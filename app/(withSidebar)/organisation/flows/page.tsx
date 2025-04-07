"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFlowTemplates } from "@/lib/data";
import Link from "next/link";
import { Plus, BarChart3, Zap, Info, ExternalLink, Play } from "lucide-react";
import FlowTable from "@/components/org/flows/flow-table";
import { Badge } from "@/components/ui/badge";
import { getTriggerIcon } from "@/lib/flows/utils";

export default function FlowsOverview() {
  const activeFlows = mockFlowTemplates.length;
  const triggersCount = mockFlowTemplates.reduce((acc, flow) => acc + flow.trigger.length, 0);
  const actionsCount = mockFlowTemplates.reduce((acc, flow) => acc + flow.actions.length, 0);
  
  // Count flows by trigger type
  const triggerTypeCounts = mockFlowTemplates.reduce((acc, flow) => {
    flow.trigger.forEach(trigger => {
      acc[trigger.type] = (acc[trigger.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Get the trigger types ordered by count (descending)
  const orderedTriggerTypes = Object.entries(triggerTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Show top 4 trigger types

  // Count flows by action type  
  const actionTypeCounts = mockFlowTemplates.reduce((acc, flow) => {
    flow.actions.forEach(action => {
      acc[action.type] = (acc[action.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Get the action types ordered by count (descending)
  const orderedActionTypes = Object.entries(actionTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Show top 4 action types



  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Flows Dashboard</h1>
        <Button asChild>
          <Link href="/organisation/flows/create">
            <Plus className="mr-2 h-4 w-4" /> Create Flow
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlows}</div>
            <p className="text-xs text-muted-foreground">Automations running in your organization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Triggers</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggersCount}</div>
            <p className="text-xs text-muted-foreground">Conditions that initiate flows</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionsCount}</div>
            <p className="text-xs text-muted-foreground">Tasks performed by flows</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execution Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">Flow execution success rate</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4 flex-wrap">
        {/* Popular Triggers */}
        <Card className="grow">
          <CardHeader>
            <CardTitle>Popular Triggers</CardTitle>
            <CardDescription>Most common flow triggers in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderedTriggerTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-md border bg-background flex items-center justify-center">
                      {getTriggerIcon(type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{type}</p>
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
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-md border bg-background flex items-center justify-center">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{type}</p>
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
      
      {/* Flows List */}
      <FlowTable flows={mockFlowTemplates} />

    </div>
  );
}