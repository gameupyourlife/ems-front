"use client";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export function TeamSwitcher() {

    const { data: session, update } = useSession()
    const currentOrg = session?.org;
    const userOrgs = session?.orgsOfUser || [];


    if (!currentOrg || userOrgs.length === 0) {
        return null;
    }

    const handleTeamChange = async (orgId: string) => {
        try {
            const newOrg = userOrgs.find((org) => org.id === orgId);
            if (!newOrg) {
                toast.error("Fehler beim Wechseln der Organisation");
                return;
            }

            // Update the session with the new organization
            await update({ org: newOrg, user: { ...session.user, orgId: newOrg.id } });
        } catch (error) {
            console.error("Fehler:", error);
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
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
