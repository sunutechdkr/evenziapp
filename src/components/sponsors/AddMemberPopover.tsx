'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlusIcon } from '@heroicons/react/24/outline';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  company?: string;
  type: string;
}

interface AddMemberPopoverProps {
  sponsorId: string;
  eventId: string;
  onMemberAdded: () => void;
}

export function AddMemberPopover({ sponsorId, eventId, onMemberAdded }: AddMemberPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchParticipants = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setParticipants([]);
      return;
    }

    setLoading(true);
    try {
      const url = `/api/events/${eventId}/participants?search=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Limiter à 25 résultats pour les performances
        setParticipants(data.slice(0, 25));
      } else {
        console.error('Erreur lors du chargement des participants');
        setParticipants([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Effect pour la recherche avec debounce
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        fetchParticipants(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setParticipants([]);
    }
  }, [searchQuery, fetchParticipants]);

  const addMember = async (participantId: string) => {
    try {
      const response = await fetch(`/api/events/sponsors/${sponsorId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId }),
      });

      if (response.ok) {
        // Notifier le parent que le membre a été ajouté
        onMemberAdded();
        // Réinitialiser et fermer
        resetAndClose();
      } else {
        console.error('Erreur lors de l\'ajout du membre');
        alert('Erreur lors de l\'ajout du membre. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      alert('Erreur lors de l\'ajout du membre. Veuillez réessayer.');
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setSearchQuery('');
    setParticipants([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-[min(640px,90vw)] p-0 max-h-72 overflow-hidden z-[60]"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          resetAndClose();
        }}
      >
        <div className="flex flex-col">
          {/* Header avec input de recherche */}
          <div className="p-3 border-b">
            <Input
              placeholder="Chercher un participant (nom, email, entreprise)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          {/* Zone de résultats avec scroll */}
          <ScrollArea className="max-h-64">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-r-transparent"></div>
                <span className="ml-2">Recherche en cours...</span>
              </div>
            ) : searchQuery.trim() ? (
              participants.length > 0 ? (
                <div className="divide-y">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addMember(participant.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                          {participant.firstName?.[0]?.toUpperCase()}{participant.lastName?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">
                            {participant.firstName} {participant.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {participant.jobTitle && (
                              <span className="mr-2">{participant.jobTitle}</span>
                            )}
                            {participant.company && (
                              <span className="mr-2">• {participant.company}</span>
                            )}
                            <span>{participant.email}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="secondary" className="flex-shrink-0">
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  Aucun participant trouvé pour &quot;{searchQuery}&quot;
                </div>
              )
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Tapez pour rechercher des participants...
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
