'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";

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

interface TemplateViewerProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateViewer({ 
  template, 
  isOpen, 
  onClose 
}: TemplateViewerProps) {
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
            <EyeIcon className="h-5 w-5" />
            Aperçu : {template.name}
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

        <div className="mt-4">
          <div className="border rounded-lg p-4 bg-white">
            <div className="mb-4 pb-4 border-b">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Sujet:</strong> {getPreviewContent(template.subject)}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Catégorie:</strong> {getCategoryLabel(template.category)}
              </div>
              {template.description && (
                <div className="text-sm text-gray-600">
                  <strong>Description:</strong> {template.description}
                </div>
              )}
            </div>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: getPreviewContent(template.htmlContent) 
              }}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 