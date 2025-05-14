"use server"

import { signIn } from "../auth"

export async function logIn(formData: any) {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/",
        })
    }
    catch (error) {
        console.error("Error logging in: ", error)
    }
}