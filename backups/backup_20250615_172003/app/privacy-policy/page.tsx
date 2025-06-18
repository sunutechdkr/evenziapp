import React from 'react';
import Link from 'next/link';

// Import shadcn/ui components
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-none shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Politique de Confidentialité</CardTitle>
            <CardDescription className="text-lg text-gray-500">
              Chez InEvent, la sécurité et la confidentialité de vos données sont notre priorité
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 py-5">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="mb-4 text-gray-600">
                InEvent s'engage à protéger la vie privée et les informations personnelles des utilisateurs 
                conformément aux réglementations en vigueur en Afrique de l'Ouest, notamment la loi sur la 
                protection des données personnelles de la CEDEAO et les législations nationales applicables.
              </p>
              <p className="mb-4 text-gray-600">
                Cette politique de confidentialité explique comment nous collectons, utilisons, partageons
                et protégeons vos informations lorsque vous utilisez notre plateforme de gestion d'événements.
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Collecte des données</h2>
              <p className="mb-4 text-gray-600">
                Nous collectons les informations suivantes lors de votre inscription à nos événements :
              </p>
              <ul className="list-disc ml-6 mb-4 text-gray-600">
                <li>Informations d'identification : nom, prénom, adresse email</li>
                <li>Informations professionnelles : entreprise, fonction</li>
                <li>Préférences pour l'événement auquel vous participez</li>
                <li>Informations de connexion et données d'utilisation de notre plateforme</li>
              </ul>
              <p className="text-gray-600">
                Le recueil de ces données est nécessaire pour faciliter votre participation aux événements 
                et améliorer votre expérience utilisateur.
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Utilisation des données</h2>
              <p className="mb-4 text-gray-600">
                Vos données personnelles sont utilisées pour :
              </p>
              <ul className="list-disc ml-6 mb-4 text-gray-600">
                <li>Gérer votre inscription et participation aux événements</li>
                <li>Vous fournir un badge et un QR code personnalisés</li>
                <li>Faciliter le processus de check-in lors des événements</li>
                <li>Vous envoyer des informations importantes concernant les événements auxquels vous êtes inscrit</li>
                <li>Améliorer nos services et personnaliser votre expérience utilisateur</li>
                <li>Établir des statistiques anonymisées sur la participation aux événements</li>
              </ul>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Protection et sécurité des données</h2>
              <p className="mb-4 text-gray-600">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc ml-6 mb-4 text-gray-600">
                <li>Chiffrement des données sensibles (AES-256)</li>
                <li>Sécurisation des transferts de données (TLS 1.2 minimum)</li>
                <li>Contrôle d'accès strict aux données avec authentification multi-facteurs</li>
                <li>Hébergement des données sur des serveurs sécurisés</li>
                <li>Audits réguliers de sécurité</li>
                <li>Formation de notre personnel aux bonnes pratiques de sécurité</li>
              </ul>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Conservation des données</h2>
              <p className="mb-4 text-gray-600">
                Nous conservons vos données personnelles uniquement pour la durée nécessaire aux finalités 
                pour lesquelles elles ont été collectées, conformément aux exigences légales applicables en 
                Afrique de l'Ouest.
              </p>
              <p className="text-gray-600">
                En règle générale, les données relatives à votre participation à un événement sont conservées 
                pour une période de 3 ans après la fin de l'événement, sauf obligation légale contraire ou 
                demande spécifique de votre part.
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partage des données</h2>
              <p className="mb-4 text-gray-600">
                Nous pouvons partager vos données dans les cas suivants :
              </p>
              <ul className="list-disc ml-6 mb-4 text-gray-600">
                <li>Avec les organisateurs des événements auxquels vous vous inscrivez</li>
                <li>Avec nos prestataires de services qui nous aident à gérer notre plateforme (sous des conditions strictes de confidentialité)</li>
                <li>Lorsque nous sommes légalement obligés de le faire (ex: demande judiciaire)</li>
                <li>Avec votre consentement explicite dans d'autres cas</li>
              </ul>
              <p className="text-gray-600">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Transfert international des données</h2>
              <p className="mb-4 text-gray-600">
                Nos serveurs sont principalement situés en Afrique de l'Ouest et en Europe. Si vos données 
                doivent être transférées en dehors de ces zones, nous nous assurons que des mesures de 
                protection adéquates sont mises en place conformément aux réglementations applicables.
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vos droits</h2>
              <p className="mb-4 text-gray-600">
                Conformément aux réglementations en vigueur, vous disposez des droits suivants concernant vos 
                données personnelles :
              </p>
              <ul className="list-disc ml-6 mb-4 text-gray-600">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement (droit à l'oubli)</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit d'opposition au traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit de retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-gray-600">
                Pour exercer ces droits, contactez-nous à l'adresse email : privacy@inevent.com
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies et technologies similaires</h2>
              <p className="mb-4 text-gray-600">
                Notre plateforme utilise des cookies et technologies similaires pour améliorer votre expérience 
                utilisateur et analyser l'utilisation de nos services. Vous pouvez contrôler l'utilisation des cookies 
                via les paramètres de votre navigateur.
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications de la politique de confidentialité</h2>
              <p className="mb-4 text-gray-600">
                Nous pouvons mettre à jour cette politique de confidentialité périodiquement pour refléter les 
                changements dans nos pratiques ou pour des raisons légales. Nous vous informerons de tout 
                changement significatif par email ou via notre plateforme.
              </p>
            </section>
            
            <Separator className="my-8" />
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
              <p className="mb-4 text-gray-600">
                Si vous avez des questions concernant cette politique de confidentialité ou la protection de vos 
                données personnelles, veuillez nous contacter à :
              </p>
              <Card className="bg-gray-50 border-none">
                <CardContent className="p-4">
                  <p className="text-gray-700 font-medium">InEvent - Responsable de la Protection des Données</p>
                  <p className="text-gray-600">Email: privacy@inevent.com</p>
                  <p className="text-gray-600">Téléphone: +221 XX XXX XX XX</p>
                  <p className="text-gray-600">Adresse: Dakar, Sénégal</p>
                </CardContent>
              </Card>
            </section>
            
            <div className="mt-10 text-center">
              <BackButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 