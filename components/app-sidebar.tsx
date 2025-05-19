"use client";;
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import {
    BuildingIcon,
    CalendarHeartIcon,
    CalendarIcon,
    CalendarSearchIcon,
    FunctionSquareIcon,
    HelpCircleIcon,
    LayoutDashboardIcon,
    MailsIcon,
    SearchIcon,
    SettingsIcon,
    TicketIcon,
} from "lucide-react";
import { NavAdmin } from "./nav-admin";
import { TeamSwitcher } from "./team-switcher";
import { useSession } from "next-auth/react";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/",
            icon: LayoutDashboardIcon,
        },
        {
            title: "Events durchsuchen",
            url: "/events",
            icon: CalendarSearchIcon,
        },
        {
            title: "Angemeldete Events",
            url: "/user/events",
            icon: TicketIcon,
        },
    ],
    navAdmin: [
        {
            title: "Organisation",
            icon: BuildingIcon,
            isActive: true,
            url: "/organization",
        },
        {
            title: "Events",
            icon: CalendarIcon,
            url: "/organization/events",
        },
        {
            title: "Flows",
            icon: FunctionSquareIcon,
            url: "/organization/flows",
        },
        {
            title: "Mails",
            url: "/organization/email-templates",
            icon: MailsIcon,
        },
    ],
    navSecondary: [
        {
            title: "Einstellungen",
            url: "/user",
            icon: SettingsIcon,
        },
        {
            title: "Dokumentation",
            url: "/docs",
            icon: HelpCircleIcon,
        },
        {
            title: "Suche",
            url: "#",
            icon: SearchIcon,
        },
    ],
    myEvents: [
        {
            name: "Cooles Event 1",
            url: "/events/12345",
            icon: CalendarHeartIcon,
        },
        {
            name: "Cooles Event 3",
            url: "/events/12345",
            icon: CalendarHeartIcon,
        },
        {
            name: "Cooles Event 2",
            url: "/events/12345",
            icon: CalendarHeartIcon,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession()

    // Check if user is admin in current organization
    const isAdmin = session?.user?.orgRole?.toLowerCase() === "0";

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                {isAdmin && (
                    <NavAdmin items={data.navAdmin} />
                )}
                <NavMain isAdmin={isAdmin} items={data.navMain} />
                {/* <NavEvents items={data.myEvents} /> */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
