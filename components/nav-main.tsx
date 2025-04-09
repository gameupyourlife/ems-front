"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"


export function NavMain({
  items,
  isAdmin,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[],
  isAdmin?: boolean
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {isAdmin && <SidebarGroupLabel>Nutzernavigation</SidebarGroupLabel>}
      <SidebarGroupContent className="flex flex-col gap-2">
      <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  className={isActive ? "border border-primary" : ""}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
