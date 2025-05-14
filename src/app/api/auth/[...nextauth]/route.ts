import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Extend the next-auth types to include our custom properties
declare module "next-auth" {
  interface User {
    role?: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Rechercher l'utilisateur par email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          // Si aucun utilisateur n'est trouvé, renvoyer null
          if (!user) {
            console.log("Aucun utilisateur trouvé avec cet email:", credentials.email);
            return null;
          }

          // Si l'utilisateur existe mais n'a pas de mot de passe (connexion sociale)
          if (!user.password) {
            console.log("L'utilisateur n'a pas de mot de passe défini");
            return null;
          }

          // Vérifier si le mot de passe correspond
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) {
            console.log("Mot de passe incorrect");
            return null;
          }

          // Authentification réussie
          console.log("Authentification réussie pour:", user.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "DEFAULT_SECRET_FOR_DEV",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 