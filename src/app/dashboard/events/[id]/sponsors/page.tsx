"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  UserPlusIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
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
  Squares2X2Icon,
  TableCellsIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Importer les composants Shadcn UI
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Pagination pour la vue tableau
  const indexOfLastSponsor = currentPage * sponsorsPerPage;
  const indexOfFirstSponsor = indexOfLastSponsor - sponsorsPerPage;
  const currentSponsors = filteredSponsors.slice(indexOfFirstSponsor, indexOfLastSponsor);
  const totalPages = Math.ceil(filteredSponsors.length / sponsorsPerPage);

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

        {/* Filtres et commutateur de vue */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom de sponsor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441]"
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
              
              {/* Commutateur de vue */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={viewMode === 'cards' ? 'bg-white shadow-sm' : ''}
                >
                  <Squares2X2Icon className="h-4 w-4 mr-1" />
                  Cartes
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-white shadow-sm' : ''}
                >
                  <TableCellsIcon className="h-4 w-4 mr-1" />
                  Grille
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu selon le mode de vue */}
        {sponsors.length > 0 ? (
          <>
            {viewMode === 'cards' ? (
              /* Vue en cartes */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredSponsors.map(sponsor => (
                  <Card
                    key={sponsor.id}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${!sponsor.visible ? 'opacity-60' : ''}`}
                    onClick={() => openSponsorDetails(sponsor)}
                  >
                    <CardContent className="p-0">
                      {/* Logo */}
                      <div className="h-32 bg-gray-50 flex items-center justify-center p-4 relative">
                        {/* Actions overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/events/${eventId}/sponsors/edit?id=${sponsor.id}`);
                            }}
                            className="p-1 bg-white rounded-full shadow-sm border hover:bg-gray-50 transition-colors"
                            title="Modifier le sponsor"
                          >
                            <PencilIcon className="h-3 w-3 text-gray-600" />
                          </button>
                        </div>
                        
                        {sponsor.logo ? (
                          <img 
                            src={sponsor.logo} 
                            alt={sponsor.name} 
                            className="max-h-24 max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <PhotoIcon className="h-10 w-10" />
                            <span className="text-xs mt-1">Pas de logo</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/events/${eventId}/sponsors/edit?id=${sponsor.id}`);
                              }}
                              className="text-xs text-[#81B441] hover:text-[#72a139] mt-1 underline"
                            >
                              Ajouter un logo
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Informations */}
                      <div className="p-3 text-center border-t">
                        <h3 className="font-medium text-sm text-gray-900 mb-2 truncate">
                          {sponsor.name}
                        </h3>
                        <Badge className={`text-xs ${getLevelBadgeClass(sponsor.level)}`}>
                          {getLevelText(sponsor.level)}
                        </Badge>
                        {!sponsor.visible && (
                          <div className="mt-1 text-xs text-gray-500 italic">
                            Non visible
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Vue en grille/tableau */
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sponsor</TableHead>
                          <TableHead>Niveau</TableHead>
                          <TableHead>Site web</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date d&apos;ajout</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSponsors.map((sponsor) => (
                          <TableRow 
                            key={sponsor.id} 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => openSponsorDetails(sponsor)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="border-2 border-[#81B441] h-10 w-10">
                                  {sponsor.logo ? (
                                    <img 
                                      src={sponsor.logo} 
                                      alt={sponsor.name}
                                      className="h-full w-full object-contain p-1"
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-white text-black border-[#81B441]">
                                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <p className="font-medium">{sponsor.name}</p>
                                  {sponsor.description && (
                                    <p className="text-sm text-gray-500 truncate max-w-xs">
                                      {sponsor.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className="bg-[#EAF9D7] text-gray-800 hover:bg-[#EAF9D7] border-[#EAF9D7]"
                                variant="outline"
                              >
                                {getLevelText(sponsor.level)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {sponsor.website ? (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <GlobeAltIcon className="h-4 w-4" />
                                  <span className="text-sm truncate max-w-xs">
                                    {sponsor.website.replace(/^https?:\/\//, '')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {sponsor.visible ? (
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
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-500">
                                {format(sponsor.createdAt, "dd MMM yyyy", { locale: fr })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    openSponsorDetails(sponsor);
                                  }}>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Voir les détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/events/${eventId}/sponsors/edit?id=${sponsor.id}`);
                                  }}>
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  {sponsor.website && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(sponsor.website, '_blank');
                                    }}>
                                      <LinkIcon className="h-4 w-4 mr-2" />
                                      Visiter le site
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSponsorToDelete(sponsor);
                                      setDeleteConfirmOpen(true);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Pagination pour la vue tableau */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-gray-700">
                        Affichage de {indexOfFirstSponsor + 1} à {Math.min(indexOfLastSponsor, filteredSponsors.length)} sur {filteredSponsors.length} résultats
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className={currentPage === pageNumber ? 'bg-[#81B441] hover:bg-[#72a339]' : ''}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
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

      {/* Modal des détails du sponsor avec onglets */}
      <Dialog open={showSponsorModal} onOpenChange={setShowSponsorModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Détails du sponsor</DialogTitle>
          </DialogHeader>
          
          {selectedSponsor && (
            <div className="mt-4">
              {/* En-tête avec logo et infos principales */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-[#81B441]">
                  {selectedSponsor.logo ? (
                    <img 
                      src={selectedSponsor.logo} 
                      alt={selectedSponsor.name}
                      className="max-h-16 max-w-16 object-contain"
                    />
                  ) : (
                    <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedSponsor.name}
                  </h3>
                  {selectedSponsor.website && (
                    <p className="text-blue-600 text-sm">{selectedSponsor.website}</p>
                  )}
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

              {/* Onglets */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[400px] pr-4">
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {selectedSponsor.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{selectedSponsor.description}</p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Niveau de sponsoring</h4>
                        <p className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeClass(selectedSponsor.level)}`}>
                            {getLevelText(selectedSponsor.level)}
                          </span>
                        </p>
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

                  <TabsContent value="contact">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Site web</h4>
                        {selectedSponsor.website ? (
                          <a 
                            href={selectedSponsor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          >
                            <GlobeAltIcon className="h-4 w-4" />
                            {selectedSponsor.website}
                          </a>
                        ) : (
                          <p className="text-gray-500">Aucun site web renseigné</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline">
                    <div className="space-y-4">
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
                        
                        <div className="relative -ml-1.5">
                          <div className="absolute top-2 left-0 w-3 h-3 bg-[#81B441] rounded-full"></div>
                          <div className="ml-6">
                            <p className="text-sm font-medium">Sponsor ajouté</p>
                            <p className="text-xs text-gray-500">
                              {format(selectedSponsor.createdAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
                            </p>
                          </div>
                        </div>
                        
                        {selectedSponsor.updatedAt.getTime() !== selectedSponsor.createdAt.getTime() && (
                          <div className="relative -ml-1.5 mt-6">
                            <div className="absolute top-2 left-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="ml-6">
                              <p className="text-sm font-medium">Dernière modification</p>
                              <p className="text-xs text-gray-500">
                                {format(selectedSponsor.updatedAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
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