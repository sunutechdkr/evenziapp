import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { slug: string } }
) {
  // Autoriser l'accès sans authentification pour cette route
  // car elle est utilisée par la page de check-in publique
  
  try {
    // Accéder au slug de manière sûre, en s'assurant que c'est bien une chaîne
    const { slug } = context.params;
    
    if (!slug) {
      return NextResponse.json(
        { message: "Slug d'événement requis" },
        { status: 400 }
      );
    }

    console.log(`Recherche de l'ID pour l'événement avec slug: ${slug}`);

    // Récupérer l'événement avec SQL direct
    const eventQuery = await prisma.$queryRaw`
      SELECT id, name 
      FROM events 
      WHERE slug = ${slug}
    `;
    
    const event = Array.isArray(eventQuery) && eventQuery.length > 0 ? eventQuery[0] : null;

    if (!event) {
      console.error(`Événement avec slug ${slug} non trouvé`);
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    console.log(`Événement trouvé pour slug ${slug}: ID=${event.id}, Name=${event.name}`);
    
    return NextResponse.json(event);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement par slug:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération de l'événement" },
      { status: 500 }
    );
  }
} 