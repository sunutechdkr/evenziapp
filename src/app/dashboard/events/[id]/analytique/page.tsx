"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EventSidebar } from "@/components/dashboard/EventSidebar";
import { ArrowLeftIcon, CalendarIcon, AdjustmentsHorizontalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Enregistrer les composants ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Types pour les données analytiques
type EventData = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type RegistrationStats = {
  total: number;
  checkedIn: number;
};

type EventAnalytics = {
  event: EventData;
  registrations: RegistrationStats;
  period: string;
};

// Types pour les filtres de période
type DateRange = '7j' | '30j' | 'all';

export default function EventAnalyticsPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EventAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('7j');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/events/${params.id}/analytics?period=${dateRange}`);
        
        if (!response.ok) {
          const status = response.status;
          if (status === 404) {
            throw new Error("Événement introuvable");
          } else {
            throw new Error("Erreur lors de la récupération des données analytiques");
          }
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Erreur:", error);
        setError("Impossible de charger les données analytiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [params.id, dateRange]);

  // Configuration du graphique des inscriptions (simulée à partir des données disponibles)
  const registrationsChartData = {
    labels: data ? ['Jour 1', 'Jour 2', 'Jour 3', 'Jour 4', 'Jour 5', 'Jour 6', 'Jour 7'] : [],
    datasets: [
      {
        label: "Inscriptions",
        data: data ? [
          Math.round(data.registrations.total * 0.2),
          Math.round(data.registrations.total * 0.3),
          Math.round(data.registrations.total * 0.4),
          Math.round(data.registrations.total * 0.5),
          Math.round(data.registrations.total * 0.7),
          Math.round(data.registrations.total * 0.8),
          data.registrations.total
        ] : [],
        borderColor: "#81B441",
        backgroundColor: "rgba(129, 180, 65, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#81B441"
      }
    ]
  };

  // Configuration du graphique des check-ins (simulée)
  const checkInsChartData = {
    labels: data ? ['Jour 1', 'Jour 2', 'Jour 3', 'Jour 4', 'Jour 5', 'Jour 6', 'Jour 7'] : [],
    datasets: [
      {
        label: "Check-ins",
        data: data ? [
          Math.round(data.registrations.checkedIn * 0.1),
          Math.round(data.registrations.checkedIn * 0.2),
          Math.round(data.registrations.checkedIn * 0.3),
          Math.round(data.registrations.checkedIn * 0.5),
          Math.round(data.registrations.checkedIn * 0.6),
          Math.round(data.registrations.checkedIn * 0.8),
          data.registrations.checkedIn
        ] : [],
        backgroundColor: "#6a9636",
        borderRadius: 6
      }
    ]
  };

  // Configuration du graphique des types de participants (simulée)
  const participantTypesChartData = {
    labels: ["Participants", "VIPs", "Intervenants", "Staff"],
    datasets: [
      {
        data: data ? [
          Math.max(Math.round(data.registrations.total * 0.7), 1),
          Math.round(data.registrations.total * 0.15),
          Math.round(data.registrations.total * 0.1),
          Math.round(data.registrations.total * 0.05)
        ] : [],
        backgroundColor: [
          "#81B441",
          "#6a9636",
          "#95c562",
          "#abd67e"
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const
      }
    }
  };

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    if (!data) return;
    
    // Créer les en-têtes
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Événement,Total Inscriptions,Check-ins,Taux de présence,Période\n";
    
    // Ajouter les données
    const checkInRate = (data.registrations.checkedIn / Math.max(1, data.registrations.total) * 100).toFixed(1);
    csvContent += `${data.event.name},${data.registrations.total},${data.registrations.checkedIn},${checkInRate}%,${
      dateRange === '7j' ? 'Derniers 7 jours' : 
      dateRange === '30j' ? 'Derniers 30 jours' : 
      'Depuis le début'
    }\n`;
    
    // Créer un lien de téléchargement
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics-event-${params.id}-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculer le taux de présence
  const checkInRate = data ? 
    ((data.registrations.checkedIn / Math.max(1, data.registrations.total)) * 100).toFixed(0) + '%' : 
    '0%';

  return (
    <div className="dashboard-container">
      <EventSidebar eventId={params.id} />
      <div className="dashboard-content">
        <main className="dashboard-main">
          {/* En-tête avec bouton de retour et options */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center">
              <Link href={`/dashboard/events/${params.id}`} className="text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold">Analytique de l&apos;événement</h1>
            </div>
            
            <div className="flex ml-auto gap-2">
              <div className="relative">
                <button 
                  className="btn-secondary flex items-center gap-1"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Filtres
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="p-2">
                      <h3 className="text-sm font-semibold mb-2 text-gray-700">Période</h3>
                      <div className="space-y-1">
                        <button 
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === '7j' ? 'bg-[#81B441]/10 text-[#81B441] font-medium' : 'hover:bg-gray-100'}`}
                          onClick={() => {
                            setDateRange('7j');
                            setShowFilters(false);
                          }}
                        >
                          7 derniers jours
                        </button>
                        <button 
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === '30j' ? 'bg-[#81B441]/10 text-[#81B441] font-medium' : 'hover:bg-gray-100'}`}
                          onClick={() => {
                            setDateRange('30j');
                            setShowFilters(false);
                          }}
                        >
                          30 derniers jours
                        </button>
                        <button 
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'all' ? 'bg-[#81B441]/10 text-[#81B441] font-medium' : 'hover:bg-gray-100'}`}
                          onClick={() => {
                            setDateRange('all');
                            setShowFilters(false);
                          }}
                        >
                          Depuis le début
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="btn-secondary flex items-center gap-1"
                onClick={exportToCSV}
                disabled={!data}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Exporter
              </button>
            </div>
          </div>

          {/* Indicateur de filtre actif */}
          <div className="mb-6 flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              Période : {
                dateRange === '7j' ? 'Derniers 7 jours' : 
                dateRange === '30j' ? 'Derniers 30 jours' : 
                'Depuis le début'
              }
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#81B441] border-r-transparent"></div>
              <p className="ml-4 text-gray-600">Chargement des données...</p>
            </div>
          ) : error ? (
            <div>
              <div className="bg-amber-50 p-6 rounded-md text-amber-700 mb-6">
                <p className="text-lg font-medium mb-2">Erreur</p>
                <p className="mb-4">{error}</p>
                <button 
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    // Retenter la requête
                    const fetchData = async () => {
                      try {
                        const response = await fetch(`/api/events/${params.id}/analytics?period=${dateRange}`);
                        if (!response.ok) throw new Error("Impossible de charger les données");
                        const data = await response.json();
                        setData(data);
                        setError(null);
                      } catch (e) {
                        setError("Impossible de charger les données analytiques.");
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchData();
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Graphiques et statistiques */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4">Évolution des inscriptions</h2>
                <Line data={registrationsChartData} options={chartOptions} />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4">Check-ins par jour</h2>
                <Bar data={checkInsChartData} options={chartOptions} />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4">Répartition des participants</h2>
                <Doughnut data={participantTypesChartData} options={doughnutOptions} />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4">Statistiques clés</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total inscriptions</p>
                    <p className="text-2xl font-bold text-green-700">
                      {data?.registrations.total || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total check-ins</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {data?.registrations.checkedIn || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Taux de présence</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {checkInRate}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Période</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {dateRange === '7j' ? '7j' : dateRange === '30j' ? '30j' : 'Tout'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 