import { Suspense } from "react";
import ParticipantQRCode from "@/components/ParticipantQRCode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ParticipantQRPage({ params }: { params: { id: string } }) {
  // Vérifier l'authentification côté serveur
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login?callbackUrl=/participant-qr/" + params.id);
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">QR Code du Participant</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
            <ParticipantQRCode participantId={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 