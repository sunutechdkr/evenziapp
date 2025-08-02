import { toast } from "react-hot-toast";

export interface UserMatchProfile {
  id: string;
  userId: string;
  eventId: string;
  headline?: string;
  bio?: string;
  interests: string[];
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchSuggestion {
  id: string;
  userId: string;
  suggestedId: string;
  eventId: string;
  score: number;
  reason: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  profile: UserMatchProfile;
}

export interface MatchmakingFilters {
  sector?: string;
  goals?: string[];
  company?: string;
  minScore?: number;
}

export class MatchmakingService {
  /**
   * Récupère le profil de matchmaking de l'utilisateur pour un événement
   */
  static async getUserProfile(eventId: string): Promise<UserMatchProfile | null> {
    try {
      const response = await fetch(`/api/matchmaking/profile?eventId=${eventId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return null;
    }
  }

  /**
   * Met à jour le profil de matchmaking
   */
  static async updateProfile(eventId: string, profile: Partial<UserMatchProfile>): Promise<boolean> {
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
        toast.success("Profil mis à jour avec succès !");
        return true;
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la mise à jour");
        return false;
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour du profil");
      return false;
    }
  }

  /**
   * Génère de nouvelles suggestions de matchmaking
   */
  static async generateSuggestions(eventId: string): Promise<MatchSuggestion[]> {
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
        toast.success(`${data.suggestions?.length || 0} nouvelles suggestions générées !`);
        return data.suggestions || [];
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la génération");
        return [];
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la génération des suggestions");
      return [];
    }
  }

  /**
   * Récupère les suggestions existantes
   */
  static async getSuggestions(eventId: string): Promise<MatchSuggestion[]> {
    try {
      const response = await fetch(`/api/matchmaking/suggest?eventId=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        return data.suggestions || [];
      }
      return [];
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }

  /**
   * Filtre les suggestions selon des critères
   */
  static filterSuggestions(
    suggestions: MatchSuggestion[], 
    filters: MatchmakingFilters
  ): MatchSuggestion[] {
    return suggestions.filter(suggestion => {
      // Filtre par score minimum
      if (filters.minScore && suggestion.score < filters.minScore) {
        return false;
      }

      // Filtre par objectifs
      if (filters.goals && filters.goals.length > 0) {
        const hasCommonGoals = suggestion.profile.goals.some(goal => 
          filters.goals!.includes(goal)
        );
        if (!hasCommonGoals) return false;
      }

      return true;
    });
  }

  /**
   * Obtient le badge de score approprié
   */
  static getScoreLevel(score: number): {
    level: 'high' | 'medium' | 'low';
    label: string;
    color: string;
  } {
    if (score >= 0.8) {
      return {
        level: 'high',
        label: 'Match fort',
        color: 'bg-green-500'
      };
    } else if (score >= 0.5) {
      return {
        level: 'medium',
        label: 'Match moyen',
        color: 'bg-blue-500'
      };
    } else {
      return {
        level: 'low',
        label: 'Match faible',
        color: 'bg-gray-400'
      };
    }
  }

  /**
   * Formate la raison du match pour l'affichage
   */
  static formatMatchReason(reason: string): string {
    if (!reason) return '';
    
    // Capitalise la première lettre
    return reason.charAt(0).toUpperCase() + reason.slice(1);
  }

  /**
   * Calcule les statistiques des suggestions
   */
  static getStats(suggestions: MatchSuggestion[]): {
    total: number;
    highMatches: number;
    mediumMatches: number;
    lowMatches: number;
    avgScore: number;
  } {
    const total = suggestions.length;
    const highMatches = suggestions.filter(s => s.score >= 0.8).length;
    const mediumMatches = suggestions.filter(s => s.score >= 0.5 && s.score < 0.8).length;
    const lowMatches = suggestions.filter(s => s.score < 0.5).length;
    const avgScore = total > 0 
      ? suggestions.reduce((sum, s) => sum + s.score, 0) / total 
      : 0;

    return {
      total,
      highMatches,
      mediumMatches,
      lowMatches,
      avgScore: Math.round(avgScore * 100) / 100
    };
  }
} 