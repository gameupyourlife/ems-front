"use server";;
import { isRedirectError, RedirectType } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "../auth";
import { registerNewUser } from "../backend/auth";
import { redirect } from "next/navigation";


export async function logOutActionPleaseCallThisOneToUnsetSession() {
    await signOut()
    redirect("/", RedirectType.push);
}

export async function logInActionPleaseCallThisOneToSetSession(formData: any) {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/",
            redirect: true,
        })
    }
    catch (error) {
        if (isRedirectError(error)) {
            // preload("/")
            // redirect("/", RedirectType.push);
            throw error;
        }
        console.error("Error logging in: ", error)
    }
}

export async function registerAction(formData: any) {

    try {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        await registerNewUser(email, password, firstName, lastName);

        // Redirect to login page after successful registration
        return { success: true };
    } catch (error) {
        console.error("Error during registration:", error);
        return { success: false, error: "Registration failed. Please try again." };
    }
}