"use server"

import { signIn } from "../auth"

export async function logIn(formData: any) {
    await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/",
    })
}