"use client";

import { useState, useEffect } from "react";
import { 
  UserPlusIcon, 
  ChevronLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  PhotoIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { toast } from "react-hot-toast";

// Types pour les sponsors
type SponsorLevel = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTNER' | 'MEDIA' | 'OTHER';

type Sponsor = {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  level: SponsorLevel;
  visible: boolean;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Type d'événement
type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  banner?: string;
  slug?: string;
};

export default function EventSponsorsPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sponsorToEdit, setSponsorToEdit] = useState<Sponsor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    description: '',
    website: '',
    level: 'GOLD' as SponsorLevel,
    visible: true
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const eventId = params.id;

  // Fetch data on load
  useEffect(() => {
    fetchEventDetails();
    fetchSponsors();
  }, []);

  /**
   * Récupère les détails de l'événement
   */
  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des détails de l\'événement');
      
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les détails de l\'événement');
    }
  };

  /**
   * Récupère la liste des sponsors
   */
  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/sponsors`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des sponsors');
      
      const data = await response.json();
      setSponsors(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les sponsors');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère l'ouverture du modal d'ajout
   */
  const openAddModal = () => {
    setNewSponsor({
      name: '',
      description: '',
      website: '',
      level: 'GOLD',
      visible: true
    });
    setLogoFile(null);
    setLogoPreview('');
    setShowAddModal(true);
  };

  /**
   * Ferme le modal d'ajout
   */
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  /**
   * Gère les changements dans le formulaire d'ajout de sponsor
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'visible' && type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setNewSponsor({
        ...newSponsor,
        [name]: target.checked
      });
    } else {
      setNewSponsor({
        ...newSponsor,
        [name]: value
      });
    }
  };

  /**
   * Gère l'upload du logo
   */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }
    
    // Vérifier la taille du fichier (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('L\'image est trop volumineuse. Taille maximale: 2MB');
      return;
    }
    
    setLogoFile(file);
    
    // Créer une URL pour l'aperçu
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  /**
   * Ajoute un nouveau sponsor
   */
  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', newSponsor.name);
      formData.append('description', newSponsor.description || '');
      formData.append('website', newSponsor.website || '');
      formData.append('level', newSponsor.level);
      formData.append('visible', String(newSponsor.visible));
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      const response = await fetch(`/api/events/${eventId}/sponsors`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'ajout du sponsor');
      
      toast.success('Sponsor ajouté avec succès');
      closeAddModal();
      fetchSponsors();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible d\'ajouter le sponsor');
    }
  };

  /**
   * Ouvre le modal de modification
   */
  const handleEditSponsor = (sponsor: Sponsor) => {
    setSponsorToEdit(sponsor);
    setNewSponsor({
      name: sponsor.name,
      description: sponsor.description || '',
      website: sponsor.website || '',
      level: sponsor.level,
      visible: sponsor.visible
    });
    setLogoPreview(sponsor.logo || '');
    setShowEditModal(true);
  };

  /**
   * Ferme le modal de modification
   */
  const closeEditModal = () => {
    setShowEditModal(false);
    setSponsorToEdit(null);
  };

  /**
   * Met à jour un sponsor existant
   */
  const handleUpdateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sponsorToEdit) return;
    
    try {
      const formData = new FormData();
      formData.append('name', newSponsor.name);
      formData.append('description', newSponsor.description || '');
      formData.append('website', newSponsor.website || '');
      formData.append('level', newSponsor.level);
      formData.append('visible', String(newSponsor.visible));
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      const response = await fetch(`/api/events/${eventId}/sponsors/${sponsorToEdit.id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du sponsor');
      
      toast.success('Sponsor mis à jour avec succès');
      closeEditModal();
      fetchSponsors();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de mettre à jour le sponsor');
    }
  };
  
  /**
   * Confirme la suppression d'un sponsor
   */
  const handleDeletePrompt = (sponsor: Sponsor) => {
    setSponsorToDelete(sponsor);
    setShowDeleteConfirm(true);
  };
  
  /**
   * Ferme la modale de confirmation de suppression
   */
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setSponsorToDelete(null);
  };
  
  /**
   * Supprime un sponsor
   */
  const handleDeleteSponsor = async () => {
    if (!sponsorToDelete) return;
    
    const sponsorId = sponsorToDelete.id;
    
    // Ajouter l'état de traitement pour ce sponsor
    setProcessing(prev => ({ ...prev, [sponsorId]: true }));
    
    try {
      const response = await fetch(`/api/events/${eventId}/sponsors/${sponsorId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression du sponsor');
      
      toast.success('Sponsor supprimé avec succès');
      closeDeleteConfirm();
      fetchSponsors();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de supprimer le sponsor');
    } finally {
      setProcessing(prev => ({ ...prev, [sponsorId]: false }));
    }
  };
  
  /**
   * Retourne la classe CSS pour le badge de niveau
   */
  const getLevelBadgeClass = (level: SponsorLevel) => {
    switch(level) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'BRONZE': return 'bg-amber-100 text-amber-800';
      case 'PARTNER': return 'bg-blue-100 text-blue-800';
      case 'MEDIA': return 'bg-green-100 text-green-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  /**
   * Retourne le texte pour chaque niveau
   */
  const getLevelText = (level: SponsorLevel) => {
    switch(level) {
      case 'PLATINUM': return 'Platinum';
      case 'GOLD': return 'Gold';
      case 'SILVER': return 'Silver';
      case 'BRONZE': return 'Bronze';
      case 'PARTNER': return 'Partenaire';
      case 'MEDIA': return 'Media';
      case 'OTHER': return 'Autre';
      default: return level;
    }
  };
  
  // Filtrer les sponsors en fonction de la recherche et du filtre de niveau
  const filteredSponsors = sponsors.filter(sponsor => 
    sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (levelFilter ? sponsor.level === levelFilter : true)
  );

  /**
   * Rafraîchit la liste des sponsors
   */
  const handleRefresh = () => {
    toast.loading('Actualisation des exposants...', { id: 'refresh-toast' });
    fetchSponsors().then(() => {
      toast.success('Liste des exposants actualisée', { id: 'refresh-toast' });
    });
  };

  /**
   * Exporte les sponsors au format Excel
   */
  const handleExportSponsors = () => {
    // Préparation de l'URL de l'API d'exportation
    const exportUrl = `/api/events/${eventId}/export/sponsors`;
    
    // Afficher un loading toast
    toast.loading('Exportation des exposants en cours...', { id: 'export-toast' });

    // Ouvrir l'URL dans un nouvel onglet ou télécharger directement le fichier
    const downloadLink = document.createElement('a');
    downloadLink.href = exportUrl;
    downloadLink.target = '_blank';
    downloadLink.download = 'exposants.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Mettre à jour le toast pour indiquer le succès
    setTimeout(() => {
      toast.success('Les exposants ont été exportés avec succès', { id: 'export-toast' });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EventSidebar eventId={eventId} />
      
      <main className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center mb-1">
                <Link 
                  href={`/dashboard/events/${eventId}`}
                  className="inline-flex items-center mr-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-1" />
                  Retour à l&apos;événement
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sponsors et Partenaires</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les sponsors et partenaires pour votre événement {event?.name || ''}
              </p>
            </div>
            
            {/* Actions */}
            <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Actualiser
              </button>

              <button
                onClick={handleExportSponsors}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Exporter Excel
              </button>
              
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Ajouter un exposant
              </button>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un sponsor..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-[#81B441] focus:border-[#81B441] sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sm:w-48">
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#81B441] focus:border-[#81B441] sm:text-sm rounded-md"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="">Tous les niveaux</option>
                  <option value="PLATINUM">Platinum</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                  <option value="PARTNER">Partenaire</option>
                  <option value="MEDIA">Media</option>
                  <option value="OTHER">Autre</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sponsors grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
              <p className="ml-3 text-gray-500">Chargement des sponsors...</p>
            </div>
          ) : sponsors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSponsors.map(sponsor => (
                <div 
                  key={sponsor.id} 
                  className={`relative bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!sponsor.visible ? 'opacity-60' : ''}`}
                >
                  {/* Sponsor Logo */}
                  <div className="h-40 bg-gray-50 flex items-center justify-center p-4 border-b">
                    {sponsor.logo ? (
                      <img 
                        src={sponsor.logo} 
                        alt={sponsor.name} 
                        className="max-h-32 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <PhotoIcon className="h-12 w-12" />
                        <span className="text-xs mt-2">Pas de logo</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Level Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeClass(sponsor.level)}`}>
                      {getLevelText(sponsor.level)}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{sponsor.name}</h3>
                    
                    {sponsor.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {sponsor.description}
                      </p>
                    )}
                    
                    {/* Website link */}
                    {sponsor.website && (
                      <a 
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-sm text-[#81B441] hover:text-[#72a139]"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Visiter le site web
                      </a>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditSponsor(sponsor)}
                        className="inline-flex items-center p-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(sponsor)}
                        className="inline-flex items-center p-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:text-red-700 bg-white hover:bg-gray-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {!sponsor.visible && <span className="italic">Non visible</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UserPlusIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucun sponsor</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n&apos;avez pas encore ajouté de sponsors à cet événement.
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Ajouter votre premier sponsor
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Modal d'ajout de sponsor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white">
              <h2 className="text-xl font-bold">Ajouter un sponsor</h2>
              <button 
                onClick={closeAddModal}
                className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              <form onSubmit={handleAddSponsor}>
                {/* Logo upload */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Logo
                    </label>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#81B441] transition-colors"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    {logoPreview ? (
                      <div className="relative w-full h-32 flex items-center justify-center">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoFile(null);
                            setLogoPreview('');
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Cliquez pour ajouter un logo</span>
                      </>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Formats recommandés: PNG, JPG. Max 2 MB.</p>
                </div>
                
                {/* Nom */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="text-red-500">*</span> Nom du sponsor
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    value={newSponsor.name}
                    onChange={handleInputChange}
                    placeholder="Nom de l'entreprise ou de l'organisation"
                  />
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    value={newSponsor.description}
                    onChange={handleInputChange}
                    placeholder="Description du sponsor (optionnel)"
                  />
                </div>
                
                {/* Site web */}
                <div className="mb-4">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                      value={newSponsor.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                {/* Niveau de sponsor */}
                <div className="mb-4">
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="text-red-500">*</span> Niveau de sponsor
                  </label>
                  <select
                    id="level"
                    name="level"
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    value={newSponsor.level}
                    onChange={handleInputChange}
                  >
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="BRONZE">Bronze</option>
                    <option value="PARTNER">Partner</option>
                    <option value="MEDIA">Media</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                {/* Visibilité */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="visible"
                    name="visible"
                    className="h-4 w-4 text-[#81B441] focus:ring-[#81B441] border-gray-300 rounded"
                    checked={newSponsor.visible}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
                    Afficher publiquement ce sponsor
                  </label>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#81B441] hover:bg-[#72a137] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal d'édition de sponsor */}
      {showEditModal && sponsorToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white">
              <h2 className="text-xl font-bold">Modifier un sponsor</h2>
              <button 
                onClick={closeEditModal}
                className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              <form onSubmit={handleUpdateSponsor}>
                {/* Logo upload */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Logo
                    </label>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#81B441] transition-colors"
                    onClick={() => document.getElementById('logo-upload-edit')?.click()}
                  >
                    {logoPreview ? (
                      <div className="relative w-full h-32 flex items-center justify-center">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoFile(null);
                            setLogoPreview('');
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Cliquez pour ajouter un logo</span>
                      </>
                    )}
                    <input
                      id="logo-upload-edit"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Formats recommandés: PNG, JPG. Max 2 MB.</p>
                </div>
                
                {/* Nom */}
                <div className="mb-4">
                  <label htmlFor="name-edit" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="text-red-500">*</span> Nom du sponsor
                  </label>
                  <input
                    type="text"
                    id="name-edit"
                    name="name"
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    value={newSponsor.name}
                    onChange={handleInputChange}
                    placeholder="Nom de l'entreprise ou de l'organisation"
                  />
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description-edit" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description-edit"
                    name="description"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    value={newSponsor.description}
                    onChange={handleInputChange}
                    placeholder="Description du sponsor (optionnel)"
                  />
                </div>
                
                {/* Site web */}
                <div className="mb-4">
                  <label htmlFor="website-edit" className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="website-edit"
                      name="website"
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                      value={newSponsor.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                {/* Niveau de sponsor */}
                <div className="mb-4">
                  <label htmlFor="level-edit" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="text-red-500">*</span> Niveau de sponsor
                  </label>
                  <select
                    id="level-edit"
                    name="level"
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    value={newSponsor.level}
                    onChange={handleInputChange}
                  >
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="BRONZE">Bronze</option>
                    <option value="PARTNER">Partner</option>
                    <option value="MEDIA">Media</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                {/* Visibilité */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="visible-edit"
                    name="visible"
                    className="h-4 w-4 text-[#81B441] focus:ring-[#81B441] border-gray-300 rounded"
                    checked={newSponsor.visible}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="visible-edit" className="ml-2 block text-sm text-gray-700">
                    Afficher publiquement ce sponsor
                  </label>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#81B441] hover:bg-[#72a137] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && sponsorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 rounded-full p-3">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
                Supprimer ce sponsor ?
              </h3>
              <p className="text-center text-gray-500 mb-6">
                Êtes-vous sûr de vouloir supprimer le sponsor &quot;{sponsorToDelete.name}&quot; ? Cette action est irréversible.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={processing[sponsorToDelete.id]}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteSponsor}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                  disabled={processing[sponsorToDelete.id]}
                >
                  {processing[sponsorToDelete.id] ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    <>Supprimer</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 