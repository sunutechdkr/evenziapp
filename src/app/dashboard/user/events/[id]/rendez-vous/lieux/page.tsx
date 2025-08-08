"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UserEventSidebar from "@/components/dashboard/UserEventSidebar";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPinIcon,
  ChevronLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import Link from "next/link";

// Types pour les lieux
type MeetingLocation = {
  id: string;
  name: string;
  address?: string;
  description?: string;
  capacity?: number;
  isActive: boolean;
  type: "CONFERENCE_ROOM" | "CAFE" | "OUTDOOR" | "VIRTUAL" | "OTHER";
  equipment?: string[];
  createdAt: string;
};

export default function LieuxPage() {
  const { id } = useParams();
  const router = useRouter();
  const [locations, setLocations] = useState<MeetingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MeetingLocation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    capacity: "",
    type: "CONFERENCE_ROOM" as MeetingLocation["type"],
    equipment: [] as string[],
    isActive: true
  });

  // Fetch meeting locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${id}/meeting-locations`);
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des lieux");
      }
      
      const data = await response.json();
      setLocations(data || []);
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors du chargement des lieux");
      // Si l'API n'existe pas encore, on utilise des données de démonstration
      setLocations([
        {
          id: "1",
          name: "Salle de réunion A",
          address: "1er étage, Aile Est",
          description: "Salle climatisée avec équipement audiovisuel",
          capacity: 8,
          type: "CONFERENCE_ROOM",
          equipment: ["Projecteur", "Écran", "Wi-Fi"],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "2", 
          name: "Espace café",
          address: "Rez-de-chaussée, Hall principal",
          description: "Espace décontracté pour échanges informels",
          capacity: 4,
          type: "CAFE",
          equipment: ["Wi-Fi"],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "3",
          name: "Visioconférence",
          description: "Rendez-vous virtuel via la plateforme",
          type: "VIRTUAL",
          equipment: ["Zoom", "Teams"],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();

    // Vérifier si l'écran est mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [id]);

  const handleCreate = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      address: "",
      description: "",
      capacity: "",
      type: "CONFERENCE_ROOM",
      equipment: [],
      isActive: true
    });
    setShowCreateModal(true);
  };

  const handleEdit = (location: MeetingLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || "",
      description: location.description || "",
      capacity: location.capacity ? location.capacity.toString() : "",
      type: location.type,
      equipment: location.equipment || [],
      isActive: location.isActive
    });
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    try {
      const url = editingLocation 
        ? `/api/events/${id}/meeting-locations/${editingLocation.id}`
        : `/api/events/${id}/meeting-locations`;
      
      const method = editingLocation ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      toast.success(editingLocation ? "Lieu modifié" : "Lieu créé");
      setShowCreateModal(false);
      fetchLocations();
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Impossible de sauvegarder le lieu");
    }
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce lieu ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}/meeting-locations/${locationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Lieu supprimé");
      fetchLocations();
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Impossible de supprimer le lieu");
    }
  };

  const getLocationTypeLabel = (type: MeetingLocation["type"]) => {
    const types = {
      CONFERENCE_ROOM: "Salle de réunion",
      CAFE: "Espace café",
      OUTDOOR: "Extérieur",
      VIRTUAL: "Virtuel",
      OTHER: "Autre"
    };
    return types[type] || type;
  };

  const getLocationIcon = (type: MeetingLocation["type"]) => {
    switch (type) {
      case "CONFERENCE_ROOM":
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case "VIRTUAL":
        return <span className="text-sm">💻</span>;
      case "CAFE":
        return <span className="text-sm">☕</span>;
      case "OUTDOOR":
        return <span className="text-sm">🌳</span>;
      default:
        return <MapPinIcon className="h-4 w-4" />;
    }
  };

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
          {/* En-tête */}
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
                onClick={handleCreate}
                className="bg-[#81B441] text-white border-none"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouveau lieu
              </Button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-[#81B441]" />
                  Lieux de rendez-vous disponibles
                </CardTitle>
                <CardDescription>
                  Gérez les lieux disponibles pour organiser les rendez-vous
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <p>Chargement des lieux...</p>
                  </div>
                ) : locations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map((location) => (
                      <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {getLocationIcon(location.type)}
                            <h3 className="font-medium text-gray-900">{location.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={location.isActive ? "default" : "secondary"}
                              className={location.isActive ? "bg-[#81B441] text-white" : ""}
                            >
                              {location.isActive ? "Actif" : "Inactif"}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(location)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(location.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-xs">
                            {getLocationTypeLabel(location.type)}
                          </Badge>
                          
                          {location.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPinIcon className="h-4 w-4" />
                              <span>{location.address}</span>
                            </div>
                          )}
                          
                          {location.capacity && (
                            <div className="text-sm text-gray-600">
                              <span>Capacité: {location.capacity} personnes</span>
                            </div>
                          )}
                          
                          {location.description && (
                            <p className="text-xs text-gray-500">{location.description}</p>
                          )}
                          
                          {location.equipment && location.equipment.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {location.equipment.map((eq, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                                  {eq}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucun lieu configuré</p>
                    <Button 
                      onClick={handleCreate}
                      className="bg-[#81B441] text-white border-none"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Créer le premier lieu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal de création/modification */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Modifier le lieu" : "Nouveau lieu de rendez-vous"}
            </DialogTitle>
            <DialogDescription>
              {editingLocation 
                ? "Modifiez les informations du lieu de rendez-vous"
                : "Créez un nouveau lieu pour organiser les rendez-vous"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du lieu</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Salle de réunion A, Espace café..."
              />
            </div>

            <div>
              <Label htmlFor="type">Type de lieu</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MeetingLocation["type"] }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="CONFERENCE_ROOM">Salle de réunion</option>
                <option value="CAFE">Espace café</option>
                <option value="OUTDOOR">Extérieur</option>
                <option value="VIRTUAL">Virtuel</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div>
              <Label htmlFor="address">Adresse/Localisation</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ex: 1er étage, Aile Est"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capacité (nombre de personnes)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="Ex: 8"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du lieu, équipements disponibles..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Lieu actif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-[#81B441] text-white border-none"
              disabled={!formData.name}
            >
              {editingLocation ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
