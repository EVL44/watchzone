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
    // ... other cookie settings
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
        const dbUser = await prisma.user.findUnique({
           where: { id: user.id },
           select: { username: true, password: true, avatarUrl: true, roles: true, email: true }
        });
        
        token.id = user.id;
        token.avatarUrl = dbUser.avatarUrl; 
        token.username = dbUser.username;
        token.email = dbUser.email; // Store email in token
        token.needsUsername = !dbUser.username;
        token.hasPassword = !!dbUser.password;
        
        // --- SUPER ADMIN LOGIC ---
        const isSuperAdmin = dbUser.email === process.env.SUPER_ADMIN_EMAIL;
        token.isSuperAdmin = isSuperAdmin;
        
        if (isSuperAdmin) {
          // Force Super Admin to have both roles in their session
          token.roles = ['ADMIN', 'VERIFIED'];
        } else {
          token.roles = dbUser.roles || [];
        }
        // --- END OF SUPER ADMIN LOGIC ---
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
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.avatarUrl = token.avatarUrl || token.picture; 
      session.user.needsUsername = token.needsUsername;
      session.user.hasPassword = token.hasPassword;
      
      // --- PASS SUPER ADMIN TO SESSION ---
      session.user.roles = token.roles || [];
      session.user.isSuperAdmin = token.isSuperAdmin || false;
      session.user.email = token.email; // Pass email
      // --- END OF PASS ---
      
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