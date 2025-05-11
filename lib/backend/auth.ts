import { User } from "next-auth";
import { isMock } from "./utils";

export async function logInUser(email: string, password: string) : Promise<User> {
    if(isMock()) {
        console.warn("Mocking API call for user login")
        const user : User = {
            createdAt: new Date().toISOString(),
            email: email,
            id: "1234567890",
            name: "John Doe",
            updatedAt: new Date().toISOString(),
            profilePicture: "https://example.com/profile.jpg",
            jwt: "mock-jwt-token",
            role: "user",
            orgRole: "admin",
            orgId: "org-1234567890",
        }
        return user;
    }
    
    if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined");
    }

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to log in");
    }

    return res.json();
}