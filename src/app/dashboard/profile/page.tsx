'use client';

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  User,
  Shield,
  CreditCard,
  Mail,
  Plus,
  Edit3,
  LogOut,
  ArrowLeft,
  Check,
  Chrome
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type ProfileSection = 'profile' | 'security' | 'billing';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Rediriger si pas de session
  if (!session) {
    redirect('/login');
  }

  // Récupérer les initiales de l'utilisateur
  const getUserInitials = () => {
    if (session?.user?.name) {
      const nameParts = session.user.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return session.user.name.charAt(0).toUpperCase();
    } else if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const menuItems = [
    {
      id: 'profile' as ProfileSection,
      label: 'Profil',
      icon: User,
      description: 'Gérer vos informations personnelles'
    },
    {
      id: 'security' as ProfileSection,
      label: 'Sécurité',
      icon: Shield,
      description: 'Mot de passe et authentification'
    },
    {
      id: 'billing' as ProfileSection,
      label: 'Facturation',
      icon: CreditCard,
      description: 'Plans et paiements'
    }
  ];

  const handleSignOut = () => {
    signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="flex items-center text-gray-600 hover:text-[#81B441] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Retour au dashboard</span>
            </Link>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mon compte</CardTitle>
                <CardDescription>
                  Gérez vos informations de compte
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-colors ${
                          activeSection === item.id
                            ? 'bg-[#81B441]/10 text-[#81B441] border-r-2 border-[#81B441]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                {/* Profile Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Détails du profil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-4 border-[#81B441]/20">
                          <AvatarImage src={session.user?.image || undefined} />
                          <AvatarFallback className="bg-[#81B441] text-white text-xl font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.user?.name || 'Utilisateur'}
                          </h3>
                          <p className="text-gray-500">{session.user?.email}</p>
                          {session.user?.role && (
                            <Badge 
                              variant="outline" 
                              className="mt-1 bg-[#81B441]/10 text-[#81B441] border-[#81B441]"
                            >
                              {session.user.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-[#81B441] text-[#81B441] hover:bg-[#81B441]/10"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Modifier le profil
                      </Button>
                    </div>

                    <Separator />

                    {/* Email Addresses */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Adresses email</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{session.user?.email}</p>
                              <p className="text-sm text-gray-500">Email principal</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Vérifié
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-[#81B441] hover:bg-[#81B441]/10"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une adresse email
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Phone Number */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">Numéro de téléphone</h4>
                      <div className="space-y-3">
                        <div className="text-gray-500 text-sm">
                          Aucun numéro de téléphone ajouté
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-[#81B441] hover:bg-[#81B441]/10"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un numéro de téléphone
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Connected Accounts */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">Comptes connectés</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center border">
                              <Chrome className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Google</p>
                              <p className="text-sm text-gray-500">{session.user?.email}</p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-[#81B441] hover:bg-[#81B441]/10"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Connecter un compte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Sécurité</CardTitle>
                  <CardDescription>
                    Gérez votre mot de passe et vos paramètres de sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Mot de passe</h4>
                    <p className="text-gray-600">
                      Votre mot de passe doit contenir au moins 8 caractères avec une combinaison de lettres, chiffres et symboles.
                    </p>
                    <Button className="bg-[#81B441] hover:bg-[#6a9636] text-white">
                      Changer le mot de passe
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Authentification à deux facteurs</h4>
                    <p className="text-gray-600">
                      Ajoutez une couche de sécurité supplémentaire à votre compte.
                    </p>
                    <Button variant="outline" className="border-[#81B441] text-[#81B441] hover:bg-[#81B441]/10">
                      Configurer 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Facturation</CardTitle>
                  <CardDescription>
                    Gérez votre abonnement et vos moyens de paiement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Plan actuel</h4>
                    <div className="p-4 bg-[#81B441]/10 rounded-lg border border-[#81B441]/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-[#81B441]">Plan Gratuit</h5>
                          <p className="text-sm text-gray-600">Fonctionnalités de base incluses</p>
                        </div>
                        <Badge className="bg-[#81B441] text-white">Actuel</Badge>
                      </div>
                    </div>
                    <Button className="bg-[#81B441] hover:bg-[#6a9636] text-white">
                      Mettre à niveau
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Moyens de paiement</h4>
                    <p className="text-gray-600">
                      Aucun moyen de paiement configuré.
                    </p>
                    <Button variant="outline" className="border-[#81B441] text-[#81B441] hover:bg-[#81B441]/10">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un moyen de paiement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <span>Sécurisé par</span>
            <span className="ml-2 font-semibold text-[#81B441]">InEvent</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 