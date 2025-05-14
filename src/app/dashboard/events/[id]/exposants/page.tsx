"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventSidebar } from "@/components/dashboard/EventSidebar";

export default function ExposantsRedirect({ params }: { params: { id: string } }) {
  const router = useRouter();
  const eventId = params.id;

  useEffect(() => {
    // Rediriger vers la page des sponsors
    router.replace(`/dashboard/events/${eventId}/sponsors`);
  }, [eventId, router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EventSidebar eventId={eventId} />
      
      <div className="flex-1 ml-0 md:ml-64 transition-all duration-300 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-600">Redirection vers la page des sponsors...</p>
        </div>
      </div>
    </div>
  );
} 