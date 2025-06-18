import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ClientEventPage from '@/components/events/ClientEventPage';

// Type definition for event
interface Event {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  slug: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  banner?: string | null;
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  // Fetch event data from server
  const event = await prisma.event.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      slug: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      banner: true,
    },
  });

  // If event not found, show 404
  if (!event) {
    notFound();
  }

  // Serialize dates for the client component
  const serializedEvent = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
  };

  // Pass the serialized event to the client component
  return <ClientEventPage params={params} event={serializedEvent} />;
} 