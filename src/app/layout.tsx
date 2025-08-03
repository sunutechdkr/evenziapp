import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";

// Configuration de la police Inter pour l'application
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Métadonnées générales de l'application pour le SEO
export const metadata: Metadata = {
  title: {
    template: '%s | Evenzi',
    default: 'Evenzi - Gestion d\'événements',
  },
  description: "Plateforme de gestion d'événements",
  keywords: "event management, qr code, check-in, event registration, event organization",
  authors: [{ name: "Evenzi Team" }],
  creator: "Evenzi",
  publisher: "Evenzi",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
        className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
