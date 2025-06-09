'use client';

import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  category: string;
  htmlContent: string;
  isActive: boolean;
}

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
  eventId: string;
}

interface RecipientCount {
  ALL_PARTICIPANTS: number;
  PARTICIPANTS: number;
  SPEAKERS: number;
  EXHIBITORS: number;
  SPONSORS: number;
}

export default function SendEmailModal({ isOpen, onClose, template, eventId }: SendEmailModalProps) {
  const [sendType, setSendType] = useState<'immediate' | 'scheduled'>('immediate');
  const [recipientType, setRecipientType] = useState('ALL_PARTICIPANTS');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [recipientCounts, setRecipientCounts] = useState<RecipientCount>({
    ALL_PARTICIPANTS: 0,
    PARTICIPANTS: 0,
    SPEAKERS: 0,
    EXHIBITORS: 0,
    SPONSORS: 0
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && template) {
      setCustomSubject(template.subject);
      setCustomNote('');
      fetchRecipientCounts();
    }
  }, [isOpen, template, eventId]);

  const fetchRecipientCounts = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/recipients-count`);
      if (response.ok) {
        const data = await response.json();
        setRecipientCounts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des destinataires:', error);
    }
  };

  const getRecipientLabel = (type: string) => {
    const labels = {
      ALL_PARTICIPANTS: 'Tous les participants',
      PARTICIPANTS: 'Participants uniquement',
      SPEAKERS: 'Intervenants',
      EXHIBITORS: 'Exposants',
      SPONSORS: 'Sponsors',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getCurrentRecipientCount = () => {
    return recipientCounts[recipientType as keyof RecipientCount] || 0;
  };

  const handleSend = async () => {
    if (!template) return;

    setSending(true);
    try {
      const campaignData = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: customNote || `Envoi automatique du template ${template.name}`,
        templateId: template.id,
        recipientType,
        subject: customSubject,
        htmlContent: template.htmlContent,
        type: 'CUSTOM',
        sendType,
        scheduledAt: sendType === 'scheduled' ? `${scheduledDate}T${scheduledTime}:00` : null
      };

      const response = await fetch(`/api/events/${eventId}/campaigns/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      const result = await response.json();
      
      // Afficher un message de succès
      alert(sendType === 'immediate' 
        ? `Email envoyé avec succès à ${result.recipientCount} destinataires !`
        : `Email programmé avec succès pour le ${new Date(campaignData.scheduledAt!).toLocaleDateString()} à ${new Date(campaignData.scheduledAt!).toLocaleTimeString()}`
      );
      
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const isFormValid = () => {
    if (!customSubject.trim()) return false;
    if (sendType === 'scheduled' && (!scheduledDate || !scheduledTime)) return false;
    return getCurrentRecipientCount() > 0;
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5" />
            Envoyer: {template.name}
          </DialogTitle>
          <DialogDescription>
            Configurez l'envoi de votre email aux participants de l'événement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Type d'envoi */}
          <div>
            <Label className="text-base font-medium mb-3 block">Type d'envoi</Label>
            <RadioGroup value={sendType} onValueChange={(value) => setSendType(value as 'immediate' | 'scheduled')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="immediate" id="immediate" />
                <label htmlFor="immediate" className="flex items-center gap-2 cursor-pointer flex-1">
                  <EnvelopeIcon className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Envoi immédiat</div>
                    <div className="text-sm text-gray-500">L&apos;email sera envoyé directement</div>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <label htmlFor="scheduled" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Envoi programmé</div>
                    <div className="text-sm text-gray-500">Planifier l'envoi pour plus tard</div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Programmation */}
          {sendType === 'scheduled' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <Label htmlFor="date">Date d'envoi</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="time">Heure d'envoi</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Destinataires */}
          <div>
            <Label className="text-base font-medium mb-3 block">Destinataires</Label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(recipientCounts).map(([type, count]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center justify-between w-full">
                      <span>{getRecipientLabel(type)}</span>
                      <span className="text-sm text-gray-500 ml-2">({count})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <UsersIcon className="h-4 w-4" />
              <span>{getCurrentRecipientCount()} destinataires sélectionnés</span>
            </div>
          </div>

          {/* Sujet personnalisé */}
          <div>
            <Label htmlFor="subject" className="text-base font-medium">Sujet de l'email</Label>
            <Input
              id="subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="mt-2"
              placeholder="Sujet de votre email"
            />
          </div>

          {/* Note personnalisée */}
          <div>
            <Label htmlFor="note" className="text-base font-medium">Note interne (optionnel)</Label>
            <Textarea
              id="note"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="mt-2"
              rows={3}
              placeholder="Note pour identifier cette campagne..."
            />
          </div>

          {/* Récapitulatif */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Récapitulatif</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Template:</span>
                <span className="font-medium">{template.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Destinataires:</span>
                <span className="font-medium">{getCurrentRecipientCount()} personnes</span>
              </div>
              <div className="flex justify-between">
                <span>Type d'envoi:</span>
                <span className="font-medium">
                  {sendType === 'immediate' ? 'Immédiat' : 'Programmé'}
                </span>
              </div>
              {sendType === 'scheduled' && scheduledDate && scheduledTime && (
                <div className="flex justify-between">
                  <span>Programmé pour:</span>
                  <span className="font-medium">
                    {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString()} à {scheduledTime}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Avertissement si aucun destinataire */}
          {getCurrentRecipientCount() === 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="text-sm">Aucun destinataire trouvé pour ce type. Vérifiez vos inscriptions.</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Annuler
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!isFormValid() || sending}
            className="bg-[#81B441] hover:bg-[#6a9636]"
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {sendType === 'immediate' ? 'Envoi...' : 'Programmation...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {sendType === 'immediate' ? (
                  <EnvelopeIcon className="h-4 w-4" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
                {sendType === 'immediate' ? 'Envoyer maintenant' : 'Programmer l\'envoi'}
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 