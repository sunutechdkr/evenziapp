'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  PlusIcon, 
  TrashIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  recipientType: string;
  subject: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients?: number;
  successCount?: number;
  failureCount?: number;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  category: string;
  type: string;
  htmlContent: string;
  textContent?: string;
  isActive: boolean;
  isDefault: boolean;
  isGlobal: boolean;
  createdAt: string;
}

export default function CommunicationPage() {
  const { id: eventId } = useParams();
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, [eventId]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/campaigns`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des campagnes');
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await fetch(`/api/events/${eventId}/templates`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error('Erreur templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const toggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du template');
      }

      setTemplates(templates.map(template => 
        template.id === templateId ? { ...template, isActive } : template
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      DRAFT: { label: 'Brouillon', variant: 'secondary' as const },
      SCHEDULED: { label: 'Programmé', variant: 'default' as const },
      SENDING: { label: 'Envoi en cours', variant: 'default' as const },
      SENT: { label: 'Envoyé', variant: 'default' as const },
      FAILED: { label: 'Échec', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getRecipientTypeLabel = (type: string) => {
    const typeMap = {
      ALL_PARTICIPANTS: 'Tous les participants',
      PARTICIPANTS: 'Participants',
      SPEAKERS: 'Intervenants',
      EXHIBITORS: 'Exposants',
      SPONSORS: 'Sponsors',
      CUSTOM_LIST: 'Liste personnalisée',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getTemplatesBySection = (section: string) => {
    const sectionMap = {
      inscription: ['CONFIRMATION_INSCRIPTION'],
      participants: ['BIENVENUE_PARTICIPANT', 'RAPPEL_EVENEMENT', 'INFOS_PRATIQUES', 'SUIVI_POST_EVENEMENT'],
      exposants: ['GUIDE_EXPOSANT', 'RAPPEL_INSTALLATION', 'INFOS_TECHNIQUES_STAND', 'BILAN_PARTICIPATION'],
      speakers: ['CONFIRMATION_SPEAKER', 'INFOS_TECHNIQUES_PRESENTATION', 'RAPPEL_PRESENTATION', 'REMERCIEMENT_SPEAKER'],
    };
    
    const categories = sectionMap[section as keyof typeof sectionMap] || [];
    return templates.filter(t => categories.includes(t.category));
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (!session?.user || (session.user.role !== 'ORGANIZER' && session.user.role !== 'ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600">Vous n&apos;avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'SCHEDULED' || c.status === 'SENDING').length;
  const activeTemplates = templates.filter(t => t.isActive).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EventSidebar eventId={eventId as string} activeTab={`/dashboard/events/${eventId}/communication`} />
      
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
                <p className="text-gray-600 mt-1">Gérez vos campagnes emails et templates pour cet événement</p>
              </div>
              <Link href={`/dashboard/events/${eventId}/communication/create`}>
                <Button className="bg-[#81B441] hover:bg-[#6a9636]">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nouvelle campagne
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campagnes totales</CardTitle>
                <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates actifs</CardTitle>
                <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTemplates}</div>
                <p className="text-xs text-muted-foreground">sur {templates.length} disponibles</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + (c.successCount || 0), 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campagnes actives</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCampaigns}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="campaigns" className="space-y-6">
            <TabsList>
              <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Campagnes Email</CardTitle>
                  <CardDescription>
                    Gérez vos campagnes email pour cet événement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Chargement des campagnes...</div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 mb-4">{error}</div>
                      <Button onClick={fetchCampaigns} variant="outline">
                        Réessayer
                      </Button>
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne</h3>
                      <p className="text-gray-600 mb-4">Commencez par créer votre première campagne email.</p>
                      <Link href={`/dashboard/events/${eventId}/communication/create`}>
                        <Button className="bg-[#81B441] hover:bg-[#6a9636]">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Créer une campagne
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                                {getStatusBadge(campaign.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{getRecipientTypeLabel(campaign.recipientType)}</span>
                                {campaign.totalRecipients && (
                                  <span>{campaign.totalRecipients} destinataires</span>
                                )}
                                {campaign.scheduledAt && (
                                  <span>Programmé le {new Date(campaign.scheduledAt).toLocaleDateString()}</span>
                                )}
                                {campaign.sentAt && (
                                  <span>Envoyé le {new Date(campaign.sentAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteCampaign(campaign.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <div className="space-y-6">
                {/* Templates par section */}
                {['inscription', 'participants', 'exposants', 'speakers'].map((section) => {
                  const sectionTemplates = getTemplatesBySection(section);
                  const sectionLabels = {
                    inscription: { title: 'Inscription', icon: '✅', description: '1 template pour confirmer les inscriptions' },
                    participants: { title: 'Participants', icon: '👥', description: '4 templates pour communiquer avec les participants' },
                    exposants: { title: 'Exposants', icon: '🏢', description: '4 templates pour gérer les exposants' },
                    speakers: { title: 'Speakers', icon: '🎤', description: '4 templates pour les intervenants' },
                  };
                  
                  const sectionInfo = sectionLabels[section as keyof typeof sectionLabels];
                  
                  return (
                    <Card key={section}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{sectionInfo.icon}</span>
                          {sectionInfo.title}
                        </CardTitle>
                        <CardDescription>{sectionInfo.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {templatesLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="text-gray-500">Chargement...</div>
                          </div>
                        ) : sectionTemplates.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500">Aucun template disponible pour cette section</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sectionTemplates.map((template) => (
                              <Link 
                                key={template.id} 
                                href={`/dashboard/events/${eventId}/communication/templates/${template.id}/edit`}
                                className="block"
                              >
                                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                                      {template.isDefault && (
                                        <Badge variant="outline" className="text-xs">Par défaut</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        <Switch
                                          checked={template.isActive}
                                          onCheckedChange={(checked) => toggleTemplate(template.id, checked)}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                  <p className="text-xs text-gray-500">
                                    Sujet: {template.subject}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 