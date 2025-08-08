"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import UserEventSidebar from "@/components/dashboard/UserEventSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Link from "next/link";

// Types
type TimeSlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  description?: string;
  isAvailable: boolean;
  createdAt: string;
};

export default function HorairesPage() {
  const { id } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    day: '',
    startTime: '',
    endTime: '',
    description: '',
    isAvailable: true
  });

  const daysOfWeek = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' },
    { value: 'dimanche', label: 'Dimanche' }
  ];

  // Generate time options (8h à 20h par tranches de 30 min)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Fetch time slots
  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on utilise des données mockées
      const mockData: TimeSlot[] = [
        {
          id: '1',
          day: 'lundi',
          startTime: '09:00',
          endTime: '12:00',
          description: 'Matinée networking',
          isAvailable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          day: 'lundi',
          startTime: '14:00',
          endTime: '17:00',
          description: 'Après-midi rendez-vous',
          isAvailable: true,
          createdAt: new Date().toISOString()
        }
      ];
      setTimeSlots(mockData);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast.error("Erreur lors du chargement des créneaux");
    } finally {
      setLoading(false);
    }
  };

  // Create time slot
  const createTimeSlot = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.day || !formData.startTime || !formData.endTime) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      if (formData.startTime >= formData.endTime) {
        toast.error("L'heure de fin doit être après l'heure de début");
        return;
      }

      // Mock création - remplacer par un appel API réel
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        isAvailable: formData.isAvailable,
        createdAt: new Date().toISOString()
      };

      setTimeSlots(prev => [...prev, newSlot]);
      toast.success("Créneau créé avec succès !");
      
      // Reset form
      setFormData({
        day: '',
        startTime: '',
        endTime: '',
        description: '',
        isAvailable: true
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating time slot:", error);
      toast.error("Erreur lors de la création du créneau");
    } finally {
      setLoading(false);
    }
  };

  // Update time slot
  const updateTimeSlot = async () => {
    if (!editingSlot) return;

    try {
      setLoading(true);
      
      // Mock mise à jour - remplacer par un appel API réel
      setTimeSlots(prev => prev.map(slot => 
        slot.id === editingSlot.id 
          ? { ...slot, ...formData }
          : slot
      ));

      toast.success("Créneau mis à jour avec succès !");
      setEditingSlot(null);
      setFormData({
        day: '',
        startTime: '',
        endTime: '',
        description: '',
        isAvailable: true
      });
    } catch (error) {
      console.error("Error updating time slot:", error);
      toast.error("Erreur lors de la mise à jour du créneau");
    } finally {
      setLoading(false);
    }
  };

  // Delete time slot
  const deleteTimeSlot = async (slotId: string) => {
    try {
      // Mock suppression - remplacer par un appel API réel
      setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
      toast.success("Créneau supprimé avec succès !");
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error("Erreur lors de la suppression du créneau");
    }
  };

  // Open edit dialog
  const openEditDialog = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: slot.description || '',
      isAvailable: slot.isAvailable
    });
  };

  // Format day name
  const formatDayName = (day: string) => {
    const dayObj = daysOfWeek.find(d => d.value === day);
    return dayObj ? dayObj.label : day;
  };

  useEffect(() => {
    fetchTimeSlots();

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
                  Gestion des Horaires
                </h1>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-[#81B441] text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouveau créneau
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                  Créneaux de disponibilité
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
                        <TableHead>Jour</TableHead>
                        <TableHead>Heure de début</TableHead>
                        <TableHead>Heure de fin</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.length > 0 ? (
                        timeSlots.map((slot) => (
                          <TableRow key={slot.id}>
                            <TableCell className="font-medium">
                              {formatDayName(slot.day)}
                            </TableCell>
                            <TableCell>{slot.startTime}</TableCell>
                            <TableCell>{slot.endTime}</TableCell>
                            <TableCell>{slot.description || '-'}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={slot.isAvailable ? "default" : "secondary"}
                                className={slot.isAvailable ? "bg-[#81B441] text-white" : ""}
                              >
                                {slot.isAvailable ? 'Disponible' : 'Indisponible'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(slot)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTimeSlot(slot.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Aucun créneau configuré
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
      <Dialog open={showCreateDialog || !!editingSlot} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingSlot(null);
          setFormData({
            day: '',
            startTime: '',
            endTime: '',
            description: '',
            isAvailable: true
          });
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSlot ? 'Modifier le créneau' : 'Nouveau créneau'}
            </DialogTitle>
            <DialogDescription>
              {editingSlot ? 'Modifiez les informations du créneau' : 'Ajoutez un nouveau créneau de disponibilité'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="day">Jour *</Label>
              <Select value={formData.day} onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jour" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Heure de début *</Label>
                <Select value={formData.startTime} onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Début" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">Heure de fin *</Label>
                <Select value={formData.endTime} onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du créneau (optionnel)"
              />
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
              setEditingSlot(null);
              setFormData({
                day: '',
                startTime: '',
                endTime: '',
                description: '',
                isAvailable: true
              });
            }}>
              Annuler
            </Button>
            <Button 
              onClick={editingSlot ? updateTimeSlot : createTimeSlot}
              disabled={loading}
              className="bg-[#81B441] text-white"
            >
              {loading ? 'Sauvegarde...' : editingSlot ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
