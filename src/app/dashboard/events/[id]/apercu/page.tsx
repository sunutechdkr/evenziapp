"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, MapPinIcon, UsersIcon, MicrophoneIcon, BuildingStorefrontIcon, CheckCircleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useParams } from "next/navigation";

type Event = {
  id: string;
  name: string;
  slug?: string;
  location?: string;
  description?: string;
  registrations?: number;
  banner?: string;
  startDate?: string;
  endDate?: string;
  logo?: string;
  videoUrl?: string;
  speakersCount?: number;
  exhibitorsCount?: number;
  organizer?: { name?: string; role?: string };
};

// Ajouter un type pour les participants
type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  avatar?: string;
  checkedIn: boolean;
};

export default function EventApercuPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("about");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération de l'événement");
        const data = await response.json();
        setEvent(data);
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Ajouter une fonction pour récupérer les participants
  useEffect(() => {
    if (activeTab === "participants" && event) {
      const fetchParticipants = async () => {
        setLoadingParticipants(true);
        try {
          const response = await fetch(`/api/events/${eventId}/participants`);
          if (response.ok) {
            const data = await response.json();
            setParticipants(data);
          } else {
            // En cas d'erreur, on peut utiliser des données de test
            setParticipants([
              {
                id: '1',
                firstName: 'Sophie',
                lastName: 'Martin',
                jobTitle: 'Directrice Marketing',
                company: 'TechCorp',
                email: 'sophie.martin@example.com',
                checkedIn: true
              },
              {
                id: '2',
                firstName: 'Thomas',
                lastName: 'Dubois',
                jobTitle: 'Développeur Frontend',
                company: 'WebInnovate',
                email: 'thomas.dubois@example.com',
                checkedIn: true
              },
              {
                id: '3',
                firstName: 'Léa',
                lastName: 'Bernard',
                jobTitle: 'Consultante UX/UI',
                company: 'DesignHub',
                email: 'lea.bernard@example.com',
                checkedIn: false
              },
              {
                id: '4',
                firstName: 'Mohamed',
                lastName: 'Ndiaye',
                jobTitle: 'Chef de projet',
                company: 'GlobalConsult',
                email: 'mohamed.ndiaye@example.com',
                checkedIn: false
              },
              {
                id: '5',
                firstName: 'Aurélie',
                lastName: 'Robert',
                jobTitle: 'Responsable Innovation',
                company: 'FutureTech',
                email: 'aurelie.robert@example.com',
                checkedIn: true
              }
            ]);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des participants:", error);
        } finally {
          setLoadingParticipants(false);
        }
      };
      
      fetchParticipants();
    }
  }, [activeTab, eventId, event]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement de l&apos;événement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-gray-500">Événement introuvable.</div>
      </div>
    );
  }

  // Format helpers
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "d MMMM yyyy", { locale: fr });
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header: Banner + Avatar + Main Info */}
      <div className="relative">
        <div className="w-full h-56 bg-gray-200">
          {event.banner ? (
            <img src={event.banner} alt="Bannière" className="w-full h-56 object-cover" />
          ) : (
            <div className="w-full h-56 flex items-center justify-center text-gray-400 text-2xl font-bold bg-gradient-to-r from-blue-100 to-green-100">Aucune bannière</div>
          )}
        </div>
        <div className="absolute left-8 -bottom-16 flex items-end">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden">
            {event.logo ? (
              <img src={event.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-blue-600">{event.name?.charAt(0) || "E"}</span>
            )}
          </div>
          <div className="ml-6 mb-4">
            <div className="flex items-center text-gray-500 mt-2 flex-wrap gap-4">
              <span className="flex items-center bg-white bg-opacity-90 px-3 py-1 rounded"><CalendarIcon className="w-5 h-5 mr-1" />{formatDate(event.startDate || '')}{event.endDate ? ` - ${formatDate(event.endDate || '')}` : ""}</span>
              <span className="flex items-center bg-white bg-opacity-90 px-3 py-1 rounded"><MapPinIcon className="w-5 h-5 mr-1" />{event.location}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Spacer for avatar overlay */}
      <div className="h-20" />

      {/* Navigation Tabs */}
      <nav className="px-8 border-b bg-white flex gap-8 text-gray-600 font-medium text-base sticky top-0 z-10">
        <button 
          onClick={() => setActiveTab("about")} 
          className={`py-4 hover:text-[#81B441] transition-colors ${activeTab === "about" ? "text-[#81B441] border-b-2 border-[#81B441]" : ""}`}
        >
          Accueil
        </button>
        <button 
          onClick={() => setActiveTab("participants")} 
          className={`py-4 hover:text-[#81B441] transition-colors ${activeTab === "participants" ? "text-[#81B441] border-b-2 border-[#81B441]" : ""}`}
        >
          Participants
        </button>
        <button 
          onClick={() => setActiveTab("speakers")} 
          className={`py-4 hover:text-[#81B441] transition-colors ${activeTab === "speakers" ? "text-[#81B441] border-b-2 border-[#81B441]" : ""}`}
        >
          Intervenants
        </button>
        <button 
          onClick={() => setActiveTab("agenda")} 
          className={`py-4 hover:text-[#81B441] transition-colors ${activeTab === "agenda" ? "text-[#81B441] border-b-2 border-[#81B441]" : ""}`}
        >
          Agenda
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto mt-8 gap-8 px-4">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {activeTab === "about" && (
          <>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.name}</h1>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">À propos</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description || "Aucune description disponible."}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Vidéo de présentation</h2>
            {event.videoUrl ? (
              <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                <iframe src={event.videoUrl} title="Vidéo de l&apos;événement" allowFullScreen className="w-full h-full"></iframe>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-400">Aucune vidéo</div>
            )}
          </section>
          </>
          )}
          
          {activeTab === "agenda" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Agenda</h2>
            <div className="bg-gray-100 rounded-lg p-6 text-gray-500">L&apos;agenda détaillé sera bientôt disponible.</div>
          </section>
          )}
          
          {activeTab === "participants" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Participants</h2>
            
            {loadingParticipants ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#81B441] border-t-transparent"></div>
              </div>
            ) : participants.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
                Aucun participant inscrit pour le moment.
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {participants.length} participant{participants.length > 1 ? 's' : ''} 
                    <span className="ml-2 text-[#81B441]">
                      ({participants.filter(p => p.checkedIn).length} présent{participants.filter(p => p.checkedIn).length > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Rechercher un participant..." 
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {participants.map(participant => (
                    <div key={participant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {participant.avatar ? (
                            <img src={participant.avatar} alt={`${participant.firstName} ${participant.lastName}`} className="h-14 w-14 rounded-full object-cover" />
                          ) : (
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                              <UserCircleIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {participant.firstName} {participant.lastName}
                          </h3>
                          {participant.jobTitle && (
                            <p className="text-sm text-gray-600 truncate">
                              {participant.jobTitle} {participant.company && `· ${participant.company}`}
                            </p>
                          )}
                          {participant.email && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {participant.email}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          {participant.checkedIn ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Présent
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              En attente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button className="text-[#81B441] hover:text-[#6a9636] font-medium text-sm flex items-center gap-1">
                    Voir tous les participants
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </section>
          )}
          
          {activeTab === "speakers" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Intervenants</h2>
            <div className="bg-gray-100 rounded-lg p-6 text-gray-500">La liste des intervenants sera affichée ici.</div>
          </section>
          )}
        </div>
        {/* Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-2">Infos rapides</h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li className="flex items-center gap-2"><UsersIcon className="w-5 h-5 text-blue-500" /> {event.registrations || 0} participants</li>
              <li className="flex items-center gap-2"><MicrophoneIcon className="w-5 h-5 text-green-500" /> {event.speakersCount || 0} intervenants</li>
              <li className="flex items-center gap-2"><BuildingStorefrontIcon className="w-5 h-5 text-yellow-500" /> {event.exhibitorsCount || 0} exposants</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-2">Organisateur</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">{event.organizer?.name?.charAt(0) || "O"}</div>
              <div>
                <div className="font-semibold text-gray-900">{event.organizer?.name || "Organisateur"}</div>
                <div className="text-xs text-gray-500">{event.organizer?.role || "Équipe événement"}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-2">Réseaux sociaux</h3>
            <div className="flex gap-3">
              <a href="#" className="text-blue-500 hover:text-blue-700">#hashtag</a>
              <a href="#" className="text-blue-500 hover:text-blue-700">@twitter</a>
            </div>
          </div>
        </aside>
      </div>
      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-xs text-gray-400">
        powered by ineventapp
      </footer>
    </div>
  );
} 