import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";

// Configuration des polices Geist pour l'application
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Métadonnées générales de l'application pour le SEO
export const metadata: Metadata = {
  title: {
    template: '%s | InEvent',
    default: 'InEvent - Gestion d\'événements',
  },
  description: "Plateforme de gestion d'événements",
  keywords: "event management, qr code, check-in, event registration, event organization",
  authors: [{ name: "InEvent Team" }],
  creator: "InEvent",
  publisher: "InEvent",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

/**
 * Layout racine de l'application
 * 
 * Ce layout est appliqué à toutes les pages de l'application.
 * Il inclut les variables de police, le CSS global et le fournisseur d'authentification.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
