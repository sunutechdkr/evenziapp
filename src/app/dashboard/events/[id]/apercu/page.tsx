"use client";

import { useEffect, useState, useMemo } from "react";
import { CalendarIcon, MapPinIcon, UsersIcon, MicrophoneIcon, BuildingStorefrontIcon, CheckCircleIcon, UserCircleIcon, ClockIcon, ChevronRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import ClientOnly from "@/components/ClientOnly";
import ParticipantsSection from "@/components/ParticipantsSection";
// Types
type RegistrationData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  company?: string;
  checkedIn: boolean;
  type: string;
};

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

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  avatar?: string;
  checkedIn: boolean;
  type?: string;
  bio?: string;
  expertise?: string[];
  sessions?: Array<{id: string, title: string}>;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
};

type Session = {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  speakerIds?: string[];
  speakers?: Participant[];
  day?: string;
  participantCount?: number;
};

export default function EventApercuPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("about");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [speakers, setSpeakers] = useState<Participant[]>([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Participant | null>(null);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

  

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

  // Récupérer les participants
  useEffect(() => {
    if (activeTab === "participants" && event) {
      const fetchParticipants = async () => {
        setLoadingParticipants(true);
        try {
          const response = await fetch(`/api/events/${eventId}/registrations`);
          if (response.ok) {
            const data = await response.json();
            
            if (!data || !data.registrations || !Array.isArray(data.registrations)) {
              console.error("Format de données invalide:", data);
              setParticipants([]);
              return;
            }
            
            const mappedParticipants = data.registrations.map((reg: RegistrationData) => ({
              id: reg.id,
              firstName: reg.firstName,
              lastName: reg.lastName,
              email: reg.email,
              jobTitle: reg.jobTitle || "",
              company: reg.company || "",
              avatar: "",
              checkedIn: reg.checkedIn,
              type: reg.type || "PARTICIPANT"
            }));
            
            setParticipants(mappedParticipants);
          } else {
            console.error("Erreur lors de la récupération des participants:", await response.text());
            setParticipants([]);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des participants:", error);
          setParticipants([]);
        } finally {
          setLoadingParticipants(false);
        }
      };
      
      fetchParticipants();
    }
  }, [activeTab, eventId, event]);

  // Récupérer les intervenants
  useEffect(() => {
    if (activeTab === "speakers" && event) {
      const fetchSpeakers = async () => {
        setLoadingSpeakers(true);
        try {
          const response = await fetch(`/api/events/${eventId}/registrations`);
          if (response.ok) {
            const data = await response.json();
            
            if (data && data.registrations && Array.isArray(data.registrations)) {
              const speakersFromDB = data.registrations
                .filter((reg: RegistrationData) => reg.type === 'SPEAKER')
                .map((reg: RegistrationData) => ({
                  id: reg.id,
                  firstName: reg.firstName,
                  lastName: reg.lastName,
                  email: reg.email,
                  jobTitle: reg.jobTitle || "Intervenant",
                  company: reg.company || "",
                  avatar: "",
                  checkedIn: reg.checkedIn,
                  type: reg.type,
                  bio: `Intervenant expérimenté dans le domaine de ${reg.company || 'son secteur'}.`,
                  expertise: [reg.jobTitle || "Expertise générale"],
                  sessions: [],
                  socialLinks: {}
                }));
              
              setSpeakers(speakersFromDB);
            } else {
              setSpeakers([]);
            }
          } else {
            console.error("Erreur lors de la récupération des intervenants");
            setSpeakers([]);
          }
        } catch (error) {
          console.error("Erreur:", error);
          setSpeakers([]);
        } finally {
          setLoadingSpeakers(false);
        }
      };
      fetchSpeakers();
    }
  }, [activeTab, event, eventId]);

  // Récupérer les sessions
  useEffect(() => {
    if (activeTab === "agenda" && event) {
      const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
          const response = await fetch(`/api/events/${eventId}/sessions`);
          if (response.ok) {
            const sessionsData = await response.json();
            
            const formattedSessions = sessionsData.map((session: any) => {
              const startDate = new Date(session.start_date || session.startDate);
              const endDate = new Date(session.end_date || session.endDate);
              const formattedDay = format(startDate, "d MMMM yyyy", { locale: fr });
              
              const sessionSpeakers = session.speakers || [];
              const speakersWithAvatars = sessionSpeakers.map((speaker: any) => ({
                ...speaker,
                avatar: speaker.avatar || generateAvatarUrl(speaker.firstName, speaker.lastName)
              }));
              
              return {
                id: session.id,
                title: session.title,
                description: session.description,
                startTime: `${startDate.toISOString().split('T')[0]}T${session.start_time || "09:00:00"}`,
                endTime: `${endDate.toISOString().split('T')[0]}T${session.end_time || "10:00:00"}`,
                location: session.location,
                speakers: speakersWithAvatars.length > 0 ? speakersWithAvatars : undefined,
                day: formattedDay,
                participantCount: session.participantCount || 0
              };
            });
            
            formattedSessions.sort((a: Session, b: Session) => 
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
            
            setSessions(formattedSessions);
          } else {
            console.error("Erreur lors de la récupération des sessions:", await response.text());
            setSessions([]);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des sessions:", error);
          setSessions([]);
        } finally {
          setLoadingSessions(false);
        }
      };
      
      fetchSessions();
    }
  }, [activeTab, eventId, event]);

  const openSessionDetails = async (session: Session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
    checkParticipationStatus(session.id);
  };

  const checkParticipationStatus = async (sessionId: string) => {
    setIsParticipating(false);
    
    try {
      const response = await fetch(`/api/events/${eventId}/sessions/${sessionId}/participants/check`);
      if (response.ok) {
        const data = await response.json();
        setIsParticipating(data.isParticipating || false);
      }
    } catch {
      console.log("API de vérification de participation non disponible");
      setIsParticipating(Math.random() < 0.2);
    }
  };

  const updateParticipationStatus = (sessionId: string, isAdding: boolean = true) => {
    setSessions(prevSessions => 
      prevSessions.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              participantCount: isAdding 
                ? (s.participantCount || 0) + 1 
                : Math.max((s.participantCount || 0) - 1, 0)
            } 
          : s
      )
    );
    
    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession({
        ...selectedSession,
        participantCount: isAdding 
          ? (selectedSession.participantCount || 0) + 1 
          : Math.max((selectedSession.participantCount || 0) - 1, 0)
      });
    }
  };

  const participateInSession = async (sessionId: string) => {
    if (isParticipating) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const response = await fetch(`/api/events/${eventId}/sessions/${sessionId}/participants`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            setIsParticipating(false);
            updateParticipationStatus(sessionId, false);
            toast.success("Vous êtes désinscrit de cette session");
            return;
          }
        } catch {
          console.log("API de désinscription non disponible, simulation locale utilisée");
        }
        
        setIsParticipating(false);
        updateParticipationStatus(sessionId, false);
        toast.success("Vous êtes désinscrit de cette session (simulation)");
        
      } catch (error) {
        console.error("Erreur lors de la désinscription à la session:", error);
        toast.error("Une erreur est survenue lors de la désinscription");
      }
    } else {
      try {
        setIsParticipating(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const response = await fetch(`/api/events/${eventId}/sessions/${sessionId}/participants`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (response.ok) {
            updateParticipationStatus(sessionId, true);
            toast.success("Vous êtes inscrit à cette session");
            return;
          }
        } catch {
          console.log("API de participation non disponible, simulation locale utilisée");
        }
        
        updateParticipationStatus(sessionId, true);
        toast.success("Vous êtes inscrit à cette session (simulation)");
        
      } catch (error) {
        console.error("Erreur lors de l'inscription à la session:", error);
        setIsParticipating(false);
        toast.error("Une erreur inattendue s'est produite");
      }
    }
  };

  const openSpeakerProfile = async (speaker: Participant | string) => {
    if (typeof speaker === 'string') {
      try {
        setSelectedSpeaker({
          id: speaker,
          firstName: "Chargement",
          lastName: "...",
          checkedIn: false,
          avatar: generateAvatarUrl("C", ""),
          type: "SPEAKER"
        });
        setIsSpeakerModalOpen(true);
        
        const response = await fetch(`/api/events/${eventId}/registrations/${speaker}`);
        if (response.ok) {
          const data = await response.json();
          const registration = data.registration;
          
          if (registration) {
            const speakerSessions = sessions
              .filter(session => 
                session.speakers?.some(s => 
                  (typeof s === 'string' && s === speaker) || 
                  (typeof s === 'object' && s.id === speaker)
                )
              )
              .map(session => ({
                id: session.id,
                title: session.title
              }));
            
            setSelectedSpeaker({
              id: registration.id,
              firstName: registration.firstName,
              lastName: registration.lastName,
              email: registration.email,
              jobTitle: registration.jobTitle || "",
              company: registration.company || "",
              bio: registration.bio || "Cet intervenant est un expert dans son domaine.",
              expertise: registration.expertise || ["Expertise"],
              sessions: speakerSessions,
              socialLinks: registration.socialLinks || { 
                twitter: `@${registration.firstName.toLowerCase()}`, 
                linkedin: `/in/${registration.firstName.toLowerCase()}-${registration.lastName.toLowerCase()}`,
                website: registration.company ? `https://www.${registration.company.toLowerCase().replace(/\s+/g, '')}.com` : "https://example.com"
              },
              avatar: registration.avatar || generateAvatarUrl(registration.firstName, registration.lastName),
              checkedIn: registration.checkedIn || false,
              type: registration.type || "SPEAKER"
            });
          }
        } else {
          setSelectedSpeaker({
            id: speaker,
            firstName: "Intervenant",
            lastName: "#" + speaker.substring(0, 4),
            checkedIn: false,
            jobTitle: "Information non disponible",
            company: "",
            bio: "Les détails de cet intervenant ne sont pas disponibles pour le moment.",
            expertise: ["Conférencier"],
            avatar: generateAvatarUrl("I", "N"),
            type: "SPEAKER"
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des détails de l'intervenant:", error);
      }
    } else {
      setSelectedSpeaker({
        ...speaker,
        avatar: speaker.avatar || generateAvatarUrl(speaker.firstName, speaker.lastName)
      });
      setIsSpeakerModalOpen(true);
    }
  };

  const closeSpeakerProfile = () => {
    setIsSpeakerModalOpen(false);
    setSelectedSpeaker(null);
  };

  const generateAvatarUrl = (firstName: string, lastName: string) => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const colors = ['81B441', '4169E1', 'E91E63', 'FF9800', '009688', '673AB7'];
    const colorIndex = (firstName.length + lastName.length) % colors.length;
    return `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff&size=128`;
  };

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
        {/* Bouton retour au dashboard */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Link>
        </div>
        
        <div className="w-full h-56 bg-gray-200">
          {event?.banner ? (
            <img src={event.banner} alt="Bannière" className="w-full h-56 object-cover" />
          ) : (
            <div className="w-full h-56 flex items-center justify-center text-gray-400 text-2xl font-bold bg-gradient-to-r from-blue-100 to-green-100">Aucune bannière</div>
          )}
        </div>
        
        <div className="absolute left-8 -bottom-16 flex items-end">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden">
            {event?.logo ? (
              <img src={event.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-blue-600">{event?.name?.charAt(0) || "E"}</span>
            )}
          </div>
          <div className="ml-6 mb-4">
            <div className="flex items-center text-gray-500 mt-2 flex-wrap gap-4">
              <span className="flex items-center bg-white bg-opacity-90 px-3 py-1 rounded">
                <CalendarIcon className="w-5 h-5 mr-1" />
                {event?.startDate ? formatDate(event.startDate) : ''}
                {event?.endDate ? ` - ${formatDate(event.endDate)}` : ""}
              </span>
              <span className="flex items-center bg-white bg-opacity-90 px-3 py-1 rounded">
                <MapPinIcon className="w-5 h-5 mr-1" />
                {event?.location}
              </span>
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
            <h2 className="text-xl font-semibold mb-4">Agenda</h2>
            
            {loadingSessions ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#81B441] border-t-transparent"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
                L&apos;agenda détaillé sera bientôt disponible.
              </div>
            ) : (
              <div>
                {/* Regrouper les sessions par jour */}
                {Array.from(new Set(sessions.map(session => session.day))).map(day => (
                  <Card key={day} className="mb-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2 text-[#81B441]" />
                        {day}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sessions
                          .filter(session => session.day === day)
                          .sort((a: Session, b: Session) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                          .map(session => (
                            <div key={session.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-transparent last:pb-0">
                              {/* Point sur la timeline */}
                              <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-[#81B441]"></div>
                              
                              {/* Carte cliquable pour ouvrir les détails */}
                              <div 
                                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => openSessionDetails(session)}
                              >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                                  <div className="flex items-center text-sm text-gray-500 mt-1 md:mt-0">
                                    <ClockIcon className="w-4 h-4 mr-1 text-[#81B441]" />
                                    {format(new Date(session.startTime), "HH'h'mm", { locale: fr })} - {format(new Date(session.endTime), "HH'h'mm", { locale: fr })}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs mt-2">
                                  {session.location && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <MapPinIcon className="w-3 h-3" />
                                      {session.location}
                                    </Badge>
                                  )}
                                  
                                  {session.speakers && session.speakers.length > 0 && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <MicrophoneIcon className="w-3 h-3" />
                                      {session.speakers.length} intervenant{session.speakers.length > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                  
                                  {(!session.speakers || session.speakers.length === 0) && (
                                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-500">
                                      <MicrophoneIcon className="w-3 h-3" />
                                      0 intervenant
                                    </Badge>
                                  )}
                                  
                                  {session.participantCount !== undefined && (
                                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                                      <UsersIcon className="w-3 h-3" />
                                      {session.participantCount} participant{session.participantCount !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Modal de détails de session */}
                <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
                  {selectedSession && (
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-[#81B441]">{selectedSession.title}</DialogTitle>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <ClockIcon className="w-4 h-4 mr-1 text-[#81B441]" />
                          {format(new Date(selectedSession.startTime), "d MMMM yyyy, HH'h'mm", { locale: fr })} - {format(new Date(selectedSession.endTime), "HH'h'mm", { locale: fr })}
                        </div>
                      </DialogHeader>
                      
                      <div className="mt-2">
                        {selectedSession.location && (
                          <div className="flex items-center mb-3 text-gray-600">
                            <MapPinIcon className="w-5 h-5 mr-2 text-[#81B441]" />
                            <span>{selectedSession.location}</span>
                          </div>
                        )}
                        
                        {selectedSession.description && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1 text-gray-700">Description</h4>
                            <p className="text-gray-600 text-sm">{selectedSession.description}</p>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2 text-gray-700">Intervenants</h4>
                          {selectedSession.speakers && selectedSession.speakers.length > 0 ? (
                            <div className="space-y-2">
                              {selectedSession.speakers.map((speaker, index) => {
                                return (
                                  <div 
                                    key={typeof speaker === 'string' ? speaker : speaker.id || index} 
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => openSpeakerProfile(speaker)}
                                  >
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                      {typeof speaker === 'string' ? (
                                        <div className="h-full w-full flex items-center justify-center bg-[#81B441] text-white font-bold text-lg">
                                          I
                                        </div>
                                      ) : speaker.avatar ? (
                                        <img src={speaker.avatar} alt={`${speaker.firstName} ${speaker.lastName}`} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-[#81B441] text-white font-bold text-lg">
                                          {speaker.firstName?.charAt(0) || "I"}{speaker.lastName?.charAt(0) || ""}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      {typeof speaker === 'string' ? (
                                        <p className="font-medium text-gray-800">Intervenant #{(speaker as string).substring(0, 4)}</p>
                                      ) : (
                                        <>
                                          <p className="font-medium text-gray-800">{speaker.firstName} {speaker.lastName}</p>
                                          {speaker.jobTitle && <p className="text-xs text-gray-500">{speaker.jobTitle}</p>}
                                          {speaker.company && <p className="text-xs font-medium text-[#81B441]">{speaker.company}</p>}
                                        </>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 border border-dashed border-gray-200 rounded-md bg-gray-50 text-center">
                              <p className="text-sm text-gray-500 mb-2">Aucun intervenant assigné à cette session</p>
                              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                <MicrophoneIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <div className="text-sm text-gray-500 mb-2">
                            <div className="w-full text-xs text-gray-500 mb-2 text-center">
                              {selectedSession.participantCount === 0 ? (
                                <p>Soyez le premier à participer !</p>
                              ) : (
                                <p>{selectedSession.participantCount} participant{selectedSession.participantCount !== 1 ? 's' : ''} inscrit{selectedSession.participantCount !== 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          onClick={() => participateInSession(selectedSession.id)}
                          className={`w-full ${
                            isParticipating 
                              ? "bg-red-500 hover:bg-red-600" 
                              : "bg-[#81B441] hover:bg-[#729939]"
                          }`}
                        >
                          {isParticipating ? (
                            <span className="flex items-center">
                              <CheckCircleIcon className="w-4 h-4 mr-2" />
                              Se désinscrire
                            </span>
                          ) : (
                            'Participer à cette session'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            )}
          </section>
          )}
          
          {activeTab === "participants" && (
          <ClientOnly fallback={
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#81B441] border-t-transparent"></div>
            </div>
          }>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Participants</h2>
              <ParticipantsSection 
                participants={participants}
                loadingParticipants={loadingParticipants}
              />
            </section>
          </ClientOnly>
          )}
          
          {activeTab === "speakers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Intervenants</h2>
              <p className="text-gray-600">
                {loadingSpeakers ? "Chargement..." : `${speakers.length} intervenant${speakers.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            
            {loadingSpeakers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : speakers.length === 0 ? (
              <div className="text-center py-12">
                <MicrophoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun intervenant défini pour le moment</h3>
                <p className="text-gray-500">Les intervenants seront affichés une fois qu&apos;ils seront ajoutés à l&apos;événement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {speakers.map((speaker) => (
                  <div
                    key={speaker.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6"
                    onClick={() => openSpeakerProfile(speaker)}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                        {speaker.firstName?.charAt(0)}{speaker.lastName?.charAt(0)}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {speaker.firstName} {speaker.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{speaker.jobTitle}</p>
                      <p className="text-xs text-gray-500">{speaker.company}</p>
                      {speaker.checkedIn && (
                        <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Présent
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {/* Dialog pour le profil de l'intervenant */}
      <Dialog open={isSpeakerModalOpen} onOpenChange={setIsSpeakerModalOpen}>
        {selectedSpeaker && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center">
                <span>{selectedSpeaker.firstName} {selectedSpeaker.lastName}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                  {selectedSpeaker.avatar ? (
                    <img 
                      src={selectedSpeaker.avatar} 
                      alt={`${selectedSpeaker.firstName} ${selectedSpeaker.lastName}`} 
                      className="h-full w-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = generateAvatarUrl(selectedSpeaker.firstName || 'I', selectedSpeaker.lastName || '');
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#81B441] text-white font-bold text-3xl">
                      {selectedSpeaker.firstName?.charAt(0) || 'I'}{selectedSpeaker.lastName?.charAt(0) || ''}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedSpeaker.firstName} {selectedSpeaker.lastName}</h3>
                  {selectedSpeaker.jobTitle && (
                    <p className="text-sm text-gray-600">{selectedSpeaker.jobTitle}</p>
                  )}
                  {selectedSpeaker.company && (
                    <p className="text-sm font-medium text-[#81B441]">{selectedSpeaker.company}</p>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Intervenant
                    </Badge>
                    {selectedSpeaker.checkedIn && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Présent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Biographie</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {selectedSpeaker.bio || "Aucune biographie disponible pour cet intervenant."}
                </div>
              </div>
              
              {selectedSpeaker.expertise && selectedSpeaker.expertise.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpeaker.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-[#81B441] bg-opacity-10 text-[#81B441] hover:bg-opacity-20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSpeaker.sessions && selectedSpeaker.sessions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700">Sessions</h4>
                  <div className="space-y-2">
                    {selectedSpeaker.sessions.map((session) => (
                      <div key={session.id} 
                           className="p-3 bg-[#81B441] bg-opacity-5 rounded-md border border-[#81B441] border-opacity-20 hover:bg-opacity-10 transition-colors cursor-pointer"
                           onClick={() => {
                             const sessionDetails = sessions.find(s => s.id === session.id);
                             if (sessionDetails) {
                               closeSpeakerProfile();
                               setTimeout(() => openSessionDetails(sessionDetails), 100);
                             }
                           }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-[#81B441]">{session.title}</p>
                          <ChevronRightIcon className="h-5 w-5 text-[#81B441]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSpeaker.socialLinks && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700">Réseaux sociaux</h4>
                  <div className="flex gap-3 text-sm">
                    {selectedSpeaker.socialLinks.twitter && (
                      <a href={`https://twitter.com/${selectedSpeaker.socialLinks.twitter.replace('@', '')}`} 
                         target="_blank" rel="noopener noreferrer"
                         className="text-blue-500 hover:text-blue-700 hover:underline">
                        Twitter
                      </a>
                    )}
                    {selectedSpeaker.socialLinks.linkedin && (
                      <a href={`https://linkedin.com${selectedSpeaker.socialLinks.linkedin}`} 
                         target="_blank" rel="noopener noreferrer"
                         className="text-blue-500 hover:text-blue-700 hover:underline">
                        LinkedIn
                      </a>
                    )}
                    {selectedSpeaker.socialLinks.website && (
                      <a href={selectedSpeaker.socialLinks.website} 
                         target="_blank" rel="noopener noreferrer"
                         className="text-blue-500 hover:text-blue-700 hover:underline">
                        Site web
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                onClick={closeSpeakerProfile}
                variant="outline"
                className="w-full"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-xs text-gray-400">
        powered by evenziapp
      </footer>
    </div>
  );
}
