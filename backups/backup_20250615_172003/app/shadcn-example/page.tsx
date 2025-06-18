"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Plus, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function ShadcnExample() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([
    { id: 1, name: "Forum de l'Innovation", date: "2023-10-15", participants: 120 },
    { id: 2, name: "Conférence Technologique", date: "2023-11-20", participants: 250 },
    { id: 3, name: "Salon des Entrepreneurs", date: "2023-12-05", participants: 175 },
  ]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-2">InEvent UI avec Shadcn</h1>
      <p className="text-gray-500 mb-8">
        Exemple d'intégration des composants Shadcn/UI dans l'application InEvent
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>Nombre total de participants enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">545</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-ins</CardTitle>
            <CardDescription>Participants ayant fait leur check-in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">328</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              60% du total des participants
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Nombre total de sessions planifiées</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">24</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Réparties sur 3 jours
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Liste des Événements</h2>
        <div className="flex space-x-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvel Événement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un événement</DialogTitle>
                <DialogDescription>
                  Remplissez le formulaire ci-dessous pour créer un nouvel événement.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom de l'événement</Label>
                  <Input id="name" placeholder="Forum 2023" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Dakar, Sénégal" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setOpen(false)}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Filtrer
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Date (plus récent)</DropdownMenuItem>
              <DropdownMenuItem>Date (plus ancien)</DropdownMenuItem>
              <DropdownMenuItem>Nom (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Participants (décroissant)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <Table>
          <TableCaption>Liste de tous les événements</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Participants</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell className="text-right">{event.participants}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Voir</DropdownMenuItem>
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Utilisateurs actifs</h2>
        <div className="flex flex-wrap gap-4">
          {['JD', 'AS', 'MB', 'FT', 'LH'].map((initials, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm">Utilisateur {i+1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/dashboard">
          <Button variant="outline">Retour au Dashboard</Button>
        </Link>
      </div>
    </div>
  );
} 