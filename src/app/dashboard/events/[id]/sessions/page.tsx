"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeftIcon,
  PlusIcon,
  CalendarIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types
type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  banner?: string;
  slug?: string;
};

type Session = {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  speaker?: string;
  capacity?: number;
};

// Type augmentation pour le champ speaker
type Speaker = {
  id?: string;
  firstName?: string;
  lastName?: string;
};

export default function EventSessionsPage({ params }: { params: { id: string } }) {
  const [eventId, setEventId] = useState<string>("");
  const [event, setEvent] = useState<Event | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterSpeaker, setFilterSpeaker] = useState<string>('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  // Extraire les paramètres une fois au chargement du composant
  useEffect(() => {
    if (params && params.id) {
      setEventId(params.id);
    }
  }, [params]);

  // Récupérer les détails de l'événement et les sessions au chargement
  useEffect(() => {
    if (!eventId) return;
    
    const fetchData = async () => {
      try {
        // Récupérer les détails de l'événement
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) throw new Error('Erreur lors de la récupération des détails de l\'événement');
        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Récupérer les sessions
        const sessionsResponse = await fetch(`/api/events/${eventId}/sessions`);
        if (!sessionsResponse.ok) throw new Error('Erreur lors de la récupération des sessions');
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const refreshSessions = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/sessions`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des sessions');
      const data = await response.json();
      setSessions(data);
      toast.success('Sessions actualisées');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'actualisation des sessions');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les lieux uniques pour le filtre
  const uniqueLocations = useMemo(() => {
    const locations = sessions
      .filter(s => s.location)
      .map(s => s.location as string);
    return [...new Set(locations)];
  }, [sessions]);

  // Obtenir les intervenants uniques pour le filtre
  const uniqueSpeakers = useMemo(() => {
    const speakers = sessions
      .filter(s => s.speaker)
      .map(s => {
        const speaker = s.speaker;
        
        // Si c'est une chaîne
        if (typeof speaker === 'string') {
          return speaker;
        } 
        
        // Si c'est un objet
        if (speaker && typeof speaker === 'object') {
          const speakerObj = speaker as Speaker;
          
          // Si c'est un objet avec firstName et lastName
          if ('firstName' in speakerObj && 'lastName' in speakerObj) {
            return `${speakerObj.firstName} ${speakerObj.lastName}`;
          }
          
          // Si c'est un tableau
          if (Array.isArray(speakerObj)) {
            return speakerObj
              .map(spk => {
                if (spk && typeof spk === 'object' && 'firstName' in spk && 'lastName' in spk) {
                  const typedSpeaker = spk as Speaker;
                  return `${typedSpeaker.firstName} ${typedSpeaker.lastName}`;
                }
                return String(spk);
              })
              .join(', ');
          }
          
          // Si c'est un autre type d'objet, le convertir en chaîne
          return JSON.stringify(speakerObj);
        }
        
        // Fallback pour tout autre type
        return String(speaker);
      });
    
    // Utiliser Set pour éliminer les doublons
    return [...new Set(speakers)];
  }, [sessions]);

  // Filtrer les sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      let matchesLocation = true;
      let matchesSpeaker = true;
      
      if (filterLocation && session.location) {
        matchesLocation = session.location.includes(filterLocation);
      }
      
      if (filterSpeaker && session.speaker) {
        matchesSpeaker = session.speaker.includes(filterSpeaker);
      }
      
      return matchesLocation && matchesSpeaker;
    });
  }, [sessions, filterLocation, filterSpeaker]);

  // Organiser les sessions par jour
  const sessionsByDay = useMemo(() => {
    const grouped: { [key: string]: Session[] } = {};
    
    filteredSessions.forEach(session => {
      const dateKey = format(new Date(session.start_date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    
    // Trier les sessions de chaque jour par heure de début
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        return a.start_time.localeCompare(b.start_time);
      });
    });
    
    return grouped;
  }, [filteredSessions]);

  const toggleDayExpansion = (day: string) => {
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      setExpandedDay(day);
    }
  };

  // Fonction pour exporter les sessions au format Excel
  const handleExportSessions = () => {
    if (!eventId) return;
    
    // Préparation de l'URL de l'API d'exportation
    const exportUrl = `/api/events/${eventId}/export/sessions`;
    
    // Afficher un loading toast
    toast.loading('Exportation des sessions en cours...', { id: 'export-toast' });

    // Ouvrir l'URL dans un nouvel onglet ou télécharger directement le fichier
    const downloadLink = document.createElement('a');
    downloadLink.href = exportUrl;
    downloadLink.target = '_blank';
    downloadLink.download = 'sessions.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Mettre à jour le toast pour indiquer le succès
    setTimeout(() => {
      toast.success('Les sessions ont été exportées avec succès', { id: 'export-toast' });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EventSidebar eventId={eventId} />
      
      <main className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300 overflow-auto">
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
              <h1 className="text-2xl font-bold text-gray-900">Sessions et programme</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les sessions et le programme pour votre événement {event?.name || ''}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <button
                onClick={refreshSessions}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Actualiser
              </button>
              
              <button
                onClick={handleExportSessions}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Exporter Excel
              </button>

              <Link
                href={`/dashboard/events/${eventId}/sessions/create`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Ajouter une session
              </Link>
            </div>
          </div>
          
          {/* Contrôles de filtre */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div>
                  <label htmlFor="filterLocation" className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <select
                    id="filterLocation"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full sm:w-40 py-1.5 pl-3 pr-10 text-sm border-gray-300 focus:outline-none focus:ring-[#81B441] focus:border-[#81B441] rounded-md"
                  >
                    <option value="">Tous les lieux</option>
                    {uniqueLocations.map((location, index) => (
                      <option key={`location-${index}`} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="filterSpeaker" className="block text-sm font-medium text-gray-700 mb-1">Intervenant</label>
                  <select
                    id="filterSpeaker"
                    value={filterSpeaker}
                    onChange={(e) => setFilterSpeaker(e.target.value)}
                    className="w-full sm:w-48 py-1.5 pl-3 pr-10 text-sm border-gray-300 focus:outline-none focus:ring-[#81B441] focus:border-[#81B441] rounded-md"
                  >
                    <option value="">Tous les intervenants</option>
                    {uniqueSpeakers.map((speaker, index) => (
                      <option key={`speaker-${index}`} value={speaker}>
                        {speaker}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} trouvée{filteredSessions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {/* Content area */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
              <p className="ml-3 text-gray-500">Chargement des sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucune session</h3>
              <p className="mt-1 text-sm text-gray-500">
                {sessions.length > 0 
                  ? "Filtrer ou rechercher parmi les sessions disponibles pour afficher les résultats."
                  : "Vous n'avez pas encore ajouté de sessions à cet événement."}
              </p>
              <Link
                href={`/dashboard/events/${eventId}/sessions/create`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Ajouter votre première session
              </Link>
            </div>
          ) : (
            // Vue liste organisée par jour
            <div className="space-y-6 pb-20">
              {Object.keys(sessionsByDay).sort().map((day) => (
                <div key={day} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div 
                    className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer"
                    onClick={() => toggleDayExpansion(day)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#81B441]">
                        {format(new Date(day), 'EEEE d MMMM yyyy', { locale: fr })}
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {sessionsByDay[day].length} session{sessionsByDay[day].length !== 1 ? 's' : ''}
                        </span>
                        {expandedDay === day ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {(expandedDay === day || expandedDay === null) && (
                    <ul role="list" className="divide-y divide-gray-200">
                      {sessionsByDay[day].map((session) => (
                        <li key={session.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150 relative">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <span className="text-lg font-medium text-gray-900">
                                  {session.title}
                                </span>
                                <div className="px-2 py-1 bg-[#81B441]/10 text-[#81B441] text-xs font-medium rounded-full">
                                  {session.start_time} - {session.end_time}
                                </div>
                              </div>
                            </div>
                            <div className="self-center">
                              <ChevronLeftIcon className="h-5 w-5 text-gray-400 transform rotate-180" />
                            </div>
                          </div>
                          <Link
                            href={`/dashboard/events/${eventId}/sessions/${session.id}`}
                            className="absolute inset-0 cursor-pointer z-10"
                            aria-label={`Voir les détails de la session ${session.title}`}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Styles pour le spinner */}
      <style jsx>{`
        .spinner {
          border: 3px solid rgba(129, 180, 65, 0.3);
          border-radius: 50%;
          border-top: 3px solid #81B441;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 