import { 
  ArrowLeftIcon, 
  UserPlusIcon, 
  DocumentTextIcon, 
  ShareIcon, 
  PencilIcon, 
  PhotoIcon,
  QrCodeIcon,
  CalendarIcon,
  EyeIcon,
  ClockIcon,
  IdentificationIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Ce fichier contient uniquement le design pour le bloc "Détails de l'événement" 
// et le bloc "Actions rapides" à ajouter à la page d'événement

export const EventDetailSection = ({ event, eventId, getEventStartDate, getEventEndDate }) => {
  return (
    <>
      {/* Informations de l'événement */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Détails de l&apos;événement</h2>
            <p className="text-sm text-gray-500 mt-1">Informations essentielles sur votre événement</p>
          </div>
          <button
            onClick={() => {
              if (event?.slug) {
                const url = window.location.origin + `/events/${event.slug}`;
                navigator.clipboard.writeText(url);
                alert("Lien copié dans le presse-papier!");
              }
            }}
            className="text-gray-700 hover:text-[#81B441] flex items-center gap-2 transition-colors text-sm"
          >
            <ShareIcon className="w-5 h-5" />
            <span>Partager l&apos;événement</span>
          </button>
        </div>
                
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <div className="h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden shadow-sm">
              {event?.banner ? (
                <img 
                  src={event.banner} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PhotoIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">{event?.name}</h3>
            <p className="text-gray-700 mb-4 line-clamp-3">{event?.description || "Aucune description disponible."}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {event?.sector && (
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {event.sector}
                </span>
              )}
              {event?.type && (
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {event.type}
                </span>
              )}
              {event?.format && (
                <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  {event.format}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-4 border-l border-gray-100 pl-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#81B441]" />
                Date et heure
              </h3>
              <p className="text-gray-900">
                {getEventStartDate(event) && format(new Date(getEventStartDate(event)), 'd MMMM yyyy', { locale: fr })}
                {event?.startTime && ` à ${event.startTime}`}
                {getEventEndDate(event) && getEventStartDate(event) !== getEventEndDate(event) && 
                  ` - ${format(new Date(getEventEndDate(event)), 'd MMMM yyyy', { locale: fr })}`}
                {event?.endTime && ` à ${event.endTime}`}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-[#81B441]" />
                Lieu
              </h3>
              <p className="text-gray-900">{event?.location || "Non spécifié"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-[#81B441]" />
                Contact
              </h3>
              <p className="text-gray-900">{event?.supportEmail || "Non spécifié"}</p>
            </div>
            
            <div className="pt-4">
              <Link
                href={`/dashboard/events/${eventId}/participants`}
                className="inline-flex items-center px-4 py-2 bg-[#81B441] text-white text-sm font-medium rounded-md hover:bg-[#6a9636] transition-colors"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Gérer les participants
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Actions rapides</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez facilement les aspects essentiels de votre événement</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1: Sessions et programme */}
          <Link href={`/dashboard/events/${eventId}/sessions`} className="group">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all flex flex-col">
              <div className="flex items-center p-5 bg-white">
                <div className="mr-4 p-3 rounded-full bg-[#eef5e5] group-hover:bg-[#81B441]/20 transition-colors">
                  <CalendarIcon className="h-6 w-6 text-[#81B441]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-[#81B441] transition-colors">Sessions et programme</h3>
                  <p className="text-sm text-gray-500 mt-1">Créez des sessions attrayantes et permettez aux participants de planifier leurs agendas</p>
                </div>
              </div>
              <div className="mt-auto px-5 py-3 border-t border-gray-100 flex justify-end">
                <div className="text-gray-400 group-hover:text-[#81B441] transition-colors">
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
          
          {/* Action 2: Badges */}
          <Link href={`/dashboard/events/${eventId}/badges`} className="group">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all flex flex-col">
              <div className="flex items-center p-5 bg-white">
                <div className="mr-4 p-3 rounded-full bg-[#eef5e5] group-hover:bg-[#81B441]/20 transition-colors">
                  <IdentificationIcon className="h-6 w-6 text-[#81B441]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-[#81B441] transition-colors">Badges et QR codes</h3>
                  <p className="text-sm text-gray-500 mt-1">Générez des badges personnalisés et des QR codes pour vos participants</p>
                </div>
              </div>
              <div className="mt-auto px-5 py-3 border-t border-gray-100 flex justify-end">
                <div className="text-gray-400 group-hover:text-[#81B441] transition-colors">
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
          
          {/* Action 3: Rendez-vous */}
          <Link href={`/dashboard/events/${eventId}/rendez-vous`} className="group">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden hover:border-[#81B441] hover:shadow-md transition-all flex flex-col">
              <div className="flex items-center p-5 bg-white">
                <div className="mr-4 p-3 rounded-full bg-[#eef5e5] group-hover:bg-[#81B441]/20 transition-colors">
                  <ClockIcon className="h-6 w-6 text-[#81B441]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-[#81B441] transition-colors">Rendez-vous</h3>
                  <p className="text-sm text-gray-500 mt-1">Facilitez la planification de rendez-vous entre participants à des créneaux horaires définis</p>
                </div>
              </div>
              <div className="mt-auto px-5 py-3 border-t border-gray-100 flex justify-end">
                <div className="text-gray-400 group-hover:text-[#81B441] transition-colors">
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}; 