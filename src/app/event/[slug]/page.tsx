import { RegistrationForm } from "@/components/events/RegistrationForm";
import { prisma } from '@/lib/prisma';
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { notFound } from "next/navigation";



type EventPageProps = {
  params: {
    slug: string;
  };
};

async function getEvent(slug: string) {
  try {
    const event = await prisma.event.findUnique({
      where: {
        slug,
      },
    });
    
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.slug);
  
  if (!event) {
    notFound();
  }
  
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">
          {event.name}
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:gap-8 mt-4 text-gray-500">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>
              {format(new Date(event.startDate), "MMMM d, yyyy")}
              {event.startTime && ` at ${event.startTime}`}
            </span>
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>{event.location}</span>
          </div>
        </div>
        
        {event.description && (
          <div className="mt-4 prose max-w-none">
            <p>{event.description}</p>
          </div>
        )}
      </div>
      
      <div className="my-8 border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register for this event</h2>
        <RegistrationForm eventId={event.id} eventSlug={event.slug} />
      </div>
    </div>
  );
} 