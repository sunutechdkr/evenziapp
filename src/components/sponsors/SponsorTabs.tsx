"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, EyeSlashIcon, LinkIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, PhotoIcon, UserIcon, TrashIcon } from "@heroicons/react/24/outline";
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
    <div className="space-y-4">
      {/* Section Logo + Description en une ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Logo */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-2 block">Logo</Label>
          <div className="flex items-center gap-2">
            <SponsorLogo 
              src={editedSponsor?.logo || sponsor.logo} 
              alt={sponsor.name}
              size="md"
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
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <PhotoIcon className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="lg:col-span-3">
          <Label className="text-sm font-medium text-gray-500 mb-2 block">Description</Label>
          {isEditing ? (
            <Textarea
              value={editedSponsor?.description || ''}
              onChange={(e) => setEditedSponsor?.({ ...editedSponsor, description: e.target.value })}
              placeholder="Description du sponsor..."
              rows={2}
              className="text-sm"
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              {sponsor.description || 'Aucune description disponible'}
            </p>
          )}
        </div>
      </div>

      {/* Informations générales sur une seule ligne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Emplacement */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-1 block">Emplacement</Label>
          {isEditing ? (
            <Input
              value={editedSponsor?.location || ''}
              onChange={(e) => setEditedSponsor?.({ ...editedSponsor, location: e.target.value })}
              placeholder="Stand A12, Hall 1, etc."
              className="text-sm"
            />
          ) : (
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-700">
                {sponsor.location || 'Non défini'}
              </span>
            </div>
          )}
        </div>

        {/* Niveau de sponsoring */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-1 block">Niveau</Label>
          {isEditing ? (
            <Select 
              value={editedSponsor?.level || sponsor.level}
              onValueChange={(value) => setEditedSponsor?.({ ...editedSponsor, level: value as SponsorLevel })}
            >
              <SelectTrigger className="text-sm">
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
            <Badge className={`${getLevelBadgeClass(sponsor.level)} text-xs`}>
              {getLevelText(sponsor.level)}
            </Badge>
          )}
        </div>
        
        {/* Visibilité */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-1 block">Visibilité</Label>
          <div className="flex items-center gap-2">
            {sponsor.visible ? (
              <span className="flex items-center text-sm text-green-600">
                <EyeIcon className="h-3 w-3 mr-1" />
                Visible
              </span>
            ) : (
              <span className="flex items-center text-sm text-gray-500">
                <EyeSlashIcon className="h-3 w-3 mr-1" />
                Masqué
              </span>
            )}
          </div>
        </div>

        {/* Site Web */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-1 block">Site web</Label>
          {isEditing ? (
            <Input
              value={editedSponsor?.website || ''}
              onChange={(e) => setEditedSponsor?.({ ...editedSponsor, website: e.target.value })}
              placeholder="https://exemple.com"
              type="url"
              className="text-sm"
            />
          ) : sponsor.website ? (
            <a 
              href={ensureProtocol(sponsor.website)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Site web
            </a>
          ) : (
            <span className="text-sm text-gray-500">Non renseigné</span>
          )}
        </div>
      </div>

      {/* Coordonnées compactes */}
      <div>
        <Label className="text-sm font-medium text-gray-500 mb-2 block">Coordonnées</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Colonne 1 */}
          <div className="space-y-2">
            {/* Adresse */}
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Adresse</Label>
              {isEditing ? (
                <Input
                  value={editedSponsor?.address || ''}
                  onChange={(e) => setEditedSponsor?.({ ...editedSponsor, address: e.target.value })}
                  placeholder="Adresse complète..."
                  className="text-sm"
                />
              ) : (
                <span className="text-sm text-gray-700">
                  {sponsor.address || 'Non renseignée'}
                </span>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Téléphone</Label>
              {isEditing ? (
                <Input
                  value={editedSponsor?.phone || ''}
                  onChange={(e) => setEditedSponsor?.({ ...editedSponsor, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                  type="tel"
                  className="text-sm"
                />
              ) : sponsor.phone ? (
                <a href={`tel:${sponsor.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <PhoneIcon className="h-3 w-3" />
                  {sponsor.phone}
                </a>
              ) : (
                <span className="text-sm text-gray-500">Non renseigné</span>
              )}
            </div>
          </div>

          {/* Colonne 2 */}
          <div className="space-y-2">
            {/* Email */}
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Email</Label>
              {isEditing ? (
                <Input
                  value={editedSponsor?.email || ''}
                  onChange={(e) => setEditedSponsor?.({ ...editedSponsor, email: e.target.value })}
                  placeholder="contact@entreprise.com"
                  type="email"
                  className="text-sm"
                />
              ) : sponsor.email ? (
                <a href={`mailto:${sponsor.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <EnvelopeIcon className="h-3 w-3" />
                  {sponsor.email}
                </a>
              ) : (
                <span className="text-sm text-gray-500">Non renseigné</span>
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
                  className="text-sm"
                />
              ) : sponsor.mobile ? (
                <a href={`tel:${sponsor.mobile}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <PhoneIcon className="h-3 w-3" />
                  {sponsor.mobile}
                </a>
              ) : (
                <span className="text-sm text-gray-500">Non renseigné</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Réseaux sociaux compacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-2 block">Réseaux sociaux</Label>
          <div className="space-y-1">
            {/* LinkedIn */}
            {isEditing ? (
              <Input
                value={editedSponsor?.linkedinUrl || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, linkedinUrl: e.target.value })}
                placeholder="LinkedIn URL..."
                type="url"
                className="text-sm"
              />
            ) : sponsor.linkedinUrl ? (
              <a 
                href={ensureProtocol(sponsor.linkedinUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                📊 LinkedIn
              </a>
            ) : null}

            {/* X (Twitter) */}
            {isEditing ? (
              <Input
                value={editedSponsor?.twitterUrl || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, twitterUrl: e.target.value })}
                placeholder="X/Twitter URL..."
                type="url"
                className="text-sm"
              />
            ) : sponsor.twitterUrl ? (
              <a 
                href={ensureProtocol(sponsor.twitterUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                🐦 X (Twitter)
              </a>
            ) : null}

            {/* Facebook */}
            {isEditing ? (
              <Input
                value={editedSponsor?.facebookUrl || ''}
                onChange={(e) => setEditedSponsor?.({ ...editedSponsor, facebookUrl: e.target.value })}
                placeholder="Facebook URL..."
                type="url"
                className="text-sm"
              />
            ) : sponsor.facebookUrl ? (
              <a 
                href={ensureProtocol(sponsor.facebookUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                📘 Facebook
              </a>
            ) : null}

            {!isEditing && !sponsor.linkedinUrl && !sponsor.twitterUrl && !sponsor.facebookUrl && (
              <span className="text-sm text-gray-500">Aucun réseau social renseigné</span>
            )}
          </div>
        </div>

        {/* Date d'ajout */}
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-2 block">Date d&apos;ajout</Label>
          <span className="text-sm text-gray-700">
            {format(typeof sponsor.createdAt === 'string' ? new Date(sponsor.createdAt) : sponsor.createdAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
          </span>
        </div>
      </div>
    </div>
  );
}







// Composant Onglet Membres
export function SponsorMembersTab({ sponsor }: TabProps) {
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAddMember, setShowAddMember] = React.useState(false);
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [filteredParticipants, setFilteredParticipants] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedParticipant, setSelectedParticipant] = React.useState<any>(null);
  const [showParticipantProfile, setShowParticipantProfile] = React.useState(false);

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

  const fetchParticipants = async (query = '') => {
    try {
      const url = query 
        ? `/api/events/${sponsor.eventId}/participants?search=${encodeURIComponent(query)}`
        : `/api/events/${sponsor.eventId}/participants`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
        setFilteredParticipants(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      fetchParticipants(query);
    } else {
      setFilteredParticipants([]);
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
        // Vider la recherche et les résultats
        setSearchQuery('');
        setFilteredParticipants([]);
        setShowAddMember(false);
      } else {
        console.error('Erreur lors de l\'ajout du membre');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
    }
  };

  const viewParticipantProfile = (participant: any) => {
    setSelectedParticipant(participant);
    setShowParticipantProfile(true);
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre du sponsor ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/sponsors/${sponsor.id}/members?participantId=${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recharger la liste des membres
        await fetchMembers();
      } else {
        console.error('Erreur lors de la suppression du membre');
        alert('Erreur lors de la suppression du membre');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      alert('Erreur lors de la suppression du membre');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec barre de recherche */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Membres de l&apos;organisation</h3>
          <p className="text-sm text-gray-500">
            Participants associés à {sponsor.name}
          </p>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#81B441] focus:border-[#81B441] sm:text-sm"
            placeholder="Rechercher un participant à ajouter..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Résultats de recherche */}
      {searchQuery.trim() && filteredParticipants.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Résultats ({filteredParticipants.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="h-8 w-8 bg-[#81B441] rounded-full flex items-center justify-center text-white font-medium text-xs">
                    {participant.firstName?.[0]?.toUpperCase()}{participant.lastName?.[0]?.toUpperCase()}
                  </div>
                  
                  {/* Informations du participant - tout sur une ligne */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {participant.firstName} {participant.lastName}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {participant.type}
                      </span>
                    </div>
                    
                    {/* Une seule ligne pour fonction, entreprise et email */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 truncate">
                      {participant.jobTitle && (
                        <span className="font-medium truncate">
                          {participant.jobTitle}
                        </span>
                      )}
                      {participant.company && (
                        <span className="truncate">
                          📢 {participant.company}
                        </span>
                      )}
                      <span className="truncate">
                        ✉️ {participant.email}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewParticipantProfile(participant)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Voir profil
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addMember(participant.id)}
                    className="bg-[#81B441] hover:bg-[#72a139]"
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message pour recherche vide */}
      {searchQuery.trim() && filteredParticipants.length === 0 && (
        <div className="text-center py-6 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500">
            Aucun participant trouvé pour &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Liste des membres */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#81B441] border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des membres...</p>
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-8 w-8 bg-[#81B441] rounded-full flex items-center justify-center text-white font-medium text-sm">
                {member.firstName?.[0]?.toUpperCase()}{member.lastName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm">{member.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {member.jobTitle && (
                    <span className="truncate">{member.jobTitle}</span>
                  )}
                  {member.jobTitle && member.company && (
                    <span>•</span>
                  )}
                  {member.company && (
                    <span className="truncate">{member.company}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Créer un objet participant pour la modal
                    const participant = {
                      id: member.id,
                      firstName: member.firstName,
                      lastName: member.lastName,
                      email: member.email,
                      jobTitle: member.jobTitle,
                      company: member.company,
                      type: member.type,
                      registrationDate: member.joinedAt,
                      shortCode: '',
                      checkedIn: false
                    };
                    viewParticipantProfile(participant);
                  }}
                >
                  Voir profil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMember(member.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Ajouter un membre</h3>
              <Button
                variant="outline"
                onClick={() => setShowAddMember(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto space-y-3 pr-2">
                {participants.length > 0 ? participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="h-12 w-12 bg-[#81B441] rounded-full flex items-center justify-center text-white font-medium">
                        {participant.firstName?.[0]?.toUpperCase()}{participant.lastName?.[0]?.toUpperCase()}
                      </div>
                      
                      {/* Informations du participant */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {participant.firstName} {participant.lastName}
                          </h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {participant.type}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {participant.jobTitle && (
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {participant.jobTitle}
                            </p>
                          )}
                          {participant.company && (
                            <p className="text-sm text-gray-600 truncate">
                              📢 {participant.company}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 truncate">
                            ✉️ {participant.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewParticipantProfile(participant)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Voir profil
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addMember(participant.id)}
                        className="bg-[#81B441] hover:bg-[#72a139]"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun participant disponible</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddMember(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de profil du participant */}
      {showParticipantProfile && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Profil du participant</h3>
              <Button
                variant="outline"
                onClick={() => setShowParticipantProfile(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* En-tête du profil */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-[#81B441] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedParticipant.firstName?.[0]?.toUpperCase()}{selectedParticipant.lastName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedParticipant.firstName} {selectedParticipant.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedParticipant.jobTitle}</p>
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {selectedParticipant.type}
                  </span>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Contact</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">✉️</span>
                      <span className="text-sm">{selectedParticipant.email}</span>
                    </div>
                    {selectedParticipant.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📞</span>
                        <span className="text-sm">{selectedParticipant.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Entreprise</h5>
                  <div className="space-y-2">
                    {selectedParticipant.company && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🏢</span>
                        <span className="text-sm">{selectedParticipant.company}</span>
                      </div>
                    )}
                    {selectedParticipant.jobTitle && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">💼</span>
                        <span className="text-sm">{selectedParticipant.jobTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations d'inscription */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Inscription</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📅</span>
                    <span className="text-sm">
                      Inscrit le {selectedParticipant.registrationDate ? 
                        format(new Date(selectedParticipant.registrationDate), "dd MMMM yyyy", { locale: fr }) :
                        'Date inconnue'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🎫</span>
                    <span className="text-sm">Code: {selectedParticipant.shortCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={selectedParticipant.checkedIn ? "text-green-500" : "text-gray-500"}>
                      {selectedParticipant.checkedIn ? "✅" : "⏳"}
                    </span>
                    <span className="text-sm">
                      {selectedParticipant.checkedIn ? "Présent à l'événement" : "Pas encore arrivé"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowParticipantProfile(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// Composant Onglet Documents
export function SponsorDocumentsTab({ sponsor, isEditing, editedSponsor, setEditedSponsor }: TabProps) {
  const [uploading, setUploading] = React.useState(false);

  // Définir documents d'abord
  const documents = React.useMemo(() => {
    try {
      // En mode édition, utiliser editedSponsor, sinon utiliser sponsor
      const docsSource = isEditing && editedSponsor?.documents ? editedSponsor.documents : sponsor.documents;
      
      if (typeof docsSource === 'string') {
        return JSON.parse(docsSource);
      } else if (Array.isArray(docsSource)) {
        return docsSource;
      }
      return [];
    } catch (e) {
      console.error('Erreur parsing documents:', e);
      return [];
    }
  }, [sponsor.documents, editedSponsor?.documents, isEditing]);

  const handleDocumentUpload = async (files: FileList) => {
    if (!files.length || !isEditing || !setEditedSponsor) return;

    const currentDocs = documents;
    
    // Limite de 2 documents
    if (currentDocs.length + files.length > 2) {
      alert('Vous ne pouvez télécharger que 2 documents maximum');
      return;
    }

    setUploading(true);
    const newDocs = [...currentDocs];

    try {
      for (const file of Array.from(files)) {
        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Le fichier ${file.name} est trop volumineux (max 5MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'document');

        const response = await fetch('/api/blob/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newDocs.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: data.url,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString()
          });
        }
      }

      setEditedSponsor({
        ...(editedSponsor || sponsor),
        documents: JSON.stringify(newDocs)
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement des documents');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = (docId: string) => {
    if (!isEditing || !setEditedSponsor) return;
    
    const currentDocs = documents;
    const filteredDocs = currentDocs.filter((doc: any) => doc.id !== docId);
    
    setEditedSponsor({
      ...(editedSponsor || sponsor),
      documents: JSON.stringify(filteredDocs)
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Documents</h3>
          <p className="text-sm text-gray-500">
            Documents partagés par {sponsor.name} (max 2 fichiers, 5MB chacun)
          </p>
        </div>
        {isEditing && documents.length < 2 && (
          <div>
            <input
              type="file"
              id="document-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
            />
            <Button
              onClick={() => document.getElementById('document-upload')?.click()}
              disabled={uploading}
              className="bg-[#81B441] hover:bg-[#72a139]"
            >
              {uploading ? 'Téléchargement...' : 'Ajouter document'}
            </Button>
          </div>
        )}
      </div>

      {/* Liste des documents */}
      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <p className="text-sm text-gray-500">
                    {(doc.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  Ouvrir
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDocumentDelete(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
          <p className="text-sm text-gray-500">
            {isEditing ? 'Ajoutez des documents pour ce sponsor' : 'Ce sponsor n\'a pas encore partagé de documents.'}
          </p>
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
