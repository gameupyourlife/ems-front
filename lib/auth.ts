import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./form-schemas";
import { getUser, logInUser } from "./backend/auth";
import { ZodError } from "zod";
import { Organization } from "./types-old";
import { getOrgsOfUser } from "./backend/org";

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        org: Organization;
        orgsOfUser: Organization[];
    }
    interface User {
        id: string;
        name: string;
        email: string;
        createdAt: string;
        updatedAt: string;
        profilePicture: string;
        jwt: string;
        role: string;
        orgRole: string;
        orgId: string;

        firstName: string;
        lastName: string;
        organization: { id: string, name: string, profilePicture: string }
    }

}

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/login",
        newUser: "/",
    },
    callbacks: {
        jwt: async ({ trigger, token, user, session }) => {
            try {
                if (user) {
                    token.user = user
                }

                if (trigger === "update") {

                    // @ts-ignore
                    const user = await getUser(token?.user.id, token?.user.jwt)
                    token.user = user
                }
                return token
            } catch (error) {
                console.error("Error in JWT callback: ", error)
                return token
            }
        },
        session: async ({ session, token }) => {
            try {
                if (token.user) {
                    session.user = token.user as any
                }

                if (session.user.jwt) {
                    const orgsOfUser = await getOrgsOfUser(session.user.id, session.user.jwt)
                    session.org = orgsOfUser.find(org => org.id === session.user.organization.id) || orgsOfUser[0] || null;
                    session.orgsOfUser = orgsOfUser
                }

                return session;
            }
            catch (error) {
                console.error("Error fetching organization: ", error)
                return session;
            }
        },

    },
    providers: [
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@gmail.com",
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "*****",
                },
            },

            authorize: async (credentials, request) => {
                try {

                    let user = null

                    const { email, password } = await signInSchema.parseAsync(credentials)

                    user = await logInUser(email, password)

                    if (!user) {
                        throw new Error("Invalid credentials.")
                    }

                    // return JSON object with the user data
                    return user
                } catch (error) {
                    if (error instanceof ZodError) {
                        // Return `null` to indicate that the credentials are invalid
                        return null
                    }
                    // Return null for any other error
                    return null
                }
            },


        }),
    ],
})