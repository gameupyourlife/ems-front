import { User } from "next-auth";
import { jwtDecode } from "jwt-decode";
import { auth } from "../auth";

export async function logInUser(email: string, password: string): Promise<User | null> {
    try {



        if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error("API URL is not defined");
        }

        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        // res will be a object just with a jwt
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            console.error("Login response not OK:", res.status, res.statusText);
            throw new Error("Failed to log in");
        }

        // const body = await res.text();
        // Get the response which contains just the JWT token
        const data = await res.json();
        if (!data) {
            throw new Error("No data returned from login");
        }
        const { token } = data;
        // const { token } = await res.json();

        if (!token) {
            throw new Error("No token returned from login");
        }

        try {
            // Decode the JWT token to get user information
            const decodedToken = jwtDecode<{
                "nameid": string,
                "email": string,
                "role": string,
                "nbf": number,
                "exp": number,
                "iat": number,
                "iss": string,
                "aud": string
            }>(token);

            const user = await getUser(decodedToken.nameid, token);

            console.log("New User: ", user);
            return user;
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            throw new Error("Invalid token format");
        }
    }
    catch (error) {
        console.error("Error logging in user:", error);
        throw new Error("Login failed");
    }
}

export async function getUser(userId: string, token? : any): Promise<User | null> {


    if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined");
    }

    const session = await auth()


    // Declare token if not passed
    if (!token) {
        token = session?.user?.jwt;
    }


    // const token = session?.user?.jwt;
    console.log("Token: ", token);
    if (!token) {
        throw new Error("No token found");
    }
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        console.error("Fetch user response not OK:", res.status, res.statusText);
        throw new Error("Failed to fetch user data");
    }

    const user = await res.json();
    return user;
}