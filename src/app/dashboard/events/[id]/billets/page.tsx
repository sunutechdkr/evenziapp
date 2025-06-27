"use client";

import { useState, useEffect } from "react";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import { 
  
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  EllipsisVerticalIcon,
  Cog6ToothIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ArrowArrowTrendingUpIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import CreateTicketForm from "@/components/forms/CreateTicketForm";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Types
type Ticket = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'TERMINATED' | 'DRAFT';
  price: number;
  usage: string;
  validFrom: Date;
  validUntil: Date;
  group: string;
  visibility: 'VISIBLE' | 'HIDDEN';
  description?: string;
  quantity?: number;
};


export default function EventTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Extraire l'ID de params au chargement
  useEffect(() => {
    const extractParams = async () => {
      const { id } = await params;
      setEventId(id);
    };
    extractParams();
  }, [params]);

  // Données de démonstration
  useEffect(() => {
    if (eventId) {
      // Simuler le chargement des données
      setTimeout(() => {
        setTickets([
          {
            id: "1",
            name: "PARTICIPANT PREMIUM",
            status: "TERMINATED",
            price: 0,
            usage: "117/Illimité",
            validFrom: new Date("2025-05-30"),
            validUntil: new Date("2025-06-25T19:00"),
            group: "Attendees",
            visibility: "VISIBLE"
          },
          {
            id: "2", 
            name: "PARTICIPANT ACCESS",
            status: "TERMINATED",
            price: 0,
            usage: "258/Illimité",
            validFrom: new Date("2025-03-19"),
            validUntil: new Date("2025-06-25T19:00"),
            group: "Attendees",
            visibility: "VISIBLE"
          },
          {
            id: "3",
            name: "VISITEUR",
            status: "TERMINATED", 
            price: 0,
            usage: "485/Illimité",
            validFrom: new Date("2025-05-30"),
            validUntil: new Date("2025-06-25T19:00"),
            group: "Attendees",
            visibility: "VISIBLE"
          },
          {
            id: "4",
            name: "SPEAKERS",
            status: "TERMINATED",
            price: 0,
            usage: "15/Illimité", 
            validFrom: new Date("2025-03-19"),
            validUntil: new Date("2025-06-25T19:00"),
            group: "Speakers",
            visibility: "VISIBLE"
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [eventId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'TERMINATED':
        return 'Terminé';
      case 'DRAFT':
        return 'Brouillon';
      default:
        return status;
    }
  };

  const handleCreateTicket = (ticketData: {
    name: string;
    startDate: string;
    endDate: string;
    quantity: string;
    visibility: string;
    type: string;
    price: number;
    group: string;
    description: string;
  }) => {
    // Simuler la création du billet
    const newTicket: Ticket = {
      id: String(tickets.length + 1),
      name: ticketData.name,
      status: 'ACTIVE',
      price: ticketData.type === 'free' ? 0 : ticketData.price,
      usage: '0/Illimité',
      validFrom: new Date(ticketData.startDate),
      validUntil: new Date(ticketData.endDate),
      group: ticketData.group,
      visibility: ticketData.visibility === 'visible' ? 'VISIBLE' : 'HIDDEN',
      description: ticketData.description,
      quantity: ticketData.quantity === 'unlimited' ? undefined : parseInt(ticketData.quantity)
    };

    setTickets(prev => [...prev, newTicket]);
    setShowCreateModal(false);
    toast.success('Billet créé avec succès !');
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setShowEditModal(true);
  };

  const handleUpdateTicket = (ticketData: {
    name: string;
    startDate: string;
    endDate: string;
    quantity: string;
    visibility: string;
    type: string;
    price: number;
    group: string;
    description: string;
  }) => {
    if (!editingTicket) return;

    const updatedTicket: Ticket = {
      ...editingTicket,
      name: ticketData.name,
      price: ticketData.type === 'free' ? 0 : ticketData.price,
      validFrom: new Date(ticketData.startDate),
      validUntil: new Date(ticketData.endDate),
      group: ticketData.group,
      visibility: ticketData.visibility === 'visible' ? 'VISIBLE' : 'HIDDEN',
      description: ticketData.description,
      quantity: ticketData.quantity === 'unlimited' ? undefined : parseInt(ticketData.quantity)
    };

    setTickets(prev => prev.map(t => t.id === editingTicket.id ? updatedTicket : t));
    setShowEditModal(false);
    setEditingTicket(null);
    toast.success('Billet mis à jour avec succès !');
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    toast.success('Billet supprimé avec succès !');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EventSidebar eventId={eventId} onExpandChange={setSidebarExpanded} />
        <main className={`transition-all duration-300 ease-in-out ${sidebarExpanded ? "md:ml-64" : "ml-0"} flex-1 p-6`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81B441] mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des billets...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EventSidebar eventId={eventId} onExpandChange={setSidebarExpanded} />
      
      <main className={`transition-all duration-300 ease-in-out ${sidebarExpanded ? "md:ml-64" : "ml-0"} flex-1 p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Billets</h1>
            <p className="text-gray-600 mb-6">
              Utilisez un seul ou plusieurs types de billets en fonction de votre événement. Chaque billet a 
              une quantité limite optionnelle, des dates de disponibilité, et un groupe auquel les inscrits 
              seront assignés.
            </p>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total des ventes</CardTitle>
                  <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#81B441]">
                    {tickets.reduce((sum, ticket) => sum + parseInt(ticket.usage.split('/')[0]), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    billets vendus au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Types de billets</CardTitle>
                  <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#81B441]">{tickets.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {tickets.filter(t => t.status === 'ACTIVE').length} actifs, {tickets.filter(t => t.status === 'TERMINATED').length} terminés
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#81B441]">89.2%</div>
                  <p className="text-xs text-muted-foreground">
                    taux moyen de conversion
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="text-gray-600 border-gray-300 hover:text-[#81B441] hover:border-[#81B441]"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Paramètres de paiement
              </Button>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#81B441] hover:bg-[#72a339] text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer un billet
              </Button>
            </div>
          </div>

          {/* Table des billets */}
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du billet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Valide à partir du</TableHead>
                  <TableHead>Valide jusqu&apos;au</TableHead>
                  <TableHead>Groupe</TableHead>
                  <TableHead>Visibilité</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium py-6">
                      {ticket.name}
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge className={getStatusColor(ticket.status)}>
                        ● {getStatusText(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6">
                      {ticket.price === 0 ? 'Gratuit' : `${ticket.price}€`}
                    </TableCell>
                    <TableCell className="py-6">{ticket.usage}</TableCell>
                    <TableCell className="py-6">
                      <div>
                        <div>{format(ticket.validFrom, 'dd MMM yyyy', { locale: fr })}</div>
                        <div className="text-sm text-gray-500">00:00</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div>
                        <div>{format(ticket.validUntil, 'dd MMM yyyy', { locale: fr })}</div>
                        <div className="text-sm text-gray-500">19:00</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">{ticket.group}</TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center">
                        {ticket.visibility === 'VISIBLE' ? (
                          <EyeIcon className="h-4 w-4 text-gray-500 mr-1" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4 text-gray-500 mr-1" />
                        )}
                        <span className="text-sm">
                          {ticket.visibility === 'VISIBLE' ? 'Visible' : 'Masqué'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTicket(ticket.id)}
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
          </div>
        </div>
      </main>

      {/* Modal de création */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un billet</DialogTitle>
          </DialogHeader>
          <CreateTicketForm
            onSubmit={handleCreateTicket}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le billet</DialogTitle>
          </DialogHeader>
          <CreateTicketForm
            editMode={true}
            initialData={{
              name: editingTicket?.name,
              startDate: editingTicket?.validFrom.toISOString().slice(0, 16).replace('T', ' '),
              endDate: editingTicket?.validUntil.toISOString().slice(0, 16).replace('T', ' '),
              quantity: editingTicket?.quantity ? editingTicket.quantity.toString() : 'unlimited',
              visibility: editingTicket?.visibility === 'VISIBLE' ? 'visible' : 'hidden',
              type: editingTicket?.price === 0 ? 'free' : 'paid',
              price: editingTicket?.price || 0,
              group: editingTicket?.group,
              description: editingTicket?.description || ''
            }}
            onSubmit={handleUpdateTicket}
            onCancel={() => setShowEditModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 