"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import UserEventSidebar from "@/components/dashboard/UserEventSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeftIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Link from "next/link";

// Types
type MeetingLocation = {
  id: string;
  name: string;
  type: 'conference_room' | 'cafe' | 'office' | 'outdoor' | 'virtual' | 'other';
  address?: string;
  description?: string;
  capacity?: number;
  isAvailable: boolean;
  amenities: string[];
  createdAt: string;
};

export default function LieuxPage() {
  const { id } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [locations, setLocations] = useState<MeetingLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MeetingLocation | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'conference_room' as 'conference_room' | 'cafe' | 'office' | 'outdoor' | 'virtual' | 'other',
    address: '',
    description: '',
    capacity: '',
    isAvailable: true,
    amenities: [] as string[]
  });

  const locationTypes = [
    { value: 'conference_room', label: 'Salle de conférence', icon: '🏢' },
    { value: 'cafe', label: 'Café / Restaurant', icon: '☕' },
    { value: 'office', label: 'Bureau', icon: '🏢' },
    { value: 'outdoor', label: 'Extérieur', icon: '🌳' },
    { value: 'virtual', label: 'Virtuel', icon: '💻' },
    { value: 'other', label: 'Autre', icon: '📍' }
  ];

  const amenitiesOptions = [
    'WiFi',
    'Projecteur',
    'Tableau blanc',
    'Climatisation',
    'Café/Thé',
    'Parking',
    'Accessibilité PMR',
    'Écran TV',
    'Système audio',
    'Espace fumeur'
  ];

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on utilise des données mockées
      const mockData: MeetingLocation[] = [
        {
          id: '1',
          name: 'Salle de conférence A',
          type: 'conference_room',
          address: '123 Rue de la Paix, Paris',
          description: 'Grande salle équipée pour les réunions importantes',
          capacity: 20,
          isAvailable: true,
          amenities: ['WiFi', 'Projecteur', 'Climatisation', 'Café/Thé'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Café Central',
          type: 'cafe',
          address: '456 Avenue des Champs, Paris',
          description: 'Ambiance décontractée pour des rencontres informelles',
          capacity: 4,
          isAvailable: true,
          amenities: ['WiFi', 'Café/Thé'],
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Visioconférence Teams',
          type: 'virtual',
          description: 'Réunion en ligne via Microsoft Teams',
          isAvailable: true,
          amenities: ['Système audio'],
          createdAt: new Date().toISOString()
        }
      ];
      setLocations(mockData);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Erreur lors du chargement des lieux");
    } finally {
      setLoading(false);
    }
  };

  // Create location
  const createLocation = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.name || !formData.type) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Mock création - remplacer par un appel API réel
      const newLocation: MeetingLocation = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        address: formData.address,
        description: formData.description,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        isAvailable: formData.isAvailable,
        amenities: formData.amenities,
        createdAt: new Date().toISOString()
      };

      setLocations(prev => [...prev, newLocation]);
      toast.success("Lieu créé avec succès !");
      
      // Reset form
      setFormData({
        name: '',
        type: 'conference_room' as 'conference_room' | 'cafe' | 'office' | 'outdoor' | 'virtual' | 'other',
        address: '',
        description: '',
        capacity: '',
        isAvailable: true,
        amenities: []
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Erreur lors de la création du lieu");
    } finally {
      setLoading(false);
    }
  };

  // Update location
  const updateLocation = async () => {
    if (!editingLocation) return;

    try {
      setLoading(true);
      
      // Mock mise à jour - remplacer par un appel API réel
      setLocations(prev => prev.map(location => 
        location.id === editingLocation.id 
          ? { 
              ...location, 
              ...formData,
              capacity: formData.capacity ? parseInt(formData.capacity) : undefined
            }
          : location
      ));

      toast.success("Lieu mis à jour avec succès !");
      setEditingLocation(null);
      setFormData({
        name: '',
        type: 'conference_room' as 'conference_room' | 'cafe' | 'office' | 'outdoor' | 'virtual' | 'other',
        address: '',
        description: '',
        capacity: '',
        isAvailable: true,
        amenities: []
      });
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Erreur lors de la mise à jour du lieu");
    } finally {
      setLoading(false);
    }
  };

  // Delete location
  const deleteLocation = async (locationId: string) => {
    try {
      // Mock suppression - remplacer par un appel API réel
      setLocations(prev => prev.filter(location => location.id !== locationId));
      toast.success("Lieu supprimé avec succès !");
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Erreur lors de la suppression du lieu");
    }
  };

  // Open edit dialog
  const openEditDialog = (location: MeetingLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      address: location.address || '',
      description: location.description || '',
      capacity: location.capacity?.toString() || '',
      isAvailable: location.isAvailable,
      amenities: location.amenities
    });
  };

  // Get location type info
  const getLocationTypeInfo = (type: string) => {
    const typeInfo = locationTypes.find(t => t.value === type);
    return typeInfo || { label: type, icon: '📍' };
  };

  // Toggle amenity
  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  useEffect(() => {
    fetchLocations();

    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [id]);

  return (
    <div className="dashboard-container min-h-screen overflow-hidden">
      <UserEventSidebar 
        eventId={id as string}
        activeTab="rendez-vous"
        onExpandChange={(expanded) => setSidebarExpanded(expanded)}
      />
      
      <div 
        className={`dashboard-content bg-gray-50 ${!sidebarExpanded ? 'dashboard-content-collapsed' : ''}`}
        style={{ 
          marginLeft: isMobile ? 0 : sidebarExpanded ? '16rem' : '4rem',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <main className="dashboard-main flex-1">
          {/* Header */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href={`/dashboard/user/events/${id}/rendez-vous`}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  <span>Retour aux rendez-vous</span>
                </Link>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestion des Lieux
                </h1>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-[#81B441] text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouveau lieu
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                  Lieux de rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <p>Chargement...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Capacité</TableHead>
                        <TableHead>Équipements</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.length > 0 ? (
                        locations.map((location) => {
                          const typeInfo = getLocationTypeInfo(location.type);
                          return (
                            <TableRow key={location.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <span className="mr-2">{typeInfo.icon}</span>
                                  {location.name}
                                </div>
                              </TableCell>
                              <TableCell>{typeInfo.label}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {location.address || '-'}
                              </TableCell>
                              <TableCell>
                                {location.capacity ? `${location.capacity} pers.` : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {location.amenities.slice(0, 2).map((amenity) => (
                                    <Badge key={amenity} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {location.amenities.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{location.amenities.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={location.isAvailable ? "default" : "secondary"}
                                  className={location.isAvailable ? "bg-[#81B441] text-white" : ""}
                                >
                                  {location.isAvailable ? 'Disponible' : 'Indisponible'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(location)}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteLocation(location.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Aucun lieu configuré
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingLocation} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingLocation(null);
          setFormData({
            name: '',
            type: 'conference_room' as 'conference_room' | 'cafe' | 'office' | 'outdoor' | 'virtual' | 'other',
            address: '',
            description: '',
            capacity: '',
            isAvailable: true,
            amenities: []
          });
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Modifier le lieu' : 'Nouveau lieu'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Modifiez les informations du lieu' : 'Ajoutez un nouveau lieu de rendez-vous'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du lieu *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Salle de conférence A"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type de lieu *</Label>
              <Select value={formData.type} onValueChange={(value: 'conference_room' | 'cafe' | 'office' | 'outdoor' | 'virtual' | 'other') => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse complète du lieu"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacité (nombre de personnes)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="Ex: 10"
                min="1"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du lieu, ambiance, particularités..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Équipements disponibles</Label>
              <div className="grid grid-cols-2 gap-2">
                {amenitiesOptions.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-[#81B441] focus:ring-[#81B441]"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="availability">Disponibilité</Label>
              <Select 
                value={formData.isAvailable.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, isAvailable: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Disponible</SelectItem>
                  <SelectItem value="false">Indisponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingLocation(null);
              setFormData({
                name: '',
                type: 'conference_room' as 'conference_room' | 'cafe' | 'office' | 'outdoor' | 'virtual' | 'other',
                address: '',
                description: '',
                capacity: '',
                isAvailable: true,
                amenities: []
              });
            }}>
              Annuler
            </Button>
            <Button 
              onClick={editingLocation ? updateLocation : createLocation}
              disabled={loading}
              className="bg-[#81B441] text-white"
            >
              {loading ? 'Sauvegarde...' : editingLocation ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
