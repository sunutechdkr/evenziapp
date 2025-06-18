"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  UserPlusIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ClockIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  IdentificationIcon,
  ShareIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PencilIcon,
  TicketIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import ParticipantBadge from "@/components/events/ParticipantBadge";

// Importer les composants Shadcn UI
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Type d'inscription
type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle?: string; // Fonction
  company?: string;  // Nom de l'entreprise
  type: 'PARTICIPANT' | 'EXHIBITOR' | 'SPEAKER';
  registrationDate: Date;
  checkedIn: boolean;
  checkinTime?: Date | null;
  checkedInAt?: string;
  shortCode?: string;
  qrCode?: string;
};

// Type d'événement
type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  banner?: string;
  slug?: string; // Ajouter le slug à l'interface Event
};

export default function EventParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  // Nous utilisons directement params.id au lieu de créer une variable eventId
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showActionMenuFor, setShowActionMenuFor] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [currentBadgeParticipant, setCurrentBadgeParticipant] = useState<Participant | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [cancelCheckInConfirmOpen, setCancelCheckInConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});
  const [participantType, setParticipantType] = useState('all');
  const [checkinStatus, setCheckinStatus] = useState('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [participantToEdit, setParticipantToEdit] = useState<Participant | null>(null);
  const [editButtonClicked, setEditButtonClicked] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    type: 'PARTICIPANT'
  });
  
  // ID du participant nouvellement ajouté pour l'animation
  const [newParticipantId, setNewParticipantId] = useState<string | null>(null);
  
  const participantsPerPage = 25;
  
  // Utiliser le hook useEffect pour extraire l'ID de manière asynchrone
  const [eventId, setEventId] = useState<string>("");
  
  // Extraire l'ID de params au chargement
  useEffect(() => {
    const extractParams = async () => {
      const { id } = await params;
      setEventId(id);
    };
    
    extractParams();
  }, [params]);
  
  // Helper pour créer des options de fetch standard pour éviter les problèmes de cache
  const createFetchOptions = (method = 'GET', body?: Record<string, unknown>) => {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Ajouter un en-tête aléatoire pour contourner le cache de certains navigateurs
        'X-Fetch-Time': new Date().getTime().toString()
      },
      cache: 'no-store' as RequestCache,
      ...(body ? { body: JSON.stringify(body) } : {})
    };
  };
  
  // Helper pour réessayer une requête fetch en cas d'échec
  const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
      } catch (error) {
        console.error('Fetch error:', error);
      }
      attempts++;
    }
    throw new Error('Max retries reached');
  };
  
  // Fonction de récupération des participants pour pouvoir l'appeler depuis n'importe où
  const fetchParticipants = async () => {
    try {
      // Récupérer les participants depuis l'API avec des options de cache plus strictes
      const response = await fetchWithRetry(
        `/api/events/${eventId}/registrations`, 
        createFetchOptions()
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des participants");
      }
      
      const data = await response.json();
      
      // Vérifier que data.registrations est bien un tableau
      if (!data || !data.registrations || !Array.isArray(data.registrations)) {
        console.error("Format de données invalide:", data);
        toast.error("Format de données invalide");
        setParticipants([]);
        return;
      }
      
      console.log("Participants récupérés:", data.registrations.length);
      
      // Mapper les données de Registration vers le format Participant
      const mappedParticipants: Participant[] = data.registrations.map((reg: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        jobTitle?: string;
        company?: string;
        type: string;
        createdAt: string;
        checkedIn: boolean;
        checkInTime?: string;
        shortCode?: string;
        qrCode?: string;
      }) => ({
        id: reg.id,
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        phone: reg.phone,
        jobTitle: reg.jobTitle || undefined,
        company: reg.company || undefined,
        type: reg.type as 'PARTICIPANT' | 'EXHIBITOR' | 'SPEAKER',
        registrationDate: new Date(reg.createdAt),
        checkedIn: reg.checkedIn,
        checkinTime: reg.checkInTime ? new Date(reg.checkInTime) : undefined,
        shortCode: reg.shortCode,
        qrCode: reg.qrCode
      }));
      
      console.log("Participants mappés:", mappedParticipants.length);
      setParticipants(mappedParticipants);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les participants.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour récupérer les détails de l'événement
  const fetchEventDetails = async () => {
    try {
      const response = await fetchWithRetry(
        `/api/events/${eventId}`, 
        createFetchOptions()
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails de l'événement");
      }
      
      const eventData = await response.json();
      
      // Mettre à jour l'état de l'événement avec les données récupérées
      const formattedEvent: Event = {
        id: eventData.id,
        name: eventData.name,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        banner: eventData.banner,
        slug: eventData.slug,
      };
      
      setEvent(formattedEvent);
    } catch (error) {
      console.error("Erreur lors du chargement des détails de l'événement:", error);
    }
  };
  
  /**
   * Génère et télécharge un fichier CSV modèle vide pour l'import de participants
   */
  const downloadCsvTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Définir les en-têtes du CSV
    const headers = ['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'company', 'type'];
    
    // Créer le contenu CSV (uniquement les en-têtes)
    const csvContent = headers.join(',');
    
    // Créer un Blob avec le contenu CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Créer une URL pour le Blob
    const url = URL.createObjectURL(blob);
    
    // Créer un élément d'ancrage temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'participants-template.csv');
    document.body.appendChild(link);
    
    // Déclencher le téléchargement
    link.click();
    
    // Nettoyer
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  /**
   * Traite le fichier CSV téléchargé et importe les participants
   */
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier que c'est bien un fichier CSV
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Veuillez sélectionner un fichier CSV valide.');
      return;
    }
    
    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux. Taille maximale: 10MB.');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) throw new Error('Impossible de lire le fichier');
        
        // Diviser par lignes et extraire les en-têtes
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        
        // Vérifier que les en-têtes requis sont présents
        const requiredHeaders = ['firstName', 'lastName', 'email', 'phone', 'type'];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          toast.error(`Format de CSV invalide. Colonnes manquantes: ${missingHeaders.join(', ')}`);
          return;
        }
        
        // Afficher un toast de chargement
        toast.loading(`Importation de ${lines.length - 1} participants...`, { id: 'import-csv' });
        
        let importedCount = 0;
        let errorCount = 0;
        
        // Parser les données du CSV et importer chaque participant via l'API
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Ignorer les lignes vides
          
          const values = lines[i].split(',');
          if (values.length !== headers.length) {
            console.warn(`Ligne ${i} ignorée: nombre de colonnes incorrect`);
            continue;
          }
          
          // Créer un objet participant à partir des données CSV
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });
          
          try {
            // Appeler l'API pour créer le participant
            const response = await fetch(`/api/events/${eventId}/registrations`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
            firstName: rowData.firstName,
            lastName: rowData.lastName,
            email: rowData.email,
            phone: rowData.phone,
            jobTitle: rowData.jobTitle || '',
            company: rowData.company || '',
                type: (rowData.type === 'SPEAKER' ? 'SPEAKER' : 'PARTICIPANT'),
              }),
            });
            
            if (!response.ok) {
              console.error(`Erreur lors de l'importation: ${response.statusText}`);
              errorCount++;
              continue;
            }
            
            const data = await response.json();
            
            // Ajouter le participant à la liste locale
            const participant: Participant = {
              id: data.registration.id,
              firstName: data.registration.firstName,
              lastName: data.registration.lastName,
              email: data.registration.email,
              phone: data.registration.phone,
              jobTitle: rowData.jobTitle || undefined,
              company: rowData.company || undefined,
              type: data.registration.type as 'PARTICIPANT' | 'EXHIBITOR' | 'SPEAKER',
              registrationDate: new Date(data.registration.createdAt),
              checkedIn: data.registration.checkedIn,
              checkinTime: data.registration.checkInTime ? new Date(data.registration.checkInTime) : undefined,
            };
            
            // Mettre à jour la liste des participants
            setParticipants(prev => [...prev, participant]);
            importedCount++;
            
          } catch (error) {
            console.error('Erreur lors de l\'importation d\'un participant:', error);
            errorCount++;
          }
        }
        
        // Fermer le modal
        closeAddModal();
        
        // Mettre à jour le toast
        toast.dismiss('import-csv');
        
        // Afficher le résultat
        if (importedCount > 0) {
          toast.success(`${importedCount} participant(s) importé(s) avec succès.`);
        }
        if (errorCount > 0) {
          toast.error(`${errorCount} participant(s) n'ont pas pu être importés.`);
        }
        
      } catch (error) {
        console.error('Erreur lors du traitement du CSV:', error);
        toast.error('Une erreur est survenue lors du traitement du fichier CSV.');
        toast.dismiss('import-csv');
      }
    };
    
    reader.onerror = () => {
      toast.error('Erreur lors de la lecture du fichier.');
    };
    
    reader.readAsText(file);
  };
  
  useEffect(() => {
    // Ajouter un petit délai pour éviter les problèmes de race condition
    if (!eventId) return; // Ne pas exécuter si eventId n'est pas encore défini
    
    const timer = setTimeout(() => {
      fetchParticipants();
      fetchEventDetails();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [eventId]); // Dépendre de eventId au lieu de params.id
  
  // Ajouter un effet pour recharger les données si aucun participant n'est affiché après un certain temps
  useEffect(() => {
    if (!loading && participants.length === 0) {
      const timer = setTimeout(() => {
        console.log("Aucun participant trouvé, tentative de rechargement...");
        fetchParticipants();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // On utilise un return vide pour éviter l'erreur quand la condition n'est pas remplie
    return () => {};
  }, [loading, participants, fetchParticipants]);
  
  // Filtrer les participants
  const filteredParticipants = participants.filter(participant => {
    // Filtre par type
    if (participantType !== 'all' && participant.type !== participantType) {
      return false;
    }
    
    // Filtre par statut de check-in
    if (checkinStatus !== 'all') {
      if (checkinStatus === 'checked-in' && !participant.checkedIn) {
        return false;
      }
      if (checkinStatus === 'not-checked-in' && participant.checkedIn) {
        return false;
      }
    }
    
    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        participant.firstName.toLowerCase().includes(term) ||
        participant.lastName.toLowerCase().includes(term) ||
        participant.email.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
  
  // Paginer les participants
  const indexOfLastParticipant = currentPage * participantsPerPage;
  const indexOfFirstParticipant = indexOfLastParticipant - participantsPerPage;
  const currentParticipants = filteredParticipants.slice(indexOfFirstParticipant, indexOfLastParticipant);
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredParticipants.length / participantsPerPage);
  
  // Gérer le changement de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Ouvrir la sidebar avec les détails du participant
  const openSidebar = (participant: Participant) => {
    setSelectedParticipant(participant);
    setSidebarOpen(true);
    // Ajouter une classe au body pour empêcher le défilement
    document.body.classList.add('overflow-hidden');
  };
  
  // Fermer la sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
    // Retirer la classe du body pour permettre le défilement
    document.body.classList.remove('overflow-hidden');
  };
  
  // Gérer la fermeture du modal d'ajout
  const closeAddModal = () => {
    setShowAddModal(false);
    setShowAddManual(false);
    // Retirer la classe du body pour permettre le défilement
    document.body.classList.remove('overflow-hidden');
  };
  
  // Ouvrir le modal d'ajout manuel
  const openAddManualModal = () => {
    setShowAddModal(false);
    setShowAddManual(true);
    document.body.classList.add('overflow-hidden');
  };
  
  // Fermer le modal d'ajout manuel
  const closeAddManualModal = () => {
    setShowAddManual(false);
    document.body.classList.remove('overflow-hidden');
  };
  
  // Gérer les changements dans le formulaire d'ajout
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewParticipant(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer la soumission du formulaire d'ajout
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const loadingToast = toast.loading('Ajout du participant en cours...');
      
      // Appeler l'API pour créer un participant
      const response = await fetchWithRetry(
        `/api/events/${eventId}/registrations`, 
        createFetchOptions('POST', {
      firstName: newParticipant.firstName,
      lastName: newParticipant.lastName,
      email: newParticipant.email,
      phone: newParticipant.phone,
      jobTitle: newParticipant.jobTitle,
      company: newParticipant.company,
          type: newParticipant.type,
        })
      );
      
      if (!response.ok) {
        const error = await response.json();
        toast.dismiss(loadingToast);
        throw new Error(error.message || 'Erreur lors de la création du participant');
      }
      
      const data = await response.json();
      
      // Ajouter le nouveau participant à la liste avec toutes ses propriétés
      const participant: Participant = {
        id: data.registration.id,
        firstName: data.registration.firstName,
        lastName: data.registration.lastName,
        email: data.registration.email,
        phone: data.registration.phone,
        jobTitle: newParticipant.jobTitle || undefined,
        company: newParticipant.company || undefined,
        type: data.registration.type as 'PARTICIPANT' | 'EXHIBITOR' | 'SPEAKER',
        registrationDate: new Date(data.registration.createdAt),
        checkedIn: data.registration.checkedIn,
        checkinTime: data.registration.checkInTime ? new Date(data.registration.checkInTime) : undefined,
      };
      
      setParticipants([participant, ...participants]);
      
      // Définir l'ID du nouveau participant pour l'animation
      setNewParticipantId(participant.id);
      
      // Programmer la suppression de la classe d'animation après 3 secondes
      setTimeout(() => {
        setNewParticipantId(null);
      }, 3000);
      
      // Afficher un message de succès avec animation
      toast.dismiss(loadingToast);
      toast.success(
        `${participant.firstName} ${participant.lastName} a été ajouté avec succès !`,
        {
          duration: 4000,
          icon: '👋',
          style: {
            borderRadius: '10px',
            background: '#81B441',
            color: '#fff',
          },
        }
      );
    
    // Réinitialiser le formulaire
    setNewParticipant({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      type: 'PARTICIPANT'
    });
    
    // Fermer le modal
    closeAddModal();
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout du participant');
    }
  };
  
  // Handle checkbox selection
  const handleCheckboxChange = (participantId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(currentParticipants.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (confirm(`Voulez-vous vraiment supprimer ${selectedParticipants.length} participant(s) ?`)) {
      setParticipants(prev => prev.filter(p => !selectedParticipants.includes(p.id)));
      setSelectedParticipants([]);
      setSelectAll(false);
    }
  };

  const handleBulkExport = () => {
    // Préparation de l'URL de l'API d'exportation
    const exportUrl = `/api/events/${eventId}/export/participants`;
    
    // Afficher un loading toast
    toast.loading('Exportation des participants en cours...', { id: 'export-toast' });

    // Ouvrir l'URL dans un nouvel onglet ou télécharger directement le fichier
    const downloadLink = document.createElement('a');
    downloadLink.href = exportUrl;
    downloadLink.target = '_blank';
    downloadLink.download = 'participants.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Mettre à jour le toast pour indiquer le succès
    setTimeout(() => {
      toast.success('Exportation des participants terminée!', { id: 'export-toast' });
    }, 1500);
  };

  // Reset selected when changing pages
  useEffect(() => {
    setSelectedParticipants([]);
    setSelectAll(false);
  }, [currentPage]);

  // Update selectAll when all participants are selected/deselected
  useEffect(() => {
    if (currentParticipants.length > 0 && selectedParticipants.length === currentParticipants.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedParticipants, currentParticipants]);

  // Fonction pour gérer l'affichage du badge
  const handleShowBadge = (participant: Participant) => {
    setCurrentBadgeParticipant(participant);
    setShowBadgeModal(true);
    // Empêcher le défilement de la page quand le modal est ouvert
    document.body.classList.add('overflow-hidden');
  };

  // Fermer le modal du badge
  const handleCloseBadgeModal = () => {
    setShowBadgeModal(false);
    setCurrentBadgeParticipant(null);
    // Permettre le défilement à nouveau
    document.body.classList.remove('overflow-hidden');
  };

  // Gérer le check-in d'un participant
  const handleCheckInFromBadge = async (participantId: string) => {
    // Vérifier si le participant existe
    if (!participantId) {
      console.error('ID de participant invalide');
      toast.error('ID de participant invalide');
      return;
    }

    // Vérifier si le participant est déjà en cours de traitement
    if (processing[participantId]) {
      console.log(`Le participant ${participantId} est déjà en cours d'enregistrement`);
      return;
    }

    try {
      // Mettre à jour l'état de chargement pour ce participant spécifique
      setProcessing(prev => ({ ...prev, [participantId]: true }));
      
      // Log pour débugger
      console.log(`Tentative de check-in pour le participant: ${participantId} sur l'événement: ${eventId}`);
      
      // Construire l'URL de l'API avec les paramètres corrects
      const apiUrl = `/api/events/${eventId}/registrations/${participantId}/checkin`;
      console.log("Appel API vers:", apiUrl);
      
      const response = await fetchWithRetry(apiUrl, createFetchOptions('POST'));

      console.log('Réponse du serveur:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues:', data);
        
        // Mettre à jour le statut check-in localement
        setParticipants(prev =>
          prev.map((p) => 
            p.id === participantId 
              ? { 
                  ...p, 
                  checkedIn: true, 
                  checkinTime: data.registration.checkInTime ? new Date(data.registration.checkInTime) : new Date() 
                } 
              : p
          )
        );
        
        if (currentBadgeParticipant && currentBadgeParticipant.id === participantId) {
          setCurrentBadgeParticipant({
            ...currentBadgeParticipant,
            checkedIn: true,
            checkinTime: data.registration.checkInTime ? new Date(data.registration.checkInTime) : new Date()
          });
        }
        
        toast.success('Participant enregistré avec succès');
        
        // Rafraîchir la liste des participants après un check-in réussi
        setTimeout(() => {
          fetchParticipants();
        }, 1000);
      } else {
        // Essayer de récupérer les données d'erreur
        let errorMessage = 'Erreur lors de l\'enregistrement du participant';
        try {
          const errorData = await response.json();
          console.error('Erreur lors du check-in:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Impossible de lire la réponse d\'erreur:', jsonError);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error checking in participant:', error);
      toast.error('Erreur lors de l\'enregistrement du participant');
    } finally {
      // Réinitialiser l'état de chargement pour ce participant
      setTimeout(() => {
        setProcessing(prev => ({ ...prev, [participantId]: false }));
      }, 500); // Petit délai pour éviter les clics accidentels multiples
    }
  };

  // Gérer le check-in en masse des participants sélectionnés
  const handleBulkCheckIn = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Aucun participant sélectionné');
      return;
    }

    // Filtrer pour ne garder que les participants non déjà enregistrés
    const participantsToCheckIn = selectedParticipants.filter(id => {
      const participant = participants.find(p => p.id === id);
      return participant && !participant.checkedIn;
    });

    if (participantsToCheckIn.length === 0) {
      toast.error('Tous les participants sélectionnés sont déjà enregistrés');
      return;
    }

    // Créer un objet de chargement pour tous les participants sélectionnés
    const loadingState = participantsToCheckIn.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setProcessing(prev => ({ ...prev, ...loadingState }));
    
    let successCount = 0;
    let errorCount = 0;
    
    // Afficher un toast pour l'opération en cours
    toast.loading(`Enregistrement de ${participantsToCheckIn.length} participants...`, { id: 'bulk-checkin' });
    
    console.log(`Tentative de check-in en masse pour ${participantsToCheckIn.length} participants`);
    
    // Traiter chaque participant sélectionné
    for (const participantId of participantsToCheckIn) {
      try {
        console.log(`Tentative de check-in pour ${participantId}`);
        
        const apiUrl = `/api/events/${eventId}/registrations/${participantId}/checkin`;
        console.log(`Appel API vers: ${apiUrl}`);
        
        const response = await fetchWithRetry(apiUrl, createFetchOptions('POST'));
        
        console.log(`Réponse pour ${participantId}:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Données reçues pour ${participantId}:`, data);
          
          successCount++;
          
          // Mettre à jour le statut localement
          setParticipants(prev => 
            prev.map(p => 
              p.id === participantId 
                ? { 
                    ...p, 
                    checkedIn: true, 
                    checkinTime: data.registration.checkInTime ? new Date(data.registration.checkInTime) : new Date() 
                  } 
                : p
            )
          );
        } else {
          let errorMessage = `Erreur lors de l'enregistrement du participant ${participantId}`;
          try {
            const errorData = await response.json();
            console.error(`Erreur pour ${participantId}:`, errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error(`Impossible de lire la réponse d'erreur pour ${participantId}:`, jsonError);
          }
          console.error(errorMessage);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error checking in participant ${participantId}:`, error);
        errorCount++;
      } finally {
        // Réinitialiser l'état de chargement pour ce participant spécifique
        setTimeout(() => {
          setProcessing(prev => ({ ...prev, [participantId]: false }));
        }, 200); // Délai plus court car c'est exécuté séquentiellement
      }
    }
    
    // Terminer le toast et afficher les résultats
    toast.dismiss('bulk-checkin');
    
    if (successCount > 0) {
      toast.success(`${successCount} participant(s) enregistré(s) avec succès`);
    }
    
    if (errorCount > 0) {
      toast.error(`Échec de l'enregistrement pour ${errorCount} participant(s)`);
    }
    
    // Réinitialiser la sélection
    setSelectedParticipants([]);
    setSelectAll(false);
    
    // Rafraîchir la liste des participants après un check-in en masse
    setTimeout(() => {
      fetchParticipants();
    }, 1000);
  };

  // Gérer le partage du badge
  const handleShareBadge = async (participant: Participant) => {
    try {
      // Utiliser l'API Web Share si disponible
      if (navigator.share) {
        await navigator.share({
          title: `Badge de ${participant.firstName} ${participant.lastName}`,
          text: `Voici le badge de ${participant.firstName} ${participant.lastName} pour l'événement`,
          url: window.location.href,
        });
      } else {
        // Fallback si l'API Web Share n'est pas supportée
        toast.success('Fonctionnalité de partage non supportée par votre navigateur');
        // Copier le lien dans le presse-papier
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papier');
      }
    } catch (error) {
      console.error('Error sharing badge:', error);
      toast.error('Erreur lors du partage du badge');
    }
  };

  // Télécharger le badge comme image
  const handleDownloadBadge = () => {
    if (!currentBadgeParticipant) return;
    
    const badgeElement = document.getElementById('participant-badge');
    if (!badgeElement) return;
    
    toast.success('Préparation du téléchargement...');
    
    // Ajouter une marge autour du badge pour l'export
    const originalStyle = badgeElement.style.cssText;
    badgeElement.style.margin = '20px';
    badgeElement.style.background = 'white';
    badgeElement.style.boxShadow = 'none';
    
    // Chercher l'élément QR code
    const qrCodeElement = badgeElement.querySelector('.badge-id-container svg');
    
    // S'assurer que le QR code est bien chargé
    if (qrCodeElement) {
      const qrCode = qrCodeElement as SVGElement;
      // Assurez-vous que l'élément SVG du QR code est configuré pour être inclus dans l'export
      qrCode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    
    setTimeout(() => {
      html2canvas(badgeElement, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // Meilleure qualité
        backgroundColor: 'white'
      }).then(canvas => {
        // Restaurer le style d'origine
        badgeElement.style.cssText = originalStyle;
        
      const link = document.createElement('a');
      link.download = `Badge_${currentBadgeParticipant.firstName}_${currentBadgeParticipant.lastName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Badge téléchargé');
    }).catch(err => {
      console.error('Error downloading badge:', err);
      toast.error('Erreur lors du téléchargement du badge');
        badgeElement.style.cssText = originalStyle;
    });
    }, 500); // Ajouter un délai pour s'assurer que le QR Code est chargé
  };

  // Ajouter la fonction d'impression du badge
  const handlePrintBadge = () => {
    if (!currentBadgeParticipant) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de votre navigateur.');
      return;
    }
    
    const qrCodeValue = currentBadgeParticipant.qrCode || currentBadgeParticipant.shortCode || currentBadgeParticipant.id.substring(0, 9);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Badge de ${currentBadgeParticipant.firstName} ${currentBadgeParticipant.lastName}</title>
          <style>
            /* ... existing styles ... */
          </style>
        </head>
        <body>
          <!-- Contenu du badge -->
          <div id="print-badge" class="w-[85mm] h-[54mm] bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden relative">
            <div class="absolute top-0 left-0 w-full h-1 bg-[#81B441]"></div>
            <div class="absolute bottom-0 right-0 w-20 h-20 bg-[#81B441]/10 rounded-full -mr-10 -mb-10"></div>
            <div class="absolute top-0 right-0 w-12 h-12 bg-[#81B441]/5 rounded-full -mr-6 -mt-6"></div>
            
            <div class="flex h-full">
              <div class="w-1/3 bg-gradient-to-b from-[#81B441] to-[#6a9834] text-white p-4 flex flex-col justify-between relative">
                <div>
                  <div class="font-bold text-xl mb-2 drop-shadow-sm">${event?.name || 'Événement'}</div>
                  <div class="text-white/80 text-sm">${new Date().toLocaleDateString()}</div>
          </div>
                
                <div class="text-xs text-white/90 backdrop-blur-sm bg-white/10 py-1 px-2 rounded">
                  <div class="font-medium">${currentBadgeParticipant.type}</div>
                  ${currentBadgeParticipant.company ? `<div class="mt-1 opacity-90">${currentBadgeParticipant.company}</div>` : ''}
                </div>
              </div>
              
              <div class="w-2/3 p-4 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                <div class="flex items-center justify-between">
                  <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                    <div class="text-[#81B441] font-bold text-xl flex items-center">
                      <span class="text-[#81B441]">In</span>
                      <span class="text-gray-700">event</span>
                    </div>
                  </div>
                </div>
                
                <div class="text-center mt-2">
                  <h2 class="text-xl font-bold tracking-tight truncate text-gray-800">
                    ${currentBadgeParticipant.firstName} ${currentBadgeParticipant.lastName}
                  </h2>
                  ${currentBadgeParticipant.jobTitle ? `<p class="text-gray-700 text-sm mt-1 truncate">${currentBadgeParticipant.jobTitle}</p>` : ''}
                  ${currentBadgeParticipant.company ? `<p class="text-[#81B441] text-sm font-semibold mt-1 truncate">${currentBadgeParticipant.company}</p>` : ''}
                </div>

                <div class="mt-3 flex justify-center">
                  <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeValue)}" 
                      width="75" 
                      height="75" 
                      alt="QR Code"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Fonction modifiée pour gérer correctement l'ouverture/fermeture du menu
  const toggleActionMenu = (e: React.MouseEvent, participantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle the menu
    setShowActionMenuFor(prevState => 
      prevState === participantId ? null : participantId
    );
  };

  // Ajoutons un effet pour gérer la fermeture en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Vérifiez si l'élément cliqué est à l'extérieur du menu dropdown
      const dropdowns = document.querySelectorAll('.dropdown-menu');
      const buttons = document.querySelectorAll('.dropdown-button');
      
      let clickedOutside = true;
      
      dropdowns.forEach(dropdown => {
        if (dropdown.contains(e.target as Node)) {
          clickedOutside = false;
        }
      });
      
      buttons.forEach(button => {
        if (button.contains(e.target as Node)) {
          clickedOutside = false;
        }
      });
      
      if (clickedOutside) {
        setShowActionMenuFor(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Gérer la modification d'un participant
  const handleEditParticipant = (e: React.MouseEvent, participant: Participant) => {
    e.stopPropagation();
    setShowActionMenuFor(null);
    setParticipantToEdit(participant);
    setNewParticipant({
      firstName: participant.firstName,
      lastName: participant.lastName,
      email: participant.email,
      phone: participant.phone,
      jobTitle: participant.jobTitle || '',
      company: participant.company || '',
      type: participant.type
    });
    setShowEditModal(true);
    document.body.classList.add('overflow-hidden');
  };
  
  // Gérer la soumission du formulaire de modification
  const handleUpdateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!participantToEdit) return;
    
    try {
      // Appeler l'API pour mettre à jour le participant
      const response = await fetchWithRetry(
        `/api/events/${eventId}/registrations/${participantToEdit.id}`,
        createFetchOptions('PUT', {
          firstName: newParticipant.firstName,
          lastName: newParticipant.lastName,
          email: newParticipant.email,
          phone: newParticipant.phone,
          jobTitle: newParticipant.jobTitle,
          company: newParticipant.company,
          type: newParticipant.type,
        })
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du participant');
      }
      
      // Réponse reçue, mais nous n'avons pas besoin d'utiliser les données retournées
      await response.json();
      
      // Mettre à jour le participant dans la liste locale
      setParticipants(participants.map(p => 
        p.id === participantToEdit.id 
          ? {
              ...p,
              firstName: newParticipant.firstName,
              lastName: newParticipant.lastName,
              email: newParticipant.email,
              phone: newParticipant.phone,
              jobTitle: newParticipant.jobTitle || undefined,
              company: newParticipant.company || undefined,
              type: newParticipant.type as 'PARTICIPANT' | 'EXHIBITOR' | 'SPEAKER',
            } 
          : p
      ));
      
      // Afficher un message de succès
      toast.success('Participant mis à jour avec succès');
      
      // Fermer le modal
      setShowEditModal(false);
      setParticipantToEdit(null);
      document.body.classList.remove('overflow-hidden');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du participant');
    }
  };
  
  // Ouvrir la confirmation de suppression
  const handleDeletePrompt = (e: React.MouseEvent, participant: Participant) => {
    e.stopPropagation();
    setShowActionMenuFor(null);
    setParticipantToDelete(participant);
    setDeleteConfirmOpen(true);
    document.body.classList.add('overflow-hidden');
  };
  
  // Fermer la confirmation de suppression
  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setParticipantToDelete(null);
    document.body.classList.remove('overflow-hidden');
  };
  
  // Supprimer un participant
  const handleDeleteParticipant = async () => {
    if (!participantToDelete) return;
    
    try {
      // Appeler l'API pour supprimer le participant
      const response = await fetchWithRetry(
        `/api/events/${eventId}/registrations/${participantToDelete.id}`,
        createFetchOptions('DELETE')
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression du participant');
      }
      
      // Supprimer le participant de la liste locale
      setParticipants(participants.filter(p => p.id !== participantToDelete.id));
      
      // Afficher un message de succès
      toast.success('Participant supprimé avec succès');
      
      // Fermer la confirmation
      closeDeleteConfirm();
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du participant');
    }
  };

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="dashboard-container">
        <EventSidebar eventId={eventId} />
        <div className="dashboard-content">
          <main className="dashboard-main">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#81B441] border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Chargement des données...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="participants-container bg-[#f9fafb] min-h-screen">
      <EventSidebar eventId={eventId} activeTab="participants" />
      
      <div className="p-6 ml-64">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
              <ChevronRightIcon className="h-4 w-4" />
              <Link href="/dashboard/events" className="hover:text-gray-700">Événements</Link>
              <ChevronRightIcon className="h-4 w-4" />
              {event && (
                <>
                  <Link href={`/dashboard/events/${eventId}`} className="hover:text-gray-700 truncate max-w-[150px]">
                    {event.name}
            </Link>
                  <ChevronRightIcon className="h-4 w-4" />
                </>
              )}
              <span className="font-medium text-gray-600">Participants</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <>Participants {event?.name && <span className="text-[#81B441]">• {event.name}</span>}</>
              )}
            </h1>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:text-[#81B441] hover:border-[#81B441]"
              onClick={downloadCsvTemplate}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Modèle CSV
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300 text-gray-600 hover:text-[#81B441] hover:border-[#81B441]">
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Importer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => document.getElementById('csv-upload')?.click()}>
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  <span>Importer CSV</span>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvUpload}
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openAddManualModal}>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  <span>Ajouter manuellement</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              onClick={() => setShowAddManual(true)}
              className="bg-[#81B441] hover:bg-[#72a339] button-hover-effect"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Ajouter un participant
            </Button>
                </div>
              </div>
              
        {/* Carte des statistiques */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total des participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? <Skeleton className="h-9 w-12" /> : participants.length}
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  participants.filter(p => p.checkedIn).length
                )}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {loading ? (
                    <Skeleton className="h-5 w-12 inline-block" />
                  ) : (
                    participants.length > 0
                      ? `(${Math.round((participants.filter(p => p.checkedIn).length / participants.length) * 100)}%)`
                      : '(0%)'
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Intervenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  participants.filter(p => p.type === 'SPEAKER').length
                )}
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  participants.filter(p => !p.checkedIn).length
                )}
            </div>
            </CardContent>
          </Card>
          </div>
          
        {/* Barre de recherche et filtres */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center w-full max-w-md relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
                    type="text"
              placeholder="Rechercher un participant..."
                    value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-[#81B441] focus:ring-[#81B441]"
                  />
                </div>
          
          <div className="flex items-center space-x-3">
            <Select value={participantType} onValueChange={setParticipantType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de participant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="PARTICIPANT">Participants</SelectItem>
                <SelectItem value="SPEAKER">Intervenants</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={checkinStatus} onValueChange={setCheckinStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut check-in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="checked-in">Enregistrés</SelectItem>
                <SelectItem value="not-checked-in">Non enregistrés</SelectItem>
              </SelectContent>
            </Select>
              </div>
            </div>
            
        {/* Actions groupées */}
            {selectedParticipants.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedParticipants.length}</span> participant(s) sélectionné(s)
                </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={handleBulkCheckIn}
              >
                <CheckBadgeIcon className="h-4 w-4 mr-1" />
                Check-in groupé
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                    onClick={handleBulkExport}
                  >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={handleBulkDelete}
                  >
                <TrashIcon className="h-4 w-4 mr-1" />
                    Supprimer
              </Button>
                </div>
              </div>
            )}
            
            {/* Tableau des participants */}
        {loading ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="h-10 bg-gray-50 border-b flex items-center px-6"></div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                      </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="text-center p-6">
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <XMarkIcon className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={fetchParticipants}>Réessayer</Button>
              </div>
            </CardContent>
          </Card>
        ) : participants.length === 0 ? (
          <Card className="text-center p-6">
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <UserIcon className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h3>
                <p className="text-gray-500 mb-4">Commencez par ajouter des participants à votre événement</p>
                <Button onClick={() => setShowAddManual(true)}>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Ajouter un participant
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Sélectionner tous les participants"
                    />
                  </TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.slice((currentPage - 1) * participantsPerPage, currentPage * participantsPerPage).map((participant) => (
                  <TableRow 
                        key={participant.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${newParticipantId === participant.id ? 'new-participant-row' : ''}`}
                    onClick={() => openSidebar(participant)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} className="w-[40px]">
                      <Checkbox 
                            checked={selectedParticipants.includes(participant.id)}
                        onCheckedChange={() => handleCheckboxChange(participant.id)}
                        aria-label={`Sélectionner ${participant.firstName} ${participant.lastName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9 bg-gradient-to-br from-blue-100 to-green-100 border border-white">
                          <AvatarFallback className="text-gray-700">{participant.firstName.charAt(0)}{participant.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{participant.firstName} {participant.lastName}</div>
                          {(participant.jobTitle || participant.company) && (
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                              {participant.jobTitle && (
                                <span className="flex items-center">
                                  <BriefcaseIcon className="h-3 w-3 inline mr-1" />
                                  {participant.jobTitle}
                                </span>
                              )}
                              {participant.jobTitle && participant.company && (
                                <span className="mx-1">•</span>
                              )}
                              {participant.company && (
                                <span className="flex items-center">
                                  <BuildingOfficeIcon className="h-3 w-3 inline mr-1" />
                                  {participant.company}
                                </span>
                              )}
                            </div>
                          )}
                              </div>
                            </div>
                    </TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>{participant.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={participant.type === 'PARTICIPANT' ? 'default' : 'secondary'}
                        className={
                          participant.type === 'PARTICIPANT' 
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }
                          >
                            {participant.type === 'PARTICIPANT' ? 'Participant' : 'Intervenant'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                          {format(participant.registrationDate, "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={participant.checkedIn ? 'outline' : 'secondary'}
                        className={
                          participant.checkedIn 
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium status-badge-success' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }
                      >
                        {participant.checkedIn ? (
                          <span className="flex items-center">
                            <CheckBadgeIcon className="h-3.5 w-3.5 mr-1" />
                            Enregistré
                          </span>
                        ) : 'Non enregistré'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (!participant.checkedIn && !processing[participant.id]) {
                              handleCheckInFromBadge(participant.id);
                            }
                          }}
                          disabled={participant.checkedIn || processing[participant.id]}
                          className={cn(
                            participant.checkedIn
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : processing[participant.id]
                                ? 'bg-green-200 text-white border-green-200'
                                : 'bg-green-200 text-white hover:bg-green-209 border-green-200',
                            "transition-all duration-200"
                          )}
                        >
                          {processing[participant.id] ? (
                            <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <QrCodeIcon className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShowBadge(participant)}>
                              <IdentificationIcon className="mr-2 h-4 w-4" />
                              <span>Voir badge</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleEditParticipant(e, participant)}>
                              <PencilIcon className="mr-2 h-4 w-4" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDeletePrompt(e, participant)}
                              className="text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                  </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
            )}
          </div>

      {/* Panneau latéral des détails du participant */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedParticipant && (
          <div className="h-full flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Détails du participant</h3>
              <Button variant="ghost" size="sm" onClick={closeSidebar} className="h-8 w-8 p-0">
                <XMarkIcon className="h-5 w-5" />
              </Button>
                </div>
                
            <div className="overflow-y-auto flex-grow">
              {/* En-tête avec Avatar */}
              <div className="p-6 pb-2 flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-gradient-to-br from-blue-100 to-green-100">
                  <AvatarFallback className="text-3xl font-medium text-gray-700">
                        {selectedParticipant.firstName.charAt(0)}{selectedParticipant.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
                        {selectedParticipant.firstName} {selectedParticipant.lastName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{selectedParticipant.email}</p>
                <Badge
                  variant={selectedParticipant.type === 'PARTICIPANT' ? 'default' : 'secondary'}
                  className={cn(
                    "mt-3",
                    selectedParticipant.type === 'PARTICIPANT' 
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  )}
                >
                          {selectedParticipant.type === 'PARTICIPANT' ? 'Participant' : 'Intervenant'}
                </Badge>
                      </div>
              
              {/* Actions principales */}
              <div className="px-6 pt-2 pb-4 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className={cn(
                    "text-gray-700 border-gray-300",
                    !selectedParticipant.checkedIn && "text-green-600 border-green-200 hover:bg-green-50"
                  )}
                  disabled={selectedParticipant.checkedIn}
                  onClick={() => selectedParticipant && handleCheckInFromBadge(selectedParticipant.id)}
                >
                  <CheckBadgeIcon className="h-4 w-4 mr-2" />
                  {selectedParticipant.checkedIn ? 'Déjà enregistré' : 'Enregistrer'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedParticipant && handleShowBadge(selectedParticipant)}
                >
                  <IdentificationIcon className="h-4 w-4 mr-2" />
                  Voir badge
                </Button>
                  </div>
                  
              <Separator className="my-1" />
              
              {/* Informations personnelles */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-[#81B441]" />
                  Informations personnelles
                    </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                            Email
                      </p>
                      <p className="text-sm text-gray-900">{selectedParticipant.email}</p>
                          </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1" />
                            Téléphone
                      </p>
                      <p className="text-sm text-gray-900">{selectedParticipant.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1">
                    {selectedParticipant.jobTitle && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <BriefcaseIcon className="h-3 w-3 mr-1" />
                          Fonction
                        </p>
                        <p className="text-sm text-gray-900">{selectedParticipant.jobTitle}</p>
                          </div>
                    )}
                    {selectedParticipant.company && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                          Entreprise
                        </p>
                        <p className="text-sm text-gray-900">{selectedParticipant.company}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
              <Separator className="my-1" />
              
              {/* Informations sur l'événement */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-[#81B441]" />
                  Informations sur l'inscription
                    </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Date d'inscription
                      </p>
                      <p className="text-sm text-gray-900">
                        {format(selectedParticipant.registrationDate, "dd MMMM yyyy", { locale: fr })}
                      </p>
                            </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <QrCodeIcon className="h-3 w-3 mr-1" />
                        Code QR
                      </p>
                      <p className="text-sm text-gray-900">{selectedParticipant.shortCode || 'Non défini'}</p>
                          </div>
                        </div>
                        
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <CheckBadgeIcon className="h-3 w-3 mr-1" />
                      Statut d'enregistrement
                    </p>
                    <div>
                      {selectedParticipant.checkedIn ? (
                        <Badge 
                          className="bg-green-50 text-green-700 border border-green-200 status-badge-success"
                        >
                          <span className="flex items-center">
                            <CheckBadgeIcon className="h-3.5 w-3.5 mr-1" />
                            Enregistré le {selectedParticipant.checkinTime ? format(new Date(selectedParticipant.checkinTime), "dd/MM/yyyy à HH:mm", { locale: fr }) : ''}
                          </span>
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-50 text-gray-600 border border-gray-200">
                          Non enregistré
                        </Badge>
            )}
          </div>
                </div>
                  </div>
                      </div>
                    </div>
                    
            {/* Actions en bas du panneau */}
            <div className="p-5 border-t flex justify-between">
              <Button 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  if (selectedParticipant) {
                    handleDeletePrompt(new MouseEvent('click') as React.MouseEvent, selectedParticipant);
                    closeSidebar();
                  }
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedParticipant) {
                    handleEditParticipant(new MouseEvent('click') as React.MouseEvent, selectedParticipant);
                    closeSidebar();
                  }
                }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              </div>
            </div>
          )}
                </div>
                
      {/* Modal d'ajout de participant */}
      <Dialog open={showAddManual} onOpenChange={(open) => !open && closeAddModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un participant</DialogTitle>
            <DialogDescription>
              Créez un nouveau participant pour cet événement.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddParticipant} className="form-animation">
            <div className="grid gap-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-field-animation">
                  <label htmlFor="firstName" className="text-xs font-medium text-gray-700 mb-1 block">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                  <Input
                        id="firstName"
                        name="firstName"
                    placeholder="Prénom"
                    required
                        value={newParticipant.firstName}
                        onChange={handleInputChange}
                    autoComplete="given-name"
                    className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441]"
                      />
                    </div>
                    
                <div className="form-field-animation">
                  <label htmlFor="lastName" className="text-xs font-medium text-gray-700 mb-1 block">
                        Nom <span className="text-red-500">*</span>
                      </label>
                  <Input
                        id="lastName"
                        name="lastName"
                    placeholder="Nom"
                    required
                        value={newParticipant.lastName}
                        onChange={handleInputChange}
                    autoComplete="family-name"
                    className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441]"
                      />
                </div>
                    </div>
                    
              <div className="form-field-animation">
                <label htmlFor="email" className="text-xs font-medium text-gray-700 mb-1 block">
                        Email <span className="text-red-500">*</span>
                      </label>
                <Input
                        id="email"
                        name="email"
                  type="email"
                  placeholder="email@exemple.com"
                  required
                        value={newParticipant.email}
                        onChange={handleInputChange}
                  autoComplete="email"
                  className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441]"
                />
              </div>
              
              <div className="form-field-animation">
                <label htmlFor="phone" className="text-xs font-medium text-gray-700 mb-1 block">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+33 6 12 34 56 78"
                        required
                  value={newParticipant.phone}
                  onChange={handleInputChange}
                  autoComplete="tel"
                  className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441]"
                      />
                    </div>
                    
              <div className="grid grid-cols-2 gap-3">
                <div className="form-field-animation">
                  <label htmlFor="jobTitle" className="text-xs font-medium text-gray-700 mb-1 block">
                          Fonction
                        </label>
                  <Input
                          id="jobTitle"
                          name="jobTitle"
                    placeholder="Fonction / Poste"
                          value={newParticipant.jobTitle}
                          onChange={handleInputChange}
                    className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441]"
                        />
                      </div>
                      
                <div className="form-field-animation">
                  <label htmlFor="company" className="text-xs font-medium text-gray-700 mb-1 block">
                    Entreprise
                        </label>
                  <Input
                          id="company"
                          name="company"
                    placeholder="Nom de l'entreprise"
                          value={newParticipant.company}
                          onChange={handleInputChange}
                    className="border-gray-300 focus:border-[#81B441] focus:ring-[#81B441]"
                        />
                      </div>
                    </div>
                    
              <div className="form-field-animation">
                <label htmlFor="type" className="text-xs font-medium text-gray-700 mb-1 block">
                  Type de participant <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="type"
                          name="type"
                  required
                          value={newParticipant.type}
                          onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#81B441] focus:outline-none focus:ring-[#81B441]"
                        >
                          <option value="PARTICIPANT">Participant</option>
                          <option value="SPEAKER">Intervenant</option>
                        </select>
                      </div>
                </div>
                
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={closeAddModal}>
                    Annuler
              </Button>
              <Button type="submit" className="bg-[#81B441] hover:bg-[#72a339] button-hover-effect">
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              <div className="flex items-center">
                <TrashIcon className="h-5 w-5 mr-2" />
                Confirmer la suppression
                </div>
            </DialogTitle>
            <DialogDescription>
              {participantToDelete && (
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir supprimer définitivement le participant <strong>{participantToDelete.firstName} {participantToDelete.lastName}</strong> ?
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={closeDeleteConfirm}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteParticipant}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal du badge */}
      <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Badge du participant</DialogTitle>
          </DialogHeader>
          
          {currentBadgeParticipant && (
            <ParticipantBadge
              firstName={currentBadgeParticipant.firstName}
              lastName={currentBadgeParticipant.lastName}
              jobTitle={currentBadgeParticipant.jobTitle}
              company={currentBadgeParticipant.company}
              qrCode={currentBadgeParticipant.qrCode}
              eventName={event?.name || 'Événement'}
              eventBanner={event?.banner}
            />
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {currentBadgeParticipant && !currentBadgeParticipant.checkedIn && (
              <Button 
                onClick={() => currentBadgeParticipant && handleCheckInFromBadge(currentBadgeParticipant.id)}
                className="w-full bg-[#81B441] hover:bg-[#72a139]"
              >
                <CheckBadgeIcon className="h-4 w-4 mr-2" />
                Enregistrer le participant
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
                    </div>
  );
} 


// Fermer la boîte de dialogue de confirmation d'annulation de check-in
const closeCancelCheckInConfirm = () => {
  setCancelCheckInConfirmOpen(false);
};

// Gérer l'annulation de l'enregistrement d'un participant
const handleCancelCheckIn = async () => {
  if (!selectedParticipant) return;
  
  try {
    setProcessing((prev: Record<string, boolean>) => ({ ...prev, [selectedParticipant.id]: true }));
    
    // Appel à l'API pour annuler l'enregistrement
    const response = await fetchWithRetry(
      `/api/events/${params.id}/registrations/${selectedParticipant.id}/cancel-checkin`, 
      createFetchOptions('POST')
    );
    
    if (response.ok) {
      // Mettre à jour l'état local du participant
      setParticipants(prev => 
        prev.map(p => 
          p.id === selectedParticipant.id 
            ? { ...p, checkedIn: false, checkinTime: undefined } 
            : p
        )
      );
      
      // Mettre à jour le participant sélectionné dans la sidebar
      setSelectedParticipant({
        ...selectedParticipant,
        checkedIn: false,
        checkinTime: undefined
      });
      
      toast.success('Enregistrement annulé avec succès');
      
      // Rafraîchir la liste des participants
      setTimeout(() => {
        fetchParticipants();
      }, 1000);
    } else {
      // Gérer les erreurs
      const error = await response.json();
      toast.error(error.message || 'Erreur lors de l\'annulation');
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    toast.error('Erreur technique lors de l\'annulation');
  } finally {
    setProcessing((prev: Record<string, boolean>) => ({ ...prev, [selectedParticipant.id]: false }));
  }
};