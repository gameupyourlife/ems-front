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
  CodepenIcon,
  CodesandboxIcon,
  FilesIcon,
  FunctionSquareIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  TicketIcon,
} from "lucide-react";
import { NavAdmin } from "./nav-admin";
import { TeamSwitcher } from "./team-switcher";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      url: "/organisation",
    },
    {
      title: "Events",
      icon: CalendarIcon,
      url: "/organisation/events",
    },
    {
      title: "Prozesse",
      icon: FunctionSquareIcon,
      url: "/organisation/processes",
    },
    {
      title: "Dateien",
      url: "/organisation/files",
      icon: FilesIcon,
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

const teams = [
  {
    id: "1",
    name: "Org 1",
    logo: CodepenIcon,
  },
  {
    id: "2",
    name: "Org 2",
    logo: CodesandboxIcon
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isAdmin = true;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
