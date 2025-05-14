"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";

type EventProps = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string;
  slug: string;
  banner: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export function EventCard({ event }: { event: EventProps }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {event.banner && (
        <div className="w-full h-40 relative">
          <Image
            src={event.banner}
            alt={`Bannière de ${event.name}`}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {event.name}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description || "Aucune description disponible"}
        </p>
        
        <div className="flex items-center text-gray-500 mb-2">
          <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
          <span>{format(event.startDate, "EEEE dd MMMM yyyy", { locale: fr })}</span>
        </div>
        
        <div className="flex items-center text-gray-500">
          <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
          <span>{event.location}</span>
        </div>
        
        <div className="mt-5 sm:mt-6">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-[#81B441] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#71a137] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441] sm:text-sm"
          >
            Gérer l&apos;événement
          </Link>
        </div>
      </div>
    </div>
  );
} 