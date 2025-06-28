'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, CheckCircleIcon, UsersIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';

interface Ticket {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  quantity?: number | null;
  sold: number;
  status: string;
  visibility: string;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    gdprConsent: false
  });

  // Fonction pour récupérer les billets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch(`/api/public/events/${event.id}/tickets`);
      if (response.ok) {
        const data = await response.json();
        const availableTickets = (data.tickets || []).filter(
          (ticket: Ticket) => ticket.status === 'ACTIVE' && ticket.visibility === 'VISIBLE'
        );
        setTickets(availableTickets);
        
        // Sélectionner automatiquement le premier billet disponible
        if (availableTickets.length > 0) {
          setSelectedTicket(availableTickets[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des billets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Charger les billets au montage du composant
  useEffect(() => {
    fetchTickets();
  }, [event.id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !selectedTicket || !formData.gdprConsent) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          eventId: event.id,
          ticketId: selectedTicket,
          type: 'PARTICIPANT',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'inscription');
      }
      
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite pendant l\'inscription');
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fonction pour formater la date
  const formatEventDate = (startDate: string, endDate: string, startTime?: string | null) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDateStr = start.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (start.toDateString() === end.toDateString()) {
      return startTime ? `${startDateStr} à ${startTime}` : startDateStr;
    } else {
      const endDateStr = end.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `Du ${startDateStr} au ${endDateStr}`;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative h-32 w-full bg-gradient-to-r from-[#81B441] to-[#6a9636]">
          {event.banner ? (
            <Image
              src={event.banner}
              alt={event.name}
              fill
              style={{ objectFit: 'cover' }}
              className="z-0 opacity-20"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#81B441] to-[#6a9636]"></div>
          )}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">{event.name}</h1>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto w-full px-4 py-8">
          <div className="shadow-xl border-0 bg-white rounded-lg">
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Inscription confirmée !</h2>
              
              <div className="space-y-6 mb-8">
                <p className="text-lg text-gray-700">
                  Félicitations ! Vous êtes maintenant inscrit(e) à <strong>{event.name}</strong>
                </p>
                
                <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-200/50">
                  <h4 className="font-semibold text-blue-900 mb-2">📧 Vérifiez votre email</h4>
                  <p className="text-blue-800 text-sm">
                    Un email de confirmation avec votre badge QR a été envoyé à <strong>{formData.email}</strong>.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => window.location.href = `/event/${event.slug}`}
                className="bg-[#81B441] hover:bg-[#729939] text-white px-8 py-3 text-lg font-semibold rounded-lg"
              >
                Retour à l&apos;événement
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Bannière de l'événement */}
      <div className="relative h-64 w-full bg-gradient-to-r from-[#81B441] to-[#6a9636]">
        {event.banner ? (
          <Image
            src={event.banner}
            alt={event.name}
            fill
            style={{ objectFit: 'cover' }}
            className="z-0 opacity-30"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#81B441] to-[#6a9636]"></div>
        )}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-4 bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-sm inline-block">
              {formatEventDate(event.startDate, event.endDate, event.startTime)}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">{event.name}</h1>
            {event.description && (
              <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 drop-shadow-md px-4">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations de l'événement */}
          <div className="lg:col-span-1">
            <div className="shadow-lg border-0 bg-white rounded-lg">
              <div className="bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white p-4 rounded-t-lg">
                <h2 className="flex items-center font-semibold">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Détails de l&apos;événement
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <CalendarIcon className="w-5 h-5 mr-3 text-[#81B441]" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm">{formatEventDate(event.startDate, event.endDate, event.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPinIcon className="w-5 h-5 mr-3 text-[#81B441]" />
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-sm">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'inscription */}
          <div className="lg:col-span-2">
            <div className="shadow-xl border-0 bg-white rounded-lg">
              <div className="bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white p-4 rounded-t-lg">
                <h2 className="flex items-center font-semibold">
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Inscrivez-vous à cet événement
                </h2>
              </div>
              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Sélection de billet */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Sélection de billet</h3>
                    {loadingTickets ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-t-2 border-[#81B441] border-solid rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">Chargement des billets...</span>
                      </div>
                    ) : tickets.length > 0 ? (
                      <div className="grid gap-3">
                        {tickets.map((ticket) => {
                          const isAvailable = !ticket.quantity || ticket.sold < ticket.quantity;
                          const isSelected = selectedTicket === ticket.id;
                          
                          return (
                            <div
                              key={ticket.id}
                              onClick={() => {
                                if (isAvailable) {
                                  setSelectedTicket(ticket.id);
                                }
                              }}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#81B441] bg-[#81B441]/10'
                                  : isAvailable
                                  ? 'border-gray-200 hover:border-[#81B441]/50 hover:bg-gray-50'
                                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                                  {ticket.description && (
                                    <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center space-x-4">
                                      <span className="text-lg font-bold text-[#81B441]">
                                        {ticket.price === 0 ? 'Gratuit' : `${ticket.price} ${ticket.currency}`}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {ticket.quantity 
                                          ? `${ticket.quantity - ticket.sold} places restantes`
                                          : 'Places illimitées'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-[#81B441] bg-[#81B441]' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Aucun billet disponible pour cet événement.</p>
                      </div>
                    )}
                  </div>

                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                        <input
                          type="text"
                          placeholder="Jean"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          placeholder="Dupont"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email *</label>
                      <input
                        type="email"
                        placeholder="jean.dupont@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441]"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Votre badge et les informations de l&apos;événement seront envoyés à cette adresse
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441]"
                      />
                    </div>
                  </div>

                  {/* Informations professionnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Informations professionnelles (optionnel)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                        <input
                          type="text"
                          placeholder="Directeur Marketing"
                          value={formData.jobTitle}
                          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <input
                          type="text"
                          placeholder="Entreprise XYZ"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consentement RGPD */}
                  <div className="flex items-start space-x-3 p-4 border rounded-md">
                    <input
                      type="checkbox"
                      checked={formData.gdprConsent}
                      onChange={(e) => handleInputChange('gdprConsent', e.target.checked)}
                      className="mt-1"
                      required
                    />
                    <div className="space-y-1 leading-none">
                      <label className="text-sm font-medium">
                        J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité *
                      </label>
                      <p className="text-xs text-gray-500">
                        En cochant cette case, vous acceptez que vos données soient utilisées 
                        pour l&apos;organisation de cet événement.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || tickets.length === 0}
                    className="w-full bg-[#81B441] hover:bg-[#729939] text-white py-3 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                        Inscription en cours...
                      </div>
                    ) : (
                      'S\'inscrire à l\'événement'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
