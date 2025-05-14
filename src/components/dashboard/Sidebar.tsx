"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { 
  HomeIcon,
  CalendarIcon, 
  QrCodeIcon, 
  IdentificationIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  ChevronRightIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  UserGroupIcon,
  BriefcaseIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

// Configuration des liens de navigation
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, exact: true },
  { name: "Événements", href: "/dashboard/events", icon: CalendarIcon },
  { name: "Analytique", href: "/dashboard/analytics", icon: ChartBarIcon },
  { name: "Check-in", href: "/dashboard/check-in", icon: QrCodeIcon },
  { name: "Badge", href: "/dashboard/badges", icon: IdentificationIcon },
  { name: "Communication", href: "/dashboard/communications", icon: EnvelopeIcon },
  { name: "Réglages", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

/**
 * Composant NotificationPanel - Panneau de notifications
 */
export function NotificationPanel({ 
  show, 
  onClose 
}: { 
  show: boolean, 
  onClose: () => void 
}) {
  return (
    <>
      {/* Overlay */}
      {show && (
        <div 
          className="fixed inset-0 bg-black/30 z-30" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Panneau latéral */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-[#212529] shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          show ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-[#81B441]" />
              Notifications
              <span className="ml-2 bg-[#81B441] text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <div className="notification-item bg-gray-800 hover:bg-gray-700 rounded-md p-3 cursor-pointer transition-colors duration-200 transform hover:translate-x-1 border-l-2 border-[#81B441]">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-white font-medium">Nouvel inscrit</p>
                  <span className="text-xs text-gray-400">5 min</span>
                </div>
                <p className="text-sm text-[#81B441] font-semibold mt-1">Amadou Diallo</p>
                <p className="text-xs text-gray-400 mt-1">Un nouveau participant s&apos;est inscrit à votre événement.</p>
              </div>
              
              <div className="notification-item bg-gray-800 hover:bg-gray-700 rounded-md p-3 cursor-pointer transition-colors duration-200 transform hover:translate-x-1 border-l-2 border-[#81B441]">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-white font-medium">Mise à jour de l&apos;agenda</p>
                  <span className="text-xs text-gray-400">2h</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Une activité a été modifiée dans l&apos;agenda de l&apos;événement.</p>
              </div>
              
              <div className="notification-item bg-gray-800 hover:bg-gray-700 rounded-md p-3 cursor-pointer transition-colors duration-200 transform hover:translate-x-1 border-l-2 border-[#81B441]">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-white font-medium">Nouvel exposant</p>
                  <span className="text-xs text-gray-400">Hier</span>
                </div>
                <p className="text-sm text-[#81B441] font-semibold mt-1">Tech Solutions</p>
                <p className="text-xs text-gray-400 mt-1">Un nouvel exposant a été ajouté à votre événement.</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-white/10">
            <button className="w-full bg-[#81B441]/20 hover:bg-[#81B441]/30 text-[#81B441] font-medium py-2 rounded transition-colors flex justify-center items-center">
              <span>Voir toutes les notifications</span>
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Composant NotificationCenter - Centre de notifications réutilisable
 */
export function NotificationCenter({ 
  isExpanded = true, 
  onToggle 
}: { 
  isExpanded: boolean, 
  onToggle: (show: boolean) => void 
}) {
  return (
    <>
      {/* Bouton de notification dans le sidebar */}
      <div className="notification-center px-3 mb-2">
        {isExpanded ? (
          <button 
            onClick={() => onToggle(true)}
            className="w-full flex justify-between items-center bg-gray-700 hover:bg-gray-600 p-2 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-[#81B441]" />
              <span className="text-sm text-white">Notifications</span>
            </div>
            <span className="bg-[#81B441] text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
          </button>
        ) : (
          <div className="flex justify-center">
            <button 
              onClick={() => onToggle(true)}
              className="relative p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-700 transition-all duration-300"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-3 w-3 bg-[#81B441] rounded-full border-2 border-gray-800 animate-pulse"></span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Composant AdminProfile - Profil administrateur réutilisable
 */
export function AdminProfile({ isExpanded = true }: { isExpanded: boolean }) {
  return (
    <div className="admin-profile px-3 mb-2">
      {isExpanded ? (
        <div className="bg-gray-700 rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 border-l-2 border-[#81B441]">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#81B441] to-[#6a9636] flex items-center justify-center text-white font-bold">
                AD
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-400 truncate">
                admin@inevent.com
              </p>
            </div>
            <div>
              <button className="text-gray-400 hover:text-white">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="text-xs bg-[#81B441]/20 hover:bg-[#81B441]/30 text-white py-1 px-2 rounded transition-colors hover:shadow-md">
              Profil
            </button>
            <button className="text-xs bg-gray-800 hover:bg-gray-900 text-white py-1 px-2 rounded transition-colors hover:shadow-md">
              Déconnexion
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-700 transition-colors">
            <UserCircleIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Composant Sidebar - Barre latérale de navigation principale
 * 
 * Fournit les liens de navigation principaux avec le même design que EventSidebar
 */
export function Sidebar({ onExpandChange }: { onExpandChange?: (expanded: boolean) => void }) {
  // États pour contrôler l'expansion et les notifications
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  // Notifier le parent du changement d'état de la sidebar
  const toggleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
    if (onExpandChange) {
      onExpandChange(expanded);
    }
  };

  // Fonction pour vérifier si un lien est actif
  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  
  return (
    <>
      {/* Version mobile: bouton d'ouverture */}
      <button
        className={`md:hidden fixed z-30 bottom-4 right-4 p-3 rounded-full bg-[#81B441] text-white shadow-lg transition-transform duration-200 ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
        onClick={() => toggleExpand(!isExpanded)}
      >
        {isExpanded ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChevronRightIcon className="h-6 w-6" />
        )}
      </button>
      
      {/* Version desktop: bouton d'ouverture quand sidebar est cachée */}
      {!isExpanded && (
        <button
          className="hidden md:flex fixed z-30 top-4 left-4 p-2 rounded-md bg-[#81B441] text-white shadow-lg hover:bg-[#6a9636] transition-all duration-200 items-center justify-center"
          onClick={() => toggleExpand(true)}
          title="Ouvrir le menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      )}
      
      {/* Overlay pour la version mobile */}
      {isExpanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-20"
          onClick={() => toggleExpand(false)}
        ></div>
      )}
      
      {/* Barre latérale */}
      <aside 
        className={`${
          isExpanded ? 'translate-x-0 w-64' : '-translate-x-full w-0 md:w-16 md:translate-x-0'
        } fixed left-0 top-0 h-screen z-30 bg-gray-800 transition-all duration-300 ease-in-out transform overflow-y-auto overflow-x-hidden border-r border-gray-700`}
        style={{ 
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: isExpanded ? '16rem' : '0',
          minHeight: '100vh',
          maxHeight: '100vh',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="sidebar-content h-full flex flex-col">
          {/* En-tête avec logo */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
            <div className="flex items-center space-x-2">
              {/* Logo */}
              <div className="h-8 w-8 bg-[#81B441] rounded-md flex items-center justify-center shadow-inner">
                <span className="font-bold text-white">iN</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">InEvent</span>
                <span className="text-gray-400 text-xs">Dashboard</span>
              </div>
            </div>
            {/* Bouton pour réduire la sidebar (version desktop) */}
            <button
              className="hidden md:block text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              onClick={() => toggleExpand(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronLeftIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Profil admin */}
          <AdminProfile isExpanded={isExpanded} />
          
          {/* Centre de notifications */}
          <NotificationCenter 
            isExpanded={isExpanded} 
            onToggle={(show) => setShowNotifications(show)} 
          />
          
          {/* Navigation principale */}
          <nav className="flex-1 px-3 pb-4 mt-2 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  block py-2 px-3 rounded-md transition-colors duration-200
                  ${isActive(item.href, item.exact) 
                    ? 'bg-[#81B441] text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span className="text-sm">{item.name}</span>}
                </div>
              </Link>
            ))}
          </nav>
          
          {/* Pied de sidebar */}
          <div className="p-3 mt-auto">
            <div className="py-2 px-3 bg-gray-700/50 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-5 w-5 text-[#81B441]" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-white font-medium">Besoin d&apos;aide?</p>
                  <a 
                    href="mailto:support@inevent.com" 
                    className="text-xs text-[#81B441] hover:underline"
                  >
                    support@inevent.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Panneau de notifications */}
      <NotificationPanel show={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
} 