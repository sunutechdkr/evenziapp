import { notFound } from "next/navigation";
import { prisma } from '@/lib/prisma';
import Badge from "@/components/events/Badge";

interface RegisteredPageProps {
  params: Promise<{
    slug: string;
    id?: string;
  }>;
  searchParams: {
    id?: string;
  };
}

// Typage plus permissif pour éviter les erreurs
interface RegistrationWithEvent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  shortCode?: string;
  event: {
    id: string;
    name: string;
    slug: string;
    location: string;
    date: Date;
    description?: string | null;
    banner?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
  } & Record<string, unknown>;
}

// Type spécifique pour l'enregistrement de Prisma
interface PrismaRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  eventId: string;
  qrCode: string;
  shortCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  checkedIn: boolean;
  checkInTime: Date | null;
  event: {
    id: string;
    name: string;
    slug: string;
    location: string;
    date: Date;
    description?: string | null;
    banner?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
  } & Record<string, unknown>;
}

async function getRegistrationData(id: string): Promise<RegistrationWithEvent | null> {
  try {
    // Récupère l'enregistrement avec son événement
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });
    
    if (!registration) {
      return null;
    }
    
    // Force le type pour accéder aux propriétés
    const reg = registration as unknown as PrismaRegistration;
    
    return {
      id: reg.id,
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      type: reg.type,
      shortCode: reg.shortCode || undefined,
      event: {
        id: reg.event.id,
        name: reg.event.name,
        slug: reg.event.slug,
        location: reg.event.location,
        date: reg.event.date
      }
    };
  } catch (error) {
    console.error("Error fetching registration:", error);
    return null;
  }
}

export default async function RegisteredPage({ params, searchParams }: RegisteredPageProps) {
  const { slug } = await params;
  const registrationId = searchParams.id;
  
  if (!registrationId) {
    notFound();
  }
  
  const registrationData = await getRegistrationData(registrationId);
  
  if (!registrationData || registrationData.event.slug !== slug) {
    notFound();
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
        <p className="text-lg text-gray-600">
          Thank you for registering for {registrationData.event.name}
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Badge</h2>
        <div className="flex justify-center">
          <Badge 
            firstName={registrationData.firstName}
            lastName={registrationData.lastName}
            eventName={registrationData.event.name}
            eventDate={new Date(registrationData.event.date).toLocaleDateString()}
            eventLocation={registrationData.event.location}
            registrationType={registrationData.type}
            shortCode={registrationData.shortCode}
          />
        </div>
      </div>
      <div className="text-center space-y-4 mt-8">
        <p className="text-gray-600">
          We&apos;ve also sent an email with your badge to <span className="font-semibold">{registrationData.email}</span>
        </p>
        <div className="mt-6">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Badge
          </button>
        </div>
      </div>
    </div>
  );
} 