'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilIcon, EyeIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from 'next/dynamic';

// Import dynamique pour l'éditeur riche
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-md" />
});

interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  category: string;
  htmlContent: string;
  textContent?: string;
  isActive: boolean;
  isDefault: boolean;
  isGlobal: boolean;
}

interface TemplateEditModalProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
  eventId: string;
}

export default function TemplateEditModal({ 
  template, 
  isOpen, 
  onClose, 
  onSave, 
  eventId 
}: TemplateEditModalProps) {
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      });
    }
  }, [template]);

  const handleSave = async () => {
    if (!template || !formData.name || !formData.subject || !formData.htmlContent) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          subject: formData.subject,
          htmlContent: formData.htmlContent,
          textContent: formData.textContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const updatedTemplate = await response.json();
      onSave(updatedTemplate);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap = {
      CONFIRMATION_INSCRIPTION: 'Confirmation d&apos;inscription',
      BIENVENUE_PARTICIPANT: 'Bienvenue participant',
      RAPPEL_EVENEMENT: 'Rappel événement',
      INFOS_PRATIQUES: 'Informations pratiques',
      SUIVI_POST_EVENEMENT: 'Suivi post-événement',
      GUIDE_EXPOSANT: 'Guide exposant',
      RAPPEL_INSTALLATION: 'Rappel installation',
      INFOS_TECHNIQUES_STAND: 'Informations techniques stand',
      BILAN_PARTICIPATION: 'Bilan participation',
      CONFIRMATION_SPEAKER: 'Confirmation speaker',
      INFOS_TECHNIQUES_PRESENTATION: 'Informations techniques présentation',
      RAPPEL_PRESENTATION: 'Rappel présentation',
      REMERCIEMENT_SPEAKER: 'Remerciement speaker',
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const getPreviewContent = (content: string) => {
    return content
      .replace(/\{\{eventName\}\}/g, 'Mon Événement')
      .replace(/\{\{participantName\}\}/g, 'Jean Dupont')
      .replace(/\{\{eventDate\}\}/g, '15 juin 2024')
      .replace(/\{\{eventTime\}\}/g, '14h00')
      .replace(/\{\{eventLocation\}\}/g, 'Paris, France')
      .replace(/\{\{organizerName\}\}/g, 'Organisateur')
      .replace(/\{\{supportEmail\}\}/g, 'support@event.com');
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="h-5 w-5" />
            Éditer le template : {template.name}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
              {template.isDefault && (
                <Badge variant="outline" className="text-xs">Par défaut</Badge>
              )}
              {template.isActive ? (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">Actif</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Inactif</Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              Éditer
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              Aperçu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Nom du template</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du template"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du template"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="subject">Sujet de l&apos;email</Label>
                <Input
                  id="subject"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Sujet de l'email"
                />
              </div>

              <div>
                <Label htmlFor="htmlContent">Contenu HTML</Label>
                <div className="mt-2">
                  <RichTextEditor
                    value={formData.htmlContent || ''}
                    onChange={(value) => setFormData({ ...formData, htmlContent: value })}
                    placeholder="Contenu de votre email..."
                  />
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Variables disponibles : eventName, participantName, eventDate, eventTime, eventLocation, organizerName, supportEmail
                </div>
              </div>

              <div>
                <Label htmlFor="textContent">Version texte (optionnel)</Label>
                <Textarea
                  id="textContent"
                  value={formData.textContent || ''}
                  onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                  placeholder="Version texte de votre email"
                  rows={6}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg p-4 bg-white">
              <div className="mb-4 pb-4 border-b">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Sujet:</strong> {getPreviewContent(formData.subject || '')}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Catégorie:</strong> {getCategoryLabel(template.category)}
                </div>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: getPreviewContent(formData.htmlContent || '') 
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || !formData.name || !formData.subject || !formData.htmlContent}
            className="bg-[#81B441] hover:bg-[#6a9636]"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 