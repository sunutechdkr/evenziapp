"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, EyeSlashIcon, LinkIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, DocumentIcon, PhotoIcon, UserPlusIcon, UserIcon } from "@heroicons/react/24/outline";
import { SponsorLogo } from "@/components/ui/sponsor-logo";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Helper function to ensure URL has proper protocol
const ensureProtocol = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// Types
type SponsorLevel = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTNER' | 'MEDIA' | 'OTHER';

interface SponsorTabData {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  level: SponsorLevel;
  visible: boolean;
  eventId: string;
  location?: string;
  address?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  documents?: { name: string; size: string; type: string }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface TabProps {
  sponsor: SponsorTabData;
  isEditing: boolean;
  editedSponsor?: Partial<SponsorTabData>;
  setEditedSponsor?: (sponsor: Partial<SponsorTabData>) => void;
}

// Utilitaires
const getLevelText = (level: SponsorLevel) => {
  const levels = {
    PLATINUM: 'Platine',
    GOLD: 'Or',
    SILVER: 'Argent', 
    BRONZE: 'Bronze',
    PARTNER: 'Partenaire',
    MEDIA: 'Média',
    OTHER: 'Autre'
  };
  return levels[level] || level;
};

const getLevelBadgeClass = (level: SponsorLevel) => {
  const classes = {
    PLATINUM: 'bg-gray-100 text-gray-800 border-gray-300',
    GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    SILVER: 'bg-gray-100 text-gray-600 border-gray-300',
    BRONZE: 'bg-orange-100 text-orange-800 border-orange-300',
    PARTNER: 'bg-blue-100 text-blue-800 border-blue-300',
    MEDIA: 'bg-purple-100 text-purple-800 border-purple-300',
    OTHER: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return classes[level] || classes.OTHER;
};

// Composant Onglet Détails
export function SponsorDetailsTab({ sponsor, isEditing, editedSponsor, setEditedSponsor }: TabProps) {
  const handleLogoUpload = async (file: File) => {
    if (!setEditedSponsor) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'sponsor');

      const response = await fetch('/api/blob/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l\'upload');

      const data = await response.json();
      setEditedSponsor({ ...editedSponsor, logo: data.url });
    } catch (error) {
      console.error('Erreur upload logo:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo du sponsor */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-2 block">Logo</Label>
        <div className="flex items-center gap-4">
          <SponsorLogo 
            src={editedSponsor?.logo || sponsor.logo} 
            alt={sponsor.name}
            size="lg"
          />
          {isEditing && (
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('logo-upload')?.click()}
                className="h-8"
              >
                <PhotoIcon className="h-4 w-4 mr-2" />
                Changer logo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-2 block">Description</Label>
        {isEditing ? (
          <Textarea
            value={editedSponsor?.description || ''}
            onChange={(e) => setEditedSponsor?.({ ...editedSponsor, description: e.target.value })}
            placeholder="Description du sponsor..."
            className="min-h-[100px]"
          />
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {sponsor.description || 'Aucune description disponible'}
            </p>
          </div>
        )}
      </div>

      {/* Emplacement */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-2 block">Emplacement</Label>
        {isEditing ? (
          <Input
            value={editedSponsor?.location || ''}
            onChange={(e) => setEditedSponsor?.({ ...editedSponsor, location: e.target.value })}
            placeholder="Stand A12, Hall 1, etc."
          />
        ) : (
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">
              {sponsor.location || 'Emplacement non défini'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Niveau de sponsoring */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-2 block">Niveau de sponsoring</Label>
          {isEditing ? (
            <Select 
              value={editedSponsor?.level || sponsor.level}
              onValueChange={(value) => setEditedSponsor?.({ ...editedSponsor, level: value as SponsorLevel })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLATINUM">Platine</SelectItem>
                <SelectItem value="GOLD">Or</SelectItem>
                <SelectItem value="SILVER">Argent</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="PARTNER">Partenaire</SelectItem>
                <SelectItem value="MEDIA">Média</SelectItem>
                <SelectItem value="OTHER">Autre</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={`${getLevelBadgeClass(sponsor.level)}`}>
              {getLevelText(sponsor.level)}
            </Badge>
          )}
        </div>
        
        {/* Visibilité */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-2 block">Visibilité</Label>
          <div className="flex items-center gap-2">
            {sponsor.visible ? (
              <span className="flex items-center text-green-600">
                <EyeIcon className="h-4 w-4 mr-2" />
                Visible publiquement
              </span>
            ) : (
              <span className="flex items-center text-gray-500">
                <EyeSlashIcon className="h-4 w-4 mr-2" />
                Non visible
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Site Web */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-2 block">Site web</Label>
        {isEditing ? (
          <Input
            value={editedSponsor?.website || ''}
            onChange={(e) => setEditedSponsor?.({ ...editedSponsor, website: e.target.value })}
            placeholder="https://exemple.com"
            type="url"
          />
        ) : sponsor.website ? (
          <a 
            href={ensureProtocol(sponsor.website)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {sponsor.website}
          </a>
        ) : (
          <span className="text-gray-500">Aucun site web renseigné</span>
        )}
      </div>

      {/* Coordonnées */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-3 block">Coordonnées</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Adresse */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Adresse</Label>
            {isEditing ? (
              <Textarea
                value={editedSponsor?.address || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, address: e.target.value })}
                placeholder="Adresse complète..."
                rows={2}
              />
            ) : (
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-700 text-sm">
                  {sponsor.address || 'Non renseignée'}
                </span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Email</Label>
            {isEditing ? (
              <Input
                value={editedSponsor?.email || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, email: e.target.value })}
                placeholder="contact@entreprise.com"
                type="email"
              />
            ) : sponsor.email ? (
              <a href={`mailto:${sponsor.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                <EnvelopeIcon className="h-4 w-4" />
                {sponsor.email}
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Non renseigné</span>
            )}
          </div>

          {/* Téléphone fixe */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Téléphone</Label>
            {isEditing ? (
              <Input
                value={editedSponsor?.phone || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
                type="tel"
              />
            ) : sponsor.phone ? (
              <a href={`tel:${sponsor.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                <PhoneIcon className="h-4 w-4" />
                {sponsor.phone}
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Non renseigné</span>
            )}
          </div>

          {/* Mobile */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Mobile</Label>
            {isEditing ? (
              <Input
                value={editedSponsor?.mobile || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, mobile: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                type="tel"
              />
            ) : sponsor.mobile ? (
              <a href={`tel:${sponsor.mobile}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                <PhoneIcon className="h-4 w-4" />
                {sponsor.mobile}
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Non renseigné</span>
            )}
          </div>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-3 block">Réseaux sociaux</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LinkedIn */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">LinkedIn</Label>
            {isEditing ? (
              <Input
                value={editedSponsor?.linkedinUrl || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                type="url"
              />
            ) : sponsor.linkedinUrl ? (
              <a 
                href={ensureProtocol(sponsor.linkedinUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <span className="w-4 h-4 mr-2">📊</span>
                LinkedIn
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Non renseigné</span>
            )}
          </div>

          {/* X (Twitter) */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">X (Twitter)</Label>
            {isEditing ? (
              <Input
                value={editedSponsor?.twitterUrl || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, twitterUrl: e.target.value })}
                placeholder="https://x.com/username"
                type="url"
              />
            ) : sponsor.twitterUrl ? (
              <a 
                href={ensureProtocol(sponsor.twitterUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <span className="w-4 h-4 mr-2">🐦</span>
                X (Twitter)
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Non renseigné</span>
            )}
          </div>

          {/* Facebook */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Facebook</Label>
            {isEditing ? (
              <Input
                value={editedSponsor?.facebookUrl || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/page"
                type="url"
              />
            ) : sponsor.facebookUrl ? (
              <a 
                href={ensureProtocol(sponsor.facebookUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <span className="w-4 h-4 mr-2">📘</span>
                Facebook
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Non renseigné</span>
            )}
          </div>
        </div>
      </div>

      {/* Date d'ajout */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-2 block">Date d&apos;ajout</Label>
        <span className="text-gray-700">
          {format(typeof sponsor.createdAt === 'string' ? new Date(sponsor.createdAt) : sponsor.createdAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
        </span>
      </div>
    </div>
  );
}





// Composant Onglet Documents
export function SponsorDocumentsTab({ sponsor, isEditing, editedSponsor, setEditedSponsor }: TabProps) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const documents = (editedSponsor?.documents as any[]) || (sponsor.documents as any[]) || [];

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    // Vérifier le nombre maximum de documents
    if (documents.length + files.length > 2) {
      alert('Vous ne pouvez charger que 2 documents maximum par sponsor.');
      return;
    }

    // Vérifier la taille des fichiers (5Mo max)
    const maxSize = 5 * 1024 * 1024; // 5Mo en bytes
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        alert(`Le fichier "${files[i].name}" est trop volumineux. Taille maximum : 5Mo`);
        return;
      }
    }

    setUploading(true);
    const newDocuments = [...documents];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'document');

        const response = await fetch('/api/blob/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newDocuments.push({
            name: file.name,
            url: data.url,
            size: formatFileSize(file.size),
            type: file.type,
            uploadedAt: new Date().toISOString()
          });
        } else {
          throw new Error(`Erreur lors du téléchargement de ${file.name}`);
        }
      }

      if (setEditedSponsor) {
        setEditedSponsor({ ...editedSponsor, documents: newDocuments });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement des documents');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    if (setEditedSponsor) {
      setEditedSponsor({ ...editedSponsor, documents: newDocuments });
    }
  };

  return (
    <div className="space-y-6">
      {/* Documents existants */}
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
          <p className="text-gray-500">Les documents joints par le sponsor apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <DocumentIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.size} • {doc.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {doc.url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    Ouvrir
                  </Button>
                )}
                {isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Zone d'upload en mode édition */}
      {isEditing && documents.length < 2 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <DocumentIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Téléchargez vos documents (max 2 fichiers, 5Mo chacun)
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Formats acceptés : PDF, DOC, DOCX, JPG, PNG
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Téléchargement...' : 'Choisir des fichiers'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Onglet Membres
export function SponsorMembersTab({ sponsor }: TabProps) {
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAddMember, setShowAddMember] = React.useState(false);
  const [participants, setParticipants] = React.useState<any[]>([]);

  const fetchMembers = async () => {
    if (!sponsor.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events/sponsors/${sponsor.id}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        console.error('Erreur API membres:', response.status, response.statusText);
        setMembers([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/events/${sponsor.eventId}/participants`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, [sponsor.id]);

  const addMember = async (participantId: string) => {
    try {
      const response = await fetch(`/api/events/sponsors/${sponsor.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId }),
      });

      if (response.ok) {
        // Recharger la liste des membres
        await fetchMembers();
        setShowAddMember(false);
      } else {
        console.error('Erreur lors de l\'ajout du membre');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Membres de l&apos;organisation</h3>
          <p className="text-sm text-gray-500">
            Participants associés à {sponsor.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddMember(true);
            fetchParticipants();
          }}
          className="bg-[#81B441] hover:bg-[#72a139]"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Ajouter un Membre
        </Button>
      </div>

      {/* Liste des membres */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#81B441] border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des membres...</p>
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-500">{member.jobTitle}</p>
                <p className="text-sm text-gray-400">{member.company}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Voir profil:', member.id)}
              >
                Voir profil
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre</h3>
          <p className="text-sm text-gray-500 mb-4">
            Aucun participant n&apos;est encore associé à ce sponsor.
          </p>
        </div>
      )}

      {/* Modal pour ajouter un membre */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Ajouter un membre</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-gray-500">{participant.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addMember(participant.id)}
                  >
                    Ajouter
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddMember(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Onglet Sessions
export function SponsorSessionsTab({ sponsor }: TabProps) {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchSessions = async () => {
    if (!sponsor.eventId) return;
    setLoading(true);
    try {
      // Rechercher les sessions où le sponsor est mentionné ou participe
      const response = await fetch(`/api/events/${sponsor.eventId}/sessions?sponsor=${encodeURIComponent(sponsor.name)}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Erreur API sessions:', response.status, response.statusText);
        setSessions([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSessions();
  }, [sponsor.eventId, sponsor.name]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Sessions du sponsor</h3>
        <p className="text-sm text-gray-500">
          Sessions animées ou sponsorisées par {sponsor.name}
        </p>
      </div>

      {/* Liste des sessions */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#81B441] border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des sessions...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>🗓️ {session.start_date ? format(new Date(session.start_date), "dd MMM yyyy", { locale: fr }) : 'Date non définie'}</span>
                    <span>⏰ {session.start_time || '00:00'} - {session.end_time || '00:00'}</span>
                    <span>📍 {session.location || 'Lieu non défini'}</span>
                  </div>
                  {session.speakers && session.speakers.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        Intervenant(s): {session.speakers.map((s: any) => `${s.firstName} ${s.lastName}`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Voir session:', session.id)}
                >
                  Voir détails
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session</h3>
          <p className="text-sm text-gray-500">
            Ce sponsor n&apos;est associé à aucune session pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
