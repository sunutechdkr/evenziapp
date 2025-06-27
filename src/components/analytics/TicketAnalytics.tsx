"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TicketIcon, 
  UserGroupIcon, 
  ArrowArrowTrendingUpIcon, 
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type TicketStats = {
  id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  conversionRate: number;
  status: 'ACTIVE' | 'TERMINATED' | 'DRAFT';
  visibility: 'VISIBLE' | 'HIDDEN';
  group: string;
  price: number;
};

type TicketAnalyticsProps = {
  eventId: string;
};

export default function TicketAnalytics({ eventId: _ }: TicketAnalyticsProps) {
  // Données de démonstration
  const ticketStats: TicketStats[] = [
    {
      id: "1",
      name: "PARTICIPANT PREMIUM",
      totalSold: 117,
      totalRevenue: 0,
      conversionRate: 78.5,
      status: "TERMINATED",
      visibility: "VISIBLE",
      group: "Attendees",
      price: 0
    },
    {
      id: "2",
      name: "PARTICIPANT ACCESS", 
      totalSold: 258,
      totalRevenue: 0,
      conversionRate: 85.2,
      status: "TERMINATED",
      visibility: "VISIBLE",
      group: "Attendees",
      price: 0
    },
    {
      id: "3",
      name: "VISITEUR",
      totalSold: 485,
      totalRevenue: 0,
      conversionRate: 92.1,
      status: "TERMINATED",
      visibility: "VISIBLE", 
      group: "Attendees",
      price: 0
    },
    {
      id: "4",
      name: "SPEAKERS",
      totalSold: 15,
      totalRevenue: 0,
      conversionRate: 100,
      status: "TERMINATED",
      visibility: "VISIBLE",
      group: "Speakers",
      price: 0
    }
  ];

  const totalTicketsSold = ticketStats.reduce((sum, ticket) => sum + ticket.totalSold, 0);
  const totalRevenue = ticketStats.reduce((sum, ticket) => sum + ticket.totalRevenue, 0);
  const averageConversion = ticketStats.reduce((sum, ticket) => sum + ticket.conversionRate, 0) / ticketStats.length;

  // Données pour le graphique en barres
  const chartData = ticketStats.map(ticket => ({
    name: ticket.name.length > 15 ? ticket.name.substring(0, 15) + '...' : ticket.name,
    sold: ticket.totalSold,
    revenue: ticket.totalRevenue
  }));

  // Données pour le graphique en secteurs
  const pieData = ticketStats.map(ticket => ({
    name: ticket.name,
    value: ticket.totalSold,
    color: ticket.group === 'Speakers' ? '#f59e0b' : 
           ticket.group === 'Attendees' ? '#81B441' : '#6b7280'
  }));

  const COLORS = ['#81B441', '#f59e0b', '#ef4444', '#8b5cf6'];

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

  return (
    <div className="space-y-6">
      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des billets vendus</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#81B441]">{totalTicketsSold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#81B441]">
              {totalRevenue === 0 ? 'Gratuit' : `${totalRevenue.toLocaleString()}€`}
            </div>
            <p className="text-xs text-muted-foreground">
              Événement gratuit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion moyen</CardTitle>
            <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#81B441]">{averageConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% par rapport à la moyenne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types de billets</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#81B441]">{ticketStats.length}</div>
            <p className="text-xs text-muted-foreground">
              {ticketStats.filter(t => t.status === 'ACTIVE').length} actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres - Ventes par type de billet */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes par type de billet</CardTitle>
            <CardDescription>
              Nombre de billets vendus par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="sold" fill="#81B441" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique en secteurs - Répartition des ventes */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des ventes</CardTitle>
            <CardDescription>
              Distribution des billets vendus par type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={11}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé des performances */}
      <Card>
        <CardHeader>
          <CardTitle>Performance détaillée des billets</CardTitle>
          <CardDescription>
            Statistiques complètes pour chaque type de billet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nom du billet</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Visibilité</th>
                  <th className="text-left py-3 px-4">Groupe</th>
                  <th className="text-right py-3 px-4">Vendus</th>
                  <th className="text-right py-3 px-4">Revenus</th>
                  <th className="text-right py-3 px-4">Taux de conversion</th>
                </tr>
              </thead>
              <tbody>
                {ticketStats.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{ticket.name}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        ● {getStatusText(ticket.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4">{ticket.group}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#81B441]">
                      {ticket.totalSold.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ticket.totalRevenue === 0 ? 'Gratuit' : `${ticket.totalRevenue.toLocaleString()}€`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${ticket.conversionRate > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {ticket.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 