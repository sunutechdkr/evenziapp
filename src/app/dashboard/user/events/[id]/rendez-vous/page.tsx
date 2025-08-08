"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import UserEventSidebar from "@/components/dashboard/UserEventSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPinIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Link from "next/link";
import MatchmakingWizard from "@/components/matchmaking/MatchmakingWizard";
import AppointmentRequestForm from "@/components/appointments/AppointmentRequestForm";

// Types
type MatchSuggestion = {
  id: string;
  user: {
    id: string;
    name: string;
  email: string;
    image?: string;
  };
  profile: {
    headline?: string;
    jobTitle?: string;
  company?: string;
    goals: string[];
  };
  score: number;
};

type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  sector?: string;
  description?: string;
};

export default function UserRendezVousPage() {
  const { id } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMatchmakingWizard, setShowMatchmakingWizard] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [otherParticipants, setOtherParticipants] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // Fetch event details
  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();
      setCurrentEvent(data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  }, [id]);

  // Fetch matchmaking suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch targeted suggestions
      const suggestionsResponse = await fetch(`/api/matchmaking/suggest?eventId=${id}`);
      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        setSuggestions(suggestionsData.suggestions || []);
      }

      // Fetch other participants
      const participantsResponse = await fetch(`/api/events/${id}/participants`);
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        
        // Convert participants to match suggestion format
        const formattedParticipants: MatchSuggestion[] = participantsData.participants
          .slice(0, 6) // Limite à 6 pour la grille 3x2
          .map((participant: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            avatar?: string;
            headline?: string;
            jobTitle?: string;
            company?: string;
          }) => ({
            id: participant.id,
            user: {
              id: participant.id,
              name: `${participant.firstName} ${participant.lastName}`,
              email: participant.email,
              image: participant.avatar || undefined
            },
            profile: {
              headline: participant.headline,
              jobTitle: participant.jobTitle,
              company: participant.company,
              goals: []
            },
            score: 0.5 // Score neutre pour les autres participants
          }));
        
        setOtherParticipants(formattedParticipants);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Erreur lors du chargement des suggestions");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Generate suggestions
  const generateSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matchmaking/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id })
      });

      if (response.ok) {
        toast.success("Suggestions mises à jour !");
        fetchSuggestions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la génération des suggestions");
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Erreur lors de la génération des suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchEventDetails();
      await fetchSuggestions();
    };
    
    fetchData();

    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [id, fetchEventDetails, fetchSuggestions]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get match level badge
  const getMatchBadge = (score: number) => {
    if (score >= 0.8) {
      return <Badge className="bg-[#81B441] text-white text-xs">Match fort</Badge>;
    } else if (score >= 0.5) {
      return <Badge className="bg-[#81B441]/70 text-white text-xs">Match moyen</Badge>;
    } else {
      return <Badge className="bg-[#81B441]/40 text-white text-xs">Match faible</Badge>;
    }
  };

  return (
    <div className="dashboard-container min-h-screen overflow-hidden">
      <UserEventSidebar 
        eventId={id as string}
        activeTab="rendez-vous"
        onExpandChange={(expanded) => setSidebarExpanded(expanded)}
      />
      
      <div 
        className={`dashboard-content bg-gray-50 ${!sidebarExpanded ? 'dashboard-content-collapsed' : ''}`}
        style={{ 
          marginLeft: isMobile ? 0 : sidebarExpanded ? '16rem' : '4rem',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <main className="dashboard-main flex-1">
          {/* Header */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href={`/dashboard/user/events/${id}`}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  <span>Retour à l&apos;événement</span>
                </Link>
                <h1 className="text-xl font-bold text-gray-900">
                  Mes Rendez-vous
                </h1>
              </div>
              <div className="flex space-x-2">
                <Link href={`/dashboard/user/events/${id}/rendez-vous/horaires`}>
                  <Button variant="outline" size="sm">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Horaires
                  </Button>
                </Link>
                <Link href={`/dashboard/user/events/${id}/rendez-vous/lieux`}>
                  <Button variant="outline" size="sm">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    Lieux
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-8">
            {/* Configuration du matchmaking - EN PREMIER */}
            <div className="bg-gradient-to-r from-[#DBAEEE] to-[#94C3E9] p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                  <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Configuration du matchmaking</h2>
                  <p className="text-white/90 text-sm">
                    Configurez votre profil pour recevoir des suggestions personnalisées de participants à rencontrer
                  </p>
                </div>
                <Button 
                  onClick={() => setShowMatchmakingWizard(true)}
                  className="bg-[#81B441] text-white border-none"
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-2" />
                  Configurer mon profil
                </Button>
                </div>
              </div>
              
            {/* Suggestions de participants à rencontrer */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                      Suggestions de participants à rencontrer
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Basées sur vos intérêts et objectifs</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateSuggestions}
                    disabled={loading}
                    className="border-[#81B441] text-[#81B441] hover:bg-[#81B441] hover:text-white"
                  >
                    <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>

                {suggestions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="flex space-x-4 pb-4" style={{ minWidth: 'fit-content' }}>
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          {/* Avatar et nom */}
                          <div className="text-center mb-4">
                            <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-[#81B441] ring-offset-2">
                              <AvatarImage src={suggestion.user.image} />
                              <AvatarFallback className="bg-[#81B441] text-white">
                                {getInitials(suggestion.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <h4 className="font-semibold text-sm text-gray-900">
                              {suggestion.user.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {suggestion.profile.jobTitle || 'Fonction'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {suggestion.profile.company || 'Entreprise'}
                            </p>
                </div>

                          {/* Badge niveau match */}
                          <div className="flex justify-center mb-4">
                            {getMatchBadge(suggestion.score)}
              </div>
              
                          {/* Bouton rencontrer */}
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedUser({id: suggestion.user.id, name: suggestion.user.name});
                              setShowRequestForm(true);
                            }}
                            className="w-full bg-[#81B441] text-white border-none"
                          >
                            Rencontrer
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Aucune suggestion disponible</p>
                    <p className="text-xs text-gray-400 mt-1">Configurez votre profil pour recevoir des suggestions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vous pouvez aussi rencontrer */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Vous pouvez aussi rencontrer
                </h3>

                {otherParticipants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherParticipants.map((participant) => (
                      <div key={participant.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 ring-2 ring-[#81B441] ring-offset-2">
                            <AvatarImage src={participant.user.image} />
                            <AvatarFallback className="bg-[#81B441] text-white">
                              {getInitials(participant.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                              {participant.user.name}
                            </h4>
                            <p className="text-xs text-gray-600 truncate">
                              {participant.profile.jobTitle || 'Fonction'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {participant.profile.company || 'Entreprise'}
                    </p>
                  </div>
                          <div className="flex flex-col space-y-1">
                            {getMatchBadge(participant.score)}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser({id: participant.user.id, name: participant.user.name});
                                setShowRequestForm(true);
                              }}
                              className="text-xs px-2 py-1 h-7 border-[#81B441] text-[#81B441] hover:bg-[#81B441] hover:text-white"
                            >
                              Contacter
                            </Button>
                </div>
              </div>
            </div>
                    ))}
                    </div>
                  ) : (
                  <div className="text-center py-12 text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Aucun participant disponible</p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal de demande de rendez-vous */}
      {showRequestForm && selectedUser && (
        <AppointmentRequestForm
          isOpen={showRequestForm}
          onClose={() => {
            setShowRequestForm(false);
            setSelectedUser(null);
          }}
          recipient={{
            id: selectedUser.id,
            firstName: selectedUser.name.split(' ')[0] || '',
            lastName: selectedUser.name.split(' ').slice(1).join(' ') || '',
            email: '',
            company: '',
            jobTitle: ''
          }}
          event={currentEvent!}
          currentUserRegistrationId=""
          onSuccess={() => {
            setShowRequestForm(false);
            setSelectedUser(null);
            toast.success("Demande de rendez-vous envoyée !");
          }}
        />
      )}

      {/* Wizard de configuration du matchmaking */}
      {showMatchmakingWizard && currentEvent && (
        <MatchmakingWizard
          isOpen={showMatchmakingWizard}
          onClose={() => setShowMatchmakingWizard(false)}
          eventId={id as string}
          eventName={currentEvent.name}
          eventSector={currentEvent.sector}
          eventDescription={currentEvent.description}
        />
      )}
    </div>
  );
} 