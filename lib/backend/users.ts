import { User } from "next-auth";

export async function resetPasswort(email: string, newPassword: string, confirmNewPassword: string, token: string): Promise<void> {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error("API URL is not defined");
        }

        if (!email || !newPassword) {
            throw new Error("Email and password are required");
        }

        if (!token) throw new Error("No authentication token found");

        const body = JSON.stringify({
            "email": email,
            "newPassword": newPassword,
            "confirmPassword": confirmNewPassword
        });

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/reset-password`, {
            method: "POST",
            body: body,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            console.error("Reset password response not OK:", res.status, res.statusText);
            throw new Error("Failed to reset password");
        }
    }
    catch (error) {
        console.error("Error resetting password:", error);
        throw new Error("Password reset failed");
    }
}

export async function deleteAccount(userId: string, token: string): Promise<void> {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error("API URL is not defined");
        }
        if (!userId) {
            throw new Error("User ID is required");
        }

        if (!token) throw new Error("No authentication token found");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            console.error("Delete account response not OK:", res.status, res.statusText);
            throw new Error("Failed to delete account");
        }
    }
    catch (error) {
        console.error("Error deleting account:", error);
        throw new Error("Account deletion failed");
    }
}

export async function updateUser(userId: string, userData: Partial<User>, token: string): Promise<void> {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error("API URL is not defined");
        }
        if (!userId) {
            throw new Error("User ID is required");
        }

        // Only firstName, lastName, profilePicture
        // Only the ones that are not undefined
        if (!userData.firstName && !userData.lastName && !userData.profilePicture) {
            throw new Error("No user data provided");
        }

        const newUserData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePicture: "",
        }


        // console.log("Updating user with ID:", userId, "Token:", token, "Data:", newUserData);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUserData),
        });

        if (!res.ok) {
            console.error("Update user response not OK:", res.status, res.statusText);
            throw new Error("Failed to update user");
        }

        return;
    }
    catch (error) {
        console.error("Error updating user:", error);
        throw new Error("User update failed");
    }
}