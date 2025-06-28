'use client';

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

export default function ClientEventPage({ 
  event
}: { 
  event: Event
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative h-64 w-full bg-gradient-to-r from-[#81B441] to-[#6a9636]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">{event.name}</h1>
            {event.description && (
              <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 drop-shadow-md px-4">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Formulaire d&apos;inscription en cours de maintenance
          </h3>
          <p className="text-gray-600 mb-6">
            Le système d&apos;inscription est temporairement indisponible. 
            Veuillez réessayer dans quelques instants.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Pour toute question, contactez l&apos;organisateur de l&apos;événement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
