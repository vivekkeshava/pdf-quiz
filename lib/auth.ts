// Auth.js v5 config
//
// Sign-in flows:
//
//   Magic link:
//     /login → signIn("nodemailer") → email sent
//     → user clicks link → /api/auth/callback/nodemailer
//     → Session row created in DB → redirect to app
//
//   Google OAuth:
//     /login → signIn("google") → Google consent screen
//     → /api/auth/callback/google → Account row upserted
//     → Session row created in DB → redirect to app
//
// Session strategy: database (revocable, inspectable)
// Account linking: allowDangerousEmailAccountLinking=true so the same
//   email works with both Google and magic link without duplicate users.

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM ?? "noreply@pdf-quiz.app",
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    error: "/login",  // branded login page handles auth errors via ?error= param
  },
});
