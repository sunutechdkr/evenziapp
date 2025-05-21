"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'magic-link' | 'admin'>('magic-link');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fonction pour gérer la connexion admin avec identifiants
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }
      
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError("Une erreur s'est produite lors de la connexion");
      setLoading(false);
    }
  };

  // Fonction pour gérer la connexion par Magic Link
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Veuillez saisir votre adresse email");
      setLoading(false);
      return;
    }

    try {
      // Stocker l'email dans sessionStorage
      sessionStorage.setItem('verifyEmail', email);
      
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError("Erreur lors de l'envoi du lien de connexion");
        setLoading(false);
        return;
      }
      
      // Si la requête est réussie, rediriger vers la page de vérification
      router.push('/auth/verify-request');
    } catch (error) {
      setError("Une erreur s'est produite lors de l'envoi du lien de connexion");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#81B441]/30 to-[#81B441]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-md"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-[#81B441]/20 to-[#81B441]/5 rounded-full translate-x-1/4 translate-y-1/4 blur-md"></div>
      <div className="absolute top-1/4 right-1/5 w-16 h-16 bg-gradient-to-br from-[#81B441]/15 to-[#81B441]/5 rounded-full blur-md"></div>
      
      {/* Animated stars background */}
      <div className="stars-container absolute inset-0 overflow-hidden opacity-60">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="star absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 5 + 5}s`,
            }}
          />
        ))}
      </div>
      
      <div className="w-full max-w-md px-8 py-10 bg-gray-800 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm relative z-10 transform transition-all duration-300 hover:shadow-[0_15px_25px_rgba(0,0,0,0.4)] border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 animate-fadeIn">
            <h1 className="text-3xl font-bold flex items-center text-white">
              <span className="text-[#81B441] font-extrabold">In</span>
              <span>event</span>
              <svg
                className="w-10 h-10 ml-2 animate-pulse"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="20" r="18" fill="#81B441" />
                <path
                  d="M14 19.5L18 23.5L26 15.5"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h1>
          </div>
          <p className="text-gray-400">Connectez-vous à votre compte</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('magic-link')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'magic-link'
                ? 'text-[#81B441] border-b-2 border-[#81B441]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'admin'
                ? 'text-[#81B441] border-b-2 border-[#81B441]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 border border-red-800 rounded-md text-sm animate-fadeIn">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 text-green-300 border border-green-800 rounded-md text-sm animate-fadeIn">
            {success}
          </div>
        )}

        {/* Magic Link Form */}
        {activeTab === 'magic-link' && (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-6">
            <div className="transform transition-all duration-200 hover:translate-y-[-2px]">
              <label htmlFor="magic-email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="magic-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#81B441] to-[#6a9635] hover:from-[#9ccd5b] hover:to-[#81B441] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#81B441] transition-all duration-200 transform hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(129,180,65,0.4)]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  "Envoyer le lien de connexion"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Admin Login Form */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-6">
            <div className="transform transition-all duration-200 hover:translate-y-[-2px]">
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="transform transition-all duration-200 hover:translate-y-[-2px]">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-700 border-gray-600 text-[#81B441] focus:ring-[#81B441] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Se souvenir de moi
                </label>
              </div>
              <a href="#" className="text-sm text-[#81B441] hover:text-[#9ccd5b] hover:underline transition-colors duration-200">
                Mot de passe oublié?
              </a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#81B441] to-[#6a9635] hover:from-[#9ccd5b] hover:to-[#81B441] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#81B441] transition-all duration-200 transform hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(129,180,65,0.4)]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Vous n&apos;avez pas de compte? 
            <a href="#" className="text-[#81B441] hover:text-[#9ccd5b] hover:underline ml-1 transition-colors duration-200">
              Contactez l&apos;administrateur.
            </a>
          </p>
        </div>
      </div>
      
      {/* Add CSS for animated stars */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        .star {
          animation: twinkle infinite;
        }
      `}</style>
    </div>
  );
} 