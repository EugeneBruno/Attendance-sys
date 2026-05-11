// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protects all routes except static files and auth-related APIs
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};