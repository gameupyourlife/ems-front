"use client";

import { Organization, User, OrgUser } from "@/lib/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { mockOrg, mockOrgUsers } from "@/lib/data";

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
        // This would be a real API call in production
        // For now, simulate by setting some mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set mock user as first user from mock data
        if (mockOrgUsers.length > 0) {
          const firstOrgUser = mockOrgUsers[0];
          setCurrentUser(firstOrgUser.user);
          
          // Set user's organizations (for now just the mock org)
          setUserOrgs([mockOrg]);
          
          // Set current organization
          setCurrentOrg(mockOrg);
          
          // Set current org user data
          setCurrentOrgUser(firstOrgUser);
        }
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
        setCurrentUser(matchingOrgUser.user);
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

// Combined hook for convenience
export function useUserOrg() {
  return {
    ...useUser(),
    ...useOrg()
  };
}