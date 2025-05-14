import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./form-schemas";
import { logInUser } from "./backend/auth";
import { ZodError } from "zod";
import { Organization } from "./types";
import { getOrg, getOrgsOfUser } from "./backend/org";

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        //   user: {
        //     id: string;
        //     name: string;
        //     email: string;
        //     createdAt: string;
        //     updatedAt: string;
        //     profilePicture: string;
        //     role?: string;
        //     jwt?: string;
        //   } & DefaultSession["user"]
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
    }

}


// declare module "next-auth/jwt" {
//   /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
//   interface JWT {
//     /** OpenID ID Token */
//     idToken?: string
//   }
// }


export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt: async ({ token, user, session }) => {
            try {
                if (user) {
                    token.user = user
                    console.log("user: ", user)
                }

                // token.org = session.org
                // console.log("user: ", user)
                // console.log("session: ", session)
                return token
            } catch (error) {
                console.error("Error in JWT callback: ", error)
                return token
            }
        },
        session: async ({ session, token }) => {
            try {
                if(token.user) session.user = token.user as any
                
                const org = await getOrg(session.user.orgId)
                const orgsOfUser = await getOrgsOfUser(session.user.id)
                session.org = org
                session.orgsOfUser = orgsOfUser


                // console.log("session: ", session)
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
                console.log("Credentials: ", credentials)
                try {

                    let user = null

                    const { email, password } = await signInSchema.parseAsync(credentials)

                    console.log("Parsed credentials: ", { email, password })
                    // logic to verify if the user exists
                    user = await logInUser(email, password)

                    console.log("User: ", user)
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