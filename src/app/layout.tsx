import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

// Configuration des polices Geist pour l'application
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Métadonnées générales de l'application pour le SEO
export const metadata: Metadata = {
  title: "Inevent - Event Management System",
  description: "Gérez vos événements, inscriptions et check-ins avec QR codes de manière intuitive",
  keywords: "event management, qr code, check-in, event registration, event organization",
  authors: [{ name: "Inevent Team" }],
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
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
