import type { Metadata } from "next";

// Métadonnées pour le SEO de la section dashboard
export const metadata: Metadata = {
  title: "Dashboard | Inevent",
  description: "Gérez vos événements avec Inevent - Tableaux de bord, statistiques et gestion des participants",
};

/**
 * Layout pour toutes les pages du dashboard
 * 
 * Ce composant enveloppe toutes les pages sous le chemin /dashboard
 * et peut être utilisé pour ajouter des éléments communs à toutes ces pages
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-wrapper">
      {children}
    </div>
  );
} 