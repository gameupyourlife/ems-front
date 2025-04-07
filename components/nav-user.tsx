"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BellIcon, EllipsisVerticalIcon, LogOutIcon, Moon, Sun, UserCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/context/user-org-context";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { clearAuthCookie } from "@/lib/auth-utils";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { currentUser, logout } = useUser();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme()

  function toggleTheme() {
    const themeToSet = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(themeToSet)
  }

  // Handle logout
  const handleLogout = () => {
    // Clear the auth cookie first
    clearAuthCookie();
    
    // Then log out from the user context
    logout();
    toast.success("Erfolgreich abgemeldet");
    router.push("/login");
  };

  if (!currentUser) {
    return null;
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={currentUser.profilePicture} alt={currentUser.name} />
                <AvatarFallback className="rounded-lg">{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentUser.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {currentUser.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={currentUser.profilePicture} alt={currentUser.name} />
                  <AvatarFallback className="rounded-lg">{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{currentUser.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/user">
                <DropdownMenuItem>
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  Konto
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem disabled>
                <BellIcon className="mr-2 h-4 w-4" />
                Benachrichtigungen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme} >
                <div className="mr-2 h-4 w-4 relative">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </div>
                <span>Farbmodus wechseln</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
