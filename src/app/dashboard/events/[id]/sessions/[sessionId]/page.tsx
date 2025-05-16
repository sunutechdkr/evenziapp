"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Types
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
  format?: string;
  banner?: string;
};

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
};

export default function SessionDetailPage({ params }: { params: { id: string, sessionId: string } }) {
  // Initialiser les params comme variables régulières pour éviter les erreurs
  const router = useRouter();
  const [eventId, setEventId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [speakers, setSpeakers] = useState<Participant[]>([]);

  // Extraire les paramètres une fois au chargement du composant
  useEffect(() => {
    if (params && params.id && params.sessionId) {
      setEventId(params.id);
      setSessionId(params.sessionId);
    }
  }, [params]);

  // Charger les détails de la session
  useEffect(() => {
    if (!eventId || !sessionId) return;

    const fetchSessionDetails = async () => {
      try {
        // Récupérer les détails de l'événement (pour le nom)
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) throw new Error("Erreur lors de la récupération des détails de l'événement");
        const eventData = await eventResponse.json();
        setEventName(eventData.name);

        // Récupérer les détails de la session
        const response = await fetch(`/api/events/${eventId}/sessions/${sessionId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des détails de la session");
        const data = await response.json();
        setSession(data);

        // Si la session a des intervenants, récupérer leurs détails
        if (data.speaker) {
          await fetchSpeakerDetails(data.speaker);
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de récupérer les détails de la session");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [eventId, sessionId]);

  // Fonction pour récupérer les détails des intervenants
  const fetchSpeakerDetails = async (speakerIds: string) => {
    try {
      // Les IDs des intervenants sont stockés sous forme de chaîne séparée par des virgules
      const speakerIdArray = speakerIds.split(',');
      if (speakerIdArray.length === 0) return;

      // Récupérer tous les participants de l'événement
      const response = await fetch(`/api/events/${eventId}/registrations`);
      if (!response.ok) throw new Error("Erreur lors de la récupération des participants");
      const data = await response.json();

      // Filtrer les participants pour ne garder que les intervenants
      const participantList = data.registrations || [];
      const speakersList = participantList.filter((participant: Participant) => 
        speakerIdArray.includes(participant.id)
      );

      setSpeakers(speakersList);
    } catch (error) {
      console.error("Erreur lors de la récupération des intervenants:", error);
    }
  };

  const handleDeleteSession = async () => {
    if (!eventId || !sessionId) return;

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la session");
      }

      toast.success("Session supprimée avec succès");
      // Rediriger vers la liste des sessions
      router.push(`/dashboard/events/${eventId}/sessions`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE d MMMM yyyy", { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return dateString;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EventSidebar eventId={eventId} />
      
      <main className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header with back button and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center mb-1">
                <Link 
                  href={`/dashboard/events/${eventId}/sessions`}
                  className="inline-flex items-center mr-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-1" />
                  Retour au programme
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Détails de la session</h1>
              <p className="mt-1 text-sm text-gray-500">
                {eventName}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <Link href={`/dashboard/events/${eventId}/sessions/edit/${sessionId}`}>
                <Button className="bg-[#81B441] hover:bg-[#72a139]">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
              <p className="ml-3 text-gray-500">Chargement des détails...</p>
            </div>
          ) : !session ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Session non trouvée</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cette session n&apos;existe pas ou a été supprimée.
                </p>
                <div className="mt-4">
                  <Link href={`/dashboard/events/${eventId}/sessions`}>
                    <Button variant="outline">Retour aux sessions</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Grand bloc central avec toutes les informations */}
              <div className="flex flex-col bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden">
                {/* Section d'en-tête avec les informations principales */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Bannière de la session (format rectangulaire 400x200) */}
                    <div className="w-full md:w-[400px] h-[200px] rounded-md overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                      {session.banner ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img src={session.banner} alt={session.title} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-white text-gray-800">
                          <span className="text-xl font-medium">TIF</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Informations de la session à droite */}
                    <div className="flex-1">
                      <div className="mb-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {session.format || "physical"}
                        </span>
                        {session.capacity && (
                          <span className="text-xs ml-2 text-gray-600">
                            {session.capacity} places
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {session.title}
                      </h2>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {formatDate(session.start_date)}
                        </div>
                        
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {session.start_time} - {session.end_time}
                        </div>
                        
                        {session.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {session.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Onglets de navigation */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button 
                      className={`px-6 py-3 ${activeTab === "details" ? "text-[#81B441] border-b-2 border-[#81B441] font-medium" : "text-gray-500 hover:text-gray-700"}`}
                      onClick={() => setActiveTab("details")}
                    >
                      Détails
                    </button>
                    <button 
                      className={`px-6 py-3 ${activeTab === "intervenants" ? "text-[#81B441] border-b-2 border-[#81B441] font-medium" : "text-gray-500 hover:text-gray-700"}`}
                      onClick={() => setActiveTab("intervenants")}
                    >
                      Intervenants
                    </button>
                    <button 
                      className={`px-6 py-3 ${activeTab === "documents" ? "text-[#81B441] border-b-2 border-[#81B441] font-medium" : "text-gray-500 hover:text-gray-700"}`}
                      onClick={() => setActiveTab("documents")}
                    >
                      Documents & Liens
                    </button>
                    <button 
                      className={`px-6 py-3 ${activeTab === "preferences" ? "text-[#81B441] border-b-2 border-[#81B441] font-medium" : "text-gray-500 hover:text-gray-700"}`}
                      onClick={() => setActiveTab("preferences")}
                    >
                      Préférences
                    </button>
                  </div>
                </div>
                
                {/* Contenu de l'onglet */}
                <div className="p-6">
                  {activeTab === "details" && (
                    <>
                      <h3 className="text-lg font-medium mb-4">Description</h3>
                      <div className="prose max-w-none text-gray-700">
                        {session.description ? (
                          <p>{session.description}</p>
                        ) : (
                          <p className="text-gray-500 italic">Mot de bienvenue, petit déjeuner</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {activeTab === "intervenants" && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Intervenants</h3>
                        <div className="text-sm text-gray-500">
                          Modifiables depuis le formulaire de session
                        </div>
                      </div>
                      {session.speaker && speakers.length > 0 ? (
                        <div className="space-y-3">
                          {speakers.map((speaker) => (
                            <div key={speaker.id} className="border rounded-lg p-4">
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-4">
                                  <span className="text-gray-600 text-lg font-medium">
                                    {speaker.firstName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {`${speaker.firstName} ${speaker.lastName}`}
                                  </h4>
                                  <p className="text-sm text-gray-500">{speaker.email}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border rounded-lg">
                          <p className="text-gray-500">Aucun intervenant défini pour cette session</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Vous pouvez ajouter des intervenants en modifiant la session
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === "documents" && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Documents & Liens</h3>
                        <button className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Ajouter
                        </button>
                      </div>
                      <div className="text-center py-10 border rounded-lg">
                        <p className="text-gray-500">Aucun document disponible</p>
                      </div>
                    </>
                  )}
                  
                  {activeTab === "preferences" && (
                    <>
                      <h3 className="text-lg font-medium mb-4">Préférences</h3>
                      <p className="text-gray-500">Options avancées pour cette session</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Bouton de suppression */}
              <Button 
                variant="destructive"
                onClick={handleDeleteSession}
                className="w-full sm:w-auto"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Supprimer cette session
              </Button>
            </>
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