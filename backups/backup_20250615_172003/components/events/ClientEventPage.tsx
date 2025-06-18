'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Importer les composants shadcn/ui
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schéma de validation du formulaire d'inscription
const registrationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis (minimum 2 caractères)'),
  lastName: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  email: z.string().email('Un email valide est requis'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  gdprConsent: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions pour vous inscrire',
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

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
  params,
  event
}: { 
  params: { slug: string },
  event: Event
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Initialiser le formulaire avec react-hook-form et shadcn
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      company: "",
      gdprConsent: false,
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          eventId: event.id,
          type: 'PARTICIPANT', // Type de participant toujours PARTICIPANT par défaut
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'inscription');
      }
      
      const result = await response.json();
      setSuccess(true);
      
      // La redirection se fera via le bouton de la page de succès
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite pendant l\'inscription');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Bannière réduite de l'événement */}
        <div className="relative h-40 w-full bg-gradient-to-r from-gray-700 to-gray-900">
          {event.banner ? (
            <Image
              src={event.banner}
              alt={event.name}
              fill
              style={{ objectFit: 'cover' }}
              className="z-0 opacity-80"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#81B441]/20 to-indigo-500/20"></div>
          )}
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{event.name}</h1>
          </div>
        </div>
        
        {/* Message de confirmation */}
        <div className="max-w-2xl mx-auto w-full px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="rounded-full bg-green-100 p-5 mx-auto w-20 h-20 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Inscription réussie!</h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                Merci de vous être inscrit à <span className="font-semibold">{event.name}</span>.
              </p>
              <p className="text-gray-600">
                Un email contenant vos informations de connexion et votre badge a été envoyé à 
                <span className="font-semibold text-[#81B441]"> {form.getValues().email}</span>.
              </p>
              <p className="text-gray-600">
                Veuillez vérifier votre boîte de réception (et éventuellement vos spams).
              </p>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => window.location.href = `/dashboard/events/${event.id}/apercu`}
                className="bg-[#81B441] hover:bg-[#729939] text-white px-8 py-2 text-base"
              >
                Terminer
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Si vous avez des questions, veuillez contacter l'organisateur de l'événement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière de l'événement */}
      <div className="relative h-64 md:h-80 w-full bg-gradient-to-r from-gray-700 to-gray-900">
        {event.banner ? (
          <Image
            src={event.banner}
            alt={event.name}
            fill
            style={{ objectFit: 'cover' }}
            className="z-0 opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#81B441]/20 to-indigo-500/20"></div>
        )}
        
        {/* Overlay avec informations de l'événement */}
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col justify-end p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <div className="inline-block px-3 py-1 bg-[#81B441] text-white text-xs font-semibold rounded-full mb-3">
                {new Date(event.startDate).toLocaleDateString('fr-FR')}
                {event.endDate && new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && 
                  ` - ${new Date(event.endDate).toLocaleDateString('fr-FR')}`}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mt-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString('fr-FR')}
                    {event.startTime && ` à ${event.startTime}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-8 -mt-12 md:-mt-16 relative z-20 mb-12">
          {event.description && (
            <div className="prose max-w-none mb-8">
              <p>{event.description}</p>
            </div>
          )}
        </div>
        
        {/* Formulaire d'inscription */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Inscrivez-vous à cet événement</h2>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 max-w-2xl mx-auto">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Champ prénom */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Prénom <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Jean" 
                            {...field} 
                            className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* Champ nom */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Nom <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Dupont" 
                            {...field} 
                            className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* Champ email (sur toute la largeur) */}
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="jean.dupont@exemple.com" 
                              {...field} 
                              className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Champ téléphone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Téléphone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123-456-7890" 
                            {...field} 
                            className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* Champ fonction */}
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Fonction</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Directeur Marketing" 
                            {...field} 
                            className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* Champ entreprise */}
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Entreprise</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Entreprise XYZ" 
                            {...field} 
                            className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Case à cocher RGPD */}
                <FormField
                  control={form.control}
                  name="gdprConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#81B441] data-[state=checked]:border-[#81B441]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700">
                          Protection des données <span className="text-red-500">*</span>
                        </FormLabel>
                        <p className="text-sm text-gray-500">
                          J'accepte que mes données soient traitées conformément à la {' '}
                          <a href="/privacy-policy" className="text-[#81B441] underline hover:text-[#6a9636]">
                            politique de confidentialité
                          </a>.
                        </p>
                        <FormMessage className="text-red-500" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Bouton de soumission */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-[#81B441] hover:bg-[#729939] text-white focus:ring-[#81B441] focus:ring-opacity-50 focus:ring-offset-white transition-colors"
                >
                  {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire à l\'événement'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
} 