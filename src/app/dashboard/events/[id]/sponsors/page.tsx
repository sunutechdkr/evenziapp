"use client";

import { useState, useEffect } from "react";
import { 
  UserPlusIcon, 
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhotoIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { toast } from "react-hot-toast";
import styles from "./style.module.css";

// Types pour les sponsors
type SponsorLevel = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTNER' | 'MEDIA' | 'OTHER';

type Sponsor = {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  level: SponsorLevel;
  visible: boolean;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Type d'événement
type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  banner?: string;
  slug?: string;
};

export default function EventSponsorsPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  
  const eventId = params.id;

  // Fetch data on load
  useEffect(() => {
    fetchEventDetails();
    fetchSponsors();
  }, []);

  /**
   * Récupère les détails de l'événement
   */
  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des détails de l\'événement');
      
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les détails de l\'événement');
    }
  };

  /**
   * Récupère la liste des sponsors
   */
  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/sponsors`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des sponsors');
      
      const data = await response.json();
      setSponsors(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les sponsors');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retourne la classe CSS pour le badge de niveau
   */
  const getLevelBadgeClass = (level: SponsorLevel) => {
    switch(level) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'BRONZE': return 'bg-amber-100 text-amber-800';
      case 'PARTNER': return 'bg-blue-100 text-blue-800';
      case 'MEDIA': return 'bg-green-100 text-green-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  /**
   * Retourne le texte pour chaque niveau
   */
  const getLevelText = (level: SponsorLevel) => {
    switch(level) {
      case 'PLATINUM': return 'Platinum';
      case 'GOLD': return 'Gold';
      case 'SILVER': return 'Silver';
      case 'BRONZE': return 'Bronze';
      case 'PARTNER': return 'Partenaire';
      case 'MEDIA': return 'Media';
      case 'OTHER': return 'Autre';
      default: return level;
    }
  };
  
  // Filtrer les sponsors en fonction de la recherche et du filtre de niveau
  const filteredSponsors = sponsors.filter(sponsor => 
    sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (levelFilter ? sponsor.level === levelFilter : true)
  );

  /**
   * Rafraîchit la liste des sponsors
   */
  const handleRefresh = () => {
    toast.loading('Actualisation des exposants...', { id: 'refresh-toast' });
    fetchSponsors().then(() => {
      toast.success('Liste des exposants actualisée', { id: 'refresh-toast' });
    });
  };

  /**
   * Exporte les sponsors au format Excel
   */
  const handleExportSponsors = () => {
    // Préparation de l'URL de l'API d'exportation
    const exportUrl = `/api/events/${eventId}/export/sponsors`;
    
    // Afficher un loading toast
    toast.loading('Exportation des exposants en cours...', { id: 'export-toast' });

    // Ouvrir l'URL dans un nouvel onglet ou télécharger directement le fichier
    const downloadLink = document.createElement('a');
    downloadLink.href = exportUrl;
    downloadLink.target = '_blank';
    downloadLink.download = 'exposants.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Mettre à jour le toast pour indiquer le succès
    setTimeout(() => {
      toast.success('Les exposants ont été exportés avec succès', { id: 'export-toast' });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EventSidebar eventId={eventId} />
      
      <main className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center mb-1">
                <Link 
                  href={`/dashboard/events/${eventId}`}
                  className="inline-flex items-center mr-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-1" />
                  Retour à l&apos;événement
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sponsors et Partenaires</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les sponsors et partenaires pour votre événement {event?.name || ''}
              </p>
            </div>
            
            {/* Actions */}
            <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Actualiser
              </button>

              <button
                onClick={handleExportSponsors}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Exporter Excel
              </button>
              
              <Link
                href={`/dashboard/events/${eventId}/sponsors/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Ajouter un exposant
              </Link>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un sponsor..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-[#81B441] focus:border-[#81B441] sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sm:w-48">
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#81B441] focus:border-[#81B441] sm:text-sm rounded-md"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="">Tous les niveaux</option>
                  <option value="PLATINUM">Platinum</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                  <option value="PARTNER">Partenaire</option>
                  <option value="MEDIA">Media</option>
                  <option value="OTHER">Autre</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sponsors grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
              <p className="ml-3 text-gray-500">Chargement des sponsors...</p>
            </div>
          ) : sponsors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSponsors.map(sponsor => (
                <div
                  key={sponsor.id}
                  className={`relative ${styles.sponsorBlock} ${!sponsor.visible ? 'opacity-60' : ''}`}
                >
                  {/* Clickable content to view details */}
                  <Link
                    href={`/dashboard/events/${eventId}/sponsors/${sponsor.id}`}
                    className="cursor-pointer block"
                  >
                    {/* Sponsor Logo */}
                    <div className={styles.logoContainer}>
                      {sponsor.logo ? (
                        <img 
                          src={sponsor.logo} 
                          alt={sponsor.name} 
                          className={styles.logo}
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <PhotoIcon className="h-10 w-10" />
                          <span className="text-xs mt-1">Pas de logo</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Level Badge & Name */}
                    <div className={styles.sponsorInfo}>
                      <h3 className={styles.sponsorName}>{sponsor.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeClass(sponsor.level)}`}>
                        {getLevelText(sponsor.level)}
                      </span>
                      {!sponsor.visible && (
                        <div className="mt-1 text-xs text-gray-500 italic">
                          Non visible
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UserPlusIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucun sponsor</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                Vous n&apos;avez pas encore ajouté de sponsors à cet événement. Les sponsors apparaîtront ici sous forme de cartes.
              </p>
              <Link
                href={`/dashboard/events/${eventId}/sponsors/edit`}
                className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Ajouter votre premier sponsor
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 