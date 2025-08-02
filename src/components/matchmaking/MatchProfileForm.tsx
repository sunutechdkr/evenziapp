"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

interface MatchProfileFormProps {
  eventId: string;
  onProfileUpdated?: () => void;
}

const SUGGESTED_INTERESTS = [
  "Tech", "IA", "Blockchain", "Marketing", "Sales", "Design", "Finance", 
  "RH", "Startup", "Innovation", "Digital", "E-commerce", "Data",
  "Product", "Strategy", "Leadership", "Consulting", "Healthcare",
  "Education", "Sustainability", "Legal", "Media", "Gaming"
];

const SUGGESTED_GOALS = [
  "networking", "recrutement", "vente", "achat", "partenariat", 
  "investissement", "mentoring", "apprentissage", "collaboration",
  "innovation", "expansion", "fundraising"
];

export default function MatchProfileForm({ eventId, onProfileUpdated }: MatchProfileFormProps) {
  const [profile, setProfile] = useState({
    headline: "",
    bio: "",
    interests: [] as string[],
    goals: [] as string[]
  });
  
  const [newInterest, setNewInterest] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Charger le profil existant
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/matchmaking/profile?eventId=${eventId}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setProfile({
              headline: data.headline || "",
              bio: data.bio || "",
              interests: data.interests || [],
              goals: data.goals || []
            });
          }
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [eventId]);

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !profile.interests.includes(trimmed)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, trimmed]
      }));
    }
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addGoal = (goal: string) => {
    const trimmed = goal.trim();
    if (trimmed && !profile.goals.includes(trimmed)) {
      setProfile(prev => ({
        ...prev,
        goals: [...prev.goals, trimmed]
      }));
    }
    setNewGoal("");
  };

  const removeGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/matchmaking/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventId,
          ...profile
        })
      });

      if (response.ok) {
        toast.success("Profil de matchmaking mis à jour !");
        onProfileUpdated?.();
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la sauvegarde du profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#81B441] border-r-transparent"></div>
            <span className="ml-2">Chargement du profil...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          🎯 Profil de Matchmaking
        </CardTitle>
        <p className="text-sm text-gray-600">
          Complétez votre profil pour recevoir des suggestions de participants à rencontrer
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headline */}
          <div>
            <Label htmlFor="headline">Titre professionnel</Label>
            <Input
              id="headline"
              value={profile.headline}
              onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
              placeholder="ex: CEO chez TechCorp, Expert en IA"
              className="mt-1"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Description</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Décrivez votre activité, vos projets, ce qui vous passionne..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Intérêts */}
          <div>
            <Label>Centres d'intérêt / Domaines d'expertise</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Ajouter un intérêt"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest(newInterest))}
                />
                <Button 
                  type="button" 
                  onClick={() => addInterest(newInterest)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Suggestions */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Suggestions :</p>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_INTERESTS.filter(i => !profile.interests.includes(i)).map(interest => (
                    <Badge 
                      key={interest} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => addInterest(interest)}
                    >
                      + {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Intérêts sélectionnés */}
              {profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map(interest => (
                    <Badge key={interest} className="bg-[#81B441] hover:bg-[#72a139]">
                      {interest}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Objectifs */}
          <div>
            <Label>Objectifs pour cet événement</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Ajouter un objectif"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal(newGoal))}
                />
                <Button 
                  type="button" 
                  onClick={() => addGoal(newGoal)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Suggestions */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Suggestions :</p>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_GOALS.filter(g => !profile.goals.includes(g)).map(goal => (
                    <Badge 
                      key={goal} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => addGoal(goal)}
                    >
                      + {goal}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Objectifs sélectionnés */}
              {profile.goals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map(goal => (
                    <Badge key={goal} className="bg-blue-500 hover:bg-blue-600">
                      {goal}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeGoal(goal)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Sauvegarde..." : "Sauvegarder le profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 