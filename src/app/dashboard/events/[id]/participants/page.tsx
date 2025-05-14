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
  HomeIcon,
  TrashIcon,
  IdentificationIcon,
  ShareIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TicketIcon,
  CheckIcon,
  ArrowUturnLeftIcon
} from "@heroicons/react/24/outline";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import Link from "next/link";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";

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

export default function EventParticipantsPage({ params }: { params: { id: string } }) {
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
  const [participantType, setParticipantType] = useState('');
  const [checkinStatus, setCheckinStatus] = useState('');
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
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        
        console.warn(`Requête vers ${url} a échoué avec le statut ${response.status}, tentative ${retries + 1}/${maxRetries}`);
        retries++;
        
        // Attendre un peu plus longtemps entre chaque tentative (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
      } catch (error) {
        console.error(`Erreur lors de la requête vers ${url}:`, error);
        retries++;
        
        if (retries >= maxRetries) {
          throw error;
        }
        
        // Attendre un peu plus longtemps entre chaque tentative
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
      }
    }
    
    throw new Error(`La requête vers ${url} a échoué après ${maxRetries} tentatives.`);
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
    if (participantType && participant.type !== participantType) {
      return false;
    }
    
    // Filtre par statut de check-in
    if (checkinStatus) {
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
      
    setParticipants([...participants, participant]);
      
      // Afficher un message de succès
      toast.success('Participant ajouté avec succès');
    
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
    <>
      {/* Styles CSS pour la sidebar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .participant-sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: none;
          z-index: 40;
        }
        
        .participant-sidebar-overlay.open {
          display: block;
        }
        
        .participant-sidebar {
          position: fixed;
          top: 0;
          right: -100%;
          width: 420px;
          max-width: 90vw;
          height: 100vh;
          background-color: #fff;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          z-index: 50;
          transition: right 0.3s ease-in-out;
          overflow-y: auto;
        }
        
        .participant-sidebar.open {
          right: 0;
        }
        
        .participant-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .participant-sidebar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        
        .participant-sidebar-close {
          color: #6b7280;
          transition: color 0.2s;
        }
        
        .participant-sidebar-close:hover {
          color: #111827;
        }
        
        .participant-sidebar-body {
          padding: 1.5rem;
        }
        
        .participant-header-details {
          margin-bottom: 1.5rem;
        }
        
        .participant-sidebar-section {
          margin-bottom: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .participant-sidebar-section-title {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .participant-sidebar-content {
          padding: 1rem;
        }
        
        .participant-sidebar-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .participant-sidebar-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .participant-sidebar-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }
        
        .participant-sidebar-value {
          font-size: 0.975rem;
          color: #111827;
        }
        
        .participant-status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .participant-status-badge.participant {
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }
        
        .participant-status-badge.speaker {
          background-color: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        
        .participant-status-badge.registered {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .participant-status-badge.not-registered {
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        
        .participant-row {
          cursor: pointer;
        }
        
        .bulk-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background-color: #f3f4f6;
          border-top: 1px solid #e5e7eb;
        }
        
        .selected-count {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .bulk-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .bulk-action-btn, .bulk-action-delete {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        .bulk-action-btn {
          background-color: white;
          color: #4b5563;
          border: 1px solid #d1d5db;
        }
        
        .bulk-action-btn:hover {
          background-color: #f9fafb;
        }
        
        .bulk-action-delete {
          background-color: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        
        .bulk-action-delete:hover {
          background-color: #fef2f2;
        }
        
        .pagination-container {
          border-top: 1px solid #e5e7eb;
        }
        
        .pagination-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
          cursor: pointer;
        }
        
        .pagination-button:hover:not(.pagination-button-disabled) {
          background-color: #f9fafb;
        }
        
        .pagination-button-disabled {
          cursor: not-allowed;
          color: #9ca3af;
          background-color: #f3f4f6;
        }
        
        .pagination-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
          cursor: pointer;
        }
        
        .pagination-number:hover:not(.pagination-number-active) {
          background-color: #f9fafb;
        }
        
        .pagination-number-active {
          background-color: #81B441;
          border-color: #81B441;
          color: white;
        }
        
        .checkbox {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.25rem;
          border: 1px solid #d1d5db;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
        }
        
        .checkbox:checked {
          background-color: #81B441;
          border-color: #81B441;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.375rem;
        }
        
        .form-input, .form-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          font-size: 0.875rem;
          color: #1f2937;
        }
        
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #81B441;
          box-shadow: 0 0 0 3px rgba(129, 180, 65, 0.2);
        }
        
        .btn-cancel {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          background-color: white;
          border: 1px solid #d1d5db;
          cursor: pointer;
        }
        
        .btn-cancel:hover {
          background-color: #f9fafb;
        }
        
        .btn-primary {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          background-color: #81B441;
          border: 1px solid #81B441;
          cursor: pointer;
        }
        
        .btn-primary:hover {
          background-color: #6a9636;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 40;
          padding: 1rem;
        }
        
        .modal-container {
          background-color: white;
          border-radius: 0.5rem;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .modal-container.modal-lg {
          max-width: 800px;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        
        .modal-close {
          color: #6b7280;
          transition: color 0.2s;
        }
        
        .modal-close:hover {
          color: #111827;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .badge-card {
          width: 100%;
          max-width: 350px;
          background-color: white;
        }
        
        /* Ajout de styles pour les boutons de check-in */
        .checkin-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .checkin-button-loading {
          position: relative;
          cursor: not-allowed;
        }
        
        .checkin-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .checkin-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          border: 2px solid currentColor;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />

    <div className="dashboard-container">
      <EventSidebar eventId={eventId} />
      <div className="dashboard-content">
        <main className="dashboard-main">
          {/* Navigation Links */}
            <div className="flex gap-4 mb-6 pt-6 pl-2">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
                <HomeIcon className="h-5 w-5 mr-2" />
              <span>Accueil</span>
            </Link>
          </div>
          
          {/* Informations de l'événement */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Informations de l&apos;événement</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <div className="text-sm text-gray-500 font-medium">Date</div>
                <div className="text-lg font-semibold flex items-center mt-1">
                  <CalendarIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                    {event?.startDate ? format(new Date(event.startDate), "dd MMMM yyyy", { locale: fr }) : "Date non définie"}
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm text-gray-500 font-medium">Lieu</div>
                <div className="text-lg font-semibold flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-[#81B441]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                    {event?.location || "Lieu non défini"}
                </div>
              </div>
              
              <div className="flex flex-col">
                  <div className="text-sm text-gray-500 font-medium">Participants</div>
                <div className="text-lg font-semibold flex items-center mt-1">
                  <UserIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                    {participants.length} au total
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="text-sm text-gray-500 font-medium">Check-in</div>
                  <div className="text-lg font-semibold flex items-center mt-1">
                    <TicketIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                    <span className="flex items-center">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-md mr-2 font-bold">{participants.filter(p => p.checkedIn).length}</span> 
                      enregistrés
                    </span>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      ({participants.length > 0 
                        ? Math.round((participants.filter(p => p.checkedIn).length / participants.length) * 100) 
                        : 0}%)
                    </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <span className="text-gray-900">Participants</span>
                {event && (
                  <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    {filteredParticipants.length}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez les participants inscrits à votre événement
              </p>
            </div>
              <div className="flex space-x-3">
                <Link
                  href={`/checkin/${event?.slug}`}
                  className="btn flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <TicketIcon className="h-5 w-5" />
                  Mode Check-in
                </Link>
                <Link
                  href={`/dashboard/events/${eventId}/participants/add`}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-[#81B441] hover:bg-[#6a9636] text-white font-medium transition-all shadow-sm hover:shadow"
            >
              <UserPlusIcon className="h-5 w-5" />
              Ajouter un participant
                </Link>
              </div>
          </div>
          
          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px] relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un participant par nom, email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent appearance-none bg-white"
                    value={participantType}
                    onChange={(e) => {
                      setParticipantType(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">Tous les types</option>
                    <option value="PARTICIPANT">Participants</option>
                    <option value="SPEAKER">Intervenants</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 transform rotate-90" />
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent appearance-none bg-white"
                    value={checkinStatus}
                    onChange={(e) => {
                      setCheckinStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="checked-in">Enregistrés</option>
                    <option value="not-checked-in">Non enregistrés</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 transform rotate-90" />
                  </div>
                </div>
              </div>
            </div>
              
              {/* Section d'importation/exportation */}
              <div className="p-4 bg-gray-50 border-t border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Importation / Exportation</h3>
                    <p className="text-xs text-gray-500 mt-1">Gérez vos participants en masse</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Link
                        href={`/dashboard/events/${eventId}/participants/import`}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4 text-gray-500" />
                        Importer CSV
                      </Link>
                    </div>
                    
                    <button
                      onClick={handleBulkExport}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 text-gray-500" />
                      Exporter Excel
                    </button>
                    
                    <button
                      onClick={downloadCsvTemplate}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 text-gray-500" />
                      Télécharger modèle
                    </button>
                </div>
              </div>
            </div>
            
            {/* Bulk actions bar */}
            {selectedParticipants.length > 0 && (
              <div className="bulk-actions-bar">
                <div className="selected-count">
                  {selectedParticipants.length} participant(s) sélectionné(s)
                </div>
                <div className="bulk-actions">
                  <button 
                    onClick={(e) => {
                      e.preventDefault(); // Empêcher la navigation par défaut
                      e.stopPropagation(); // Empêcher la propagation de l'événement
                      if (!selectedParticipants.some(id => processing[id])) {
                        handleBulkCheckIn();
                      }
                    }}
                    type="button" // Spécifier explicitement le type button
                    className={`bulk-action-btn bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1 ${selectedParticipants.some(id => processing[id]) ? 'checkin-button-loading' : 'checkin-button'}`}
                    disabled={selectedParticipants.some(id => processing[id])}
                  >
                    {selectedParticipants.some(id => processing[id]) ? (
                      <>
                        <span className="checkin-spinner border-green-700"></span>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                  <button 
                    className="bulk-action-btn"
                    onClick={handleBulkExport}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Exporter Excel
                  </button>
                  <button 
                    className="bulk-action-delete"
                    onClick={handleBulkDelete}
                  >
                    <TrashIcon className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            )}
            
            {/* Tableau des participants */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d&apos;inscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Aucun participant ne correspond à vos critères.
                      </td>
                    </tr>
                  ) : (
                    currentParticipants.map((participant) => (
                      <tr 
                        key={participant.id} 
                        className={`participant-row hover:bg-gray-50 transition-colors duration-150 ${
                            selectedParticipants.includes(participant.id) ? 'bg-blue-50' : ''
                        }`}
                          onClick={() => openSidebar(participant)}
                      >
                        <td className="px-3 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedParticipants.includes(participant.id)}
                            onChange={() => handleCheckboxChange(participant.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button 
                            className="inline-flex items-center justify-center p-2 rounded-full bg-[#81B441]/10 hover:bg-[#81B441]/20 transition-colors"
                            title="Afficher badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowBadge(participant);
                            }}
                          >
                            <IdentificationIcon className="h-5 w-5 text-[#81B441]" />
                          </button>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        >
                          <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                              {participant.firstName.charAt(0)}{participant.lastName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {participant.firstName} {participant.lastName}
                              </div>
                                {participant.jobTitle && (
                                  <div className="text-xs text-gray-500">
                                    {participant.jobTitle}{participant.company ? ` • ${participant.company}` : ''}
                                  </div>
                                )}
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        >
                          <div className="text-sm text-gray-900">{participant.email}</div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        >
                          <div className="text-sm text-gray-900">{participant.phone}</div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        >
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${participant.type === 'PARTICIPANT' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-green-100 text-green-800 border border-green-200'}`}
                          >
                            {participant.type === 'PARTICIPANT' ? 'Participant' : 'Intervenant'}
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                        >
                          {format(participant.registrationDate, "dd/MM/yyyy", { locale: fr })}
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${participant.checkedIn 
                              ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                          >
                            {participant.checkedIn ? (
                              <span className="flex items-center">
                                <CheckBadgeIcon className="h-3.5 w-3.5 mr-1" />
                                Enregistré
                              </span>
                            ) : 'Non enregistré'}
                          </span>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault(); // Empêcher la navigation par défaut
                                  e.stopPropagation(); // Empêcher la propagation de l'événement
                                  
                                  // S'assurer que le participant n'est pas déjà enregistré et qu'il n'y a pas de traitement en cours
                                  if (!participant.checkedIn && !processing[participant.id]) {
                                    console.log(`Clic sur check-in pour participant: ${participant.id}`);
                                    handleCheckInFromBadge(participant.id);
                                  } else {
                                    console.log('Check-in impossible: participant déjà enregistré ou traitement en cours');
                                  }
                                }}
                                className={`participant-checkin-button ${
                                  participant.checkedIn
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed p-2 rounded-md'
                                    : processing[participant.id]
                                      ? 'bg-green-500 text-white checkin-button-loading p-2 rounded-md'
                                      : 'bg-green-500 text-white hover:bg-green-600 shadow-md border border-green-600 transition-all duration-200 transform hover:scale-105 checkin-button p-3 rounded-md'
                                }`}
                                disabled={participant.checkedIn || processing[participant.id]}
                                title={participant.checkedIn ? 'Déjà enregistré' : (processing[participant.id] ? 'Enregistrement en cours...' : 'Enregistrer ce participant')}
                                type="button" // Spécifier explicitement le type button
                                aria-label="Check-in"
                              >
                                {processing[participant.id] ? (
                                  <span className="checkin-spinner"></span>
                                ) : (
                                  <>
                                    <QrCodeIcon className={participant.checkedIn ? "h-5 w-5" : "h-6 w-6"} />
                                    {!participant.checkedIn && (
                                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-green-600 border border-green-500">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                                        <span className="relative">+</span>
                                      </span>
                                    )}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => toggleActionMenu(e, participant.id)}
                                className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                                title="Actions"
                              >
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </button>
                            </div>
                            
                            {showActionMenuFor === participant.id && (
                              <div 
                                className="absolute right-10 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                              >
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowBadge(participant);
                                      setShowActionMenuFor(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    role="menuitem"
                                  >
                                    <IdentificationIcon className="mr-3 h-4 w-4 text-gray-500" />
                                    Voir badge
                                  </button>
                                  <button
                                    onClick={(e) => handleEditParticipant(e, participant)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    role="menuitem"
                                  >
                                    <PencilIcon className="mr-3 h-4 w-4 text-gray-500" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={(e) => handleDeletePrompt(e, participant)}
                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                    role="menuitem"
                                  >
                                    <TrashIcon className="mr-3 h-4 w-4 text-red-500" />
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Affichage de <span className="font-medium">{(currentPage - 1) * participantsPerPage + 1}</span> à{' '}
                        <span className="font-medium">{Math.min(currentPage * participantsPerPage, filteredParticipants.length)}</span> sur{' '}
                        <span className="font-medium">{filteredParticipants.length}</span> résultats
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                  <button
                        onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                        className={`pagination-button ${currentPage === 1 ? 'pagination-button-disabled' : ''}`}
                        aria-label="Première page"
                  >
                        <ChevronDoubleLeftIcon className="h-4 w-4" />
                  </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`pagination-button ${currentPage === 1 ? 'pagination-button-disabled' : ''}`}
                        aria-label="Page précédente"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`pagination-number ${pageNumber === currentPage ? 'pagination-number-active' : ''}`}
                          aria-label={`Page ${pageNumber}`}
                          aria-current={pageNumber === currentPage ? 'page' : undefined}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`pagination-button ${currentPage === totalPages ? 'pagination-button-disabled' : ''}`}
                        aria-label="Page suivante"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`pagination-button ${currentPage === totalPages ? 'pagination-button-disabled' : ''}`}
                        aria-label="Dernière page"
                      >
                        <ChevronDoubleRightIcon className="h-4 w-4" />
                      </button>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Assurez-vous que le panneau latéral est toujours inclus */}
          <div className={`participant-sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>
          <div className={`participant-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {selectedParticipant && (
              <>
                <div className="participant-sidebar-header">
                  <h3 className="participant-sidebar-title">Détails du participant</h3>
                  <button className="participant-sidebar-close" onClick={closeSidebar}>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="participant-sidebar-body">
                  <div className="participant-header-details">
                    <div className="flex justify-center mb-4">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-100 to-green-100 flex items-center justify-center text-gray-700 text-xl font-medium border-4 border-white shadow-md">
                        {selectedParticipant.firstName.charAt(0)}{selectedParticipant.lastName.charAt(0)}
                      </div>
                    </div>
                    <div className="participant-header-info text-center">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedParticipant.firstName} {selectedParticipant.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedParticipant.email}
                      </p>
                      <div className="mt-3">
                        <span className={`participant-status-badge ${selectedParticipant.type === 'PARTICIPANT' ? 'participant' : 'speaker'}`}>
                          {selectedParticipant.type === 'PARTICIPANT' ? 'Participant' : 'Intervenant'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="participant-sidebar-section">
                    <h4 className="participant-sidebar-section-title flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                      Informations de contact
                    </h4>
                    <div className="participant-sidebar-content">
                      <div className="participant-sidebar-info">
                        <div className="participant-sidebar-field">
                          <div className="participant-sidebar-label flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Email
                          </div>
                          <div className="participant-sidebar-value">{selectedParticipant.email}</div>
                        </div>
                        <div className="participant-sidebar-field">
                          <div className="participant-sidebar-label flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Téléphone
                          </div>
                          <div className="participant-sidebar-value">{selectedParticipant.phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="participant-sidebar-section">
                    <h4 className="participant-sidebar-section-title flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                      Détails d&apos;inscription
                    </h4>
                    <div className="participant-sidebar-content">
                      <div className="participant-sidebar-info">
                        <div className="participant-sidebar-field">
                          <div className="participant-sidebar-label flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Date d&apos;inscription
                          </div>
                          <div className="participant-sidebar-value">
                            {format(selectedParticipant.registrationDate, "dd MMMM yyyy", { locale: fr })}
                          </div>
                        </div>
                        <div className="participant-sidebar-field">
                          <div className="participant-sidebar-label flex items-center">
                            <CheckBadgeIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Statut
                          </div>
                          <div className="participant-sidebar-value">
                            <span className={`participant-status-badge ${selectedParticipant.checkedIn ? 'registered' : 'not-registered'}`}>
                              {selectedParticipant.checkedIn ? 'Enregistré' : 'Non enregistré'}
                            </span>
                          </div>
                        </div>
                        {selectedParticipant.checkedIn && selectedParticipant.checkinTime && (
                          <div className="participant-sidebar-field">
                            <div className="participant-sidebar-label flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                              Date d&apos;enregistrement
                            </div>
                            <div className="participant-sidebar-value">
                              {format(selectedParticipant.checkinTime, "dd MMMM yyyy HH:mm", { locale: fr })}
                            </div>
                          </div>
                        )}
                        
                        {/* Bouton d'annulation d'enregistrement */}
                        {selectedParticipant.checkedIn && (
                          <div className="participant-sidebar-field mt-4">
                            <button
                              onClick={async () => {
                                if (confirm("Êtes-vous sûr de vouloir annuler l'enregistrement de ce participant ?")) {
                                  try {
                                    setProcessing(prev => ({ ...prev, [selectedParticipant.id]: true }));
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
                                      const error = await response.json();
                                      toast.error(error.message || 'Erreur lors de l\'annulation');
                                    }
                                  } catch (err) {
                                    console.error('Erreur lors de l\'annulation:', err);
                                    toast.error('Erreur technique lors de l\'annulation');
                                  } finally {
                                    setProcessing(prev => ({ ...prev, [selectedParticipant.id]: false }));
                                  }
                                }
                              }}
                              className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center"
                              disabled={processing[selectedParticipant.id]}
                            >
                              {processing[selectedParticipant.id] ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  En cours...
                                </span>
                              ) : (
                                <>
                                  <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
                                  Annuler l&apos;enregistrement
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="participant-sidebar-section">
                    <h4 className="participant-sidebar-section-title flex items-center">
                      <TicketIcon className="h-5 w-5 mr-2 text-[#81B441]" />
                      Code d&apos;enregistrement
                    </h4>
                    <div className="participant-sidebar-content">
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-3 relative">
                          {/* Badge si déjà enregistré */}
                          {selectedParticipant.checkedIn && (
                            <div className="absolute -top-3 -right-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">
                              Déjà enregistré
                            </div>
                          )}
                          
                          {/* ID Card instead of QR Code */}
                          <div className="bg-gray-50 p-5 flex items-center justify-center overflow-hidden">
                            <div className="text-center">
                              <QRCodeSVG 
                                value={selectedParticipant.qrCode || selectedParticipant.shortCode || selectedParticipant.id.substring(0, 9)} 
                                size={120} 
                                level="M"
                                includeMargin={true}
                              />
                            </div>
                          </div>
                          
                          {/* Légende */}
                          <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100 text-sm text-gray-600 mt-2">
                            Ce code est unique pour l&apos;événement
                          </div>
                        </div>
                        
                        {/* Bouton pour voir le QR code brut */}
                        <Link 
                          href={`/participant-qr/${selectedParticipant.id}`}
                          className="mb-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m10 0h1m-7-3V8m0 0h1m-1 0H9m5 0H9" />
                          </svg>
                          <span>Voir QR Code Brut</span>
                        </Link>
                        
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-700 max-w-md">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm">
                                Ce code est unique à ce participant et cet événement.
                                Utilisez-le pour enregistrer la présence du participant.
                              </p>
                            </div>
                          </div>
                        </div>
                          
                        {!selectedParticipant.checkedIn && (
                          <button
                            type="button"
                            disabled={processing[selectedParticipant.id]}
                            className={`px-4 py-2 bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white font-medium rounded-md shadow-sm hover:shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#81B441]/50 flex items-center gap-2 transition-all disabled:opacity-70 ${processing[selectedParticipant.id] ? 'checkin-button-loading' : 'checkin-button'}`}
                            onClick={(e) => {
                              e.preventDefault(); // Empêcher la navigation par défaut
                              e.stopPropagation(); // Empêcher la propagation de l'événement
                              if (!processing[selectedParticipant.id]) {
                                handleCheckInFromBadge(selectedParticipant.id);
                              }
                            }}
                          >
                            {processing[selectedParticipant.id] ? (
                              <>
                                <span className="checkin-spinner border-white"></span>
                                <span>Enregistrement...</span>
                              </>
                            ) : (
                              <>
                                <CheckIcon className="h-5 w-5" />
                                <span>Enregistrer le participant</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

            {/* Modal d'ajout de participant - Choix du mode */}
            {showAddModal && !showAddManual && (
            <div className="modal-overlay">
              <div className="modal-container modal-lg">
                {/* En-tête avec titre et bouton de fermeture */}
                <div className="modal-header">
                  <h3 className="modal-title">Ajouter des participants</h3>
                  <button 
                    className="modal-close" 
                    onClick={closeAddModal}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Corps du modal avec deux options */}
                <div className="modal-body">
                  <div className="text-center mb-6">
                    <p className="text-gray-600">Choisissez une méthode pour ajouter des participants</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Importer CSV */}
                      <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Importer CSV</h4>
                        <p className="text-sm text-center text-gray-500 mb-4">Importez une liste de participants à partir d&apos;un fichier CSV</p>
                      
                        <div className="mt-2 w-full">
                        <div className="flex justify-center mb-3">
                          <a 
                            href="#" 
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                              onClick={(e) => {
                                e.preventDefault();
                                downloadCsvTemplate(e);
                              }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Télécharger le modèle CSV
                          </a>
                        </div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 text-center">
                          Sélectionnez votre fichier CSV
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Cliquez pour importer</span> ou glissez-déposez
                              </p>
                              <p className="text-xs text-gray-500">CSV uniquement (Max 10MB)</p>
                            </div>
                            <input 
                              type="file" 
                                id="csvUpload"
                              accept=".csv" 
                              className="hidden" 
                              onChange={handleCsvUpload}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Option 2: Ajout manuel */}
                    <div 
                      className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={openAddManualModal}
                    >
                      <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Ajouter manuellement</h4>
                      <p className="text-sm text-center text-gray-500">Ajoutez un participant en remplissant un formulaire</p>
                    </div>
                  </div>
                </div>
                
                {/* Footer avec boutons d'action */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeAddModal}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal d'ajout manuel de participant */}
          {showAddManual && (
            <div className="modal-overlay">
              <div className="modal-container modal-lg">
                {/* En-tête avec titre et bouton de fermeture */}
                <div className="modal-header">
                  <h3 className="modal-title">Ajouter un participant</h3>
                  <button 
                    className="modal-close" 
                      onClick={closeAddManualModal}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Corps du formulaire */}
                <div className="modal-body">
                  <form onSubmit={handleAddParticipant}>
                    {/* Champ prénom */}
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={newParticipant.firstName}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Prénom du participant"
                      />
                    </div>
                    
                    {/* Champ nom */}
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={newParticipant.lastName}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Nom du participant"
                      />
                    </div>
                    
                    {/* Champ email */}
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newParticipant.email}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="email@exemple.com"
                      />
                    </div>
                    
                    {/* Champs supplémentaires - Fonction et Entreprise */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="jobTitle" className="form-label">
                          Fonction
                        </label>
                        <input
                          type="text"
                          id="jobTitle"
                          name="jobTitle"
                          value={newParticipant.jobTitle}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Directeur, Manager, etc."
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="company" className="form-label">
                          Nom de l&apos;entreprise
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={newParticipant.company}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Nom de la société"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Champ téléphone */}
                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={newParticipant.phone}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="+221 XX XXX XX XX"
                        />
                      </div>
                      
                      {/* Type de participant */}
                      <div className="form-group">
                        <label htmlFor="type" className="form-label">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={newParticipant.type}
                          onChange={handleInputChange}
                          required
                          className="form-select"
                        >
                          <option value="PARTICIPANT">Participant</option>
                          <option value="SPEAKER">Intervenant</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>
                
                {/* Footer avec boutons d'action */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                      onClick={closeAddManualModal}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    onClick={handleAddParticipant}
                  >
                    Ajouter le participant
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal pour afficher le badge */}
          {showBadgeModal && currentBadgeParticipant && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseBadgeModal}>
                <div 
                  className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                {/* En-tête avec titre et bouton de fermeture */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Badge du participant</h3>
                  <button 
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={handleCloseBadgeModal}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Corps du modal avec le design du badge */}
                  <div className="overflow-y-auto p-6 flex-1">
                    <div id="participant-badge" className="badge-card border border-gray-200 rounded-lg overflow-hidden shadow-lg mx-auto" style={{ maxWidth: "350px" }}>
                    {/* Partie supérieure avec l'image de l'événement */}
                      <div className="h-40 overflow-hidden relative">
                      {event?.banner ? (
                        <img 
                          src={event.banner} 
                          alt="Bannière de l'événement"
                          className="w-full h-full object-cover"
                            onLoad={() => setImageLoading(false)} 
                            onError={(e) => {
                              console.error("Erreur de chargement de l'image:", e);
                              setImageLoading(false);
                            }}
                        />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#f0f4e3] text-gray-700">
                            <span className="text-xl font-medium">Image de l&apos;événement</span>
                          </div>
                        )}
                        {imageLoading && event?.banner && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#81B441]"></div>
                          </div>
                        )}
                    </div>
                    
                    {/* Partie avec le QR code */}
                      <div className="bg-white py-6 flex justify-center">
                        {currentBadgeParticipant && (
                          <div className="relative badge-id-container">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                              <QRCodeSVG 
                                value={currentBadgeParticipant.qrCode || currentBadgeParticipant.shortCode || currentBadgeParticipant.id.substring(0, 9)} 
                                size={150} 
                                level="M"
                                includeMargin={true}
                              />
                            </div>
                          </div>
                        )}
                    </div>
                    
                    {/* Informations du participant */}
                      <div className="bg-white py-6 px-4 text-center border-t border-gray-100">
                        {currentBadgeParticipant && (
                          <>
                            <h2 className="text-2xl font-bold text-gray-900">
                        {currentBadgeParticipant.firstName}
                      </h2>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {currentBadgeParticipant.lastName}
                      </h2>
                      
                        {currentBadgeParticipant.jobTitle && (
                              <p className="text-lg font-medium text-gray-700 mb-1">
                            {currentBadgeParticipant.jobTitle}
                          </p>
                        )}
                        
                        {currentBadgeParticipant.company && (
                              <p className="text-lg text-[#81B441] font-semibold">
                            {currentBadgeParticipant.company}
                          </p>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Powered by inevent tag */}
                      <div className="bg-gray-50 py-2 px-4 text-center border-t border-gray-100 text-xs text-gray-500">
                        powered by inevent
                    </div>
                  </div>
                </div>
                
                {/* Footer avec boutons d'action */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2 justify-end">
                    {!currentBadgeParticipant.checkedIn && (
                  <button
                    type="button"
                        disabled={processing[currentBadgeParticipant.id]}
                        className={`px-3.5 py-2 bg-gradient-to-r from-[#81B441] to-[#6a9636] text-white font-medium rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441] flex items-center gap-1.5 text-sm disabled:opacity-70 disabled:transform-none disabled:hover:shadow-md ${processing[currentBadgeParticipant.id] ? 'checkin-button-loading' : 'checkin-button'}`}
                        onClick={(e) => {
                          e.preventDefault(); // Empêcher la navigation par défaut
                          e.stopPropagation(); // Empêcher la propagation de l'événement
                          if (!processing[currentBadgeParticipant.id]) {
                            handleCheckInFromBadge(currentBadgeParticipant.id);
                          }
                        }}
                  >
                        {processing[currentBadgeParticipant.id] ? (
                          <>
                            <span className="checkin-spinner border-white"></span>
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <QrCodeIcon className="h-4 w-4" />
                            <span>Enregistrer</span>
                          </>
                        )}
                  </button>
                    )}
                    
                    <div className="flex gap-2">
                  <button
                    type="button"
                        className="px-2 py-1.5 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none flex items-center gap-1 text-sm"
                    onClick={handlePrintBadge}
                  >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                    </svg>
                    Imprimer
                  </button>
                      
                  <button
                    type="button"
                        className="px-2 py-1.5 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none flex items-center gap-1 text-sm"
                        onClick={handleDownloadBadge}
                      >
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        Télécharger
                      </button>
                      
                      <button
                        type="button"
                        className="px-2 py-1.5 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none flex items-center gap-1 text-sm"
                    onClick={() => handleShareBadge(currentBadgeParticipant)}
                  >
                        <ShareIcon className="h-3.5 w-3.5" />
                    Partager
                  </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de modification de participant */}
            {showEditModal && participantToEdit && (
              <div className="modal-overlay">
                <div className="modal-container">
                  {/* En-tête avec titre et bouton de fermeture */}
                  <div className="modal-header">
                    <h3 className="modal-title">Modifier un participant</h3>
                    <button 
                      className="modal-close" 
                      onClick={() => {
                        setShowEditModal(false);
                        setParticipantToEdit(null);
                        document.body.classList.remove('overflow-hidden');
                      }}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Corps du formulaire */}
                  <div className="modal-body">
                    <form onSubmit={handleUpdateParticipant}>
                      {/* Champ prénom */}
                      <div className="form-group">
                        <label htmlFor="firstName" className="form-label">
                          Prénom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={newParticipant.firstName}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="Prénom du participant"
                        />
                      </div>
                      
                      {/* Champ nom */}
                      <div className="form-group">
                        <label htmlFor="lastName" className="form-label">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={newParticipant.lastName}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="Nom du participant"
                        />
                      </div>
                      
                      {/* Champ email */}
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={newParticipant.email}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="email@exemple.com"
                        />
                      </div>
                      
                      {/* Champs supplémentaires - Fonction et Entreprise */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                          <label htmlFor="jobTitle" className="form-label">
                            Fonction
                          </label>
                          <input
                            type="text"
                            id="jobTitle"
                            name="jobTitle"
                            value={newParticipant.jobTitle}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Directeur, Manager, etc."
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="company" className="form-label">
                            Nom de l&apos;entreprise
                          </label>
                          <input
                            type="text"
                            id="company"
                            name="company"
                            value={newParticipant.company}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Nom de la société"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Champ téléphone */}
                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Téléphone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={newParticipant.phone}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder="+221 XX XXX XX XX"
                          />
                        </div>
                        
                        {/* Type de participant */}
                        <div className="form-group">
                          <label htmlFor="type" className="form-label">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="type"
                            name="type"
                            value={newParticipant.type}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            <option value="PARTICIPANT">Participant</option>
                            <option value="SPEAKER">Intervenant</option>
                          </select>
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  {/* Footer avec boutons d'action */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowEditModal(false);
                        setParticipantToEdit(null);
                        document.body.classList.remove('overflow-hidden');
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      onClick={handleUpdateParticipant}
                    >
                      Mettre à jour
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmation de suppression */}
            {deleteConfirmOpen && participantToDelete && (
              <div className="modal-overlay">
                <div className="modal-container modal-sm">
                  {/* En-tête avec titre et bouton de fermeture */}
                  <div className="modal-header">
                    <h3 className="modal-title">Confirmer la suppression</h3>
                    <button 
                      className="modal-close" 
                      onClick={closeDeleteConfirm}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                  
                  {/* Corps du modal */}
                  <div className="modal-body">
                    <div className="text-center mb-4">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <TrashIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="mt-3 text-lg leading-6 font-medium text-gray-900">Supprimer le participant</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Êtes-vous sûr de vouloir supprimer <strong>{participantToDelete.firstName} {participantToDelete.lastName}</strong> ? 
                          Cette action est irréversible.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer avec boutons d'action */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={closeDeleteConfirm}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={handleDeleteParticipant}
                    >
                      Supprimer
                    </button>
                  </div>
              </div>
            </div>
          )}

            {/* Ajouter la classe CSS pour le bouton de danger */}
            <style dangerouslySetInnerHTML={{ __html: `
              .btn-danger {
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                font-weight: 500;
                color: white;
                background-color: #ef4444;
                border: 1px solid #ef4444;
                cursor: pointer;
              }
              
              .btn-danger:hover {
                background-color: #dc2626;
              }
              
              .modal-sm {
                max-width: 450px;
              }
              
              /* Styles personnalisés pour le bouton de check-in */
              .participant-checkin-button {
                min-width: 40px;
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              }
              
              .participant-checkin-button:not(:disabled) {
                animation: pulse 2s infinite;
                box-shadow: 0 0 0 rgba(129, 180, 65, 0.4);
              }
              
              @keyframes pulse {
                0% {
                  box-shadow: 0 0 0 0 rgba(129, 180, 65, 0.7);
                }
                70% {
                  box-shadow: 0 0 0 10px rgba(129, 180, 65, 0);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(129, 180, 65, 0);
                }
              }
            `}} />

            {/* Ajouter le style dropdown */}
            <style dangerouslySetInnerHTML={{ __html: `
              .dropdown-container {
                position: relative;
                z-index: 30;
              }
              
              .dropdown-menu {
                position: absolute;
                right: 0;
                top: 100%;
                margin-top: 0.5rem;
                width: 12rem;
                border-radius: 0.375rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                background-color: white;
                border: 1px solid #e5e7eb;
                z-index: 50;
                overflow: hidden;
              }
              
              .participant-row {
                position: relative;
              }
            `}} />

            {/* Modal de confirmation d'annulation de check-in */}
            {cancelCheckInConfirmOpen && (
              <div className="modal-overlay">
                <div className="modal-container modal-sm">
                  {/* En-tête avec titre et bouton de fermeture */}
                  <div className="modal-header">
                    <h3 className="modal-title">Confirmer l&apos;annulation</h3>
                    <button 
                      className="modal-close" 
                      onClick={closeCancelCheckInConfirm}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Corps du modal */}
                  <div className="modal-body">
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="rounded-full bg-yellow-100 p-3 mb-4">
                        <ArrowUturnLeftIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="mt-3 text-lg leading-6 font-medium text-gray-900">Êtes-vous sûr de vouloir annuler l&apos;enregistrement ?</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Le statut &quot;Enregistré&quot; de ce participant sera annulé.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer avec boutons d'action */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={closeCancelCheckInConfirm}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={handleCancelCheckIn}
                    >
                      Confirmer
                    </button>
                  </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </>
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
    setProcessing(prev => ({ ...prev, [selectedParticipant.id]: true }));
    
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
  } catch (err) {
    console.error('Erreur lors de l\'annulation de l\'enregistrement:', err);
    toast.error('Erreur technique lors de l\'annulation');
  } finally {
    setProcessing(prev => ({ ...prev, [selectedParticipant.id]: false }));
    closeCancelCheckInConfirm();
  }
};