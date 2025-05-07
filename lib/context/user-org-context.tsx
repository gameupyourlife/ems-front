"use client";

import { Organization, User, OrgUser } from "@/lib/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { mockOrg, mockOrgUsers } from "@/lib/data";
import { useRouter } from "next/navigation";
import { setAuthCookies, clearAuthCookies, getUserFromCookie, isAuthenticatedByCookie } from "@/lib/auth-utils";

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

  // Initialize user session on first load
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      try {
        // Check if we have user data in cookies
        if (isAuthenticatedByCookie()) {
          const cookieUser = getUserFromCookie();
          
          if (cookieUser?.id) {
            // Find the complete user data from mock data
            // In a real app, you'd fetch this from your API
            const matchingOrgUser = mockOrgUsers.find(
              orgUser => orgUser.user.id === cookieUser.id
            );
            
            if (matchingOrgUser) {
              setCurrentUser(matchingOrgUser.user);
              
              // Set user's organizations (for now just the mock org)
              setUserOrgs([mockOrg]);
              
              // Set current organization
              setCurrentOrg(mockOrg);
              
              // Set current org user data
              setCurrentOrgUser(matchingOrgUser);
              
              // Done loading with success
              setIsLoading(false);
              return;
            }
          }
        }
        
        // If we reach here, either no cookie exists or the user data couldn't be loaded
        // In a real app, you could redirect to login here
        // For now just set as not authenticated
        setCurrentUser(null);
        setCurrentOrg(null);
        setCurrentOrgUser(null);
        setUserOrgs([]);
      } catch (error) {
        console.error("Failed to initialize user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulated login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email in mock data
      const matchingOrgUser = mockOrgUsers.find(orgUser => 
        orgUser.user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (matchingOrgUser) {
        const user = matchingOrgUser.user;
        
        // Set auth cookies with user information
        // In a real app, this would include a JWT token from your server
        setAuthCookies(user, "mock-auth-token-for-demo");
        
        // Update state
        setCurrentUser(user);
        setCurrentOrgUser(matchingOrgUser);
        
        // Set the user's organizations and default to the first one
        setUserOrgs([mockOrg]);
        setCurrentOrg(mockOrg);
        
        return true;
      }
      
      throw new Error("Login failed. Please check your credentials.");  
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear auth cookies
    clearAuthCookies();
    
    // Reset state
    setCurrentUser(null);
    setCurrentOrg(null);
    setCurrentOrgUser(null);
    setUserOrgs([]);
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