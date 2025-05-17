"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";

export default function EventDetailsPage() {
  const [event, setEvent] = useState(null);
  const params = useParams();
  const eventId = useMemo(() => {
    return Array.isArray(params.id) ? params.id[0] : params.id || '';
  }, [params.id]);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'événement:", error);
      }
    };
    
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard/events" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span>Retour aux événements</span>
            </Link>
            <h1 className="ml-4 text-xl font-bold text-gray-900">
              {event?.name || "Chargement..."}
            </h1>
          </div>
          <div>
            <Link 
              href={`/dashboard/events/${eventId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Modifier
            </Link>
          </div>
        </div>
      </header>
      <main className="p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
          <p className="text-center text-gray-700">
            {event ? "Détails de l'événement chargés avec succès." : "Chargement des détails de l'événement..."}
          </p>
        </div>
      </main>
    </div>
  );
}