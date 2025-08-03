"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, ChevronRight, ChevronLeft, Users, Target, Clock, User, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

interface MatchmakingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  eventSector?: string;
}

interface WizardProfile {
  headline: string;
  bio: string;
  jobTitle: string;
  company: string;
  interests: string[];
  goals: string[];
  availability: string[];
}

// Suggestions d'intérêts par secteur
const INTERESTS_BY_SECTOR: Record<string, string[]> = {
  tech: ["IA", "Blockchain", "Cloud", "Cybersécurité", "IoT", "Data Science", "DevOps", "Mobile", "Web3", "Fintech"],
  finance: ["Banque", "Assurance", "Investissement", "Crypto", "Fintech", "Trading", "Risk Management", "Compliance"],
  sante: ["Santé digitale", "Télémédecine", "Biotechnologie", "Dispositifs médicaux", "e-santé", "Pharmaceutique"],
  education: ["EdTech", "Formation", "E-learning", "Université", "Innovation pédagogique", "Digital learning"],
  agriculture: ["AgTech", "Développement durable", "Innovation agricole", "Biotechnologie", "Écologie"],
  default: ["Innovation", "Digital", "Startup", "Entrepreneuriat", "Business", "Marketing", "Vente", "Partenariat"]
};

const GOAL_SUGGESTIONS = [
  "Networking", "Recrutement", "Vente", "Achat", "Partenariat", 
  "Investissement", "Mentoring", "Apprentissage", "Collaboration",
  "Innovation", "Expansion", "Fundraising", "Conseil", "Formation"
];

// Créneaux horaires prédéfinis (à adapter selon l'événement)
const TIME_SLOTS = [
  "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", 
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00",
  "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"
];

