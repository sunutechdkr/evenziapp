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
        <Badge className="bg-gradient-to-r from-[#81B441] to-[#8B5CF6] text-white border-none shadow-md">
          <Sparkles className="h-3 w-3 mr-1" />
          Match fort
        </Badge>
      );
    } else if (score >= 0.5) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none">
          Match moyen
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-gray-300">
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
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 border-2 border-transparent bg-gradient-to-r from-[#81B441]/10 via-transparent to-[#8B5CF6]/10 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-md">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gradient-to-r from-[#81B441] to-[#8B5CF6] ring-offset-2">
                    <AvatarImage src={suggestion.user.image} />
                    <AvatarFallback>
                      {getInitials(suggestion.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {suggestion.user.name}
                        </h4>
                        {suggestion.profile.headline && (
                          <p className="text-sm text-gray-600">
                            {suggestion.profile.headline}
                          </p>
                        )}
                      </div>
                      {getScoreBadge(suggestion.score)}
                    </div>

                    {suggestion.profile.bio && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {suggestion.profile.bio}
                      </p>
                    )}

                    <div className="space-y-2 mb-3">
                      {suggestion.profile.interests.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 font-medium">Intérêts : </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {suggestion.profile.interests.slice(0, 5).map((interest, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                            {suggestion.profile.interests.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{suggestion.profile.interests.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {suggestion.profile.goals.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 font-medium">Objectifs : </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {suggestion.profile.goals.slice(0, 3).map((goal, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                                {goal}
                              </Badge>
                            ))}
                            {suggestion.profile.goals.length > 3 && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                +{suggestion.profile.goals.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {suggestion.reason && (
                      <p className="text-xs text-gray-500 mb-3">
                        <strong>Raison du match :</strong> {suggestion.reason}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Score : {Math.round(suggestion.score * 100)}%
                      </span>
                      <Button 
                        size="sm"
                        onClick={() => onRequestMeeting?.(suggestion.user.id, suggestion.user.name)}
                        className="bg-gradient-to-r from-[#81B441] to-[#8B5CF6] hover:opacity-90 text-white border-none shadow-md"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Demander un RDV
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 