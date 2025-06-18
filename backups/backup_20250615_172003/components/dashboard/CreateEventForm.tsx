"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  
  // État pour les dates et heures
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // État pour les fichiers uploadés
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Références pour les input files
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Gérer le changement de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gérer le changement de bannière
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer le logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // Supprimer la bannière
  const handleRemoveBanner = () => {
    setBannerPreview(null);
    setBannerFile(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  // Convertir les fichiers en URL format base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiErrors([]);
    
    const formData = new FormData(e.currentTarget);
    
    // Validation des champs obligatoires
    if (!startDate || !endDate) {
      setApiErrors(["Les dates de début et de fin sont obligatoires"]);
      setIsSubmitting(false);
      toast.error("Les dates de début et de fin sont obligatoires");
      return;
    }
    
    // Formatage des dates pour l'API
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';
    
    // Formatage des heures
    const formattedStartTime = startTime 
      ? `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}` 
      : '';
    const formattedEndTime = endTime 
      ? `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}` 
      : '';

    const eventData: any = {
      name: formData.get("name"),
      description: formData.get("description"),
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      location: formData.get("location"),
      sector: formData.get("sector"),
      type: formData.get("type"),
      format: formData.get("format"),
      timezone: formData.get("timezone"),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      videoUrl: formData.get("videoUrl"),
      slug: formData.get("name")?.toString().toLowerCase().replace(/\s+/g, "-"),
    };
    
    // Ajouter les images en base64 si présentes
    if (logoFile) {
      try {
        eventData.logo = await fileToBase64(logoFile);
      } catch (error) {
        console.error("Error converting logo to base64:", error);
      }
    }
    
    if (bannerFile) {
      try {
        eventData.banner = await fileToBase64(bannerFile);
      } catch (error) {
        console.error("Error converting banner to base64:", error);
      }
    }
    
    const supportEmail = formData.get("supportEmail");
    if (supportEmail && supportEmail.toString().trim() !== "") {
      eventData.supportEmail = supportEmail;
    }

    console.log("Données de l'événement envoyées:", JSON.stringify(eventData));

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur API:", data);
        if (data.errors) {
          const errors = Object.values(data.errors.fieldErrors || {}).flat();
          setApiErrors(errors as string[]);
          toast.error("Certains champs sont incorrects. Veuillez vérifier le formulaire.");
        } else {
          setApiErrors([data.message || "Une erreur est survenue"]);
          toast.error(data.message || "Une erreur est survenue");
        }
        throw new Error(data.message || "Une erreur est survenue");
      }

      setShowSuccess(true);
      toast.success("Événement créé avec succès !");

      setTimeout(() => {
        router.push("/dashboard/events");
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error("Erreur complète:", error);
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Classes pour les inputs
  const inputClass = "w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-[#81B441] transition-colors bg-white shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const selectClass = "w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-[#81B441] transition-colors bg-white shadow-sm appearance-none";
  
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full animate-fadeIn">
            <div className="w-20 h-20 bg-[#81B441]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#81B441]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3">Événement créé avec succès !</h3>
            <p className="text-gray-600 mb-6">Votre événement a été créé et est maintenant disponible.</p>
            <div className="animate-pulse text-sm text-gray-500">Redirection vers la liste des événements...</div>
          </div>
        </div>
      )}

      {apiErrors.length > 0 && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 border-l-4 border-red-500 animate-fadeIn">
          <h3 className="font-bold mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Erreurs :
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {apiErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-8 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <div className="w-1.5 h-6 bg-[#81B441] rounded-full mr-3"></div>
          Créer un nouvel événement
        </h2>
        <p className="text-gray-600 mt-2">Remplissez les informations ci-dessous pour créer votre événement.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations générales */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Informations générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="name" className={labelClass}>
                Nom de l'événement <span className="text-[#81B441]">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className={inputClass}
                placeholder="Ex: Conférence Annuelle 2025"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location" className={labelClass}>
                Lieu <span className="text-[#81B441]">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                className={inputClass}
                placeholder="Ex: Dakar, Sénégal"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Décrivez votre événement en quelques lignes..."
            />
          </div>
        </div>

        {/* Dates et heures */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dates et heures</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className={labelClass}>
                Date de début <span className="text-[#81B441]">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className={inputClass}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                  placeholderText="Sélectionner une date"
                  required
                  calendarClassName="bg-white shadow-xl rounded-md border border-gray-200"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="form-group">
              <label className={labelClass}>
                Date de fin <span className="text-[#81B441]">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className={inputClass}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                  placeholderText="Sélectionner une date"
                  required
                  minDate={startDate}
                  calendarClassName="bg-white shadow-xl rounded-md border border-gray-200"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="form-group">
              <label className={labelClass}>
                Heure de début
              </label>
              <DatePicker
                selected={startTime}
                onChange={(date) => setStartTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Heure"
                dateFormat="HH:mm"
                locale={fr}
                className={inputClass}
                placeholderText="Sélectionner une heure"
              />
            </div>

            <div className="form-group">
              <label className={labelClass}>
                Heure de fin
              </label>
              <DatePicker
                selected={endTime}
                onChange={(date) => setEndTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Heure"
                dateFormat="HH:mm"
                locale={fr}
                className={inputClass}
                placeholderText="Sélectionner une heure"
              />
            </div>
          </div>
        </div>

        {/* Catégorisation */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Catégorisation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="sector" className={labelClass}>
                Secteur d'activité
              </label>
              <div className="relative">
                <select
                  id="sector"
                  name="sector"
                  className={selectClass}
                >
                  <option value="">Sélectionnez un secteur</option>
                  <option value="Santé">Santé</option>
                  <option value="Technologie">Technologie</option>
                  <option value="Éducation">Éducation</option>
                  <option value="Finance">Finance</option>
                  <option value="Environnement">Environnement</option>
                  <option value="Arts">Arts et Culture</option>
                  <option value="Autre">Autre</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="type" className={labelClass}>
                Type d'événement
              </label>
              <div className="relative">
                <select
                  id="type"
                  name="type"
                  className={selectClass}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Conférence">Conférence</option>
                  <option value="Séminaire">Séminaire</option>
                  <option value="Atelier">Atelier</option>
                  <option value="Exposition">Exposition</option>
                  <option value="Concert">Concert</option>
                  <option value="Festival">Festival</option>
                  <option value="Autre">Autre</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="format" className={labelClass}>
                Format
              </label>
              <div className="relative">
                <select
                  id="format"
                  name="format"
                  className={selectClass}
                >
                  <option value="">Sélectionnez un format</option>
                  <option value="Présentiel">Présentiel</option>
                  <option value="Virtuel">Virtuel</option>
                  <option value="Hybride">Hybride</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timezone" className={labelClass}>
                Fuseau horaire
              </label>
              <div className="relative">
                <select
                  id="timezone"
                  name="timezone"
                  className={selectClass}
                >
                  <option value="">Sélectionnez un fuseau horaire</option>
                  <option value="GMT">GMT (Greenwich Mean Time)</option>
                  <option value="GMT+1">GMT+1 (Europe Centrale)</option>
                  <option value="GMT+0">GMT+0 (Afrique de l'Ouest)</option>
                  <option value="GMT-5">GMT-5 (Est des États-Unis)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Média et Ressources */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Média et Ressources</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo de l'événement */}
            <div className="form-group">
              <label className={labelClass}>
                Logo de l'événement
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center ${logoPreview ? 'border-[#81B441]' : 'border-gray-300'} hover:border-[#81B441] transition-colors cursor-pointer relative`}
                onClick={() => logoInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoChange}
                  className="hidden"
                  accept="image/*"
                />
                
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="max-h-40 mx-auto rounded" />
                    <button 
                      type="button" 
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLogo();
                      }}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Cliquez pour télécharger le logo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF jusqu'à 2MB</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bannière de l'événement */}
            <div className="form-group">
              <label className={labelClass}>
                Bannière de l'événement
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center ${bannerPreview ? 'border-[#81B441]' : 'border-gray-300'} hover:border-[#81B441] transition-colors cursor-pointer relative`}
                onClick={() => bannerInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerChange}
                  className="hidden"
                  accept="image/*"
                />
                
                {bannerPreview ? (
                  <div className="relative">
                    <img src={bannerPreview} alt="Banner preview" className="max-h-40 mx-auto rounded" />
                    <button 
                      type="button" 
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBanner();
                      }}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Cliquez pour télécharger la bannière</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="videoUrl" className={labelClass}>
                URL de la vidéo
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                className={inputClass}
                placeholder="https://exemple.com/video"
              />
            </div>

            <div className="form-group">
              <label htmlFor="supportEmail" className={labelClass}>
                Email de support
              </label>
              <input
                type="email"
                id="supportEmail"
                name="supportEmail"
                placeholder="support@exemple.com"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441] transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#81B441] hover:bg-[#6b9937] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81B441] disabled:opacity-50 transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              "Créer l'événement"
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 