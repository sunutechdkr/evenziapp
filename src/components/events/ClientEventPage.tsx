'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, MapPinIcon, CheckCircleIcon, UsersIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';
import { useRouter } from 'next/router';

// Importer les composants shadcn/ui
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schéma de validation du formulaire d'inscription amélioré
const registrationSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  email: z.string()
    .email('Veuillez saisir une adresse email valide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[\d\s\-\+\(\)\.]+$/.test(val), {
      message: 'Veuillez saisir un numéro de téléphone valide'
    }),
  jobTitle: z.string()
    .max(100, 'La fonction ne peut pas dépasser 100 caractères')
    .optional(),
  company: z.string()
    .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
    .optional(),
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
  event
}: { 
  event: Event
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    registrationId?: string;
    eventSlug?: string;
  } | null>(null);
  
  const router = useRouter();
  
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
      setRegistrationData(result);
      setSuccess(true);
      
      // Scroll vers le haut pour afficher le message de succès
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite pendant l\'inscription');
      setIsSubmitting(false);
      
      // Scroll vers l'erreur
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
      // Même jour
      return startTime ? `${startDateStr} à ${startTime}` : startDateStr;
    } else {
      // Plusieurs jours
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
        {/* Bannière réduite de l'événement */}
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
        
        {/* Message de confirmation amélioré */}
        <div className="max-w-3xl mx-auto w-full px-4 py-8">
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-8 text-center">
              {/* Icône de succès animée */}
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CheckCircleIcon className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Inscription confirmée !</h2>
              
              <div className="space-y-4 mb-8">
                <p className="text-lg text-gray-700">
                  Félicitations ! Vous êtes maintenant inscrit(e) à
                </p>
                <div className="bg-[#81B441] bg-opacity-10 rounded-lg p-4 border border-[#81B441] border-opacity-20">
                  <h3 className="text-xl font-bold text-[#81B441] mb-2">{event.name}</h3>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1 text-[#81B441]" />
                      {formatEventDate(event.startDate, event.endDate, event.startTime)}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1 text-[#81B441]" />
                      {event.location}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📧 Vérifiez votre email</h4>
                  <p className="text-blue-800 text-sm">
                    Un email de confirmation avec votre badge QR et toutes les informations importantes 
                    a été envoyé à <span className="font-semibold">{form.getValues().email}</span>.
                  </p>
                  <p className="text-blue-700 text-xs mt-2">
                    N&apos;oubliez pas de vérifier vos spams si vous ne le trouvez pas dans votre boîte de réception.
                  </p>
                </div>
                
                {registrationData?.registrationId && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Votre référence d&apos;inscription</h4>
                    <code className="bg-white px-3 py-1 rounded border text-sm font-mono text-gray-700">
                      {registrationData.registrationId}
                    </code>
                    <p className="text-xs text-gray-600 mt-1">
                      Conservez cette référence pour toute correspondance future
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="border-[#81B441] text-[#81B441] hover:bg-[#81B441] hover:text-white"
                >
                  Retour à l&apos;accueil
                </Button>
                <Button 
                  onClick={() => {
                    // Si possible, retour à la page précédente, sinon vers l'accueil
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push('/');
                    }
                  }}
                  className="bg-[#81B441] hover:bg-[#729939] text-white"
                >
                  Terminer
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Des questions ? Contactez l&apos;organisateur de l&apos;événement pour obtenir de l&apos;aide.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Bannière de l'événement améliorée */}
      <div className="relative h-72 md:h-96 w-full">
        {event.banner ? (
          <Image
            src={event.banner}
            alt={event.name}
            fill
            style={{ objectFit: 'cover' }}
            className="z-0"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#81B441] to-[#6a9636]"></div>
        )}
        
        {/* Overlay avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10"></div>
        
        {/* Informations de l'événement */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-4xl">
              <Badge className="bg-[#81B441] text-white mb-4 text-sm">
                {formatEventDate(event.startDate, event.endDate, event.startTime)}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-base">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString('fr-FR')}
                    {event.startTime && ` à ${event.startTime}`}
                  </span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description de l'événement */}
        {event.description && (
          <Card className="shadow-lg border-0 bg-white -mt-24 relative z-30 mb-12">
            <CardContent className="p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Formulaire d'inscription amélioré */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
              <UsersIcon className="w-6 h-6 mr-2" />
              Inscrivez-vous à cet événement
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erreur d&apos;inscription</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Section informations personnelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Informations personnelles
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Champ prénom */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Prénom <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Jean" 
                              {...field} 
                              className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />

                    {/* Champ nom */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Nom <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Dupont" 
                              {...field} 
                              className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Champ email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Adresse email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="jean.dupont@exemple.com" 
                            {...field} 
                            className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                        <p className="text-xs text-gray-500 mt-1">
                          Votre badge et les informations de l&apos;événement seront envoyés à cette adresse
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Champ téléphone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Téléphone</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="+33 6 12 34 56 78" 
                            {...field} 
                            className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section informations professionnelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Informations professionnelles <span className="text-sm font-normal text-gray-500">(optionnel)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Champ fonction */}
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Fonction</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Directeur Marketing" 
                              {...field} 
                              className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />

                    {/* Champ entreprise */}
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Entreprise</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Entreprise XYZ" 
                              {...field} 
                              className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Section consentement RGPD */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Consentement et conditions
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="gdprConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 p-4 bg-gray-50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#81B441] data-[state=checked]:border-[#81B441] mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700 font-medium">
                            Protection des données <span className="text-red-500">*</span>
                          </FormLabel>
                          <p className="text-sm text-gray-600">
                            J&apos;accepte que mes données personnelles soient collectées et traitées conformément à la {' '}
                            <a 
                              href="/privacy-policy" 
                              target="_blank"
                              className="text-[#81B441] underline hover:text-[#6a9636] font-medium"
                            >
                              politique de confidentialité
                            </a>
                            {' '} pour les besoins de ma participation à cet événement.
                          </p>
                          <FormMessage className="text-red-500 text-sm" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bouton de soumission */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-[#81B441] to-[#6a9636] hover:from-[#729939] hover:to-[#5a8230] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-[#81B441] focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Inscription en cours...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        S&apos;inscrire à l&apos;événement
                      </div>
                    )}
                  </Button>
                  
                  <p className="text-center text-xs text-gray-500 mt-3">
                    En vous inscrivant, vous recevrez un email de confirmation avec votre badge QR
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 