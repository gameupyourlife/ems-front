import { auth } from "@/lib/auth"

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/login" && req.nextUrl.pathname !== "/register") {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
})