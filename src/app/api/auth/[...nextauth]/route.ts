import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { Resend } from 'resend';

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

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
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'no-reply@inevent.app',
      
      // Personnaliser l'envoi d'emails avec Resend
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          const { data, error } = await resend.emails.send({
            from: 'InEvent <no-reply@inevent.app>',
            to: email,
            subject: 'Connexion à votre compte InEvent',
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Arial', sans-serif;">
                <div style="background-color: #81B441; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
                  <h1 style="color: white; margin: 0;">InEvent</h1>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; border: 1px solid #e0e0e0; border-top: none;">
                  <p style="font-size: 16px; line-height: 1.5;">Bonjour,</p>
                  <p style="font-size: 16px; line-height: 1.5;">Cliquez sur le lien ci-dessous pour vous connecter à votre compte InEvent :</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="background-color: #81B441; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Se connecter</a>
                  </div>
                  <p style="font-size: 16px; line-height: 1.5;">Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email.</p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">Ce lien est valable pendant 10 minutes et ne peut être utilisé qu'une seule fois.</p>
                </div>
                <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                  <p>&copy; 2024 InEvent. Tous droits réservés.</p>
                </div>
              </div>
            `,
          });

          if (error) {
            console.error('Erreur lors de l\'envoi du mail de vérification:', error);
            throw new Error('Erreur lors de l\'envoi du mail de vérification');
          }

          console.log('Email de vérification envoyé:', data);
        } catch (error) {
          console.error('Erreur avec Resend:', error);
          throw new Error('Erreur lors de l\'envoi du mail de vérification');
        }
      },
    }),
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
    verifyRequest: '/auth/verify-request', // Page affichée après l'envoi du lien par email
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