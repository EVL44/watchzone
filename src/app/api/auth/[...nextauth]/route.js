// src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';

const isProduction = process.env.NODE_ENV === "production";

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent", 
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Email and password are required");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  cookies: {
    sessionToken: {
      name: isProduction ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    state: {
      name: isProduction ? `__Secure-next-auth.state` : `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      }
    },
    callbackUrl: {
      name: isProduction ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: isProduction ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // --- THIS IS THE FIX ---
        // On sign-in, check the DB for password and add to token
        const dbUser = await prisma.user.findUnique({
           where: { id: user.id },
           select: { username: true, password: true, avatarUrl: true }
        });
        token.id = user.id;
        token.avatarUrl = dbUser.avatarUrl; 
        token.username = dbUser.username; 
        token.needsUsername = !dbUser.username;
        token.hasPassword = !!dbUser.password; // Add hasPassword flag to token
        // --- END OF FIX ---
      }
      
      if (trigger === "update" && session?.username) {
        token.username = session.username;
        token.needsUsername = false;
      }
      
      if (user?.image) {
         token.picture = user.image;
      }

      return token;
    },
    
    async session({ session, token }) {
      // Pass all our custom flags to the client-side session
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.avatarUrl = token.avatarUrl || token.picture; 
      session.user.needsUsername = token.needsUsername;
      session.user.hasPassword = token.hasPassword; // Pass flag to session
      
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', 
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };