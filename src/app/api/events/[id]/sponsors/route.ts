import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  const id = params.id;
  
  try {
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

    // Récupérer tous les sponsors de l'événement en utilisant prisma.$queryRaw
    const sponsors = await prisma.$queryRaw`
      SELECT * FROM sponsors
      WHERE event_id = ${id}
      ORDER BY created_at DESC
    `;

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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  const id = params.id;
  
  try {
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

    // Traiter le formulaire multipart
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const website = formData.get("website")?.toString();
    const level = formData.get("level")?.toString();
    const visible = formData.get("visible") === "true";
    const logoFile = formData.get("logo") as File | null;

    if (!name) {
      return NextResponse.json(
        { message: "Le nom du sponsor est requis" },
        { status: 400 }
      );
    }

    let logoPath = null;

    // Si un logo a été envoyé, le sauvegarder
    if (logoFile) {
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
      
      try {
        await writeFile(filePath, buffer);
        logoPath = relativePath;
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du logo:", error);
        return NextResponse.json(
          { message: "Erreur lors de l'enregistrement du logo" },
          { status: 500 }
        );
      }
    }

    // Créer le nouveau sponsor en utilisant prisma.$executeRaw
    const now = new Date();
    const sponsorId = uuidv4();
    
    await prisma.$executeRaw`
      INSERT INTO sponsors (
        id, name, description, logo, website, level, visible, event_id, created_at, updated_at
      ) VALUES (
        ${sponsorId}, ${name}, ${description || null}, ${logoPath}, ${website || null}, 
        ${level || "GOLD"}, ${visible}, ${id}, ${now}, ${now}
      )
    `;

    // Récupérer le sponsor créé
    const sponsor = await prisma.$queryRaw`
      SELECT * FROM sponsors WHERE id = ${sponsorId}
    `;

    return NextResponse.json(sponsor[0], { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du sponsor:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du sponsor" },
      { status: 500 }
    );
  }
} 