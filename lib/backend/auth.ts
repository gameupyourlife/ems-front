import { User } from "next-auth";
import { jwtDecode } from "jwt-decode";


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

            let user = await getUser(decodedToken.nameid, token);
            if (!user) {
                throw new Error("User not found");
            }
            
            return {
                ...user,
                jwt: token, // Assuming fullName is a property in the user object
            } as User;
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

export async function getUser(userId: string, token: string): Promise<User | null> {
    if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined");
    }


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
    return {
        ...user,
        name: user.fullName,
        jwt: token,
        orgRole: user.role.toString() as string,
    } as User;
}

export async function registerNewUser(email: string, password: string, name: string, lastName: string): Promise<void> {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error("API URL is not defined");
        }

        if (!email || !password || !name) {
            throw new Error("Email, password and name are required");
        }

        const body = JSON.stringify({
            "firstName": name,
            "lastName": lastName,
            "email": email,
            "password": password,
            "role": 0
        })

        console.log("Registering user with body: ", body);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: "POST",
            body: body,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            console.error("Register response not OK:", res.status, res.statusText);
            throw new Error("Failed to register");
        }


    }
    catch (error) {
        console.error("Error registering user:", error);
        throw new Error("Registration failed");
    }
}