import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/events/[id]/sessions/[sessionId]/documents - Récupérer les documents d'une session
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const { id: eventId, sessionId } = await params;
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la session existe
    const sessionExists = await prisma.$queryRaw`
      SELECT id FROM event_sessions 
      WHERE id = ${sessionId} AND event_id = ${eventId}
    `;
    
    if (!Array.isArray(sessionExists) || sessionExists.length === 0) {
      return NextResponse.json(
        { message: "Session non trouvée" },
        { status: 404 }
      );
    }

    // Pour le moment, retourner un tableau vide car la table session_documents n'existe pas encore
    // TODO: Implémenter la récupération des documents quand la table sera créée
    const documents = [];

    // Exemple de structure pour les documents futurs:
    /*
    const documents = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        file_path as "filePath",
        file_size as "fileSize",
        file_type as "fileType",
        uploaded_at as "uploadedAt",
        uploaded_by as "uploadedBy"
      FROM session_documents
      WHERE session_id = ${sessionId}
      ORDER BY uploaded_at DESC
    `;
    */

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents de la session:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des documents", error: String(error) },
      { status: 500 }
    );
  }
} 