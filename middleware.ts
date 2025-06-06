import { auth } from "@/lib/auth"

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/login" && req.nextUrl.pathname !== "/register") {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
    else if (req.auth && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
        const newUrl = new URL("/", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
    else {
        console.log("User is authenticated, proceeding with request")
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.well-known).*)"],
}