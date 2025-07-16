"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  UserPlusIcon, 
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types pour les sponsors
type SponsorLevel = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTNER' | 'MEDIA' | 'OTHER';

type SponsorStats = {
  members: number;
  sessions: number;
  documents: number;
  appointments: number;
  products: number;
};

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
  stats?: SponsorStats;
};

type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  banner?: string;
  slug?: string;
};

export default function EventSponsorsPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<string>("");
  const [event, setEvent] = useState<Event | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const router = useRouter();
  const sponsorsPerPage = 10;

  // Extraction des paramètres
  useEffect(() => {
    const extractParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    extractParams();
  }, [params]);

  // Fetch data on load
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchSponsors();
    }
  }, [eventId]);

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
      const formattedSponsors = data.map((sponsor: {
        id: string;
        name: string;
        description?: string;
        logo?: string;
        website?: string;
        level: SponsorLevel;
        visible: boolean;
        eventId: string;
        createdAt: string;
        updatedAt: string;
      }) => ({
        ...sponsor,
        createdAt: new Date(sponsor.createdAt),
        updatedAt: new Date(sponsor.updatedAt)
      }));
      setSponsors(formattedSponsors);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les sponsors');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retourne la classe CSS pour le badge de niveau
   */
  const getLevelBadgeClass = (level: SponsorLevel) => {
    switch(level) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'SILVER': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'BRONZE': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'PARTNER': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'MEDIA': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'OTHER': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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
    toast.loading('Actualisation des sponsors...', { id: 'refresh-toast' });
    fetchSponsors().then(() => {
      toast.success('Liste des sponsors actualisée', { id: 'refresh-toast' });
    });
  };

  /**
   * Exporte les sponsors au format Excel
   */
  const handleExportSponsors = () => {
    const exportUrl = `/api/events/${eventId}/export/sponsors`;
    
    toast.loading('Exportation des sponsors en cours...', { id: 'export-toast' });

    const downloadLink = document.createElement('a');
    downloadLink.href = exportUrl;
    downloadLink.target = '_blank';
    downloadLink.download = 'sponsors.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    setTimeout(() => {
      toast.success('Les sponsors ont été exportés avec succès', { id: 'export-toast' });
    }, 1000);
  };

  const openSponsorDetails = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setActiveTab("details");
    setShowSponsorModal(true);
  };

  const handleDeleteSponsor = async () => {
    if (!sponsorToDelete) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/sponsors/${sponsorToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression du sponsor');
      
      toast.success('Sponsor supprimé avec succès');
      setDeleteConfirmOpen(false);
      setSponsorToDelete(null);
      fetchSponsors();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de supprimer le sponsor');
    } finally {
      setProcessing(false);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EventSidebar eventId={eventId} />
        <div className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#81B441] border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sponsors-container bg-[#f9fafb] min-h-screen">
      <EventSidebar eventId={eventId} activeTab="sponsors" />
      
      <div className="ml-0 md:ml-64 transition-all duration-300 p-4 md:p-6">
        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              Sponsors et Partenaires {event?.name && <span className="text-[#81B441]">• {event.name}</span>}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les sponsors et partenaires pour votre événement
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:text-[#81B441] hover:border-[#81B441]"
              onClick={handleRefresh}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:text-[#81B441] hover:border-[#81B441]"
              onClick={handleExportSponsors}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Exporter Excel
            </Button>
            
            <Link
              href={`/dashboard/events/${eventId}/sponsors/edit`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un sponsor
            </Link>
          </div>
        </div>
        
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total des sponsors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sponsors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Sponsors visibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sponsors.filter(s => s.visible).length}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({sponsors.length > 0 ? `${Math.round((sponsors.filter(s => s.visible).length / sponsors.length) * 100)}%` : '0%'})
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Platinum/Gold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sponsors.filter(s => s.level === 'PLATINUM' || s.level === 'GOLD').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Partenaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sponsors.filter(s => s.level === 'PARTNER').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options de vue et recherche */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un sponsor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            {/* Filtre par niveau */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
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
          </div>
        </div>

        {/* Tableau des sponsors */}
        {sponsors.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5" />
                Sponsors et Partenaires ({filteredSponsors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px] sticky left-0 bg-white z-10">Logo</TableHead>
                        <TableHead className="min-w-[200px] sticky left-[80px] bg-white z-10">Sponsor</TableHead>
                        <TableHead className="w-[120px]">Niveau</TableHead>
                        <TableHead className="w-[100px]">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            Membres
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px]">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            Sessions
                          </div>
                        </TableHead>
                        <TableHead className="w-[110px]">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Documents
                          </div>
                        </TableHead>
                        <TableHead className="w-[80px]">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            RDV
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px]">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Produits
                          </div>
                        </TableHead>
                        <TableHead className="min-w-[200px]">Site web</TableHead>
                        <TableHead className="w-[100px]">Statut</TableHead>
                        <TableHead className="w-[140px]">Date d'ajout</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSponsors.map((sponsor) => (
                        <TableRow 
                          key={sponsor.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => openSponsorDetails(sponsor)}
                        >
                          {/* Logo */}
                          <TableCell className="py-4 sticky left-0 bg-white z-10">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                              {sponsor.logo ? (
                                <img 
                                  src={sponsor.logo} 
                                  alt={sponsor.name}
                                  className="w-10 h-10 object-contain rounded"
                                />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <PhotoIcon className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          {/* Informations sponsor */}
                          <TableCell className="py-4 sticky left-[80px] bg-white z-10">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {sponsor.name}
                              </div>
                              {sponsor.description && (
                                <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                                  {sponsor.description}
                                </div>
                              )}
                              {!sponsor.logo && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/events/${eventId}/sponsors/edit?id=${sponsor.id}`);
                                  }}
                                  className="text-xs text-[#81B441] hover:text-[#72a139] underline"
                                >
                                  Ajouter un logo
                                </button>
                              )}
                            </div>
                          </TableCell>
                          
                          {/* Niveau */}
                          <TableCell className="py-4">
                            <Badge className={`${getLevelBadgeClass(sponsor.level)} text-xs`}>
                              {getLevelText(sponsor.level)}
                            </Badge>
                          </TableCell>
                          
                          {/* Membres */}
                          <TableCell className="py-4">
                            <span className="font-medium text-gray-900">{sponsor.stats?.members || 0}</span>
                          </TableCell>
                          
                          {/* Sessions */}
                          <TableCell className="py-4">
                            <span className="font-medium text-gray-900">{sponsor.stats?.sessions || 0}</span>
                          </TableCell>
                          
                          {/* Documents */}
                          <TableCell className="py-4">
                            <span className="font-medium text-gray-900">{sponsor.stats?.documents || 0}</span>
                          </TableCell>
                          
                          {/* RDV */}
                          <TableCell className="py-4">
                            <span className="font-medium text-gray-900">{sponsor.stats?.appointments || 0}</span>
                          </TableCell>
                          
                          {/* Produits */}
                          <TableCell className="py-4">
                            <span className="font-medium text-gray-900">{sponsor.stats?.products || 0}</span>
                          </TableCell>
                          
                          {/* Site web */}
                          <TableCell className="py-4">
                            {sponsor.website ? (
                              <div className="flex items-center gap-2">
                                <GlobeAltIcon className="h-4 w-4 text-blue-600" />
                                <a
                                  href={sponsor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-[150px]"
                                >
                                  {sponsor.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          
                          {/* Statut */}
                          <TableCell className="py-4">
                            {sponsor.visible ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                Visible
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600">
                                <EyeSlashIcon className="h-3 w-3 mr-1" />
                                Masqué
                              </Badge>
                            )}
                          </TableCell>
                          
                          {/* Date d'ajout */}
                          <TableCell className="py-4">
                            <span className="text-sm text-gray-500">
                              {format(sponsor.createdAt, "dd MMM yyyy", { locale: fr })}
                            </span>
                          </TableCell>
                          
                          {/* Actions */}
                          <TableCell className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/events/${eventId}/sponsors/edit?id=${sponsor.id}`);
                                }}
                                className="h-8 w-8 p-0"
                                title="Modifier le sponsor"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openSponsorDetails(sponsor)}>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Voir les détails
                                  </DropdownMenuItem>
                                  {sponsor.website && (
                                    <DropdownMenuItem onClick={() => window.open(sponsor.website, '_blank')}>
                                      <LinkIcon className="h-4 w-4 mr-2" />
                                      Visiter le site
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSponsorToDelete(sponsor);
                                      setDeleteConfirmOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* État vide */
          <Card className="p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserPlusIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucun sponsor</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Vous n&apos;avez pas encore ajouté de sponsors à cet événement. Les sponsors apparaîtront ici.
            </p>
            <Link
              href={`/dashboard/events/${eventId}/sponsors/edit`}
              className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#81B441] hover:bg-[#72a139] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441]"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Ajouter votre premier sponsor
            </Link>
          </Card>
        )}
      </div>

      {/* Modal des détails du sponsor */}
      <Dialog open={showSponsorModal} onOpenChange={setShowSponsorModal}>
        <DialogContent className="max-w-4xl h-[600px] flex flex-col">
          {selectedSponsor && (
            <div className="flex flex-col h-full">
              {/* En-tête fixe */}
              <div className="flex-shrink-0 pb-4 border-b">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                    {selectedSponsor.logo ? (
                      <img 
                        src={selectedSponsor.logo} 
                        alt={selectedSponsor.name}
                        className="w-14 h-14 object-contain rounded"
                      />
                    ) : (
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedSponsor.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <Badge className={`text-xs ${getLevelBadgeClass(selectedSponsor.level)}`}>
                        {getLevelText(selectedSponsor.level)}
                      </Badge>
                      {selectedSponsor.visible ? (
                        <Badge className="bg-[#EAF9D7] text-gray-800 hover:bg-[#EAF9D7] border-[#EAF9D7]">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge className="bg-[#EAF9D7] text-gray-800 hover:bg-[#EAF9D7] border-[#EAF9D7]" variant="outline">
                          <EyeSlashIcon className="h-3 w-3 mr-1" />
                          Masqué
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Onglets */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="members">Membres</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="appointments">RDV</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="timeline">Historique</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <TabsContent value="details" className="mt-6 space-y-4">
                      {selectedSponsor.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{selectedSponsor.description}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Niveau de sponsoring</h4>
                          <Badge className={`${getLevelBadgeClass(selectedSponsor.level)}`}>
                            {getLevelText(selectedSponsor.level)}
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Visibilité</h4>
                          <p className="flex items-center gap-2">
                            {selectedSponsor.visible ? (
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
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Date d&apos;ajout</h4>
                          <p className="flex items-center gap-2">
                            <span className="text-gray-700">
                              {format(selectedSponsor.createdAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            router.push(`/dashboard/events/${eventId}/sponsors/edit?id=${selectedSponsor.id}`);
                            setShowSponsorModal(false);
                          }}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        {selectedSponsor.website && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(selectedSponsor.website, '_blank')}
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Visiter le site
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSponsorToDelete(selectedSponsor);
                            setDeleteConfirmOpen(true);
                            setShowSponsorModal(false);
                          }}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="members" className="mt-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                        Fonctionnalité à venir : Liste détaillée des membres
                      </div>
                    </TabsContent>

                    <TabsContent value="sessions" className="mt-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                        Fonctionnalité à venir : Liste détaillée des sessions
                      </div>
                    </TabsContent>

                    <TabsContent value="appointments" className="mt-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                        Fonctionnalité à venir : Liste des rendez-vous demandés
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="mt-6 space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Site web</h4>
                          {selectedSponsor.website ? (
                            <div className="flex items-center gap-2">
                              <GlobeAltIcon className="h-4 w-4 text-blue-600" />
                              <a
                                href={selectedSponsor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {selectedSponsor.website}
                              </a>
                            </div>
                          ) : (
                            <p className="text-gray-500">Aucun site web renseigné</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="mt-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Sponsor créé</div>
                            <div className="text-xs text-gray-500">
                              {format(selectedSponsor.createdAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
                            </div>
                          </div>
                        </div>
                        
                        {selectedSponsor.updatedAt && selectedSponsor.updatedAt.getTime() !== selectedSponsor.createdAt.getTime() && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <PencilIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Dernière modification</div>
                              <div className="text-xs text-gray-500">
                                {format(selectedSponsor.updatedAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </div>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmer la suppression</DialogTitle>
            <DialogDescription>
              {sponsorToDelete && (
                <p>
                  Êtes-vous sûr de vouloir supprimer définitivement le sponsor{' '}
                  <strong>{sponsorToDelete.name}</strong> ?
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSponsor}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 