"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface Suggestion {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  profile: {
    headline?: string;
    bio?: string;
    interests: string[];
    goals: string[];
  };
  score: number;
  reason: string;
  createdAt: string;
}

interface MatchSuggestionsProps {
  eventId: string;
  onRequestMeeting?: (userId: string, userName: string) => void;
}

export default function MatchSuggestions({ eventId, onRequestMeeting }: MatchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/matchmaking/suggest?eventId=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        console.error("Erreur lors de la récupération des suggestions");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/matchmaking/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        toast.success(`${data.suggestions?.length || 0} nouvelles suggestions générées !`);
      } else {
        const error = await response.json();
        if (error.message) {
          toast.error(error.message);
        } else {
          throw new Error("Erreur lors de la génération");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la génération des suggestions");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [eventId]);

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) {
      return (
        <Badge className="bg-[#81B441] text-white border-none">
          <Sparkles className="h-3 w-3 mr-1" />
          Match fort
        </Badge>
      );
    } else if (score >= 0.5) {
      return (
        <Badge className="bg-[#81B441]/70 text-white border-none">
          Match moyen
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-[#81B441] text-[#81B441]">
          Match faible
        </Badge>
      );
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#81B441] border-r-transparent"></div>
            <span className="ml-2">Chargement des suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Découper en suggestions primaires (4) et secondaires (jusqu'à 6)
  const primary = suggestions.slice(0, 4);
  const secondary = suggestions.slice(4, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              🔍 Suggestions de participants à rencontrer
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Basées sur vos intérêts et objectifs
            </p>
          </div>
          <Button 
            onClick={generateSuggestions}
            disabled={generating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? "Génération..." : "Actualiser"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune suggestion disponible
            </h3>
            <p className="text-gray-500 mb-4">
              Complétez votre profil de matchmaking pour recevoir des suggestions personnalisées
            </p>
            <Button onClick={generateSuggestions} disabled={generating}>
              <Sparkles className="h-4 w-4 mr-2" />
              Générer des suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cartes principales (4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {primary.map((s) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-end">{getScoreBadge(s.score)}</div>
                  <div className="flex flex-col items-center mt-2">
                    <Avatar className="h-20 w-20 ring-2 ring-[#81B441] ring-offset-2 mb-3">
                      <AvatarImage src={s.user.image} />
                      <AvatarFallback className="bg-[#81B441] text-white">
                        {getInitials(s.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-gray-900">{s.user.name}</h4>
                    {s.profile.headline && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{s.profile.headline}</p>
                    )}
                    <Button 
                      onClick={() => onRequestMeeting?.(s.user.id, s.user.name)}
                      className="mt-4 w-full bg-[#81B441] text-white border-none"
                    >
                      Rencontrer
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Liste secondaire */}
            {secondary.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Vous pouvez aussi rencontrer</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {secondary.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 ring-2 ring-[#81B441] ring-offset-2">
                          <AvatarImage src={s.user.image} />
                          <AvatarFallback className="bg-[#81B441] text-white">
                            {getInitials(s.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{s.user.name}</div>
                          <div className="text-xs text-gray-600 truncate">{s.profile.headline || ''}</div>
                          <div className="mt-1">{getScoreBadge(s.score)}</div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost"
                        onClick={() => onRequestMeeting?.(s.user.id, s.user.name)}
                        className="shrink-0 text-[#81B441] hover:bg-[#81B441]/10"
                        aria-label="Demander un RDV"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 