"use client";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useOrg } from "@/lib/context/user-org-context";

export function TeamSwitcher() {
    const { currentOrg, userOrgs, switchOrg } = useOrg();

    if (!currentOrg || userOrgs.length === 0) {
        return null;
    }

    const handleTeamChange = async (orgId: string) => {
        try {
            const result = await switchOrg(orgId);
            if (result) {
                toast.success("Organisation gewechselt");
            } else {
                toast.error("Fehler beim Wechseln der Organisation");
            }
        } catch (error) {
            toast.error("Fehler beim Wechseln der Organisation");
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-fit px-1.5">
                            <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                {currentOrg.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate font-semibold">{currentOrg.name}</span>
                            <ChevronDown className="opacity-50" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-64 rounded-lg"
                        align="start"
                        side="bottom"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Deine Organisationen
                        </DropdownMenuLabel>
                        {userOrgs.map((org, index) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => handleTeamChange(org.id)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    {org.name.substring(0, 2).toUpperCase()}
                                </div>
                                {org.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Organisation erstellen</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
