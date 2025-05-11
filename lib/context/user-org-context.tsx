"use client";

import { Organization, User, OrgUser } from "@/lib/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { mockOrgUsers } from "@/lib/data";
import { useRouter } from "next/navigation";

// Context types
type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

type OrgContextType = {
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
  userOrgs: Organization[];
  currentOrgUser: OrgUser | null;
  isOrgAdmin: boolean;
  switchOrg: (orgId: string) => Promise<boolean>;
};

// Create the contexts with default values
const UserContext = createContext<UserContextType | undefined>(undefined);
const OrgContext = createContext<OrgContextType | undefined>(undefined);

// Provider component
export function UserOrgProvider({ children }: { children: ReactNode }) {
  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userOrgs, setUserOrgs] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentOrgUser, setCurrentOrgUser] = useState<OrgUser | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!currentUser;
  
  // Check if user is admin in current organization
  const isOrgAdmin = currentOrgUser?.role === "Admin";

  

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
      return true
  };  

  // Logout function
  const logout = () => {
    
  };

  // Function to switch between organizations
  const switchOrg = async (orgId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Find the org in user's orgs
      const org = userOrgs.find(o => o.id === orgId);
      
      if (!org) {
        return false;
      }
      
      // In a real app, we would fetch org user details here
      const orgUser = mockOrgUsers.find(ou => ou.orgId === orgId && ou.user.id === currentUser?.id);
      
      if (orgUser) {
        setCurrentOrg(org);
        setCurrentOrgUser(orgUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to switch organization:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value objects
  const userContextValue: UserContextType = {
    currentUser,
    setCurrentUser,
    isLoading,
    isAuthenticated,
    login,
    logout
  };

  const orgContextValue: OrgContextType = {
    currentOrg,
    setCurrentOrg,
    userOrgs,
    currentOrgUser,
    isOrgAdmin,
    switchOrg
  };

  return (
    <UserContext.Provider value={userContextValue}>
      <OrgContext.Provider value={orgContextValue}>
        {children}
      </OrgContext.Provider>
    </UserContext.Provider>
  );
}

// Custom hooks to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserOrgProvider");
  }
  return context;
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within a UserOrgProvider");
  }
  return context;
}

/**
 * Custom hook that ensures an organization is available.
 * If no organization is found, it redirects to the login page.
 * This is useful for pages that require an organization to function.
 * 
 * @returns The current organization context with the guarantee that currentOrg is not null
 */
export function useRequiredOrg() {
  const orgContext = useOrg();
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after initial loading is complete
    if (!isLoading && (!isAuthenticated || !orgContext.currentOrg)) {
      // Redirect to login page with the current path as redirect target
      const currentPath = window.location.pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, orgContext.currentOrg, isLoading, router]);
  
  // Cast the context to non-null since we're handling the null case with redirection
  return {
    ...orgContext,
    currentOrg: orgContext.currentOrg || {} as Organization, // Will be used only when not null
  };
}

// Combined hook for convenience
export function useUserOrg() {
  return {
    ...useUser(),
    ...useOrg()
  };
}