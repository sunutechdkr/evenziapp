"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useParams } from "next/navigation";
import { 
  ArrowLeftIcon, 
  UserPlusIcon, 
  DocumentTextIcon, 
  ShareIcon, 
  PencilIcon, 
  XMarkIcon,
  PhotoIcon,
  QrCodeIcon,
  CalendarIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import styles from "./style.module.css";

// Type d'événement
type Event = {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
  registrations: number;
  banner?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  start_date?: string | Date; // Pour la compatibilité avec snake_case
  end_date?: string | Date; // Pour la compatibilité avec snake_case
  sector?: string;
  type?: string;
  format?: string;
  timezone?: string;
  startTime?: string;
  endTime?: string;
  start_time?: string; // Pour la compatibilité avec snake_case
  end_time?: string; // Pour la compatibilité avec snake_case
  videoUrl?: string;
  supportEmail?: string;
  video_url?: string; // Pour la compatibilité avec snake_case
  support_email?: string; // Pour la compatibilité avec snake_case
  logo?: string;
};

export default function EventDetailsPage() {
  const [, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // État pour les statistiques
  const [eventStats, setEventStats] = useState({
    totalRegistrations: 0,
    checkedInCount: 0,
    checkInRate: "0%",
    loading: true
  });
  
  // Options pour les sélecteurs
  const sectors = ["Technologie", "Santé", "Éducation", "Finance", "Art et Culture", "Sport", "Environnement"];
  const types = ["Conférence", "Séminaire", "Workshop", "Exposition", "Gala", "Salon", "Forum", "Festival"];
  const formats = ["Présentiel", "En ligne", "Hybride"];
  const timezones = ["Africa/Dakar", "Europe/Paris", "America/New_York", "Asia/Tokyo"];
  
  // Récupérer le paramètre d'URL une seule fois au chargement du composant
  const params = useParams();
  const eventId = useMemo(() => {
    return Array.isArray(params.id) ? params.id[0] : params.id || '';
  }, [params.id]);
  
  // Fonctions utilitaires pour accéder aux dates de l'événement
  const getEventStartDate = (event: Event | null): Date | null => {
    if (!event) return null;
    const dateValue = event.startDate || event.start_date;
    if (!dateValue) return null;
    try {
      return new Date(dateValue);
    } catch (error) {
      console.error("Erreur de conversion de date:", error);
      return null;
    }
  };
  
  const getEventEndDate = (event: Event | null): Date | null => {
    if (!event) return null;
    const dateValue = event.endDate || event.end_date;
    if (!dateValue) return null;
    try {
      return new Date(dateValue);
    } catch (error) {
      console.error("Erreur de conversion de date:", error);
      return null;
    }
  };
  
  // Fonction pour formater une date en texte
  const formatEventDate = (date: Date | null): string => {
    if (!date) return "Date indisponible";
    try {
      return format(date, 'd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "Date invalide";
    }
  };
  
  // Récupération des statistiques de l'événement
  useEffect(() => {
    const fetchEventStats = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (response.ok) {
        const data = await response.json();
        setEventStats({
            totalRegistrations: data.registrations || 0,
            checkedInCount: data.checkedInCount || 0,
            checkInRate: data.checkInRate || 0,
          loading: false
        });
        
          // Mettre à jour les données de l'événement y compris la bannière
          setEvent({
            ...data,
            id: data.id,
            name: data.name || '',
            description: data.description || '',
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            location: data.location || '',
            banner: data.banner || '',
            logo: data.logo || '',
            slug: data.slug || ''
          });
        } 
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchEventStats();
    }
  }, [eventId]);
  
  // État pour animer la fermeture du modal
  const [modalClosing, setModalClosing] = useState(false);
  
  const openEditModal = () => {
    if (event) {
      setEditedEvent({ ...event });
      setPreviewImage(event.banner || null);
      setLogoPreview(event.logo || null);
      // Calculer le nombre de mots dans la description
      const words = event.description.trim() ? event.description.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setShowEditModal(true);
    }
  };
  
  const closeEditModal = () => {
    // Animer la fermeture avant de la réaliser
    setModalClosing(true);
    
    // Fermer le modal après l'animation
    setTimeout(() => {
    setShowEditModal(false);
    setEditedEvent(null);
    setPreviewImage(null);
    setLogoPreview(null);
      setSaveSuccess(false);
      setModalClosing(false);
    }, 300);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editedEvent) {
      // Générer automatiquement le slug à partir du nom
      if (name === 'name') {
        const slug = value
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
        
        setEditedEvent({
          ...editedEvent,
          [name]: value,
          slug: slug
        });
      } else if (name === 'description') {
        // Compter les mots
        const words = value.trim() ? value.trim().split(/\s+/).length : 0;
        setWordCount(words);
        setEditedEvent({
          ...editedEvent,
          [name]: value
        });
      } else if (name === 'startDate' || name === 'endDate') {
          try {
            const [day, month, year] = value.split('/').map(Number);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              const newDate = new Date(year, month - 1, day);
            if (name === 'startDate') {
              setEditedEvent({
                ...editedEvent,
                startDate: newDate
              });
            } else {
              setEditedEvent({
                ...editedEvent,
                [name]: value,
                startDate: newDate
              });
            }
            }
          } catch {
            // Ignorer les erreurs de format de date
            console.log("Format de date invalide");
        }
      } else {
        setEditedEvent({
          ...editedEvent,
          [name]: value
        });
      }
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        if (editedEvent) {
          setEditedEvent({
            ...editedEvent,
            banner: result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        if (editedEvent) {
          setEditedEvent({
            ...editedEvent,
            logo: result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const triggerLogoInput = () => {
    logoInputRef.current?.click();
  };
  
  // Ajouter des états pour gérer la sauvegarde
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const saveChanges = async () => {
    if (editedEvent) {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      
      try {
        // Préparer les données à sauvegarder
        const eventToSave = {
          ...editedEvent,
          // Convertir les dates en chaînes pour l'API
          startDate: typeof editedEvent.startDate === 'object' 
            ? format(editedEvent.startDate as Date, 'yyyy-MM-dd') 
            : editedEvent.startDate,
          endDate: typeof editedEvent.endDate === 'object'
            ? format(editedEvent.endDate as Date, 'yyyy-MM-dd')
            : editedEvent.endDate
        };
        
        console.log("Données à envoyer:", eventToSave);
        
        // Essayer d'abord l'API
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventToSave),
          credentials: 'include', // Important: inclure les cookies pour l'authentification
        });
        
        const responseData = await response.json();
        console.log("Réponse reçue:", responseData);
        
        if (!response.ok) {
          console.error("Erreur API:", responseData);
          throw new Error(responseData.error || 'Erreur lors de la mise à jour de l\'événement');
        }
        
        // Mise à jour réussie
        setEvent(responseData);
        setSaveSuccess(true);
        
        // Fermer la modal après un délai plus long pour montrer l'animation
        setTimeout(() => {
          // Animer la fermeture avant de réellement fermer
          setModalClosing(true);
          
          setTimeout(() => {
            setShowEditModal(false);
            setSaveSuccess(false);
            setModalClosing(false);
          }, 300);
        }, 3000);
        
      } catch (error) {
        console.error("Erreur de sauvegarde:", error);
        
        // Fallback au localStorage en cas d'erreur API
        if (editedEvent) {
          localStorage.setItem(`event-${eventId}`, JSON.stringify(editedEvent));
          // Mettre à jour l'événement dans l'état malgré l'erreur
          setEvent(editedEvent);
        }
        
        // Afficher l'erreur à l'utilisateur
        if (error instanceof Error) {
          setSaveError(error.message);
        } else {
          setSaveError("Une erreur est survenue lors de la sauvegarde");
        }
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // Détecter si l'écran est de taille mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Vérifier initialement
    checkMobile();
    
    // Écouter les changements de taille d'écran
    window.addEventListener('resize', checkMobile);
    
    // Nettoyer
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Style global pour les animations CSS
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes shrinkWidth {
      from { width: 100%; }
      to { width: 0%; }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  // Afficher la page principale avec le dashboard de l'événement
    return (
      <div className="dashboard-container min-h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <EventSidebar 
        eventId={eventId} 
        onExpandChange={(expanded) => setSidebarExpanded(expanded)}
      />
      <div 
        className={`dashboard-content bg-gray-50 ${!sidebarExpanded ? 'dashboard-content-collapsed' : ''}`}
        style={{ 
          marginLeft: isMobile ? 0 : sidebarExpanded ? '16rem' : 0
        }}
      >
          <main className="dashboard-main flex-1">
          {/* En-tête avec retour et actions */}
          <div className="p-4 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/events" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span>Retour aux événements</span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{event?.name}</h1>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                getEventStartDate(event) && getEventStartDate(event)! > new Date() 
                  ? 'bg-blue-100 text-blue-800' 
                  : getEventEndDate(event) && getEventEndDate(event)! < new Date()
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {getEventStartDate(event) && getEventStartDate(event)! > new Date() 
                  ? 'À venir' 
                  : getEventEndDate(event) && getEventEndDate(event)! < new Date()
                    ? 'Terminé'
                    : 'En cours'
                }
              </span>
              </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                href={`/dashboard/events/${event?.id}/apercu`}
                className="inline-flex items-center justify-center px-4 py-2 bg-[#81B441] hover:bg-[#6a9636] text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <PhotoIcon className="w-5 h-5 mr-2" />
                Aperçu de l&apos;évent
              </Link>
              <Link 
                href={`/checkin/${event?.slug}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-[#81B441] text-white text-sm font-medium rounded-md shadow-sm hover:bg-[#6a9636] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <QrCodeIcon className="w-5 h-5 mr-2" />
                Check-in
              </Link>
              <button
                onClick={openEditModal}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Modifier
              </Link>
            </div>
        </div>
          
          {/* Résumé de l'événement et statistiques clés */}
          <div className="px-6 py-3">
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Carte 1: Participants */}
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Participants</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {eventStats.loading ? (
                          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          eventStats.totalRegistrations
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {eventStats.totalRegistrations > 0 
                          ? `${eventStats.checkedInCount} enregistrés (${eventStats.checkInRate}%)`
                          : "Aucun participant"
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <UserPlusIcon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link 
                      href={`/dashboard/events/${eventId}/participants`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      Voir tous les participants
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                </Link>
              </div>
            </div>
        </div>
                
              {/* Carte 2: Check-in */}
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Taux de Check-in</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {eventStats.loading ? (
                          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          `${eventStats.checkInRate}%`
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {eventStats.checkedInCount} sur {eventStats.totalRegistrations}
                      </p>
      </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <QrCodeIcon className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link 
                      href={`/checkin/${event?.slug}`}
                      className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
                    >
                      Aller à la page de check-in
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
                
              {/* Carte 3: Jours restants */}
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {getEventStartDate(event) && getEventStartDate(event)! > new Date() 
                          ? 'Jours restants' 
                          : getEventEndDate(event) && getEventEndDate(event)! < new Date()
                            ? 'Événement terminé'
                            : 'En cours'
                        }
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {getEventStartDate(event) && getEventStartDate(event)! > new Date() 
                          ? Math.ceil((new Date(getEventStartDate(event) as Date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : getEventEndDate(event) && getEventEndDate(event)! < new Date()
                            ? 'Terminé'
                            : 'En cours'
                        }
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {getEventStartDate(event) && formatEventDate(getEventStartDate(event))}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      {event?.location || 'Emplacement non spécifié'}
                    </p>
                  </div>
                </div>
              </div>
                
              {/* Carte 4: Revenus estimés */}
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Revenus estimés</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {eventStats.loading ? (
                          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          `${(eventStats.totalRegistrations * 50).toLocaleString()} €`
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Basé sur 50€ par participant
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <DocumentTextIcon className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link 
                      href={`/dashboard/events/${eventId}/analytique`}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                    >
                      Voir les analytiques
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
            </div>
          </div>
          
            {/* Informations de l'événement */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Bannière et détails principaux */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-48 relative bg-gray-100">
                  {event?.banner ? (
                <img 
                  src={event.banner} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                    <div className="flex items-center justify-center h-full">
                      <PhotoIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              </div>
            <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{event?.name}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event?.sector && (
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {event.sector}
                      </span>
                    )}
                    {event?.type && (
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {event.type}
                      </span>
                    )}
                    {event?.format && (
                      <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        {event.format}
                      </span>
                    )}
                </div>
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700">{event?.description || "Aucune description disponible."}</p>
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Date et heure</h3>
                      <p className="text-gray-900">
                        {getEventStartDate(event) && format(new Date(getEventStartDate(event) as Date), 'd MMMM yyyy', { locale: fr })}
                        {event?.startTime && ` à ${event.startTime}`}
                        {getEventEndDate(event) && getEventStartDate(event) !== getEventEndDate(event) && 
                          ` - ${format(new Date(getEventEndDate(event) as Date), 'd MMMM yyyy', { locale: fr })}`}
                        {event?.endTime && ` à ${event.endTime}`}
                  </p>
                </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Lieu</h3>
                      <p className="text-gray-900">{event?.location || "Non spécifié"}</p>
              </div>
              </div>
                    </div>
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      const url = window.location.origin + `/events/${event?.slug}`;
                      navigator.clipboard.writeText(url);
                      alert("Lien copié dans le presse-papier!");
                    }}
                    className="inline-flex items-center text-gray-700 hover:text-gray-900"
                  >
                    <ShareIcon className="w-5 h-5 mr-2" />
                    Partager l&apos;événement
                  </Link>
                </div>
              </div>
              
              {/* Actions rapides */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
                  <p className="text-xs text-gray-500 mt-1">Gérez facilement les aspects essentiels de votre événement</p>
              </div>
              
                <div className="p-4">
                  {/* Système d'accordéon pour les actions rapides */}
                  <div className="space-y-2.5">
                    {/* Accordéon 1: Sessions et programme */}
                    <Link href={`/dashboard/events/${eventId}/sessions`} className="block">
                      <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all">
                        <div className="flex items-center justify-between p-3.5 bg-white cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-3 p-2.5 rounded-full bg-[#eef5e5]">
                              <CalendarIcon className="h-5 w-5 text-[#81B441]" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">Sessions et programme</h3>
                            </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                      </div>
                  </Link>
                  
                    {/* Accordéon 2: Groupes et droits */}
                    <Link href={`/dashboard/events/${eventId}/groups`} className="block">
                      <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all">
                        <div className="flex items-center justify-between p-3.5 bg-white cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-3 p-2.5 rounded-full bg-[#eef5e5]">
                              <UsersIcon className="h-5 w-5 text-[#81B441]" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">Groupes & droits</h3>
                            </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                      </div>
                  </Link>
                  
                    {/* Accordéon 3: Sponsors et partenaires */}
                    <Link href={`/dashboard/events/${eventId}/sponsors`} className="block">
                      <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all">
                        <div className="flex items-center justify-between p-3.5 bg-white cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-3 p-2.5 rounded-full bg-[#eef5e5]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-[#81B441]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                      </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">Sponsors et partenaires</h3>
                            </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                      </div>
                  </Link>
                  
                    {/* Accordéon 4: Notifications */}
                    <Link href={`/dashboard/events/${eventId}/notifications`} className="block">
                      <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all">
                        <div className="flex items-center justify-between p-3.5 bg-white cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-3 p-2.5 rounded-full bg-[#eef5e5]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-[#81B441]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">Notifications et alertes</h3>
                            </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                      </div>
                  </Link>
                  
                    {/* Accordéon 5: Exposants */}
                    <Link href={`/dashboard/events/${eventId}/exposants`} className="block">
                      <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all">
                        <div className="flex items-center justify-between p-3.5 bg-white cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-3 p-2.5 rounded-full bg-[#eef5e5]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-[#81B441]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                      </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">Exposants</h3>
                            </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                      </div>
                  </Link>
                  
                    {/* Bouton pour voir plus d'actions */}
                    <button 
                      onClick={() => {
                        // Redirection vers une page avec toutes les actions
                        window.location.href = `/dashboard/events/${eventId}/actions`;
                      }}
                      className="w-full mt-2 py-2 bg-gray-50 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
                    >
                      Voir plus d&apos;actions
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 ml-1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </Link>
                    </div>
                </div>
              </div>
              </div>
            </div>
        </main>
          </div>
          
      {/* Modal de modification */}
      {showEditModal && editedEvent && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${modalClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300 ${modalClosing ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'}`}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white">
              <h2 className="text-xl font-bold">Modifier l&apos;événement</h2>
              <button 
                onClick={closeEditModal}
                className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                    <XMarkIcon className="h-6 w-6" />
                  </Link>
                </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              {/* Info banner */}
              <div className="bg-[#f9fbf5] border border-[#e0edd0] rounded-lg p-4 mb-6 flex items-start">
                <div className="bg-[#81B441] rounded-full p-2 text-white mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#445231] mb-1">Informations sur l&apos;événement</h3>
                  <p className="text-sm text-[#5d6f4a]">
                    ID de l&apos;événement: <span className="font-mono bg-white bg-opacity-50 px-2 py-0.5 rounded">{editedEvent?.id}</span>
                  </p>
                </div>
              </div>
              
              {/* Main Form Grid - Appliquer une opacité réduite pendant la sauvegarde */}
              <div className={`