import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "fs/promises";

// Définition temporaire du type Sponsor en attendant que Prisma Client soit régénéré
type SponsorLevel = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTNER' | 'MEDIA' | 'OTHER';

type Sponsor = {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  level: SponsorLevel;
  visible: boolean;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
};

// GET /api/events/[id]/sponsors - Récupérer tous les sponsors d'un événement
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Attendre les paramètres avant d'y accéder
    const paramsData = await params;
    const id = paramsData.id;
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les sponsors de l'événement
    const sponsors = await prisma.sponsor.findMany({
      where: {
        eventId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sponsors);
  } catch (error) {
    console.error("Erreur lors de la récupération des sponsors:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des sponsors" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/sponsors - Ajouter un nouveau sponsor
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Attendre les paramètres avant d'y accéder
    const paramsData = await params;
    const id = paramsData.id;
    console.log("POST sponsor - ID événement:", id);
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      console.log("Événement non trouvé:", id);
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Traiter le formulaire multipart
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const website = formData.get("website")?.toString();
    const level = formData.get("level")?.toString();
    const visible = formData.get("visible") === "true";
    const logoFile = formData.get("logo") as File | null;
    
    console.log("Données du sponsor:", { name, level, visible });

    if (!name) {
      return NextResponse.json(
        { message: "Le nom du sponsor est requis" },
        { status: 400 }
      );
    }

    let logoPath = null;

    // Si un logo a été envoyé, le sauvegarder
    if (logoFile) {
      try {
        console.log("Traitement du logo:", logoFile.name);
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Créer un nom de fichier unique
        const uniqueFilename = `${uuidv4()}-${logoFile.name.replace(/\s/g, '_')}`;
        const relativePath = `/uploads/sponsors/${uniqueFilename}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'sponsors');
        
        // S'assurer que le répertoire existe
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (error) {
          console.error("Erreur lors de la création du répertoire:", error);
        }
        
        const filePath = join(uploadDir, uniqueFilename);
        
        await writeFile(filePath, buffer);
        logoPath = relativePath;
        console.log("Logo sauvegardé:", relativePath);
      } catch (logoError) {
        console.error("Erreur lors du traitement du logo:", logoError);
        // Continuer sans logo plutôt que d'échouer complètement
        logoPath = null;
      }
    }

    // Créer le nouveau sponsor avec Prisma Client
    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        description: description || undefined,
        logo: logoPath,
        website: website || undefined,
        level: level as any || "GOLD",
        visible,
        eventId: id,
      }
    });
    
    console.log("Sponsor créé avec succès:", sponsor.id);
    return NextResponse.json(sponsor, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création du sponsor:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du sponsor", error: error.message },
      { status: 500 }
    );
  }
} 