"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { format, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { TrashIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";

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
};

interface EventTableProps {
  searchQuery: string;
  statusFilter: string;
}

/**
 * Composant de tableau des événements
 * 
 * Affiche la liste des événements avec options de filtrage et d'actions en masse
 */
export function EventTable({ searchQuery, statusFilter }: EventTableProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  /**
   * Charge les événements depuis l'API
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  /**
   * Filtre les événements en fonction de la recherche et du statut
   */
  useEffect(() => {
    let filtered = events;
    
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
  }, [events, searchQuery, statusFilter]);
  
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
   * Supprime les événements sélectionnés
   */
  const handleDeleteSelected = () => {
    setEvents(prev => prev.filter(event => !selectedEvents.includes(event.id)));
    setSelectedEvents([]);
  };
  
  /**
   * Archive les événements sélectionnés (simulation)
   */
  const handleArchiveSelected = () => {
    // Simuler l'archivage (dans une vraie application, on modifierait le statut)
    alert(`${selectedEvents.length} événement(s) archivé(s)`);
    setSelectedEvents([]);
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
  
  return (
    <div className="event-table-container">
      {/* Barre d'actions en masse */}
      {showBulkActions && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedEvents.length} élément(s) sélectionné(s)</span>
          <div className="bulk-actions">
            <button 
              onClick={handleArchiveSelected}
              className="bulk-action-btn"
              title="Archiver"
            >
              <ArchiveBoxIcon className="w-5 h-5" />
              <span>Archiver</span>
            </button>
            <button 
              onClick={handleDeleteSelected}
              className="bulk-action-btn bulk-action-delete"
              title="Supprimer"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Tableau des événements */}
      <table className="event-table">
        <thead>
          <tr>
            <th className="event-table-header w-12">
              <input
                type="checkbox"
                className="checkbox"
                checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                onChange={handleSelectAllChange}
              />
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
                <p className="text-gray-500">Aucun événement ne correspond à vos critères de recherche.</p>
              </td>
            </tr>
          ) : (
            filteredEvents.map((event) => (
              <tr key={event.id} className={`event-table-row ${selectedEvents.includes(event.id) ? 'selected-row' : ''}`}>
                <td className="event-table-cell">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={() => handleSelectEvent(event.id)}
                  />
                </td>
                <td className="event-table-cell">
                  <Link href={`/dashboard/events/${event.id}`} className="hover:text-[#81B441] transition-colors">
                    <div className="event-name">{event.name}</div>
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
                    <button
                      onClick={() => handleSelectEvent(event.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
                    >
                      {selectedEvents.includes(event.id) ? 'Désélectionner' : 'Sélectionner'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 