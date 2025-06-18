"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { format, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { TrashIcon, ArchiveBoxIcon, ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// Type d'événement utilisé dans le tableau
export type Event = {
  id: string;
  name: string;
  slug: string;
  date?: string; // Legacy field, kept for compatibility
  startDate?: string | Date;
  endDate?: string | Date;
  start_date?: string | Date; // Added for database snake_case compatibility
  end_date?: string | Date; // Added for database snake_case compatibility
  location: string;
  sector?: string | null;
  type?: string | null;
  format?: string | null;
  registrations?: number;
  banner?: string | null;
  archived?: boolean;
  archivedAt?: string | Date | null;
  userId?: string;
};

interface EventTableProps {
  searchQuery: string;
  statusFilter: string;
}

// Type pour les modales de confirmation
type ConfirmationModal = {
  isOpen: boolean;
  action: 'archive' | 'unarchive' | 'delete' | null;
  events: Event[];
  eventIds: string[];
};

/**
 * Composant de tableau des événements
 * 
 * Affiche la liste des événements avec options de filtrage et d'actions en masse
 */
export function EventTable({ searchQuery, statusFilter }: EventTableProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    action: null,
    events: [],
    eventIds: []
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Vérifier si l'utilisateur a les permissions pour les actions d'archivage/suppression
  const canPerformActions = session?.user?.role === "ADMIN" || session?.user?.role === "ORGANIZER";
  
  /**
   * Charge les événements depuis l'API
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = `/api/events?includeArchived=true`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
        toast.error("Erreur lors du chargement des événements");
      }
    };
    
    fetchEvents();
  }, []);
  
  /**
   * Filtre les événements en fonction de la recherche et du statut
   */
  useEffect(() => {
    let filtered = events;
    
    // Filtrer par statut d'archivage
    if (showArchived) {
      filtered = filtered.filter(event => event.archived);
    } else {
      filtered = filtered.filter(event => !event.archived);
    }
    
    // Appliquer le filtre de recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(query) || 
        event.location.toLowerCase().includes(query) ||
        event.slug.toLowerCase().includes(query)
      );
    }
    
    // Appliquer le filtre de statut
    if (statusFilter) {
      filtered = filtered.filter(event => {
        const startDateValue = event.startDate || event.start_date;
        if (!startDateValue) return true; // Si pas de date, on garde l'événement dans tous les cas
        
        try {
          const eventDate = new Date(startDateValue);
          const isEventPast = isPast(eventDate) && !isToday(eventDate);
          const isEventToday = isToday(eventDate);
        
        switch(statusFilter) {
          case 'upcoming':
            return !isEventPast && !isEventToday;
          case 'ongoing':
            return isEventToday;
          case 'past':
            return isEventPast;
          default:
              return true;
          }
        } catch {
          // En cas d'erreur de parsing de date, conserver l'événement
            return true;
        }
      });
    }
    
    setFilteredEvents(filtered);
  }, [events, searchQuery, statusFilter, showArchived]);
  
  /**
   * Gère la sélection/désélection de tous les événements
   */
  useEffect(() => {
    if (selectAll) {
      setSelectedEvents(filteredEvents.map(event => event.id));
    } else if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    }
  }, [selectAll, filteredEvents]);
  
  /**
   * Affiche la barre d'actions en masse si des événements sont sélectionnés
   */
  useEffect(() => {
    setShowBulkActions(selectedEvents.length > 0);
  }, [selectedEvents]);
  
  /**
   * Gère la sélection ou désélection d'un événement
   */
  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };
  
  /**
   * Gère la sélection ou désélection de tous les événements
   */
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
  };

  /**
   * Ouvre la modale de confirmation pour une action
   */
  const openConfirmationModal = (action: 'archive' | 'unarchive' | 'delete') => {
    const selectedEventObjs = events.filter(event => selectedEvents.includes(event.id));
    setConfirmationModal({
      isOpen: true,
      action,
      events: selectedEventObjs,
      eventIds: selectedEvents
    });
  };

  /**
   * Ferme la modale de confirmation
   */
  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      action: null,
      events: [],
      eventIds: []
    });
  };

  /**
   * Exécute l'action confirmée
   */
  const performBulkAction = async () => {
    if (!confirmationModal.action || confirmationModal.eventIds.length === 0) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/events/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: confirmationModal.action,
          eventIds: confirmationModal.eventIds
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Gestion spéciale pour les erreurs de suppression avec inscriptions
        if (confirmationModal.action === 'delete' && result.eventsWithRegistrations) {
          const hasDeleteableEvents = result.deletableEvents && result.deletableEvents.length > 0;
          
          let errorMessage = result.error + '\n\nÉvénements avec inscriptions :\n' +
            result.eventsWithRegistrations.map((e: any) => `• ${e.name} (${e.registrations} inscription(s))`).join('\n');

          if (hasDeleteableEvents) {
            errorMessage += '\n\nÉvénements supprimables :\n' +
              result.deletableEvents.map((e: any) => `• ${e.name}`).join('\n') + '\n\n' +
              'Voulez-vous supprimer uniquement les événements sans inscriptions ?';

            const confirmPartial = window.confirm(errorMessage);

            if (confirmPartial) {
              // Effectuer la suppression sécurisée
              const safeResponse = await fetch('/api/events/bulk-actions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'delete-safe',
                  eventIds: confirmationModal.eventIds
                }),
              });

              const safeResult = await safeResponse.json();
              
              if (safeResponse.ok) {
                // Actualiser la liste des événements
                const url = `/api/events?includeArchived=true`;
                const eventsResponse = await fetch(url);
                if (eventsResponse.ok) {
                  const data = await eventsResponse.json();
                  setEvents(data);
                }

                setSelectedEvents([]);
                setSelectAll(false);
                closeConfirmationModal();
                
                toast.success(safeResult.message);
                
                if (safeResult.skippedEvents && safeResult.skippedEvents.length > 0) {
                  setTimeout(() => {
                    toast.error(
                      `Événements ignorés : ${safeResult.skippedEvents.map((e: any) => e.name).join(', ')}`,
                      { duration: 6000 }
                    );
                  }, 1000);
                }
              } else {
                throw new Error(safeResult.error || 'Erreur lors de la suppression sécurisée');
              }
              return;
            }
          } else {
            toast.error(errorMessage, { duration: 8000 });
          }
        } else {
          throw new Error(result.error || 'Une erreur est survenue');
        }
        return;
      }

      // Actualiser la liste des événements
      const url = `/api/events?includeArchived=true`;
      const eventsResponse = await fetch(url);
      if (eventsResponse.ok) {
        const data = await eventsResponse.json();
        setEvents(data);
      }

      // Réinitialiser les sélections
      setSelectedEvents([]);
      setSelectAll(false);
      
      // Fermer la modale
      closeConfirmationModal();
      
      // Afficher le message de succès
      toast.success(result.message);

    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format date for display
  const formatEventDate = (dateString?: string | Date): string => {
    if (!dateString) return "Date indisponible";
    
    let date;
    if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else {
      date = dateString;
    }

    if (isNaN(date.getTime())) {
      return "Date invalide";
    }

    try {
      return format(date, "dd MMM yyyy", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  // Détermine quelles actions sont disponibles selon le type d'événements sélectionnés
  const getAvailableActions = () => {
    const selectedEventObjs = events.filter(event => selectedEvents.includes(event.id));
    const hasArchivedEvents = selectedEventObjs.some(event => event.archived);
    const hasActiveEvents = selectedEventObjs.some(event => !event.archived);

    return {
      canArchive: hasActiveEvents,
      canUnarchive: hasArchivedEvents,
      canDelete: selectedEventObjs.length > 0
    };
  };

  const availableActions = getAvailableActions();
  
  return (
    <div className="event-table-container">
      {/* Contrôles de filtrage */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showArchived 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showArchived ? 'Afficher les événements actifs' : 'Afficher les événements archivés'}
          </button>
          {showArchived && (
            <span className="text-sm text-gray-600">
              {filteredEvents.length} événement(s) archivé(s)
            </span>
          )}
        </div>
      </div>

      {/* Barre d'actions en masse */}
      {showBulkActions && canPerformActions && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedEvents.length} élément(s) sélectionné(s)</span>
          <div className="bulk-actions">
            {availableActions.canArchive && (
              <button 
                onClick={() => openConfirmationModal('archive')}
                className="bulk-action-btn"
                title="Archiver les événements sélectionnés"
              >
                <ArchiveBoxIcon className="w-5 h-5" />
                <span>Archiver</span>
              </button>
            )}
            {availableActions.canUnarchive && (
              <button 
                onClick={() => openConfirmationModal('unarchive')}
                className="bulk-action-btn"
                title="Désarchiver les événements sélectionnés"
              >
                <ArchiveBoxXMarkIcon className="w-5 h-5" />
                <span>Désarchiver</span>
              </button>
            )}
            {availableActions.canDelete && (
              <button 
                onClick={() => openConfirmationModal('delete')}
                className="bulk-action-btn bulk-action-delete"
                title="Supprimer les événements sélectionnés"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Supprimer</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Tableau des événements */}
      <table className="event-table">
        <thead>
          <tr>
            <th className="event-table-header w-12">
              {canPerformActions && (
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                  onChange={handleSelectAllChange}
                />
              )}
            </th>
            <th className="event-table-header w-1/4">Nom</th>
            <th className="event-table-header w-1/6">Date</th>
            <th className="event-table-header w-1/5">Lieu</th>
            <th className="event-table-header w-1/8">Type</th>
            <th className="event-table-header w-1/8">Format</th>
            <th className="event-table-header w-1/6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="event-table-cell text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81B441]"></div>
                </div>
              </td>
            </tr>
          ) : filteredEvents.length === 0 ? (
            <tr>
              <td colSpan={7} className="event-table-cell text-center py-8">
                <p className="text-gray-500">
                  {showArchived 
                    ? "Aucun événement archivé ne correspond à vos critères de recherche."
                    : "Aucun événement ne correspond à vos critères de recherche."
                  }
                </p>
              </td>
            </tr>
          ) : (
            filteredEvents.map((event) => (
              <tr key={event.id} className={`event-table-row ${selectedEvents.includes(event.id) ? 'selected-row' : ''} ${event.archived ? 'archived-row' : ''}`}>
                <td className="event-table-cell">
                  {canPerformActions && (
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => handleSelectEvent(event.id)}
                    />
                  )}
                </td>
                <td className="event-table-cell">
                  <Link href={`/dashboard/events/${event.id}`} className="hover:text-[#81B441] transition-colors">
                    <div className="event-name flex items-center gap-2">
                      {event.name}
                      {event.archived && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <ArchiveBoxIcon className="w-3 h-3 mr-1" />
                          Archivé
                        </span>
                      )}
                    </div>
                    <div className="event-slug">{event.slug}</div>
                  </Link>
                </td>
                <td className="event-table-cell">
                  <div className="event-date">
                    {formatEventDate(event.startDate || event.start_date)}
                  </div>
                </td>
                <td className="event-table-cell">{event.location}</td>
                <td className="event-table-cell">{event.type || '-'}</td>
                <td className="event-table-cell">{event.format || '-'}</td>
                <td className="event-table-cell text-right">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
                    >
                      Détails
                    </Link>
                    {canPerformActions && (
                      <button
                        onClick={() => handleSelectEvent(event.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
                      >
                        {selectedEvents.includes(event.id) ? 'Désélectionner' : 'Sélectionner'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modale de confirmation */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer l&apos;action
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmationModal.action === 'delete' && (
                <>
                  Êtes-vous sûr de vouloir <strong>supprimer définitivement</strong> {confirmationModal.events.length} événement(s) ? 
                  Cette action est irréversible.
                </>
              )}
              {confirmationModal.action === 'archive' && (
                <>
                  Êtes-vous sûr de vouloir <strong>archiver</strong> {confirmationModal.events.length} événement(s) ? 
                  Les événements archivés ne seront plus visibles par défaut.
                </>
              )}
              {confirmationModal.action === 'unarchive' && (
                <>
                  Êtes-vous sûr de vouloir <strong>désarchiver</strong> {confirmationModal.events.length} événement(s) ? 
                  Les événements redeviendront visibles et actifs.
                </>
              )}
            </p>
            
            {confirmationModal.events.length > 0 && (
              <div className="mb-6 max-h-32 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">Événements concernés :</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {confirmationModal.events.map(event => (
                    <li key={event.id} className="truncate">• {event.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmationModal}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={performBulkAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                  confirmationModal.action === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-[#81B441] hover:bg-[#6a9636]'
                }`}
              >
                {actionLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    En cours...
                  </div>
                ) : (
                  confirmationModal.action === 'delete' ? 'Supprimer' : 
                  confirmationModal.action === 'archive' ? 'Archiver' : 'Désarchiver'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 