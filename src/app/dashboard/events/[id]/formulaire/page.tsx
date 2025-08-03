'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CheckIcon, 
  LinkIcon, 
  ArrowPathIcon, 
  ShareIcon, 
  PencilIcon, 
  EyeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon,
  ClipboardIcon,
  PencilSquareIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

// Import composants shadcn/ui
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Type pour le mode d'inscription
type RegistrationMode = 'evenzi' | 'manual';

// Schéma de validation du formulaire d'inscription
const registrationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis (minimum 2 caractères)'),
  lastName: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  email: z.string().email('Un email valide est requis'),
  phone: z.string().min(5, 'Un numéro de téléphone est requis'),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  type: z.enum(['PARTICIPANT', 'SPEAKER'], {
    required_error: 'Veuillez sélectionner un type de participant',
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationFormPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<any>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('evenzi');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  // Configuration du formulaire avec react-hook-form et shadcn
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      company: "",
      type: "PARTICIPANT",
    },
  });

  // Récupérer les informations de l'événement
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Utiliser fetch pour récupérer les détails de l'événement
        const response = await fetch(`/api/events/${params.id}`);
        
        // Vérifier si la réponse est OK
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Erreur ${response.status}: Impossible de récupérer les données de l'événement`);
        }
        
        // Extraire les données de l'événement
        const data = await response.json();
        
        // Vérifier si l'événement existe
        if (!data) {
          throw new Error("Événement non trouvé");
        }
        
        // Mettre à jour l'état avec les données de l'événement
        setEvent(data);
        
        // Construire l'URL de partage
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/event/${data.slug}`);
      } catch (error: any) {
        console.error('Erreur:', error);
        setError(error.message || "Une erreur est survenue lors du chargement des détails de l'événement");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchEvent();
      fetchTickets();
    }
  }, [params.id]);

  // Fonction pour copier l'URL de partage
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Code d'intégration pour l'embed
  const getEmbedCode = () => {
    return `<iframe src="${shareUrl}" style="border: none; width: 100%; height: 700px;"></iframe>`;
  };
  
  // Fonction pour copier le code d'intégration
  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    
    setTimeout(() => {
      setCopiedEmbed(false);
    }, 2000);
  };

  // Fonction pour changer le mode d'inscription
  const handleRegistrationModeChange = (mode: RegistrationMode) => {
    setRegistrationMode(mode);
  };

  // Fonction pour récupérer les billets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch(`/api/events/${params.id}/tickets`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des billets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Afficher un état de chargement pendant la récupération des données
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#81B441]"></div>
      </div>
    );
  }

  // Afficher une erreur si quelque chose ne va pas
  if (error) {
    return (
      <div className="container mx-auto py-4 px-4">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                  <p className="mt-2">Essayez de rafraîchir la page ou contactez l'administrateur.</p>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/60"
                  >
                    Rafraîchir la page
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si pas d'événement trouvé, afficher un message
  if (!event) {
    return (
      <div className="container mx-auto py-4 px-4">
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500">
          <CardContent className="p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Événement non trouvé. Vérifiez l'identifiant de l'événement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4">
      {/* Header avec breadcrumb et boutons d'action */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Colonne gauche: fil d'Ariane */}
          <div className="flex items-center">
            <Link 
              href={`/dashboard/events/${params.id}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              Retour à l&apos;événement
            </Link>
          </div>
          
          {/* Colonne droite: boutons d'action */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-1"
            >
              {previewMode ? (
                <>
                  <PencilIcon className="h-4 w-4" />
                  Mode édition
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  Prévisualiser
                </>
              )}
            </Button>
            <Button 
              asChild 
              className="bg-[#81B441] hover:bg-[#729939]"
            >
              <Link href={`/event/${event?.slug}`} target="_blank">
                Voir page publique
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bannière de l'événement */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg">
        {event?.banner ? (
          <Image
            src={event.banner}
            alt={event.name}
            fill
            style={{objectFit: 'cover'}}
            className="z-0 opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#81B441]/20 to-indigo-500/20"></div>
        )}
        
        {/* Overlay avec informations de l'événement */}
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col justify-end p-6">
          <div className="max-w-3xl">
            <Badge className="bg-[#81B441] text-white mb-3">
              {event && new Date(event.startDate).toLocaleDateString('fr-FR')}
              {event?.endDate && event.startDate !== event.endDate && 
                ` - ${new Date(event.endDate).toLocaleDateString('fr-FR')}`}
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{event?.name}</h2>
            <p className="text-white/90 text-lg mb-2 line-clamp-2">{event?.description}</p>
            <div className="flex items-center text-white/80 text-sm">
              <span>{event?.location}</span>
              {event?.maxParticipants && (
                <span className="ml-4 flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  Max: {event.maxParticipants} participants
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Titre et description de la page (déplacés après la bannière) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Gestion du formulaire d'inscription
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez les options d'inscription et personnalisez le formulaire pour votre événement.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Colonne de gauche - Informations sur le formulaire */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Options d'inscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                defaultValue={registrationMode} 
                onValueChange={(value: string) => handleRegistrationModeChange(value as RegistrationMode)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="evenzi" id="evenzi-registration" className="mt-1" />
                  <div>
                    <Label htmlFor="evenzi-registration" className="font-medium text-gray-700 dark:text-gray-300">
                      Inscription Inevent
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Utilisez notre système d'inscription intégré avec un formulaire personnalisable, 
                      la génération de badges et le suivi des inscriptions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="manual" id="manual-registration" className="mt-1" />
                  <div>
                    <Label htmlFor="manual-registration" className="font-medium text-gray-700 dark:text-gray-300">
                      Inscription manuelle
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ajoutez manuellement les participants depuis le tableau de bord. 
                      Idéal si vous gérez les inscriptions par un autre moyen externe.
                    </p>
                  </div>
                </div>
              </RadioGroup>
              
              {registrationMode === 'evenzi' && (
                <>
                  <div className="mt-6">
                    <Label htmlFor="share-url" className="text-sm font-medium mb-2">
                      URL de partage
                    </Label>
                    <div className="mt-1 flex rounded-md shadow-sm relative">
                      <Input
                        id="share-url"
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        onClick={copyShareUrl}
                        variant="outline"
                        className="rounded-l-none border-l-0"
                      >
                        {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                      </Button>
                      {copied && (
                        <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Lien copié!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <Label className="text-sm font-medium">
                      Code d'intégration
                    </Label>
                    <div className="relative">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 font-mono text-xs relative">
                        <pre className="whitespace-pre-wrap break-all">{getEmbedCode()}</pre>
                        <Button
                          type="button"
                          onClick={copyEmbedCode}
                          variant="outline" 
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          {copiedEmbed ? <CheckIcon className="h-3 w-3" /> : <CodeBracketIcon className="h-3 w-3" />}
                        </Button>
                      </div>
                      {copiedEmbed && (
                        <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Code copié!
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Utilisez ce code pour intégrer le formulaire d'inscription sur votre site web.
                    </p>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <Label className="text-sm font-medium">
                      Options de partage
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/event/${event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Prévisualiser
                        </Link>
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={copyShareUrl}
                      >
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {registrationMode === 'manual' && (
                <div className="mt-6 space-y-4">
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-500">
                    <CardContent className="p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <PencilSquareIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Mode d'inscription manuelle activé. Vous pouvez ajouter directement les participants depuis la page 
                            <Button asChild variant="link" className="p-0 h-auto font-medium px-1">
                              <Link href={`/dashboard/events/${params.id}/participants`}>
                                Participants
                              </Link>
                            </Button>.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Colonne de droite - Prévisualisation du formulaire */}
        <div className="w-full md:w-2/3">
          {registrationMode === 'evenzi' ? (
            <Card>
              <CardHeader>
                <CardTitle>Prévisualisation du formulaire</CardTitle>
                <CardDescription>
                  Voici comment le formulaire apparaîtra aux participants. {!previewMode && "Les champs sont désactivés en mode édition."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Jean" 
                                {...field} 
                                disabled={!previewMode}
                                className="focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Dupont" 
                                {...field} 
                                disabled={!previewMode}
                                className="focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="jean.dupont@exemple.com" 
                                {...field} 
                                disabled={!previewMode}
                                className="focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                type="tel"
                                placeholder="+33 6 12 34 56 78" 
                                {...field} 
                                disabled={!previewMode}
                                className="focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fonction</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Directeur Marketing" 
                                {...field} 
                                disabled={!previewMode}
                                className="focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entreprise</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Entreprise XYZ" 
                                {...field} 
                                disabled={!previewMode}
                                className="focus:border-[#81B441] focus:ring-[#81B441] focus:ring-opacity-50 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      

                      {/* Section de sélection de billet */}
                      <div className="sm:col-span-2">
                        <FormLabel>Choisir un billet <span className="text-red-500">*</span></FormLabel>
                        {loadingTickets ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#81B441]"></div>
                            <span className="ml-2 text-sm text-gray-500">Chargement des billets...</span>
                          </div>
                        ) : tickets.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {tickets.filter(ticket => ticket.status === 'ACTIVE' && ticket.visibility === 'VISIBLE').map((ticket) => (
                              <div
                                key={ticket.id}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                  !previewMode ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#81B441] hover:shadow-md'
                                }`}
                                onClick={() => previewMode && console.log('Billet sélectionné:', ticket.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                                    {ticket.description && (
                                      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                                    )}
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-lg font-bold text-[#81B441]">
                                        {ticket.price === 0 ? 'Gratuit' : `${ticket.price} ${ticket.currency || 'XOF'}`}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {ticket.quantity ? `${ticket.sold || 0}/${ticket.quantity}` : 'Illimité'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className={`w-4 h-4 rounded-full border-2 ${!previewMode ? 'border-gray-300' : 'border-[#81B441]'}`}>
                                      {/* Radio button simulation */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-500">
                              Aucun billet disponible pour cet événement.
                            </p>
                          </div>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Type de participant <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="flex flex-wrap gap-4"
                                disabled={!previewMode}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="PARTICIPANT" id="participant" 
                                    className="text-[#81B441] focus:ring-[#81B441]" />
                                  <Label htmlFor="participant">Participant</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="SPEAKER" id="speaker" 
                                    className="text-[#81B441] focus:ring-[#81B441]" />
                                  <Label htmlFor="speaker">Intervenant</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={!previewMode}
                        className={`w-full ${
                          previewMode 
                            ? 'bg-[#81B441] hover:bg-[#729939] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]' 
                            : 'bg-[#81B441]/60 cursor-not-allowed'
                        }`}
                      >
                        S'inscrire à l'événement
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Gestion manuelle des inscriptions</CardTitle>
                <CardDescription>
                  Vous avez choisi le mode d'inscription manuelle. Les participants ne pourront pas s'inscrire via un formulaire en ligne.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center">
                  <PencilSquareIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Inscriptions manuelles</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                    Vous devrez ajouter manuellement les participants depuis la page Participants. Cela peut être utile si vous gérez déjà vos inscriptions par un autre moyen.
                  </p>
                  <Button asChild className="bg-[#81B441] hover:bg-[#729939]">
                    <Link href={`/dashboard/events/${params.id}/participants`}>
                      Gérer les participants
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 