export default function MatchmakingWizard({ 
  isOpen, 
  onClose, 
  eventId, 
  eventName, 
  eventSector = "default" 
}: MatchmakingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<WizardProfile>({
    headline: "",
    bio: "",
    jobTitle: "",
    company: "",
    interests: [],
    goals: [],
    availability: []
  });
  
  const [newInterest, setNewInterest] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger le profil existant au montage
  useEffect(() => {
    if (isOpen) {
      fetchExistingProfile();
    }
  }, [isOpen]);

  const fetchExistingProfile = async () => {
    try {
      const response = await fetch(`/api/matchmaking/profile?eventId=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile({
            headline: data.headline || "",
            bio: data.bio || "",
            jobTitle: data.jobTitle || "",
            company: data.company || "",
            interests: data.interests || [],
            goals: data.goals || [],
            availability: data.availability || []
          });
        }
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const getSuggestedInterests = () => {
    return INTERESTS_BY_SECTOR[eventSector.toLowerCase()] || INTERESTS_BY_SECTOR.default;
  };

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

  const toggleAvailability = (timeSlot: string) => {
    setProfile(prev => ({
      ...prev,
      availability: prev.availability.includes(timeSlot)
        ? prev.availability.filter(slot => slot !== timeSlot)
        : [...prev.availability, timeSlot]
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/matchmaking/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, ...profile })
      });

      if (response.ok) {
        toast.success("Profil de matchmaking configuré avec succès!");
        onClose();
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la sauvegarde du profil");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#81B441] to-[#9BC53D] rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Bienvenue dans le Matchmaking Intelligent</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Découvrez et rencontrez les participants qui correspondent à vos intérêts et objectifs 
                pour <span className="font-semibold text-[#81B441]">{eventName}</span>.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Comment ça marche ?</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Complétez votre profil en 4 étapes simples</li>
                <li>• Recevez des suggestions de participants compatibles</li>
                <li>• Planifiez vos rendez-vous directement via la plateforme</li>
                <li>• Maximisez vos opportunités de networking</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 mx-auto text-[#81B441]" />
              <h3 className="text-xl font-semibold">Intérêts & Objectifs</h3>
              <p className="text-gray-600">Définissez vos centres d'intérêt et objectifs pour cet événement</p>
            </div>

            {/* Intérêts */}
            <div>
              <Label className="text-sm font-medium">Centres d'intérêt</Label>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {getSuggestedInterests().map((interest) => (
                    <Button
                      key={interest}
                      type="button"
                      variant={profile.interests.includes(interest) ? "default" : "outline"}
                      size="sm"
                      onClick={() => profile.interests.includes(interest) ? removeInterest(interest) : addInterest(interest)}
                      className="h-8"
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Ajouter un intérêt personnalisé"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest(newInterest)}
                  />
                  <Button type="button" onClick={() => addInterest(newInterest)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="gap-1">
                        {interest}
                        <button onClick={() => removeInterest(interest)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Objectifs */}
            <div>
              <Label className="text-sm font-medium">Objectifs pour cet événement</Label>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {GOAL_SUGGESTIONS.map((goal) => (
                    <Button
                      key={goal}
                      type="button"
                      variant={profile.goals.includes(goal) ? "default" : "outline"}
                      size="sm"
                      onClick={() => profile.goals.includes(goal) ? removeGoal(goal) : addGoal(goal)}
                      className="h-8"
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Ajouter un objectif personnalisé"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addGoal(newGoal)}
                  />
                  <Button type="button" onClick={() => addGoal(newGoal)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {profile.goals.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {profile.goals.map((goal) => (
                      <Badge key={goal} variant="secondary" className="gap-1">
                        {goal}
                        <button onClick={() => removeGoal(goal)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 mx-auto text-[#81B441]" />
              <h3 className="text-xl font-semibold">Disponibilités</h3>
              <p className="text-gray-600">Sélectionnez vos créneaux de disponibilité pour le networking</p>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Créneaux disponibles</Label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map((timeSlot) => (
                  <div key={timeSlot} className="flex items-center space-x-2">
                    <Checkbox
                      id={timeSlot}
                      checked={profile.availability.includes(timeSlot)}
                      onCheckedChange={() => toggleAvailability(timeSlot)}
                    />
                    <label htmlFor={timeSlot} className="text-sm cursor-pointer">
                      {timeSlot}
                    </label>
                  </div>
                ))}
              </div>
              
              {profile.availability.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    {profile.availability.length} créneau{profile.availability.length > 1 ? 'x' : ''} sélectionné{profile.availability.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="h-8 w-8 mx-auto text-[#81B441]" />
              <h3 className="text-xl font-semibold">Informations Professionnelles</h3>
              <p className="text-gray-600">Complétez votre profil professionnel</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Poste / Fonction</Label>
                <Input
                  id="jobTitle"
                  value={profile.jobTitle}
                  onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="ex: Directeur Marketing, Développeur Full-Stack..."
                />
              </div>

              <div>
                <Label htmlFor="company">Entreprise / Organisation</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="ex: TechCorp, Startup Innovation..."
                />
              </div>

              <div>
                <Label htmlFor="headline">Titre professionnel</Label>
                <Input
                  id="headline"
                  value={profile.headline}
                  onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="ex: Expert en IA chez TechCorp"
                />
              </div>

              <div>
                <Label htmlFor="bio">Description</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Décrivez votre activité, vos projets, ce qui vous passionne..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
              <h3 className="text-xl font-semibold">Récapitulatif</h3>
              <p className="text-gray-600">Vérifiez vos informations avant de valider</p>
            </div>

            <div className="space-y-4">
              {/* Informations professionnelles */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {profile.jobTitle && <p><span className="font-medium">Poste:</span> {profile.jobTitle}</p>}
                  {profile.company && <p><span className="font-medium">Entreprise:</span> {profile.company}</p>}
                  {profile.headline && <p><span className="font-medium">Titre:</span> {profile.headline}</p>}
                  {profile.bio && <p><span className="font-medium">Description:</span> {profile.bio}</p>}
                </CardContent>
              </Card>

              {/* Intérêts */}
              {profile.interests.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Centres d'intérêt ({profile.interests.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Objectifs */}
              {profile.goals.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Objectifs ({profile.goals.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {profile.goals.map((goal) => (
                        <Badge key={goal} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disponibilités */}
              {profile.availability.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Disponibilités ({profile.availability.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-600">
                      {profile.availability.join(", ")}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#81B441]" />
            Configuration du Matchmaking
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-[#81B441] text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {step}
              </div>
              {step < 5 && (
                <div className={`
                  w-12 h-1 mx-2
                  ${currentStep > step ? 'bg-[#81B441]' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#81B441] hover:bg-[#71A431]"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-[#81B441] hover:bg-[#71A431]"
            >
              {loading ? "Sauvegarde..." : "Valider le profil"}
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 