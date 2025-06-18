'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircleIcon, TicketIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface RegistrationData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  shortCode: string;
  event: {
    id: string;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    slug: string;
  };
}

export default function RegisteredPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('id');
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        if (!registrationId) {
          throw new Error('ID d\'inscription non fourni');
        }

        const response = await fetch(`/api/events/${params.slug}/registrations/${registrationId}`);
        
        if (!response.ok) {
          throw new Error('Impossible de récupérer les détails de l\'inscription');
        }
        
        const data = await response.json();
        setRegistration(data.registration);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur s\'est produite');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [registrationId, params.slug]);

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-[#81B441] border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement de votre badge...</p>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error || !registration) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Une erreur s'est produite</h3>
          <p className="mt-2 text-sm text-gray-600">{error || 'Impossible de récupérer les détails de votre inscription'}</p>
          <div className="mt-6">
            <Link href={`/event/${params.slug}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#81B441] hover:bg-[#71a137] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]">
              Retour à l'événement
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière de confirmation */}
      <div className="bg-[#81B441]/10 border-b border-[#81B441]/20">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-[#81B441]/20">
                <CheckCircleIcon className="h-5 w-5 text-[#81B441]" aria-hidden="true" />
              </span>
              <p className="ml-3 font-medium text-[#81B441] truncate">
                <span className="md:hidden">Inscription réussie!</span>
                <span className="hidden md:inline">Votre inscription à {registration.event.name} a été confirmée.</span>
              </p>
            </div>
            <div className="mt-2 flex-shrink-0 w-full sm:mt-0 sm:w-auto">
              <Link 
                href={`/event/${params.slug}`} 
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#81B441] bg-white hover:bg-[#81B441]/5"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Retour à l'événement
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Section de badge et QR code */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <TicketIcon className="mx-auto h-12 w-12 text-[#81B441]" />
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Votre badge est prêt</h2>
            <p className="mt-2 text-lg text-gray-500">
              Présentez ce QR code lors de votre arrivée à l'événement pour accélérer votre enregistrement.
            </p>
          </div>
          
          {/* Badge */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">{registration.event.name}</h3>
              <p className="text-sm text-gray-500">{new Date(registration.event.startDate).toLocaleDateString('fr-FR')} - {new Date(registration.event.endDate).toLocaleDateString('fr-FR')}</p>
              <p className="text-sm text-gray-500">{registration.event.location}</p>
            </div>
            
            <div className="px-6 py-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1">
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold text-gray-900">{registration.firstName} {registration.lastName}</h4>
                    <p className="text-gray-600">{registration.email}</p>
                    <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-[#81B441]/10 text-[#81B441]">
                      {registration.type === 'PARTICIPANT' ? 'Participant' : 
                       registration.type === 'SPEAKER' ? 'Intervenant' : 'Exhibiteur'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 md:mt-0 flex-shrink-0 flex flex-col items-center">
                  <div className="p-2 bg-white rounded-lg shadow-md">
                    <QRCodeSVG
                      value={registration.shortCode || registration.id}
                      size={180}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"M"}
                      includeMargin={false}
                    />
                  </div>
                  <span className="mt-2 text-sm font-mono text-gray-600">{registration.shortCode}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <p className="text-sm text-gray-500 text-center">
                Un email de confirmation a été envoyé à {registration.email}
              </p>
            </div>
          </div>
          
          {/* Bouton d'enregistrement */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#81B441] hover:bg-[#71a137] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer le badge
            </button>
          </div>
          
          {/* Instructions */}
          <div className="mt-12 bg-white rounded-lg shadow px-6 py-5 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">À faire avant l'événement</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#81B441]/20 text-[#81B441]">
                    1
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Téléchargez ou imprimez votre badge pour un accès plus rapide</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#81B441]/20 text-[#81B441]">
                    2
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Présentez-vous 30 minutes avant le début de l'événement</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#81B441]/20 text-[#81B441]">
                    3
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">Conservez votre code de référence : <span className="font-mono font-medium">{registration.shortCode}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 